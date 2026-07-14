import type {
  ConversationItemType,
  MessageItemType,
} from "@/@types/chat.type";
import ChatForm from "@/components/features/Chat/ChatForm";
import ChatHeader from "@/components/features/Chat/ChatHeader";
import ChatMessageItem from "@/components/features/Chat/ChatMessageItem";
import { MonthNames } from "@/helpers/date";
import { messageChatMock } from "@/mocks/chat.mock";
import React from "react";

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

const getConversations = () => {
  return messageChatMock.reduce((acc: ConversationItemType[], msg) => {
    const updateAcc = [...acc];
    const date = msg.date.split("T")[0];

    const index = updateAcc.findIndex((item) => item.date === date);

    const messageDate = new Date(msg.date);
    const month = MonthNames[messageDate.getMonth()];
    const dateText = `${month} ${messageDate.getDate()}`;

    if (index === -1) {
      updateAcc.push({
        date,
        dateText,
        messages: [msg],
      });
    } else {
      updateAcc[index].messages.push(msg);
    }

    return updateAcc;
  }, []);
};

const ChatMessagingPage = () => {
  const conversations = getConversations();

  return (
    <div className="min-h-screen pb-20">
      <ChatHeader />

      <section className="flex flex-col-reverse gap-10 p-4">
        {conversations.map((conversation) => {
          const groupedMessages = groupMessagesBySender(conversation.messages);

          return (
            <section key={conversation.date} className="flex flex-col gap-6">
              <span className="sticky top-20 w-fit mx-auto text-center bg-gray-700/80 text-sm px-3 py-1 rounded-full">
                {conversation.dateText}
              </span>

              <div className="flex flex-col-reverse gap-5">
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
      </section>

      <ChatForm />
    </div>
  );
};

export default ChatMessagingPage;
