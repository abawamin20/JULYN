import * as React from "react";
import { Panel } from "@fluentui/react/lib/Panel";
import { Checkbox, Stack } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
// Used to add spacing between example checkboxes
const stackTokens = { childrenGap: 10 };
import { useId, Input } from "@fluentui/react-components";

export interface FilterOptions {
  key: string;
  text: string;
  value: string;
  checked?: boolean;
  onClick?: () => void;
}

const buttonStyles = { root: { marginRight: 8 } };

export const FilterPanelComponent = ({
  isOpen,
  dismissPanel,
  options,
  applyFilters,
  resetFilters,
  headerText,
  selectedItems,
}: {
  isOpen: boolean;
  dismissPanel: () => void;
  options: FilterOptions[];
  applyFilters: (filters: string[]) => void;
  resetFilters: () => void;
  headerText: string;
  selectedItems: string[];
}) => {
  const [checkedItems, setCheckedItems] =
    React.useState<string[]>(selectedItems);
  const [searchText, setSearchText] = React.useState<string>("");
  const [filteredOptions, setFilteredOptions] =
    React.useState<FilterOptions[]>(options);

  const apply = () => {
    applyFilters(checkedItems);
  };

  const handleSearch = () => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = options.filter(
      (item) => item.text.toLowerCase().indexOf(lowercasedFilter) !== -1
    );
    setFilteredOptions(filteredData);
  };

  React.useEffect(() => {
    setFilteredOptions(options);
  }, [checkedItems, options]);

  const onRenderFooterContent = () => (
    <div>
      <PrimaryButton onClick={apply} styles={buttonStyles}>
        Save
      </PrimaryButton>
      <DefaultButton
        onClick={() => {
          resetFilters();
          setCheckedItems([]);
          setFilteredOptions(options);
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

        <Stack tokens={stackTokens}>
          {filteredOptions.map((option) => (
            <Checkbox
              key={option.key}
              label={option.text}
              checked={checkedItems.indexOf(option.value) !== -1}
              onChange={(ev, checked) => {
                if (checked) {
                  setCheckedItems([...checkedItems, option.value]);
                } else {
                  setCheckedItems(
                    checkedItems.filter((item) => item !== option.value)
                  );
                }
              }}
            />
          ))}
        </Stack>
      </Panel>
    </div>
  );
};
