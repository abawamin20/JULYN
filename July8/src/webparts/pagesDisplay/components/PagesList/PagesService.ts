import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
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

class PagesService {
  private _sp: SPFI;

  constructor(private context: WebPartContext) {
    this._sp = spfi().using(SPFx(this.context));
  }

  public async getTermByName(
    termSetName: string,
    groupId: string
  ): Promise<string> {
    const termsUrl = `${this.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/termgroups('${groupId}')/termsets?$filter=localizedNames/any(n:n/name eq '${termSetName}')`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      termsUrl,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch terms: ${response.statusText}`);
    }

    const termsData = await response.json();

    return termsData.value[0].id;
  }

  fetchTerms = async (
    setId: string,
    parentTermId?: string
  ): Promise<ITerm[]> => {
    const termsUrl = parentTermId
      ? `${this.context.pageContext.web.absoluteUrl}/_api/v2.1/termStore/termSets('${setId}')/terms('${parentTermId}')/getlegacychildren`
      : `${this.context.pageContext.web.absoluteUrl}/_api/v2.1//termStore/termSets('${setId}')/getlegacychildren`;

    try {
      const response = await this.context.spHttpClient.get(
        termsUrl,
        SPHttpClient.configurations.v1
      );
      if (!response.ok) {
        throw new Error("Failed to fetch terms");
      }
      const termsData = await response.json();

      const terms = await Promise.all(
        termsData.value.map(async (term: any) => {
          const children =
            term.childrenCount > 0 ? await this.fetchTerms(setId, term.id) : [];
          return {
            Id: term.id, // Use term ID
            Name: term.labels.length > 0 ? term.labels[0].name : "",
            Children: children,
          };
        })
      );

      return terms;
    } catch (error) {
      console.error(`Error fetching terms for set ${setId}:`, error);
      return [];
    }
  };

  public buildHierarchy(
    terms: ITerm[],
    parentId: string | null = null
  ): ITerm[] {
    return terms
      .filter((term) => term.parentId === parentId)
      .map((term) => ({
        ...term,
        children: this.buildHierarchy(terms, term.Id),
      }));
  }
  getFilteredPages = async (
    pageNumber: number,
    pageSize: number = 10,
    orderBy: string = "Created",
    isAscending: boolean = true,
    folderPath: string = "",
    searchText: string = "",
    categories: string[] = []
  ) => {
    try {
      const skip = (pageNumber - 1) * pageSize;
      const list = this._sp.web.lists.getByTitle("Site Pages");

      // Use startswith to include files in subfolders and exclude folders
      let filterQuery = `startswith(FileDirRef, '${folderPath}') and FSObjType eq 0${
        searchText
          ? ` and (substringof('${searchText}', Title) or ArticleId eq '${searchText}' or substringof('${searchText}', Modified))`
          : ""
      }`;

      if (categories.length > 0) {
        const categoryFilters = categories
          .map((category) => `TaxCatchAll/Term eq '${category}'`)
          .join(" or ");
        filterQuery += ` and (${categoryFilters})`;
      }

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
          "ArticleId"
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
