"use client";
import Link from "next/link";
import { NotificationIcon } from "@/components/common/icons";
import { Badge, Button } from "@heroui/react";
import { useUnreadNotificationsCountQuery } from "@/hooks/queries/useNotificationsQuery";

const HeaderNotification = () => {
  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery();

  return (
    <Button
      as={Link}
      href="/notifications"
      radius="full"
      size="sm"
      className="h-fit w-fit min-w-fit aspect-square p-2"
      variant="light"
    >
      <Badge
        color="danger"
        content={unreadCount > 99 ? "99+" : unreadCount}
        hidden={!unreadCount}
        shape="circle"
      >
        <NotificationIcon className="text-white" />
      </Badge>
    </Button>
  );
};

export default HeaderNotification;
