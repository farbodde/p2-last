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

const FilterGameItem: React.FC<Props> = ({ item, isActive, onChange }) => {
  const isRemoteImage =
    typeof item.imageUrl === "string" &&
    (item.imageUrl.startsWith("http://") ||
      item.imageUrl.startsWith("https://"));

  return (
    <div
      className={clsx(
        "h-16 w-16 flex items-center overflow-hidden justify-center rounded-lg border-2 transition",
        {
          "border-[#3E8BFF]": isActive,
          "border-transparent": !isActive,
        },
      )}
      onClick={() => onChange(item.key)}
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
    </div>
  );
};

export default FilterGameItem;
