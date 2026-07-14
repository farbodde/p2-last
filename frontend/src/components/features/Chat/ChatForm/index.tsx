"use client";
import Button from "@/components/base/Button";
import React, { useCallback, useState } from "react";
import ChatAttachAccountID from "./ChatAttachAccountID";
import { SendIcon } from "@/components/common/icons";

type Props = {
  onSendMessage?: (message: string) => boolean | Promise<boolean>;
  isDisabled?: boolean;
  isSendDisabled?: boolean;
};

const ChatForm: React.FC<Props> = ({
  onSendMessage,
  isDisabled = false,
  isSendDisabled = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedMessage = message.trim();

      if (!trimmedMessage || isDisabled || isSendDisabled) {
        return;
      }

      const didSend = await onSendMessage?.(trimmedMessage);

      if (didSend) {
        setMessage("");
      }
    },
    [isDisabled, isSendDisabled, message, onSendMessage],
  );

  return (
    <div className="fixed mt-auto bottom-0 width-screen min-h-10 z-20 p-2">
      <form
        className="flex items-center bg-tab h-12 rounded-full p-1"
        onSubmit={handleSubmit}
      >
        <ChatAttachAccountID />
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isDisabled}
          className="p-1 flex-1 text-white/70 placeholder:text-white/15 outline-0"
          placeholder="Message"
        />
        <Button
          type="submit"
          color="primary"
          radius="full"
          isDisabled={isDisabled || isSendDisabled || !message.trim()}
          className="aspect-square min-w-0 p-0"
        >
          <SendIcon />
        </Button>
      </form>
    </div>
  );
};

export default ChatForm;
