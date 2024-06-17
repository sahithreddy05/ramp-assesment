import Downshift from "downshift";
import { useCallback, useState, useEffect, useRef } from "react";
import classNames from "classnames";
import {
  //  DropdownPosition,
    InputSelectOnChange, InputSelectProps } from "./types";

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return;
      }

      consumerOnChange(selectedItem);
      setSelectedValue(selectedItem);
    },
    [consumerOnChange]
  );

  const adjustDropdownPosition = () => {
    if (inputRef.current && dropdownRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${rect.bottom + window.scrollY}px`;
      dropdownRef.current.style.left = `${rect.left + window.scrollX}px`;
      dropdownRef.current.style.width = `${rect.width}px`; // Ensure the dropdown width matches the select input
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", adjustDropdownPosition);
    window.addEventListener("resize", adjustDropdownPosition);

    // Adjust position on initial render
    adjustDropdownPosition();

    return () => {
      window.removeEventListener("scroll", adjustDropdownPosition);
      window.removeEventListener("resize", adjustDropdownPosition);
    };
  }, []);

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps();
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem);

        return (
          <div className="RampInputSelect--root" ref={inputRef}>
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              {...toggleProps}
              onClick={(event) => {
                toggleProps.onClick(event);
                // Adjust position when dropdown is opened
                setTimeout(adjustDropdownPosition, 0);
              }}
            >
              {parsedSelectedItem ? parsedSelectedItem.label : label}
            </div>

            <div
              className={classNames("RampInputSelect--dropdown-container", {
                "RampInputSelect--dropdown-container-opened": isOpen,
              })}
              {...getMenuProps()}
              ref={dropdownRef}
            >
              {renderItems()}
            </div>
          </div>
        );

        function renderItems() {
          if (!isOpen) {
            return null;
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>;
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>;
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item);
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      selectedItem && parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            );
          });
        }
      }}
    </Downshift>
  );
}
