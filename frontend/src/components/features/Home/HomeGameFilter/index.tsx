import type { GameFilterItemType } from "@/@types/game.type";
import Alert from "@/components/common/Alert";
import { ChartCircleIcon } from "@/components/common/icons";
import HomeGameFilterItem from "./HomeGameFilterItem";
import clsx from "clsx";
import Link from "next/link";

type HomeGameFilterProps = {
  items: GameFilterItemType[];
  activeGameKey?: string | null;
  errorMessage?: string | null;
};

const HomeGameFilter = ({
  items,
  activeGameKey = null,
  errorMessage = null,
}: HomeGameFilterProps) => {
  const isAllActive = !activeGameKey;

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="home-game-filter-heading"
    >
      <h2 id="home-game-filter-heading" className="sr-only">
        Browse games
      </h2>

      {errorMessage ? (
        <div className="px-4 pt-2">
          <Alert
            type="error"
            title="Unable to load games"
            message={errorMessage}
            dismissible={false}
          />
        </div>
      ) : null}

      <nav
        aria-label="Game filters"
        className="overflow-auto scrollbar-hide scroll-smooth"
      >
        <ul className="flex w-fit gap-2 px-4 py-2">
          <li>
            <Link
              href="/"
              className={clsx(
                "flex h-16 w-16 items-center justify-center rounded-lg border-2 text-white/80 transition",
                {
                  "border-[#3E8BFF]": isAllActive,
                  "border-white/30": !isAllActive,
                },
              )}
              aria-label="Show all games"
              aria-current={isAllActive ? "page" : undefined}
              title="All games"
            >
              <ChartCircleIcon />
            </Link>
          </li>

          {items.map((item) => (
            <li key={item.key}>
              <HomeGameFilterItem
                item={item}
                isActive={activeGameKey === item.key}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

export default HomeGameFilter;
