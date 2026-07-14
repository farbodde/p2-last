"use client";

import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bookmarkLfg,
  type LfgBookmarkId,
  unbookmarkLfg,
} from "@/services/lfg-bookmark.service";

export const useLfgBookmarkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lfgId,
      shouldBookmark,
    }: {
      lfgId: LfgBookmarkId;
      shouldBookmark: boolean;
    }) => (shouldBookmark ? bookmarkLfg(lfgId) : unbookmarkLfg(lfgId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarksFeeds });
    },
  });
};
