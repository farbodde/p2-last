"use client";

import { queryKeys } from "@/lib/query-keys";
import { getAccountIds } from "@/services/account-id.service";
import { useQuery } from "@tanstack/react-query";

export const useAccountIdsQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.accountIds,
    queryFn: getAccountIds,
    enabled,
  });
