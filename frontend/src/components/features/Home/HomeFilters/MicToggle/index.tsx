/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { MicOnIcon } from "@/components/common/icons";
import { FiltersRecord } from "@/@types/filter.type";

const MicToggle: React.FC = () => {
  const [filters, setFilters] = useState<FiltersRecord>({});

  const pathname = usePathname();
  const navigate = useRouter();
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

  const handleToggle = useCallback(() => {
    const quickSelections = [...(filters?.quickSelections || [])];
    const index = quickSelections.indexOf("mic-on");
    if (index === -1) {
      quickSelections.push("mic-on");
    } else {
      quickSelections.splice(index, 1);
    }
    const newFilters = {
      ...filters,
      quickSelections,
    };

    const query = Object.entries(newFilters).reduce(
      (acc: string[], [key, val]) => {
        if (val.length === 0) return acc;
        return [...acc, `${key}=${val}`];
      },
      [],
    );

    navigate.push(`${pathname}?${query.join("&")}`, {
      scroll: true,
    });
  }, [filters, navigate, pathname]);

  const filtered = useMemo(
    () => (filters.quickSelections || []).includes("mic-on"),
    [filters],
  );

  return (
    <>
      <button
        className={clsx(
          "px-3 py-1.5 border-1.5 text-sm flex items-center gap-1 rounded-lg",
          {
            "border-white/30 text-white/80": !filtered,
            "border-primary text-primary bg-primary/15": filtered,
          },
        )}
        onClick={handleToggle}
      >
        <MicOnIcon className="w-4 h-4" />
        <span className="text-white/80">Mic</span>
      </button>
    </>
  );
};

export default MicToggle;
