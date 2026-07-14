"use client";

import type { UpdateLFGRequest } from "@/@types/lfg.type";
import { queryKeys } from "@/lib/query-keys";
import { updateLfg } from "@/services/lfg.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateLfgMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLFGRequest) => updateLfg(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarksFeeds });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileLfgLists });
      queryClient.invalidateQueries({ queryKey: queryKeys.lfgDetails });
    },
  });
};
