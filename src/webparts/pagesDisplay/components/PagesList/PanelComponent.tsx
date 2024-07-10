import * as React from "react";
import { Panel } from "@fluentui/react/lib/Panel";
import { Checkbox, Stack } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { useId, Input } from "@fluentui/react-components";
import PagesService from "./PagesService";
import { FilterDetail } from "./PagesService";

export interface FilterOptions {
  key: string;
  text: string;
  value: string;
}

const buttonStyles = { root: { marginRight: 8 } };

export const FilterPanelComponent = ({
  isOpen,
  dismissPanel,
  applyFilters,
  headerText,
  selectedItems,
  pagesService,
  columnName,
  data,
}: {
  isOpen: boolean;
  dismissPanel: () => void;
  applyFilters: (filterDetail: FilterDetail) => void;
  headerText: string;
  selectedItems: FilterDetail;
  pagesService: PagesService;
  columnName: string;
  data: any[];
}) => {
  const [checkedItems, setCheckedItems] =
    React.useState<FilterDetail>(selectedItems);
  const [searchText, setSearchText] = React.useState<string>("");
  const [filteredOptions, setFilteredOptions] = React.useState<FilterOptions[]>(
    []
  );
  const [options, setOptions] = React.useState<FilterOptions[]>([]);

  const apply = () => {
    const filterDetail: FilterDetail = {
      filterColumn: columnName,
      values: checkedItems.values,
    };
    applyFilters(filterDetail);
  };

  const resetFilters = () => {
    const filterDetail: FilterDetail = {
      filterColumn: columnName,
      values: [],
    };
    setCheckedItems(filterDetail);
    applyFilters(filterDetail);
  };

  const handleSearch = () => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = options.filter(
      (item) => item.text.toLowerCase().indexOf(lowercasedFilter) !== -1
    );
    setFilteredOptions(filteredData);
  };

  const constructCategoryFilters = (categories: string[]) => {
    const updatedFilterCategories: FilterOptions[] = categories.map(
      (category) => ({
        key: category,
        text: category,
        value: category,
      })
    );

    setOptions(updatedFilterCategories);
    setFilteredOptions(updatedFilterCategories); // Set filtered options initially with all categories

    return updatedFilterCategories;
  };

  React.useEffect(() => {
    pagesService.getDistinctValues(columnName, data).then((res) => {
      constructCategoryFilters(res);
    });
  }, [columnName]);

  const onRenderFooterContent = () => (
    <div>
      <PrimaryButton onClick={apply} styles={buttonStyles}>
        Apply
      </PrimaryButton>
      <DefaultButton
        onClick={() => {
          resetFilters();
          setCheckedItems({ filterColumn: columnName, values: [] }); // Reset checked items to empty array
          setFilteredOptions(options); // Reset filtered options (if needed)
        }}
      >
        Clear
      </DefaultButton>
    </div>
  );

  const inputId = useId("input");

  return (
    <div>
      <Panel
        headerText={headerText}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        onRenderFooterContent={onRenderFooterContent}
        closeButtonAriaLabel="Close"
        isFooterAtBottom={true}
      >
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
          style={{
            width: "100%",
            border: "1px solid black",
            marginBottom: "20px",
            paddingLeft: "10px",
          }}
        />

        <Stack tokens={{ childrenGap: 10 }}>
          {filteredOptions.map((option) => (
            <Checkbox
              key={option.key}
              label={
                isISODateString(option.text)
                  ? new Date(option.text).toLocaleDateString()
                  : option.text
              }
              checked={checkedItems.values.indexOf(option.value) !== -1}
              onChange={(ev, checked) => {
                if (checked) {
                  setCheckedItems({
                    filterColumn: columnName,
                    values: [...checkedItems.values, option.value],
                  });
                } else {
                  setCheckedItems({
                    filterColumn: columnName,
                    values: checkedItems.values.filter(
                      (item) => item !== option.value
                    ),
                  });
                }
              }}
            />
          ))}
        </Stack>
      </Panel>
    </div>
  );
};

// Function to check if a string is in ISO date format
function isISODateString(value: string): boolean {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/.test(value);
}
