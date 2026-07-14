"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import { GamePlatformViewData } from "@/@types/game.type";

type Props = {
  item: GamePlatformViewData;
  isActive: boolean;
  onChange: (id: number) => void;
};

const LFGPlatformItem: React.FC<Props> = ({ item, isActive, onChange }) => {
  const isRemoteImage =
    typeof item.logoUrl === "string" &&
    (item.logoUrl.startsWith("http://") ||
      item.logoUrl.startsWith("https://"));

  return (
    <button
      type="button"
      title={item.title}
      aria-label={item.title}
      className={clsx(
        "w-14.5 shrink-0 aspect-square flex items-center overflow-hidden justify-center rounded-lg border transition",
        {
          "border-primary text-primary": isActive,
          "border-white/20 text-white/60": !isActive,
        },
      )}
      onClick={() => onChange(item.id)}
      aria-current={isActive ? "true" : undefined}
    >
      {item.logoUrl ? (
        <Image
          width={32}
          height={32}
          src={item.logoUrl}
          alt=""
          unoptimized={isRemoteImage}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <span className="px-1 text-center text-xs font-medium">
          {item.title}
        </span>
      )}
    </button>
  );
};

export default LFGPlatformItem;
