/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@heroui/react";
import clsx from "clsx";
import { SettingsIcon } from "@/components/common/icons";
import { FiltersRecord } from "@/@types/filter.type";

type Props = {
  onOpen: () => void;
};

const FilterButton: React.FC<Props> = ({ onOpen }) => {
  const [filters, setFilters] = useState<FiltersRecord>({});

  const searchParams = useSearchParams();

  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams.entries());

    const urlFilters = Object.entries(queryParams).reduce(
      (acc: FiltersRecord, [key, val]: [string, string]) => ({
        ...acc,
        [key]: val.split(","),
      }),
      {},
    );

    setFilters(urlFilters);
  }, [searchParams]);

  const filterLength = useMemo(() => Object.keys(filters).length, [filters]);

  return (
    <>
      <Badge
        color="primary"
        className="text-xs"
        hidden={!filterLength}
        content={filterLength}
      >
        <button
          className={clsx(
            "px-3 py-1.5 border-1.5 text-sm flex items-center gap-1 rounded-lg",
            {
              "border-white/30 text-white/80": !filterLength,
              "border-primary text-primary bg-primary/15": !!filterLength,
            },
          )}
          onClick={onOpen}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span className="leading-[normal] text-white/80">Filters</span>
        </button>
      </Badge>
    </>
  );
};

export default FilterButton;
