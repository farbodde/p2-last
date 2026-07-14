"use client";
import React, { PropsWithChildren } from "react";
import {
  Modal as ModalHero,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Button from "../Button";
import clsx from "clsx";

type Props = PropsWithChildren & {
  isOpen: boolean;
  title?: string;
  mode?: "dark" | "light";
  placement?:
    | "center"
    | "auto"
    | "top"
    | "top-center"
    | "bottom"
    | "bottom-center"
    | undefined;
  fullScreen?: boolean;
  hideCloseButton?: boolean;
  hideCancelButton?: boolean;
  footerComponent?: React.ReactNode;
  confirmButton?: string;
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

const Modal: React.FC<Props> = ({
  isOpen,
  title,
  fullScreen,
  mode = "dark",
  hideCloseButton,
  hideCancelButton,
  placement,
  children,
  footerComponent,
  confirmDisabled,
  confirmButton,
  onConfirm,
  onClose,
}) => {
  return (
    <ModalHero
      isOpen={isOpen}
      onClose={onClose}
      placement={placement || "center"}
      hideCloseButton={hideCloseButton}
      className={clsx({ "my-0!": fullScreen })}
      classNames={{
        closeButton: clsx("text-2xl", {
          "text-white/60": mode === "dark",
        }),
        wrapper: clsx({
          "overflow-hidden": fullScreen,
        }),
      }}
    >
      <ModalContent
        className={clsx({
          "bg-background": mode === "dark",
          "w-[90%]": !fullScreen,
          "width-screen! h-screen rounded-none m-0 ": fullScreen,
        })}
      >
        {title && (
          <ModalHeader>
            <h2
              className={clsx({
                "text-black": mode === "light",
                "text-white/80": mode === "dark",
              })}
            >
              {title}
            </h2>
          </ModalHeader>
        )}

        <ModalBody className={clsx({ "p-0 w-full": fullScreen })}>
          {children}
        </ModalBody>
        {(footerComponent || !hideCancelButton || onConfirm) && (
          <ModalFooter>
            {footerComponent || (
              <div className="flex items-center gap-2">
                {!hideCancelButton && (
                  <Button
                    variant="light"
                    className={clsx("font-semibold", {
                      "text-black": mode === "light",
                      "text-white/80": mode === "dark",
                    })}
                    onPress={onClose}
                  >
                    CANCEL
                  </Button>
                )}

                {onConfirm && (
                  <Button
                    variant="light"
                    className="font-semibold text-white/80"
                    isDisabled={confirmDisabled}
                    onPress={onConfirm}
                  >
                    {confirmButton || "CONFIRM"}
                  </Button>
                )}
              </div>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </ModalHero>
  );
};

export default Modal;
