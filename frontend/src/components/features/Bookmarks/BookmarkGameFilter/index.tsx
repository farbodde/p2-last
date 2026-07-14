"use client";

import Link from "next/link";
import BookmarkGameFilterItem from "./BookmarkGameFilterItem";
import GamesSkeleton from "@/components/common/GamesSkeleton";
import { ChartCircleIcon } from "@/components/common/icons";
import { useGamesQuery } from "@/hooks/queries/useGamesQuery";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const BookmarkGameFilter = () => {
  const { data: games = [], isError, isLoading } = useGamesQuery();
  const searchParams = useSearchParams();
  const activeGame = searchParams.get("game");
  const allGamesParams = new URLSearchParams(searchParams.toString());
  allGamesParams.delete("game");
  const allGamesUrl = allGamesParams.size
    ? `/bookmarks?${allGamesParams.toString()}`
    : "/bookmarks";

  return (
    <section className="overflow-auto scrollbar-hide scroll-smooth">
      <div className="flex gap-2 w-fit py-2 px-4">
        <Link
          href={allGamesUrl}
          className={clsx(
            "w-16 h-16 flex items-center text-white justify-center rounded-lg border-2",
            {
              "border-primary": !activeGame,
              "border-white/30": activeGame,
            },
          )}
          aria-current={!activeGame ? "true" : undefined}
        >
          <ChartCircleIcon />
        </Link>

        {isLoading ? <GamesSkeleton inline /> : null}

        {games.map((item) => (
          <BookmarkGameFilterItem key={item.key} item={item} />
        ))}

        {isError ? (
          <span className="flex items-center px-2 text-sm text-danger">
            Unable to load games.
          </span>
        ) : null}
      </div>
    </section>
  );
};

export default BookmarkGameFilter;
