import { AddIcon, CloseCircleIcon } from "@/components/common/icons";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import type { GameCategoryItem } from "@/@types/game.type";

type Props = {
  label: string;
  limit: number;
  value: number[];
  items: GameCategoryItem[];
  onChange: (id: number) => void;
};

const MatchingSection: React.FC<Props> = ({
  label,
  limit,
  value,
  items,
  onChange,
}) => {
  return (
    <div className="relative border border-white/30 rounded-xl pb-4 pt-5">
      <div className="absolute bottom-full left-3 translate-y-1/2 bg-background">
        <h3 className="flex items-center gap-2 px-1 text-sm text-white/50">
          <span>{label}</span>
          {limit !== -1 ? (
            <span className="text-xs text-white/30">
              Select up to {limit}
            </span>
          ) : null}
        </h3>
      </div>
      <div className="w-full overflow-auto scrollbar-hide scroll-smooth">
        <div className="flex items-center gap-2 w-fit px-2">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={clsx(
                "flex items-center gap-1 py-1.5 px-2.5 rounded-full cursor-pointer transition",
                {
                  "bg-white/5": !value.includes(item.id),
                  "bg-primary": value.includes(item.id),
                },
              )}
              onClick={() => onChange(item.id)}
            >
              {item.icon ? (
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="w-4 h-4 object-contain"
                />
              ) : null}
              <span className="text-sm">{item.title}</span>
              {value.includes(item.id) ? (
                <CloseCircleIcon className="w-4 h-4 text-white" />
              ) : (
                <AddIcon className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingSection;
