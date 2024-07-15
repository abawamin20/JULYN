import * as React from "react";
import { IColumn, IDetailsColumnProps } from "@fluentui/react";
import { Icon } from "@fluentui/react/lib/Icon"; // Import Icon component from Fluent UI
/**
 * Returns an array of IColumn objects representing the columns of the PagesDetailsList component.
 *
 * @param {(column: IColumn) => void} onColumnClick - The function to call when a column is clicked.
 * @param {string} sortBy - The column to sort by.
 * @param {boolean} isDescending - Whether the sort order is descending.
 * @param {(column: IColumn) => void} setShowFilter - The function to set the showFilter state.
 * @return {IColumn[]} An array of IColumn objects representing the columns of the PagesDetailsList component.
 */
export const PagesColumns = (
  onColumnClick: (column: IColumn) => void, // The function to call when a column is clicked
  sortBy: string, // The column to sort by
  isDescending: boolean, // Whether the sort order is descending
  setShowFilter: (column: IColumn) => void // The function to set the showFilter state
): IColumn[] => {
  const onRenderHeader = (column: IColumn): JSX.Element => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          width: "100%", // Adjust padding as needed
          boxSizing: "border-box",
        }}
      >
        <span
          onClick={() => {
            if (column.fieldName !== "Categories") {
              onColumnClick(column);
            }
          }}
          style={{
            flex: 1,
            cursor: "pointer",
          }}
        >
          {column.name}
        </span>
        <Icon
          iconName="Filter"
          onClick={() => setShowFilter(column)}
          style={{ cursor: "pointer" }}
        />
      </div>
    );
  };

  return [
    {
      key: "Id",
      name: "Article Id",
      fieldName: "Article_x0020_ID",
      minWidth: 60,
      maxWidth: 80,
      isRowHeader: true,
      isResizable: true,
      data: "string",
      isPadded: true,
      isSorted: sortBy === "Article_x0020_ID",
      isSortedDescending: isDescending,
      onRenderHeader: (item: IDetailsColumnProps) =>
        onRenderHeader(item.column),
    },
    {
      key: "Title",
      name: "Title",
      fieldName: "Title",
      minWidth: 200,
      maxWidth: 400,
      isRowHeader: true,
      isResizable: true,
      isSorted: sortBy === "Title",
      isSortedDescending: isDescending,
      onRenderHeader: (item: IDetailsColumnProps) =>
        onRenderHeader(item.column),
      data: "string",
      isPadded: true,
      onRender(item) {
        return (
          <div>
            <a href={item.FileRef} className="" target="_blank">
              {item.Title}
            </a>
          </div>
        );
      },
    },
    {
      key: "Categories",
      name: "Categories",
      fieldName: "Categories",
      minWidth: 200,
      maxWidth: 400,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      data: "string",
      isPadded: true,
      onRenderHeader: (item: IDetailsColumnProps) =>
        onRenderHeader(item.column),
      onRender(item) {
        const categories = item.TaxCatchAll.map(
          (category: any) => category.Term
        );
        return (
          <div>
            <span title={categories.join(", ")}>{categories.join(", ")}</span>
          </div>
        );
      },
    },
    {
      key: "Modified",
      name: "Last Modified",
      fieldName: "Modified",
      minWidth: 200,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: sortBy === "Modified",
      onRenderHeader: (item: IDetailsColumnProps) =>
        onRenderHeader(item.column),
      isSortedDescending: isDescending,
      data: "string",
      isPadded: true,
      onRender(item) {
        const date = new Date(item.Modified);

        const optionsDate: any = {
          year: "numeric",
          month: "short",
          day: "numeric",
        };
        const formattedDate = date.toLocaleDateString("en-US", optionsDate);

        const optionsTime: any = {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        };
        const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

        const formattedDateTime = `${formattedDate} ${formattedTime}`;
        return <div>{formattedDateTime}</div>;
      },
    },
  ];
};
