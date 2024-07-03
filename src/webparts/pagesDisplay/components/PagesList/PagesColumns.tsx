import * as React from "react";
import { IColumn } from "@fluentui/react";
export const PagesColumns = (
  onColumnClick: any,
  sortBy: string,
  isDecending: boolean,
  setShowFilter: (ev: React.MouseEvent<HTMLElement>) => void
): IColumn[] => {
  const onColumnContextMenu = (
    column: IColumn,
    ev: React.MouseEvent<HTMLElement>
  ): void => {
    setShowFilter(ev);
  };

  return [
    {
      key: "Id",
      name: "Article Id",
      fieldName: "ArticleId",
      minWidth: 10,
      maxWidth: 40,
      isRowHeader: true,
      isResizable: true,
      data: "string",
      isPadded: true,
    },
    {
      key: "Title",
      name: "Article",
      fieldName: "Title",
      minWidth: 200,
      maxWidth: 600,
      isRowHeader: true,
      isResizable: true,
      isSorted: sortBy === "Title",
      onColumnClick: (e, column: IColumn) => onColumnClick(column),
      data: "string",
      isPadded: true,
      isSortedDescending: isDecending,
      onRender(item) {
        return <span className="">{item.Title}</span>;
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
      onColumnContextMenu(column: IColumn, ev: React.MouseEvent<HTMLElement>) {
        onColumnContextMenu(column, ev);
      },
      onColumnClick: (ev, column) => {
        onColumnContextMenu(column, ev);
      },
      data: "string",
      isPadded: true,
      onRender: (item) => {
        const categories = item.TaxCatchAll.map(
          (category: any) => category.Term
        );
        return (
          <span title={categories.join(", ")}>{categories.join(", ")}</span>
        );
      },
    },
  ];
};
