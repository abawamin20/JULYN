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
  getDistinctValues = async (columnName: string, values: any) => {
    try {
      const items = values;

      // Extract distinct values from the Title column
      const distinctValues: string[] = [];
      const seenValues = new Set<string>();

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
          let uniqueValue = item[columnName];

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

      // Use startswith to include files in subfolders and exclude folders
      let filterQuery = `startswith(FileDirRef, '${folderPath}') and FSObjType eq 0${
        searchText
          ? ` and (substringof('${searchText}', Title) or Article_x0020_ID eq '${searchText}' or substringof('${searchText}', Modified))`
          : ""
      }`;

      filters.forEach((filter) => {
        if (filter.values.length > 0) {
          if (filter.filterColumn === "Categories") {
            const categoryFilters = filter.values
              .map((value) => `TaxCatchAll/Term eq '${value}'`)
              .join(" or ");
            filterQuery += ` and (${categoryFilters})`;
          } else if (filter.filterColumn === "Modified") {
            const dateFilters = filter.values
              .map((value) => {
                const startDate = new Date(value);
                const endDate = new Date(value);
                endDate.setDate(endDate.getDate() + 1); // Include the entire day

                return `Modified ge datetime'${startDate.toISOString()}' and Modified lt datetime'${endDate.toISOString()}'`;
              })
              .join(" or ");
            filterQuery += ` and (${dateFilters})`;
          } else {
            const columnFilters = filter.values
              .map((value) => `${filter.filterColumn} eq '${value}'`)
              .join(" or ");
            filterQuery += ` and (${columnFilters})`;
          }
        }
      });

      const pages: any[] = await list.items
        .filter(filterQuery)
        .select(
          "Title",
          "Description",
          "FileLeafRef",
          "FileRef",
          "Modified",
          "Id",
          "TaxCatchAll/Term",
          "Article_x0020_ID"
        )
        .expand("TaxCatchAll")
        .skip(skip)
        .orderBy(orderBy, isAscending)();

      return pages;
    } catch (error) {
      console.error("Error fetching filtered pages:", error);
      throw new Error("Error fetching filtered pages");
    }
  };
}

export default PagesService;
