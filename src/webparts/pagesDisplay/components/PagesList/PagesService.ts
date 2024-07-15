import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ITerm {
  Id: string;
  Name: string;
  parentId: string;
  Children?: ITerm[];
}

export interface TermSet {
  setId: string;
  terms: ITerm[];
}

export interface FilterDetail {
  filterColumn: string;
  values: string[];
}
class PagesService {
  private _sp: SPFI;

  constructor(private context: WebPartContext) {
    this._sp = spfi().using(SPFx(this.context));
  }
  /**
   * Fetch distinct values for a given column from a list of items.
   * @param {string} columnName - The name of the column to fetch distinct values for.
   * @param {any[]} values - The list of items to extract distinct values from.
   * @returns {Promise<string[]>} - A promise that resolves to an array of distinct values.
   */
  getDistinctValues = async (columnName: string, values: any) => {
    try {
      const items = values; // The list of items to fetch distinct values from.

      // Extract distinct values from the Title column
      const distinctValues: string[] = [];
      const seenValues = new Set<string>(); // A set to keep track of seen values to avoid duplicates.

      items.forEach((item: any) => {
        if (columnName === "Categories") {
          if (item.TaxCatchAll && item.TaxCatchAll.length > 0) {
            // Extract distinct values from the TaxCatchAll column
            item.TaxCatchAll.forEach((category: any) => {
              const uniqueValue = category.Term;
              if (!seenValues.has(uniqueValue)) {
                seenValues.add(uniqueValue);
                distinctValues.push(uniqueValue);
              }
            });
          }
        } else {
          let uniqueValue = item[columnName]; // The value of the column for the current item.

          // Handle ISO date strings by extracting only the date part
          if (columnName === "Modified" && uniqueValue) {
            uniqueValue = new Date(uniqueValue).toISOString().split("T")[0];
          }

          if (uniqueValue && !seenValues.has(uniqueValue)) {
            seenValues.add(uniqueValue);
            distinctValues.push(uniqueValue);
          }
        }
      });

      return distinctValues;
    } catch (error) {
      console.error(
        `Error fetching distinct values for column ${columnName}:`,
        error
      );
      throw new Error(
        `Error fetching distinct values for column ${columnName}`
      );
    }
  };

  /**
   * Retrieves a page of filtered Site Pages items.
   *
   * @param pageNumber The page number to retrieve (1-indexed).
   * @param pageSize The number of items to retrieve per page. Defaults to 10.
   * @param orderBy The column to sort the items by. Defaults to "Created".
   * @param isAscending Whether to sort in ascending or descending order. Defaults to true.
   * @param folderPath The folder path to search in. Defaults to "" (root of the site).
   * @param searchText Text to search for in the Title, Article ID, or Modified columns.
   * @param filters An array of FilterDetail objects to apply to the query.
   * @returns A promise that resolves with an array of items.
   */
  getFilteredPages = async (
    pageNumber: number,
    pageSize: number = 10,
    orderBy: string = "Created",
    isAscending: boolean = true,
    folderPath: string = "",
    searchText: string = "",
    filters: FilterDetail[]
  ) => {
    try {
      const skip = (pageNumber - 1) * pageSize;
      const list = this._sp.web.lists.getByTitle("Site Pages");

      /**
       * Generates a filter query string based on the provided filters.
       *
       */
      let filterQuery = `startswith(FileDirRef, '${folderPath}') and FSObjType eq 0${
        searchText
          ? ` and (substringof('${searchText}', Title) or Article_x0020_ID eq '${searchText}' or substringof('${searchText}', Modified))`
          : ""
      }`;

      // Append filter conditions based on the provided filters.
      filters.forEach((filter) => {
        if (filter.values.length > 0) {
          // Append filter conditions to the filter query for each filter.
          if (filter.filterColumn === "Categories") {
            // Append category filters to the filter query.
            const categoryFilters = filter.values
              .map((value) => `TaxCatchAll/Term eq '${value}'`)
              .join(" or ");
            filterQuery += ` and (${categoryFilters})`;
          } else if (filter.filterColumn === "Modified") {
            // Append date filters to the filter query.
            const dateFilters = filter.values
              .map((value) => {
                // Generate start and end dates for the filter.
                const startDate = new Date(value);
                const endDate = new Date(value);
                endDate.setDate(endDate.getDate() + 1); // Include the entire day

                return `Modified ge datetime'${startDate.toISOString()}' and Modified lt datetime'${endDate.toISOString()}'`;
              })
              .join(" or ");
            filterQuery += ` and (${dateFilters})`;
          } else {
            // Append column filters to the filter query.
            const columnFilters = filter.values
              .map((value) => `${filter.filterColumn} eq '${value}'`)
              .join(" or ");
            filterQuery += ` and (${columnFilters})`;
          }
        }
      });

      /**
       * Retrieves the items from the SharePoint list based on the provided filter query,
       * selects specific columns, expands the TaxCatchAll field, applies pagination,
       * and orders the results.
       *
       */
      const pages: any[] = await list.items
        .filter(filterQuery)
        .select(
          // Select the required columns
          "Title",
          "Description",
          "FileLeafRef",
          "FileRef",
          "Modified",
          "Id",
          "TaxCatchAll/Term",
          "Article_x0020_ID"
        )
        .expand("TaxCatchAll") // Expand the TaxCatchAll field to get the Term value
        .skip(skip) // Apply pagination by skipping the specified number of items
        .orderBy(orderBy, isAscending)(); // Order the results based on the specified column and sort order

      return pages;
    } catch (error) {
      console.error("Error fetching filtered pages:", error);
      throw new Error("Error fetching filtered pages");
    }
  };
}

export default PagesService;
