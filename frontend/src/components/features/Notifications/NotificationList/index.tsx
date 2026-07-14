import React, { useMemo } from "react";
import NotificationItem from "../NotificationItem";
import type { NotificationItemType } from "@/@types/notification.type";

type Props = {
  date: string;
  items: NotificationItemType[];
};

const NotificationList: React.FC<Props> = ({ date, items }) => {
  const dateLabel = useMemo(() => {
    const d = new Date(date);
    const today = new Date();

    if (Number.isNaN(d.getTime())) {
      return "Unknown";
    }

    if (today.toDateString() === d.toDateString()) {
      return "Today";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }, [date]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-white">{dateLabel}</h2>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <NotificationItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default NotificationList;
