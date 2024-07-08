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
      minWidth: 30,
      maxWidth: 60,
      isRowHeader: true,
      isResizable: true,
      data: "string",
      isPadded: true,
      isSorted: sortBy === "ArticleId",
      isSortedDescending: isDecending,
      onColumnClick: (e, column: IColumn) => onColumnClick(column),
    },
    {
      key: "Title",
      name: "Title",
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
        return (
          <a href={item.FileRef} className="" target="_blank">
            {item.Title}
          </a>
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
    {
      key: "Modified",
      name: "Last Modified",
      fieldName: "Modified",
      minWidth: 200,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: sortBy === "Modified",
      onColumnClick: (e, column: IColumn) => onColumnClick(column),
      data: "string",
      isPadded: true,
      isSortedDescending: isDecending,
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
        return formattedDateTime;
      },
    },
  ];
};
