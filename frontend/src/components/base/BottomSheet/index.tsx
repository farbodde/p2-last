"use client";
import clsx from "clsx";
import React, { PropsWithChildren, useEffect, useState } from "react";
import Button, { ButtonProps } from "../Button";

type Props = PropsWithChildren & {
  isOpen: boolean;
  title?: string | React.ReactNode;
  description?: string;
  confirmProps?: ButtonProps;
  confirmText?: string;
  closeText?: string;
  onConfirm?: () => void;
  onClose: () => void;
};

const BottomSheet: React.FC<Props> = ({
  isOpen,
  children,
  title,
  description,
  confirmProps,
  confirmText,
  closeText,
  onClose,
  onConfirm,
}) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShow(isOpen);
      });
    } else {
      setTimeout(() => {
        setShow(isOpen);
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <>
      <div
        className="fixed bottom-0 width-screen bg-black/50 z-40 h-screen left-1/2 delay-75 transition -translate-x-1/2"
        onClick={onClose}
      />
      <section
        className={clsx(
          "fixed bottom-0 width-screen bg-background rounded-t-2xl z-50 flex flex-col overflow-auto scroll-smooth gap-4 left-1/2 min-h-0 delay-75 transition -translate-x-1/2",
          {
            "opacity-100 translate-y-0": show,
            "translate-y-1/2 opacity-0": !show || !isOpen,
          },
        )}
      >
        <div className="mt-3 w-full">
          <span className="block mx-auto bg-white/10 w-8 h-1 rounded-full" />
        </div>
        {children || (
          <div className="flex flex-col gap-8 p-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p>{description}</p>
            </div>

            <div className="flex gap-4 items-center">
              <Button
                fullWidth
                onPress={onClose}
                className="bg-[#252932] text-white"
              >
                {closeText || "Cancel"}
              </Button>
              {onConfirm && (
                <Button fullWidth onPress={onConfirm} {...confirmProps}>
                  {confirmText || "Confirm"}
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default BottomSheet;
