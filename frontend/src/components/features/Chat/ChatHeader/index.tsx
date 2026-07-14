"use client";
import BottomSheet from "@/components/base/BottomSheet";
import Button from "@/components/base/Button";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import ChatOptionsSheet from "./ChatOptionsSheet";
import { ArrowLeftIcon, VerticalDotsIcon } from "@/components/common/icons";

type ChatHeaderUser = {
  displayName: string;
  username: string;
  profileImage: string | null;
};

type Props = {
  user?: ChatHeaderUser | null;
  gameTitle?: string | null;
};

const ChatHeader: React.FC<Props> = ({ user, gameTitle }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const displayName =
    user?.displayName?.trim() || user?.username?.trim() || "Player";
  const avatarImage = user?.profileImage || "/images/logo.png";
  const headerGameTitle = gameTitle?.trim() || "LFG Chat";

  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // run once on mount (in case page loads already scrolled)
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <div
        className={clsx(
          "sticky top-0 left-0 w-full z-20 transition-colors duration-300",
          {
            "bg-background/80 backdrop-blur-[2px]": isScrolled,
            "bg-background": !isScrolled,
          },
        )}
      >
        <div className="flex relative z-10 items-center justify-between gap-3 py-4 px-2">
          <Button
            variant="light"
            radius="full"
            size="sm"
            className="min-w-0 p-0 aspect-square text-white"
            onPress={handleBack}
          >
            <ArrowLeftIcon />
          </Button>

          <span className="flex items-center gap-3 flex-1">
            <span
              className={clsx(
                "w-10 h-10 block rounded-full border-2 overflow-hidden border-warning-500",
                //   {
                //     "border-transparent":
                //       item.user.status === OnlineStatusEnum.OFFLINE,
                //     "border-warning-500":
                //       item.user.status === OnlineStatusEnum.AWAY,
                //     "border-emerald-700":
                //       item.user.status === OnlineStatusEnum.ONLINE,
                //   }
              )}
            >
              <Image
                src={avatarImage}
                alt={displayName}
                width={64}
                height={64}
                unoptimized={
                  avatarImage.startsWith("http://") ||
                  avatarImage.startsWith("https://")
                }
                className="w-full h-full object-cover object-center"
              />
            </span>

            <span className="flex flex-col">
              <span className="flex items-center gap-1.5">
                <span className="font-medium leading-[normal]">
                  {displayName}
                </span>
              </span>
              <span className="text-sm text-white/50 leading-[normal]">
                {headerGameTitle}
              </span>
            </span>
          </span>

          <Button
            variant="light"
            radius="full"
            size="sm"
            className="min-w-0 p-0 aspect-square text-white"
            onPress={() => setShowOptions(true)}
          >
            <VerticalDotsIcon />
          </Button>
        </div>
      </div>
      <BottomSheet isOpen={showOptions} onClose={() => setShowOptions(false)}>
        <ChatOptionsSheet onClose={() => setShowOptions(false)} />
      </BottomSheet>
    </>
  );
};

export default ChatHeader;
