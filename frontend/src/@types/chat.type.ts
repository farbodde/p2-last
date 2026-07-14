export enum MessageTypeEnum {
  TEXT = "text",
  ACCOUNT = "account",
}

export type AccountType = {
  username: string;
  console: "playstation" | "pc";
};

export type MessageItemBaseType = {
  id: number;
  userId: number;
  date: string;
};

export type MessageItemTextType = {
  text: string;
  type: MessageTypeEnum.TEXT;
};

export type MessageItemAccountType = {
  account: AccountType;
  type: MessageTypeEnum.ACCOUNT;
};

export type MessageItemType = MessageItemBaseType &
  (MessageItemTextType | MessageItemAccountType);

export type ConversationItemType = {
  date: string;
  dateText: string;
  messages: MessageItemType[];
};

export type Chat = {
  id: number;
  session_id: string;
  title: string;
  other_user: {
    username: string | null;
    display_name: string;
    profile_image: string | null;
  };
  last_message: {
    id: number;
    content: string;
    sender: string | null;
    created_at: string;
  } | null;
  created_at: string;
};

export type ChatListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Chat[];
};

export type ChatMessage = {
  id: number;
  chat_id: number;
  sender_username: string;
  type: string;
  content: string;
  created_at: string;
  deleted: boolean;
};

export type ChatMessagesResponse = {
  chat_id: number;
  chat_title: string;
  session_id: string;
  current_page: number;
  total_pages: number;
  total_messages: number;
  has_next: boolean;
  has_previous: boolean;
  messages: ChatMessage[];
  next_page?: number;
  previous_page?: number;
};

export type ChatSocketMessage = {
  message: string;
  sender: string;
  chat_id: number;
  msg_id: number;
};

export type ChatSocketError = {
  error: string;
};

export type StartChatPayload = {
  username: string;
};

export type StartChatResponse = {
  chat_id: number;
  session_id: string;
};
