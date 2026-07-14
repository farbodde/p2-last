"use client";

import { queryKeys } from "@/lib/query-keys";
import { getChatMessages } from "@/services/chat.service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useChatMessagesQuery = ({
  chatId,
  enabled = true,
}: {
  chatId: string | number | null;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: chatId
      ? queryKeys.chatMessages(chatId)
      : queryKeys.chatMessages(""),
    queryFn: ({ pageParam }) =>
      getChatMessages({
        chatId: chatId as string | number,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.has_next
        ? (lastPage.next_page ?? lastPage.current_page + 1)
        : undefined,
    enabled: Boolean(chatId) && enabled,
  });
