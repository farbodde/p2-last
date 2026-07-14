import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";
import type {
  NotificationItemType,
  NotificationResponse,
} from "@/@types/notification.type";

const parseNotificationErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getNotificationErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

const mapNotificationResponse = (
  notification: NotificationResponse,
): NotificationItemType => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  data: notification.data,
  isRead: notification.is_read,
  createdAt: notification.created_at,
  userId: notification.user,
});

export const getNotifications = async (): Promise<NotificationItemType[]> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.notifications.list}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseNotificationErrorResponse(response);

    return Promise.reject(
      getNotificationErrorMessage(
        errorData,
        "Failed to load notifications. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as NotificationResponse[];

  return Array.isArray(data) ? data.map(mapNotificationResponse) : [];
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.notifications.unreadCount}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseNotificationErrorResponse(response);

    return Promise.reject(
      getNotificationErrorMessage(
        errorData,
        "Failed to load unread notifications count. Please try again.",
      ),
    );
  }

  const data = await response.json();

  if (typeof data === "number") {
    return data;
  }

  return Number(data?.count ?? data?.unread_count ?? 0);
};
