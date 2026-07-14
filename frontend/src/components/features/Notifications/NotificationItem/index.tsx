import React from "react";
import type { NotificationItemType } from "@/@types/notification.type";
import { Notification2Icon } from "@/components/common/icons";
import clsx from "clsx";

type Props = {
  item: NotificationItemType;
};

const getRelativeTime = (date: string) => {
  const createdAt = new Date(date).getTime();

  if (!Number.isFinite(createdAt)) {
    return "";
  }

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt) / 1000),
  );
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  const unit = units.find((item) => diffInSeconds >= item.seconds);

  if (!unit) {
    return "Just now";
  }

  const value = Math.floor(diffInSeconds / unit.seconds);

  return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
};

const NotificationItem: React.FC<Props> = ({ item }) => {
  return (
    <div
      className={clsx(
        "flex items-start gap-4 rounded-lg p-4",
        item.isRead ? "bg-gray-300/5" : "bg-primary/10",
      )}
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
        <Notification2Icon className="h-5 w-5" />
        {!item.isRead && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium text-white/90">{item.title}</span>
          <span className="text-xs font-medium text-white/25">
            {getRelativeTime(item.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-gray-300">{item.body}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
