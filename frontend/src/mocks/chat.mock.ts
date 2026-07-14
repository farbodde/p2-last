import { MessageItemType, MessageTypeEnum } from "@/@types/chat.type";

const date0 = new Date();

const date1 = new Date();
date1.setDate(date1.getDate() - 1);

const date2 = new Date();
date2.setDate(date2.getDate() - 2);

export const messageChatMock: MessageItemType[] = [
  {
    id: 17,
    account: {
      username: "Farbodde2465445",
      console: "playstation",
    },
    userId: 1,
    date: date0.toISOString(),
    type: MessageTypeEnum.ACCOUNT,
  },
  {
    id: 16,
    account: {
      username: "Door-bold985",
      console: "playstation",
    },
    userId: 2,
    date: date0.toISOString(),
    type: MessageTypeEnum.ACCOUNT,
  },
  {
    id: 15,
    text: "I cant play now",
    userId: 1,
    date: date0.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 14,
    text: "???",
    userId: 2,
    date: date0.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 13,
    text: "Are you here?😂",
    userId: 2,
    date: date0.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 12,
    text: "Who wanna play fortnite?",
    userId: 2,
    date: date0.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 11,
    text: "helloo, are you online for play now??\nadd me we need 2",
    userId: 1,
    date: date0.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 10,
    text: "I cant play now",
    userId: 1,
    date: date1.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 9,
    text: "???",
    userId: 2,
    date: date1.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 8,
    text: "Are you here?😂",
    userId: 2,
    date: date1.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 7,
    text: "Who wanna play fortnite?",
    userId: 2,
    date: date1.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 6,
    text: "helloo, are you online for play now??\nadd me we need 2",
    userId: 1,
    date: date1.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 5,
    text: "I cant play now",
    userId: 1,
    date: date2.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 4,
    text: "???",
    userId: 2,
    date: date2.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 3,
    text: "Are you here?😂",
    userId: 2,
    date: date2.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 2,
    text: "Who wanna play fortnite?",
    userId: 2,
    date: date2.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
  {
    id: 1,
    text: "helloo, are you online for play now??\nadd me we need 2",
    userId: 1,
    date: date2.toISOString(),
    type: MessageTypeEnum.TEXT,
  },
];
