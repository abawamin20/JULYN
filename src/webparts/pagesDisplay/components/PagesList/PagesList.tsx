import * as React from "react";
import { ReusableDetailList } from "../common/ReusableDetailList";
import PagesService, { FilterDetail } from "./PagesService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PagesColumns } from "./PagesColumns";
import { DefaultButton, IColumn } from "@fluentui/react";

import { makeStyles, useId, Input } from "@fluentui/react-components";
import styles from "./pages.module.scss";
import "./pages.css";
import { FilterPanelComponent } from "./PanelComponent";

export interface IPagesListProps {
  context: WebPartContext;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: "2px",
    maxWidth: "400px",
    alignItems: "center",
  },
});

const PagesList = (props: IPagesListProps) => {
  const context = props.context;

  const [catagory, setCatagory] = React.useState<string>("");
  const [pageSizeOption] = React.useState<number[]>([
    10, 15, 20, 40, 60, 80, 100,
  ]);
  const [searchText, setSearchText] = React.useState<string>("");
  const [pages, setPages] = React.useState<any[]>([]);
  const [initialPages, setInitialPages] = React.useState<any[]>([]);
  const [paginatedPages, setPaginatedPages] = React.useState<any[]>([]);
  const [sortBy, setSortBy] = React.useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startIndex, setStartIndex] = React.useState<number>(1);
  const [endIndex, setEndIndex] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [isDecending, setIsDecending] = React.useState<boolean>(false);
  const [showFilter, setShowFilter] = React.useState<boolean>(false);
  const [filterColumn, setFilterColumn] = React.useState<string>("");
  const [filterDetails, setFilterDetails] = React.useState<FilterDetail[]>([]);

  const pagesService = new PagesService(context);
  const inputId = useId("input");

  const inputStyles = useStyles();

  const resetFilters = () => {
    setFilterDetails([]);
    setSearchText("");
    fetchPages(1, pageSize, "Created", true, "", catagory, []);
  };

  const fetchPages = (
    page = 1,
    pageSizeAmount = pageSize,
    sortBy = "Created",
    isSortedDescending = isDecending,
    searchText = "",
    category = catagory,
    filterDetails: FilterDetail[]
  ) => {
    const url = `${context.pageContext.web.serverRelativeUrl}/SitePages/${category}`;
    return pagesService
      .getFilteredPages(
        page,
        pageSizeAmount,
        sortBy,
        isSortedDescending,
        url,
        searchText,
        filterDetails
      )
      .then((res) => {
        setTotalItems(res.length);
        const totalPages = Math.ceil(res.length / pageSizeAmount);
        if (totalPages === 0) {
          setTotalPages(1);
        } else setTotalPages(Math.ceil(res.length / pageSizeAmount));
        const startIndex = 1;
        setStartIndex(startIndex);
        const endIndex = res.slice(0, pageSizeAmount).length;
        setEndIndex(endIndex);
        setPaginatedPages(res.slice(0, pageSizeAmount));
        setPages(res);
        return res;
      });
  };

  const getPages = async (path: string, filterCategories: string[]) => {
    const initialPagesFromApi = await fetchPages(
      1,
      pageSize,
      "Created",
      true,
      searchText,
      path,
      filterDetails
    );
    setInitialPages(initialPagesFromApi);
  };

  const applyFilters = (filterDetail: FilterDetail): void => {
    let currentFilters: FilterDetail[] = [];

    if (filterDetail.values.length > 0) {
      // Update or add filter detail for the specified column
      currentFilters = [
        ...filterDetails.filter((item) => item.filterColumn !== filterColumn),
        { filterColumn, values: filterDetail.values },
      ];
    } else {
      // Remove filter detail for the specified column
      currentFilters = filterDetails.filter(
        (item) => item.filterColumn !== filterColumn
      );
    }
    console.log(currentFilters);

    setFilterDetails(currentFilters); // Update filter details state
    fetchPages(
      1, // Page number
      pageSize, // Page size
      "Created", // Sorting criteria
      true, // Sorting order (ascending/descending)
      searchText, // Search text
      catagory, // Category (assuming this is another state or prop)
      currentFilters // Updated filter details
    );
  };

  const sortPages = (column: IColumn) => {
    setSortBy(column.fieldName as string);
    if (column.fieldName === sortBy) {
      setIsDecending(!isDecending);
    } else {
      setIsDecending(true);
    }
    fetchPages(
      1,
      pageSize,
      column.fieldName,
      column.isSortedDescending,
      searchText,
      catagory,
      filterDetails
    );
  };

  const handlePageChange = (page: number, pageSizeChanged = pageSize) => {
    // Ensure page is an integer
    const currentPage = Math.ceil(page);

    // Update current page number state
    setCurrentPageNumber(currentPage);

    // Calculate slice indices for pagination
    const startIndex = (currentPage - 1) * pageSizeChanged;

    if (startIndex == 0) {
      setStartIndex(1);
    } else setStartIndex(startIndex);
    const endIndex = currentPage * pageSizeChanged;
    setEndIndex(endIndex);

    // Slice the 'pages' array to get the current page of data
    const paginated = pages.slice(startIndex, endIndex);

    setTotalPages(Math.ceil(totalItems / pageSizeChanged));
    // Update paginated pages state
    setPaginatedPages(paginated);
  };

  const handleSearch = () => {
    fetchPages(
      1,
      pageSize,
      "Created",
      true,
      searchText,
      catagory,
      filterDetails
    );
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () =>
    handlePageChange(Math.max(currentPageNumber - 1, 1));
  const goToNextPage = () =>
    handlePageChange(Math.min(currentPageNumber + 1, totalPages));

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;

    if (!isNaN(inputValue)) {
      const page = parseInt(inputValue, 10);
      handlePageChange(page);
    } else {
      handlePageChange(0);
    }
  };

  const handlePageSizeChange = (e: any) => {
    setPageSize(e.target.value);
    handlePageChange(1, e.target.value);
  };

  React.useEffect(() => {
    window.addEventListener("category", (e: any) => {
      const details: {
        category: string;
        filterCategory: string[];
      } = e.detail;
      setCatagory(details.category);
      getPages(details.category, details.filterCategory);
      // setFilterCategory(details.filterCategory);
    });

    console.log(endIndex);
    console.log(startIndex);
  }, []);

  const dissmissPanel = (): void => {
    setShowFilter(false);
  };

  return (
    <div className="w-pageSize0">
      {showFilter && (
        <FilterPanelComponent
          isOpen={showFilter}
          headerText="Filter Articles"
          applyFilters={applyFilters}
          dismissPanel={dissmissPanel}
          selectedItems={
            filterDetails.filter(
              (item) => item.filterColumn === filterColumn
            )[0] || { filterColumn: "", values: [] }
          }
          columnName={filterColumn}
          pagesService={pagesService}
          data={initialPages}
        />
      )}
      <div className={`${styles.top}`}>
        <div
          className={`${styles["first-section"]} d-flex justify-content-between align-items-end py-2 px-2`}
        >
          <span className={`fs-4 ${styles["knowledgeText"]}`}>
            {catagory && <span className="">{catagory}</span>}
          </span>
          <div className={`${inputStyles.root} d-flex align-items-center me-2`}>
            <Input
              id={inputId}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search"
            />
          </div>
        </div>

        <div
          className={`d-flex justify-content-between align-items-center fs-5 px-2 my-2`}
        >
          <span>Articles /</span>
          {totalItems > 0 ? (
            <div className="d-flex align-items-center">
              {filterDetails && filterDetails.length > 0 && (
                <DefaultButton
                  onClick={() => {
                    resetFilters();
                  }}
                >
                  Clear
                </DefaultButton>
              )}
              <span className="ms-2 fs-6">Results ({totalItems})</span>
            </div>
          ) : (
            <span className="fs-6">No articles to display</span>
          )}
        </div>
      </div>

      <ReusableDetailList
        items={paginatedPages}
        columns={PagesColumns}
        setShowFilter={(column: IColumn) => {
          setShowFilter(!showFilter);
          setFilterColumn(column.fieldName as string);
        }}
        sortPages={sortPages}
        sortBy={sortBy}
        siteUrl={window.location.origin}
        isDecending={isDecending}
      />
      <div className="d-flex justify-content-end">
        <div
          className="d-flex align-items-center my-1"
          style={{
            fontSize: "13px",
          }}
        >
          <div className="d-flex align-items-center me-3">
            <span className={`me-2 ${styles.blueText}`}>Items / Page </span>
            <select
              className="form-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              name="pageSize"
              style={{
                width: 80,
                height: 35,
              }}
            >
              {pageSizeOption.map((pageSize) => {
                return (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                );
              })}
            </select>
          </div>
          <span className={`me-2 ${styles.blueText}`}>Page</span>
          <input
            type="text"
            value={currentPageNumber}
            onChange={handleInputChange}
            className="form-control"
            style={{
              width: 40,
              height: 35,
            }}
          />
          <span className="fs-6 mx-2">of {totalPages}</span>
          <span
            onClick={goToFirstPage}
            className={`mx-2 ${styles["pagination-btns"]} ${
              currentPageNumber === 1 && styles.disabledPagination
            }`}
          >
            <i className="fa fa-step-backward" aria-hidden="true"></i>
          </span>
          <span
            onClick={goToPreviousPage}
            className={`mx-2 ${styles["pagination-btns"]} ${
              currentPageNumber === 1 && styles.disabledPagination
            }`}
          >
            <i className="fa fa-caret-left" aria-hidden="true"></i>
          </span>
          <span
            onClick={goToNextPage}
            className={`mx-2 ${styles["pagination-btns"]} ${
              currentPageNumber >= totalPages ? styles.disabledPagination : ""
            }`}
          >
            <i className="fa fa-caret-right" aria-hidden="true"></i>
          </span>
          <span
            onClick={goToLastPage}
            className={`mx-2 ${styles["pagination-btns"]} ${
              currentPageNumber >= totalPages ? styles.disabledPagination : ""
            }`}
          >
            <i className="fa fa-step-forward" aria-hidden="true"></i>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PagesList;
