import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";

class PagesService {
  private _sp: SPFI;

  constructor(private context: WebPartContext) {
    this._sp = spfi().using(SPFx(this.context));
  }
  getFilteredPages = async (
    pageNumber: number,
    pageSize: number = 10,
    orderBy: string = "Created",
    isAscending: boolean = true,
    folderPath: string = "",
    searchText: string = ""
  ) => {
    try {
      const skip = (pageNumber - 1) * pageSize;
      const list = this._sp.web.lists.getByTitle("Site Pages");

      // Use startswith to include files in subfolders and exclude folders
      const filterQuery = `startswith(FileDirRef, '${folderPath}') and FSObjType eq 0${
        searchText ? ` and substringof('${searchText}', Title)` : ""
      }`;

      const pages: any[] = await list.items
        .filter(filterQuery)
        .select(
          "Title",
          "Description",
          "FileLeafRef",
          "FileRef",
          "Modified",
          "Id",
          "TaxCatchAll/Term"
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
