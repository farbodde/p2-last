"use client";
import React from "react";
import Header from "@/components/layouts/Header";
import NotificationList from "@/components/features/Notifications/NotificationList";
import { useNotificationsQuery } from "@/hooks/queries/useNotificationsQuery";
import type { NotificationItemType } from "@/@types/notification.type";
import NotificationAccess from "./NotificationAccess";

const getDateKey = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const groupNotificationsByDate = (items: NotificationItemType[]) =>
  items.reduce<Record<string, NotificationItemType[]>>((groups, item) => {
    const dateKey = getDateKey(item.createdAt);

    return {
      ...groups,
      [dateKey]: [...(groups[dateKey] ?? []), item],
    };
  }, {});

const Notifications = () => {
  const {
    data: notifications = [],
    error,
    isLoading,
  } = useNotificationsQuery();
  const groupedNotifications = React.useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  );
  const dateKeys = React.useMemo(
    () =>
      Object.keys(groupedNotifications).sort((a, b) => {
        const aTime = new Date(a).getTime();
        const bTime = new Date(b).getTime();

        if (!Number.isFinite(aTime)) return 1;
        if (!Number.isFinite(bTime)) return -1;

        return bTime - aTime;
      }),
    [groupedNotifications],
  );
  const hasNotifications = notifications.length > 0;

  return (
    <section className="flex min-h-screen flex-col">
      <Header hasBack title="Notifications" />
      <div className="flex flex-col gap-4 p-4">
        <NotificationAccess />

        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg bg-gray-300/5"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error instanceof Error
              ? error.message
              : "Failed to load notifications. Please try again."}
          </div>
        )}

        {!isLoading && !error && !hasNotifications && (
          <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
            You do not have any notifications yet.
          </div>
        )}

        {!isLoading &&
          !error &&
          dateKeys.map((dateKey) => (
            <NotificationList
              key={dateKey}
              date={dateKey}
              items={groupedNotifications[dateKey]}
            />
          ))}
      </div>
    </section>
  );
};

export default Notifications;
