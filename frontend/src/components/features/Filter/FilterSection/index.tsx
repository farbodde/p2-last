import Button from "@/components/base/Button";
import CheckboxRow from "@/components/base/Form/CheckboxRow";
import Input from "@/components/base/Form/Input";
import { ChevronDownIcon } from "@/components/common/icons";
import clsx from "clsx";
import React, { JSX, useCallback, useMemo, useState } from "react";

type OptionItem = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  icon: JSX.ElementType;
  onChange: (value: string[]) => void;
  value: string[];
  collapsable?: boolean;
  expandable?: boolean;
  searchable?: boolean;
  maxLength?: number;
  options: OptionItem[];
};

const FilterSection: React.FC<Props> = ({
  label,
  icon: Icon,
  value,
  maxLength = 10,
  collapsable,
  expandable,
  searchable,
  options,
  onChange,
}) => {
  const [searchText, setSearchText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleChange = useCallback(
    (checked: boolean, name: string) => {
      const index = value.indexOf(name);

      if (index === -1 && checked) {
        onChange([...value, name]);
      } else if (index > -1) {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
      }
    },
    [onChange, value],
  );

  const handleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const filteredList = useMemo(() => {
    return options.filter((item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [options, searchText]);

  const slicedFilteredList = useMemo(() => {
    if (expanded || !expandable) {
      return filteredList;
    }
    return filteredList.slice(0, maxLength);
  }, [expandable, expanded, filteredList, maxLength]);

  return (
    <section className="w-full border-b flex flex-col border-black/20 last:border-b-0">
      <div className="p-0.5">
        <div
          className={clsx(
            "flex items-center justify-between p-3.5 rounded-lg transition gap-2",
            {
              "cursor-pointer hover:bg-black/10": collapsable,
            },
          )}
          onClick={handleCollapse}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-5.5 h-5.5" />
            <h3 className="text-sm">{label}</h3>
          </div>

          {collapsable && (
            <ChevronDownIcon
              className={clsx("w-5 h-5 transition", {
                "-rotate-180": !collapsed,
              })}
            />
          )}
        </div>
      </div>

      {(!collapsed || !collapsable) && (
        <div className="flex flex-col pb-4 gap-4">
          {searchable && (
            <Input
              type="search"
              placeholder="Search"
              classes={{ container: "px-4 pt-2" }}
              value={searchText}
              onChangeText={setSearchText}
            />
          )}

          <div className="flex flex-col gap-2 w-full">
            {slicedFilteredList.map((item) => (
              <CheckboxRow
                key={item.value}
                label={item.label}
                name={item.value}
                value={value.includes(item.value)}
                onChange={handleChange}
              />
            ))}
            {slicedFilteredList.length === 0 && (
              <span className="block py-4 font-semibold text-red-500/60 text-center">
                Not Found
              </span>
            )}

            {expandable && filteredList.length > maxLength && (
              <div className="p-4">
                <Button
                  fullWidth
                  variant="bordered"
                  className="border-white/20 py-5! border rounded-lg"
                  onPress={handleExpand}
                >
                  {expanded ? "Show less" : "Show more"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FilterSection;
