"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import { GameFilterItemType } from "@/@types/game.type";

type Props = {
  item: GameFilterItemType;
  isActive: boolean;
  onChange: (key: string) => void;
};

const LFGGameItem: React.FC<Props> = ({ item, isActive, onChange }) => {
  const isRemoteImage =
    typeof item.imageUrl === "string" &&
    (item.imageUrl.startsWith("http://") ||
      item.imageUrl.startsWith("https://"));

  return (
    <div
      className={clsx(
        "w-20 h-20 flex items-center overflow-hidden justify-center rounded-lg border-2 transition",
        {
          "border-primary": isActive,
          "border-transparent": !isActive,
        },
      )}
      onClick={() => onChange(item.key)}
      aria-current={isActive ? "true" : undefined}
    >
      {item.imageUrl ? (
        <Image
          width={128}
          height={128}
          src={item.imageUrl}
          alt={item.title}
          unoptimized={isRemoteImage}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center object-cover bg-white/10 px-2 text-center text-xs font-medium text-white">
          {item.title}
        </span>
      )}
    </div>
  );
};

export default LFGGameItem;
