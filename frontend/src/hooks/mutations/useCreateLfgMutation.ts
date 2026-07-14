"use client";

import type { CreateLFGPayload } from "@/@types/lfg.type";
import { queryKeys } from "@/lib/query-keys";
import { createLfg } from "@/services/lfg.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateLfgMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLFGPayload) => createLfg(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeFeeds });
    },
  });
};
