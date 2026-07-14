"use client";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import FilterButton from "./FilterButton";
import Filter from "../../Filter";
import PlatformButton from "./PlatformButton";
import GoalButton from "./GoalButton";
import MicToggle from "./MicToggle";
import StatsImageToggle from "./StatsImageToggle";
import SkillButton from "./SkillButton";

type Props = {
  includeGameModes?: boolean;
};

const HomeFilters = ({ includeGameModes = true }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 85);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // run once on mount (in case page loads already scrolled)
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleOpenFilter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <section
        className={clsx(
          "overflow-auto sticky top-14 w-full transition-colors duration-300 scrollbar-hide scroll-smooth",
          {
            "bg-background/80 backdrop-blur-[2px] shadow-md": isScrolled,
            "bg-transparent": !isScrolled,
          },
        )}
      >
        <div className="flex gap-2 w-fit px-4 py-2 mb-2">
          <FilterButton onOpen={handleOpenFilter} />
          <PlatformButton onOpen={handleOpenFilter} />
          <GoalButton onOpen={handleOpenFilter} />
          <MicToggle />

          <SkillButton onOpen={handleOpenFilter} />

          <StatsImageToggle />
        </div>
      </section>

      <Filter
        isOpen={isOpen}
        includeGameModes={includeGameModes}
        onClose={handleCloseFilter}
      />
    </>
  );
};

export default HomeFilters;
