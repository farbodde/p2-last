import { apiConfig } from "@/config/api.config";

export const socketConfig = {
  baseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL,
} as const;

const resolveSocketBaseUrl = () => {
  if (socketConfig.baseUrl) {
    return socketConfig.baseUrl.replace(/\/$/, "");
  }

  const apiUrl = new URL(apiConfig.baseUrl);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "";
  apiUrl.search = "";
  apiUrl.hash = "";

  return apiUrl.toString().replace(/\/$/, "");
};

export const getChatSocketUrl = (
  chatId: string | number,
  accessToken?: string | null,
) => {
  const url = new URL(
    `/ws/chat/${encodeURIComponent(String(chatId))}/`,
    resolveSocketBaseUrl(),
  );

  if (accessToken) {
    url.searchParams.set("token", accessToken);
  }

  return url.toString();
};
