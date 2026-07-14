"use client";

import ChatForm from "@/components/features/Chat/ChatForm";
import ChatMessages from "@/components/features/Chat/ChatMessages";
import { useStartChatMutation } from "@/hooks/mutations/useStartChatMutation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { addToast } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  chatId: string | null;
  peerUsername: string;
};

const ChatConversation = ({ chatId, peerUsername }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startChatMutation = useStartChatMutation();
  const { isPending: isStartingChat, mutateAsync: startChat } =
    startChatMutation;
  const pendingInitialMessageRef = useRef<string | null>(null);
  const [startedChatId, setStartedChatId] = useState<string | null>(null);
  const activeChatId = chatId ?? startedChatId;
  const chatSocket = useChatSocket({
    chatId: activeChatId,
    enabled: Boolean(activeChatId),
  });
  const { isConnected, sendMessage } = chatSocket;

  useEffect(() => {
    const pendingMessage = pendingInitialMessageRef.current;

    if (!pendingMessage || !activeChatId || !isConnected) {
      return;
    }

    const didSend = sendMessage(pendingMessage);

    if (!didSend) {
      return;
    }

    pendingInitialMessageRef.current = null;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("chatId", activeChatId);
    router.replace(`${pathname}?${nextSearchParams.toString()}`);
  }, [activeChatId, isConnected, pathname, router, sendMessage, searchParams]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (activeChatId) {
        return sendMessage(message);
      }

      try {
        const chat = await startChat({
          username: peerUsername,
        });
        const nextChatId = String(chat.chat_id);

        pendingInitialMessageRef.current = message;
        setStartedChatId(nextChatId);

        return true;
      } catch (error) {
        addToast({
          title: "Unable to start chat",
          description:
            error instanceof Error
              ? error.message
              : "Failed to start chat. Please try again.",
          color: "danger",
          severity: "danger",
        });

        return false;
      }
    },
    [activeChatId, peerUsername, sendMessage, startChat],
  );

  return (
    <>
      {activeChatId ? (
        <ChatMessages chatId={activeChatId} peerUsername={peerUsername} />
      ) : null}

      <ChatForm
        isSendDisabled={isStartingChat || Boolean(activeChatId && !isConnected)}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default ChatConversation;
