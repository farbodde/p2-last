"use client";

import { GameOutlineIcon } from "@/components/common/icons";
import { useGamesQuery } from "@/hooks/queries/useGamesQuery";
import FilterGameItem from "./FilterGameItem";

type Props = {
  onChange: (value: string) => void;
  value: string | null;
};

const FilterGame: React.FC<Props> = ({ value, onChange }) => {
  const { data: games } = useGamesQuery();

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 px-4">
        <GameOutlineIcon className="w-5.5 h-5.5" />
        <h3 className="text-sm">Game</h3>
      </div>
      <div className="overflow-auto scrollbar-hide scroll-smooth">
        <div className="flex gap-1.5 w-fit p-4">
          {(games || []).map((item) => (
            <FilterGameItem
              key={item.key}
              item={item}
              isActive={value === item.key}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FilterGame;
