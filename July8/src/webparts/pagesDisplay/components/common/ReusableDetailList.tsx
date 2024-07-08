import * as React from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  DetailsHeader,
} from "@fluentui/react/lib/DetailsList";
import { mergeStyles } from "@fluentui/react";
import "./styles.css";

const customBodyClass = mergeStyles({
  row: {
    selectors: {
      ":nth-child(odd), .row :nth-child(odd)": {
        backgroundColor: "#efefef", // Background color for odd rows
      },
      ":nth-child(even), .row :nth-child(even)": {
        backgroundColor: "white", // Background color for even rows
      },
    },
  },
  overflowY: "auto",
  maxHeight: "700px",
});
// Define custom header styles
const customHeaderClass = mergeStyles({
  backgroundColor: "#efefef", // Custom background color
  color: "white", // Custom text color
  paddingTop: 0,
  paddingBottom: 0,
  header: {
    backgroundColor: "#0078d4", // Custom header background color
    borderBottom: "1px solid #ccc",
  },
});
export interface IReusableDetailListcomponents {
  columns: (
    onColumnClick: any,
    sortBy: string,
    isDecending: boolean,
    setShowFilter: (ev: React.MouseEvent<HTMLElement>) => void
  ) => IColumn[];
  setShowFilter: (ev: React.MouseEvent<HTMLElement>) => void;
  items: any[];
  sortPages: (column: IColumn, isAscending: boolean) => void;
  sortBy: string;
  siteUrl: string;
  isDecending: boolean;
}

export class ReusableDetailList extends React.Component<
  IReusableDetailListcomponents,
  {}
> {
  constructor(components: IReusableDetailListcomponents) {
    super(components);
  }

  componentDidUpdate(prevcomponents: IReusableDetailListcomponents) {
    if (prevcomponents.items !== this.props.items) {
      this.forceUpdate();
    }
  }

  _onRenderDetailsHeader = (components: any) => {
    if (!components) {
      return null;
    }

    // Apply custom styles to the header
    return (
      <DetailsHeader
        {...components}
        styles={{
          root: customHeaderClass, // Apply custom styles
        }}
      />
    );
  };

  public render() {
    const { columns, items, sortPages, sortBy, isDecending, setShowFilter } =
      this.props;

    return (
      <div>
        <DetailsList
          styles={{
            root: customBodyClass,
          }}
          items={items}
          compact={true}
          columns={columns(sortPages, sortBy, isDecending, setShowFilter)}
          selectionMode={SelectionMode.none}
          getKey={this._getKey}
          setKey="none"
          layoutMode={DetailsListLayoutMode.fixedColumns}
          isHeaderVisible={true}
          onRenderDetailsHeader={this._onRenderDetailsHeader}
          onItemInvoked={this._onItemInvoked}
          className="detailList"
        />
      </div>
    );
  }

  private _getKey(item: any, index?: number): string {
    return item.key;
  }

  private _onItemInvoked = (item: any): void => {
    window.open(`${this.props.siteUrl}${item.FileRef}`, "_blank");
  };
}
