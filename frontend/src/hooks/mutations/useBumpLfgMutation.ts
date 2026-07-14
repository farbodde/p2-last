"use client";

import { queryKeys } from "@/lib/query-keys";
import { bumpLfg } from "@/services/lfg.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBumpLfgMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lfgId: string | number) => bumpLfg(lfgId),
    onSuccess: (_response, lfgId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarksFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileLfgLists });
      queryClient.invalidateQueries({
        queryKey: queryKeys.lfgDetail(lfgId),
      });
    },
  });
};
