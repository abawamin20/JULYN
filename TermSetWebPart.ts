import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { SPHttpClient } from "@microsoft/sp-http";

import * as strings from "TermSetWebPartStrings";
import { ITermSetProps } from "./components/ITermSetProps";
import TermSetList from "./components/TermSet";
import { PropertyFieldMultiSelect } from "@pnp/spfx-property-controls/lib/PropertyFieldMultiSelect";

export interface ITermSetWebPartProps {
  description: string;
  multiSelect: string[];
  selectedGroupId: string;
}

export default class TermSetWebPart extends BaseClientSideWebPart<ITermSetWebPartProps> {
  private groupId: string = "26906ffe-f340-4248-84d4-b961570a6ded";
  private termSetOptions: IPropertyPaneDropdownOption[] = [];

  public async render(): Promise<void> {
    const element: React.ReactElement<ITermSetProps> = React.createElement(
      TermSetList,
      {
        context: this.context,
        groupId: this.groupId,
        setNames: this.properties.multiSelect,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private async getTermSets(groupId: string): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/v2.1/termstore/groups/${groupId}/sets`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();

    // Populate the dropdown options
    this.termSetOptions = [
      {
        key: "",
        text: "Select Set",
      },
      ...data.value.map((termSet: any) => {
        return {
          key: termSet.localizedNames[0].name,
          text: termSet.localizedNames[0].name,
        };
      }),
    ];
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected async onPropertyPaneConfigurationStart(): Promise<void> {
    // Load the term sets if not already loaded
    if (this.termSetOptions.length === 0) {
      await this.getTermSets(this.groupId);
      this.context.propertyPane.refresh();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldMultiSelect("multiSelect", {
                  key: "multiSelect",
                  label: "Multi select field",
                  options: this.termSetOptions,
                  selectedKeys: this.properties.multiSelect,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
