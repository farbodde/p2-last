"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Header from "@/components/layouts/Header";
import ChatItem from "./ChatItem";
import { useChatsQuery } from "@/hooks/queries/useChatsQuery";
import Button from "@/components/base/Button";
import ChatListEmpty from "./ChatListEmpty";

const ChatList = () => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const chatsQuery = useChatsQuery();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = chatsQuery;
  const chats = useMemo(
    () => chatsQuery.data?.pages.flatMap((page) => page.results) ?? [],
    [chatsQuery.data?.pages],
  );

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!chatsQuery.isLoading && !chatsQuery.isError && chats.length === 0) {
    return <ChatListEmpty />;
  }

  return (
    <>
      <Header title="Chat" scrollTop={25} />
      <section className="pb-10">
        {chatsQuery.isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="mx-4 h-18 animate-pulse border-b border-black/10 bg-white/5"
              />
            ))
          : null}

        {chats.map((chat) => (
          <ChatItem key={chat.id} chat={chat} />
        ))}

        {chatsQuery.isError && chats.length === 0 ? (
          <div className="m-4 flex flex-col items-center gap-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
            <span className="text-sm text-danger">
              {chatsQuery.error instanceof Error
                ? chatsQuery.error.message
                : "Failed to load chats. Please try again."}
            </span>
            <Button
              color="danger"
              variant="bordered"
              isLoading={chatsQuery.isRefetching}
              onPress={() => chatsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {chatsQuery.isError && chats.length > 0 ? (
          <div className="mx-4 my-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger">
            Failed to load more chats.
          </div>
        ) : null}

        <div
          ref={loadMoreRef}
          className="flex min-h-8 items-center justify-center text-xs text-white/40"
        >
          {chatsQuery.isFetchingNextPage ? "Loading more..." : null}
          {!chatsQuery.hasNextPage && chats.length > 0
            ? "You are all caught up."
            : null}
        </div>
      </section>
    </>
  );
};

export default ChatList;
