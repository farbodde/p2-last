"use client";

import { queryKeys } from "@/lib/query-keys";
import { getFilterConfig } from "@/services/filter-config.service";
import { useQuery } from "@tanstack/react-query";

export const useFilterConfigQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.filterConfig,
    queryFn: getFilterConfig,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
