"use client";

import { queryKeys } from "@/lib/query-keys";
import { deleteLfg } from "@/services/lfg.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteLfgMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLfg,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarksFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileLfgLists });
      queryClient.invalidateQueries({ queryKey: queryKeys.lfgDetails });
    },
  });
};
