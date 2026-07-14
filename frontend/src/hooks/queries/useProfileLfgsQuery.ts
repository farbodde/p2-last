"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getMyProfileLfgs,
  getUserProfileLfgs,
} from "@/services/lfg.service";
import { usePublicProfileQuery } from "./usePublicProfileQuery";

const PROFILE_LFG_PAGE_SIZE = 10;

export const useProfileLfgsQuery = (username?: string) => {
  const publicProfileQuery = usePublicProfileQuery(username ?? "");
  const userId = publicProfileQuery.data?.id;
  const isPublicProfile = Boolean(username);

  const lfgQuery = useInfiniteQuery({
    queryKey: queryKeys.profileLfgs(username),
    queryFn: ({ pageParam }) => {
      if (!isPublicProfile) {
        return getMyProfileLfgs({
          page: pageParam,
          pageSize: PROFILE_LFG_PAGE_SIZE,
        });
      }

      if (userId === undefined) {
        return Promise.reject("Unable to resolve this profile.");
      }

      return getUserProfileLfgs({
        userId,
        page: pageParam,
        pageSize: PROFILE_LFG_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.next ? lastPageParam + 1 : undefined,
    enabled: !isPublicProfile || userId !== undefined,
  });

  return {
    ...lfgQuery,
    isResolvingUser: isPublicProfile && publicProfileQuery.isLoading,
    userError: isPublicProfile ? publicProfileQuery.error : null,
  };
};
