"use client";

import { queryKeys } from "@/lib/query-keys";
import { getChats } from "@/services/chat.service";
import { useInfiniteQuery } from "@tanstack/react-query";

const CHAT_PAGE_SIZE = 10;

export const useChatsQuery = () =>
  useInfiniteQuery({
    queryKey: queryKeys.chats,
    queryFn: ({ pageParam }) =>
      getChats({
        page: pageParam,
        pageSize: CHAT_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.next ? lastPageParam + 1 : undefined,
  });
