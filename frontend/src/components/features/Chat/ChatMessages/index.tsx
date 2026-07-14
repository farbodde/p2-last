"use client";

import type {
  ChatMessage,
  ConversationItemType,
  MessageItemType,
} from "@/@types/chat.type";
import { MessageTypeEnum } from "@/@types/chat.type";
import Button from "@/components/base/Button";
import ChatMessageItem from "@/components/features/Chat/ChatMessageItem";
import { MonthNames } from "@/helpers/date";
import { useChatMessagesQuery } from "@/hooks/queries/useChatMessagesQuery";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  chatId: string | number | null;
  peerUsername: string;
};

const formatMessageDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = MonthNames[date.getMonth()];

  return `${month} ${date.getDate()}`;
};

const groupMessagesBySender = (messages: MessageItemType[]) => {
  return messages.reduce((acc: MessageItemType[][], msg) => {
    const lastGroup = acc[acc.length - 1];

    if (!lastGroup) {
      acc.push([msg]);
      return acc;
    }

    if (lastGroup[0].userId === msg.userId) {
      lastGroup.push(msg);
    } else {
      acc.push([msg]);
    }

    return acc;
  }, []);
};

const groupMessagesByDate = (messages: MessageItemType[]) => {
  return messages.reduce((acc: ConversationItemType[], msg) => {
    const date = msg.date.split("T")[0];
    const index = acc.findIndex((item) => item.date === date);

    if (index === -1) {
      acc.push({
        date,
        dateText: formatMessageDate(msg.date),
        messages: [msg],
      });
    } else {
      acc[index].messages.push(msg);
    }

    return acc;
  }, []);
};

const toMessageItem = ({
  message,
  currentUsername,
  peerUsername,
}: {
  message: ChatMessage;
  currentUsername: string | null;
  peerUsername: string;
}): MessageItemType => {
  const isMine = currentUsername
    ? message.sender_username === currentUsername
    : message.sender_username !== peerUsername;

  return {
    id: message.id,
    userId: isMine ? 1 : 2,
    date: message.created_at,
    type: MessageTypeEnum.TEXT,
    text: message.deleted ? "This message was deleted." : message.content,
  };
};

const ChatMessages = ({ chatId, peerUsername }: Props) => {
  const loadOlderRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const hasScrolledToBottomRef = useRef(false);
  const profileQuery = useProfileQuery();
  const messagesQuery = useChatMessagesQuery({ chatId });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = messagesQuery;
  const pageCount = messagesQuery.data?.pages.length ?? 0;
  const currentUsername = profileQuery.data?.username ?? null;
  const messages = useMemo(() => {
    const apiMessages =
      messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];
    const uniqueMessages = new Map<number, ChatMessage>();

    apiMessages.forEach((message) => {
      uniqueMessages.set(message.id, message);
    });

    return Array.from(uniqueMessages.values())
      .sort((a, b) => {
        const dateDiff =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        return dateDiff || a.id - b.id;
      })
      .map((message) =>
        toMessageItem({
          message,
          currentUsername,
          peerUsername,
        }),
      );
  }, [currentUsername, messagesQuery.data?.pages, peerUsername]);
  const conversations = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    const loadOlderElement = loadOlderRef.current;

    if (!loadOlderElement || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          previousScrollHeightRef.current = document.documentElement.scrollHeight;
          fetchNextPage();
        }
      },
      {
        rootMargin: "240px 0px 0px",
      },
    );

    observer.observe(loadOlderElement);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!messagesQuery.isSuccess || messages.length === 0) {
      return;
    }

    if (!hasScrolledToBottomRef.current) {
      hasScrolledToBottomRef.current = true;
      window.scrollTo(0, document.documentElement.scrollHeight);
      return;
    }

    if (previousScrollHeightRef.current !== null) {
      const previousScrollHeight = previousScrollHeightRef.current;
      previousScrollHeightRef.current = null;
      window.scrollTo(
        0,
        document.documentElement.scrollHeight -
          previousScrollHeight +
          window.scrollY,
      );
    }
  }, [messages.length, messagesQuery.isSuccess, pageCount]);

  if (messagesQuery.isLoading) {
    return (
      <section className="flex flex-col gap-8 p-4">
        <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-white/5" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`h-11 animate-pulse rounded-lg bg-white/5 ${
              index % 2 === 0 ? "ml-auto w-52" : "w-64"
            }`}
          />
        ))}
      </section>
    );
  }

  if (messagesQuery.isError && messages.length === 0) {
    return (
      <section className="p-4">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
          <span className="text-sm text-danger">
            {messagesQuery.error instanceof Error
              ? messagesQuery.error.message
              : "Failed to load chat messages. Please try again."}
          </span>
          <Button
            color="danger"
            variant="bordered"
            isLoading={messagesQuery.isRefetching}
            onPress={() => messagesQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (messages.length === 0) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center p-4 text-center text-sm text-white/50">
        No messages here yet.
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-10 p-4">
      <div
        ref={loadOlderRef}
        className="flex min-h-8 items-center justify-center text-xs text-white/40"
      >
        {isFetchingNextPage ? "Loading older messages..." : null}
        {!hasNextPage && messages.length > 0 ? "Start of conversation" : null}
      </div>

      {conversations.map((conversation) => {
        const groupedMessages = groupMessagesBySender(conversation.messages);

        return (
          <section key={conversation.date} className="flex flex-col gap-6">
            <span className="sticky top-20 w-fit mx-auto text-center bg-gray-700/80 text-sm px-3 py-1 rounded-full">
              {conversation.dateText}
            </span>

            <div className="flex flex-col gap-1">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-1">
                  {group.map((msg, index) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      isFirst={index === 0}
                      isLast={index === group.length - 1}
                      isSingle={group.length === 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {messagesQuery.isError && messages.length > 0 ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger">
          Failed to load older messages.
        </div>
      ) : null}
    </section>
  );
};

export default ChatMessages;
