import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { SPHttpClient } from "@microsoft/sp-http";

import * as strings from "SurveyWebPartStrings";
import { ISurveyProps } from "./components/ISurveyProps";
import TermSetList from "./components/TermSet";
import { PropertyFieldMultiSelect } from "@pnp/spfx-property-controls/lib/PropertyFieldMultiSelect";

export interface ISurveyWebPartProps {
  description: string;
  multiSelect: string[];
  selectedGroupId: string;
}

export default class SurveyWebPart extends BaseClientSideWebPart<ISurveyWebPartProps> {
  private termSetOptions: IPropertyPaneDropdownOption[] = [];
  private termStoreGroupOptions: IPropertyPaneDropdownOption[] = [];

  public async render(): Promise<void> {
    const element: React.ReactElement<ISurveyProps> = React.createElement(
      TermSetList,
      {
        context: this.context,
        groupId: this.properties.selectedGroupId,
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
  protected onInit(): Promise<void> {
    return this.getTermStoreGroups();
  }

  private async getTermStoreGroups(): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/v2.1/termstore/groups`;
    const response = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();

    this.termStoreGroupOptions = data.value.map((group: any) => {
      return {
        key: group.id,
        text: group.name,
      };
    });
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
    // Load the term store groups if not already loaded
    if (this.termStoreGroupOptions.length === 0) {
      await this.getTermStoreGroups();
    }

    if (this.termSetOptions.length === 0 && this.properties.selectedGroupId) {
      await this.getTermSets(this.properties.selectedGroupId);
    }

    this.context.propertyPane.refresh();
  }

  protected async onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: any,
    newValue: any
  ): Promise<void> {
    if (propertyPath === "selectedGroupId" && newValue) {
      await this.getTermSets(newValue);
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
                PropertyPaneDropdown("selectedGroupId", {
                  label: "Select Term Store Group",
                  options: this.termStoreGroupOptions,
                  selectedKey: this.properties.selectedGroupId,
                }),
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
