"use client";

import { Alert as HeroUIAlert } from "@heroui/react";
import React from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export type AlertProps = {
  type?: AlertType;
  title?: string;
  message: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  defaultOpen?: boolean;
  onDismiss?: () => void;
};

const colorMap: Record<AlertType, "success" | "danger" | "warning" | "primary"> =
  {
    success: "success",
    error: "danger",
    warning: "warning",
    info: "primary",
  };

const Alert = ({
  type = "info",
  title,
  message,
  className,
  dismissible = true,
  defaultOpen = true,
  onDismiss,
}: AlertProps) => {
  return (
    <HeroUIAlert
      color={colorMap[type]}
      title={title}
      description={message}
      className={className}
      variant="flat"
      isClosable={dismissible}
      isDefaultVisible={defaultOpen}
      onClose={onDismiss}
    />
  );
};

export default Alert;
