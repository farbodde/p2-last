"use client";

import { queryKeys } from "@/lib/query-keys";
import { getCountries } from "@/services/meta.service";
import { useQuery } from "@tanstack/react-query";

export const useCountriesQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.countries,
    queryFn: getCountries,
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
