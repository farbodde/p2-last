"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getNotifications,
  getUnreadNotificationsCount,
} from "@/services/notification.service";

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
  });

export const useUnreadNotificationsCountQuery = () =>
  useQuery({
    queryKey: queryKeys.unreadNotificationsCount,
    queryFn: getUnreadNotificationsCount,
  });
