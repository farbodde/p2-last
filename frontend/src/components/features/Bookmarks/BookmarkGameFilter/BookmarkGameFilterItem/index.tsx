"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GameFilterItemType } from "@/@types/game.type";

type Props = {
  item: GameFilterItemType;
};

const BookmarkGameFilterItem: React.FC<Props> = ({ item }) => {
  const searchParams = useSearchParams();
  const activeGame = searchParams?.get("game") ?? null;
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.set("game", item.key);
  const url = `/bookmarks?${nextSearchParams.toString()}`;
  const isActive = activeGame === item.key;
  const isRemoteImage =
    typeof item.imageUrl === "string" &&
    (item.imageUrl.startsWith("http://") ||
      item.imageUrl.startsWith("https://"));

  return (
    <Link
      href={url}
      className={clsx(
        "w-16 flex items-center overflow-hidden justify-center rounded-lg border-2 transition",
        {
          "border-[#3E8BFF]": isActive,
          "border-transparent": !isActive,
        },
      )}
      aria-current={isActive ? "true" : undefined}
    >
      <Image
        width={64}
        height={64}
        src={item.imageUrl ?? "/images/logo.png"}
        alt={item.title}
        unoptimized={isRemoteImage}
        className="h-full w-full object-cover"
      />
    </Link>
  );
};

export default BookmarkGameFilterItem;
