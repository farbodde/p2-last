"use client";

import { useCallback, useState } from "react";
import { Alert } from "@heroui/react";
import { Notification2Icon } from "@/components/common/icons";

const NotificationAccess = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined") {
      return "default";
    }

    return "Notification" in window ? Notification.permission : "unsupported";
  });

  const shouldShowPermissionAlert =
    isVisible && notificationPermission !== "granted";

  const handleRequestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      setIsVisible(false);
    }
  }, []);

  if (!shouldShowPermissionAlert) {
    return null;
  }

  return (
    <Alert
      color="default"
      title="Turn on push notifications"
      description={
        <div className="flex flex-col mt-1 gap-2">
          <div>
            {notificationPermission === "denied" ? (
              <p>
                Notifications are blocked in your browser. Enable them in site
                settings to receive updates.
              </p>
            ) : notificationPermission === "unsupported" ? (
              <p>This browser does not support push notification permission.</p>
            ) : (
              <>
                <p>Stay informed without the noise.</p>
                <p>Customize your alert preferences.</p>
              </>
            )}
          </div>
          {notificationPermission === "default" && (
            <button
              type="button"
              className="w-fit cursor-pointer text-sm font-medium text-primary"
              onClick={handleRequestNotificationPermission}
            >
              Enable notifications
            </button>
          )}
        </div>
      }
      isVisible={shouldShowPermissionAlert}
      variant="flat"
      classNames={{
        base: "items-start p-3 bg-gray-300/5",
        title: "text-base font-semibold",
        description: "text-sm text-white",
        iconWrapper: "rounded-lg bg-background text-primary border-0 w-10 h-10",
        closeButton: "text-background font bg-white/40 min-w-6 w-6 h-6",
      }}
      icon={<Notification2Icon />}
      onClose={() => setIsVisible(false)}
    />
  );
};

export default NotificationAccess;
