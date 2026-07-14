"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import { MessageItemType, MessageTypeEnum } from "@/@types/chat.type";
import Button from "@/components/base/Button";
import { CopyIcon } from "@/components/common/icons";
import Image from "next/image";

type Props = {
  message: MessageItemType;
  isFirst?: boolean;
  isLast?: boolean;
  isSingle?: boolean;
};

const ChatMessageItem: React.FC<Props> = ({
  message,
  isFirst,
  isLast,
  isSingle,
}) => {
  const isMine = message.userId === 1;

  const handleCopy = async () => {
    if (message.type === MessageTypeEnum.ACCOUNT) {
      try {
        await navigator.clipboard.writeText(message.account.username);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const bubbleClasses = useMemo(() => {
    return clsx(
      "w-fit p-3 max-w-[90%] text-sm transition-all",
      {
        "ml-auto bg-primary text-white": isMine,
        "bg-white/5 text-white": !isMine,
      },

      // Single message → fully rounded
      isSingle && "rounded-lg",

      // My messages
      isMine &&
        !isSingle &&
        clsx({
          "rounded-lg rounded-br-xs": isFirst,
          "rounded-lg": !isFirst && !isLast,
          "rounded-lg rounded-tr-xs": isLast,
        }),

      // Other user messages
      !isMine &&
        !isSingle &&
        clsx({
          "rounded-lg rounded-bl-xs": isFirst,
          "rounded-lg": !isFirst && !isLast,
          "rounded-lg rounded-tl-xs": isLast,
        }),
    );
  }, [isMine, isFirst, isLast, isSingle]);

  return (
    <div className={bubbleClasses}>
      {message.type === MessageTypeEnum.TEXT ? (
        message.text
      ) : (
        <span className="flex items-center gap-2">
          <Image
            src="/images/platforms/playstation.png"
            alt="playstation"
            width={40}
            height={40}
            className="w-8 h-8"
          />

          <span className="flex flex-col min-w-10">
            <span className="font-medium">{message.account.username}</span>
            <span className="text-xs text-white/50">
              {message.account.console}
            </span>
          </span>

          <Button
            variant="light"
            size="sm"
            className="min-w-0 text-white/80 aspect-square p-0"
            onPress={handleCopy}
          >
            <CopyIcon className="w-5 h-5" />
          </Button>
        </span>
      )}
    </div>
  );
};

export default ChatMessageItem;
