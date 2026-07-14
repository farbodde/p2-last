"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getBlockedUsers } from "@/services/profile.service";

export const useBlockedUsersQuery = (page: number) =>
  useQuery({
    queryKey: queryKeys.blockedUsers(page),
    queryFn: () => getBlockedUsers(page),
    placeholderData: keepPreviousData,
  });
