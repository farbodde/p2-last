import type {
  ChatListResponse,
  ChatMessagesResponse,
  StartChatPayload,
  StartChatResponse,
} from "@/@types/chat.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";

const parseChatErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getChatErrorMessage = (data: unknown, fallbackMessage: string) => {
  if (data && typeof data === "object") {
    if (
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      "detail" in data &&
      typeof data.detail === "string" &&
      data.detail.trim()
    ) {
      return data.detail;
    }
  }

  return fallbackMessage;
};

export const getChats = async ({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<ChatListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.chats.list}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseChatErrorResponse(response);

    return Promise.reject(
      getChatErrorMessage(
        errorData,
        "Failed to load chats. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as ChatListResponse;

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: Array.isArray(data.results) ? data.results : [],
  };
};

export const getChatMessages = async ({
  chatId,
  page = 1,
}: {
  chatId: string | number;
  page?: number;
}): Promise<ChatMessagesResponse> => {
  const params = new URLSearchParams({
    page: String(page),
  });
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.chats.messages(chatId)}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseChatErrorResponse(response);

    return Promise.reject(
      getChatErrorMessage(
        errorData,
        "Failed to load chat messages. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as ChatMessagesResponse;

  return {
    chat_id: data.chat_id,
    chat_title: data.chat_title,
    session_id: data.session_id,
    current_page: data.current_page,
    total_pages: data.total_pages,
    total_messages: data.total_messages,
    has_next: data.has_next,
    has_previous: data.has_previous,
    messages: Array.isArray(data.messages) ? data.messages : [],
    next_page: data.next_page,
    previous_page: data.previous_page,
  };
};

export const startChat = async (
  payload: StartChatPayload,
): Promise<StartChatResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.chats.start}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseChatErrorResponse(response);

    return Promise.reject(
      getChatErrorMessage(
        errorData,
        "Failed to start chat. Please try again.",
      ),
    );
  }

  return response.json();
};
