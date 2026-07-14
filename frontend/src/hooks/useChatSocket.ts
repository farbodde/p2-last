"use client";

import type {
  ChatMessage,
  ChatMessagesResponse,
  ChatSocketError,
  ChatSocketMessage,
} from "@/@types/chat.type";
import { getChatSocketUrl } from "@/config/socket.config";
import { queryKeys } from "@/lib/query-keys";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import { getAccessToken } from "@/lib/auth";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatSocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

type UseChatSocketParams = {
  chatId: string | number | null;
  enabled?: boolean;
};

const isSocketError = (data: unknown): data is ChatSocketError =>
  Boolean(
    data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string",
  );

const isSocketMessage = (data: unknown): data is ChatSocketMessage =>
  Boolean(
    data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string" &&
      "sender" in data &&
      typeof data.sender === "string" &&
      "chat_id" in data &&
      typeof data.chat_id === "number" &&
      "msg_id" in data &&
      typeof data.msg_id === "number",
  );

const appendMessageToCache = (
  current: InfiniteData<ChatMessagesResponse, number> | undefined,
  message: ChatMessage,
) => {
  if (!current) {
    return current;
  }

  const exists = current.pages.some((page) =>
    page.messages.some((item) => item.id === message.id),
  );

  if (exists) {
    return current;
  }

  const [firstPage, ...remainingPages] = current.pages;

  if (!firstPage) {
    return current;
  }

  return {
    ...current,
    pages: [
      {
        ...firstPage,
        total_messages: firstPage.total_messages + 1,
        messages: [...firstPage.messages, message],
      },
      ...remainingPages,
    ],
  };
};

export const useChatSocket = ({
  chatId,
  enabled = true,
}: UseChatSocketParams) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const [status, setStatus] = useState<ChatSocketStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId || !enabled) {
      return;
    }

    shouldReconnectRef.current = true;

    const connect = () => {
      setStatus("connecting");
      setLastError(null);

      const socket = new WebSocket(getChatSocketUrl(chatId, getAccessToken()));
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setStatus("open");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as unknown;

          if (isSocketError(data)) {
            setLastError(data.error);
            addToast({
              title: "Chat error",
              description: data.error,
              color: "danger",
              severity: "danger",
            });
            return;
          }

          if (!isSocketMessage(data)) {
            return;
          }

          queryClient.setQueryData<InfiniteData<ChatMessagesResponse, number>>(
            queryKeys.chatMessages(chatId),
            (current) =>
              appendMessageToCache(current, {
                id: data.msg_id,
                chat_id: data.chat_id,
                sender_username: data.sender,
                type: "text",
                content: data.message,
                created_at: new Date().toISOString(),
                deleted: false,
              }),
          );
        } catch {
          setLastError("Failed to read chat message.");
        }
      };

      socket.onerror = () => {
        setStatus("error");
        setLastError("Chat socket error.");
      };

      socket.onclose = (event) => {
        setStatus("closed");

        if (event.code === 4001) {
          setLastError("You do not have permission for this chat.");
          return;
        }

        if (event.code === 4004) {
          setLastError("Chat not found.");
          return;
        }

        if (!shouldReconnectRef.current) {
          return;
        }

        reconnectAttemptRef.current += 1;
        const delay = Math.min(1000 * reconnectAttemptRef.current, 5000);

        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [chatId, enabled, queryClient]);

  const sendMessage = useCallback((message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return false;
    }

    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setLastError("Chat is not connected yet.");
      return false;
    }

    socketRef.current.send(JSON.stringify({ message: trimmedMessage }));
    return true;
  }, []);

  return {
    status: chatId && enabled ? status : "idle",
    lastError,
    isConnected: Boolean(chatId && enabled && status === "open"),
    sendMessage,
  };
};
