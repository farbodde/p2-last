"use client";
import Button from "@/components/base/Button";
import { ArrowLeftIcon } from "@/components/common/icons";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

type Props = {
  title?: string;
  scrollTop?: number;
  rightComponent?: React.ReactNode;
  hasBack?: boolean;
  onClose?: () => void;
};

const Header: React.FC<Props> = ({
  title,
  scrollTop,
  hasBack,
  rightComponent,
  onClose,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > (scrollTop || 100));
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // run once on mount (in case page loads already scrolled)
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrollTop]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    else if (hasBack) {
      router.back();
    }
  }, [hasBack, onClose, router]);

  return (
    <div
      className={clsx(
        "sticky top-0 left-0 w-full z-20 transition-colors duration-300",
        {
          "bg-background/80 backdrop-blur-[2px]": isScrolled,
          "bg-background": !isScrolled,
        },
      )}
    >
      <div className="flex relative z-10 items-center justify-between gap-3 p-4">
        {(hasBack || onClose) && (
          <Button
            variant="light"
            radius="full"
            size="sm"
            className="min-w-0 p-0 aspect-square text-white"
            onPress={handleClose}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
        )}

        {title && <span className="text-lg font-semibold">{title}</span>}

        {rightComponent || ((hasBack || onClose) && <span className="w-10" />)}
      </div>
    </div>
  );
};

export default Header;
