import * as React from "react";
import { IColumn } from "@fluentui/react";
export const PagesColumns = (
  category: string,
  onColumnClick: any,
  sortBy: string,
  isDecending: boolean
): IColumn[] => [
  {
    key: "Id",
    name: "Article Id",
    fieldName: "Id",
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
  {
    key: "Editor",
    name: "Modified By",
    fieldName: "Editor",
    minWidth: 200,
    maxWidth: 200,
    isRowHeader: true,
    isResizable: true,
    isSorted: sortBy === "Title",
    onColumnClick: (e, column: IColumn) => onColumnClick(column),
    data: "string",
    isPadded: true,
    isSortedDescending: isDecending,
    onRender(item) {
      return <span>{item.Editor["Title"]}</span>;
    },
  },
];
