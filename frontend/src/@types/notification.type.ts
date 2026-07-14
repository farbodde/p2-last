export type NotificationResponse = {
  id: number;
  title: string;
  body: string;
  data: string;
  is_read: boolean;
  created_at: string;
  user: number;
};

export type NotificationItemType = {
  id: number;
  title: string;
  body: string;
  data: string;
  isRead: boolean;
  createdAt: string;
  userId: number;
};
