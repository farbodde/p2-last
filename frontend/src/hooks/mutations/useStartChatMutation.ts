"use client";

import type { StartChatPayload } from "@/@types/chat.type";
import { queryKeys } from "@/lib/query-keys";
import { startChat } from "@/services/chat.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useStartChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartChatPayload) => startChat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};
