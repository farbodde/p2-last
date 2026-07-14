/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FilterGame from "./FilterGame";
import FilterSection from "./FilterSection";
import Button from "@/components/base/Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiltersKey, FiltersRecord } from "@/@types/filter.type";
import Header from "@/components/layouts/Header";
import Modal from "@/components/base/Modal";
import { useGameFiltersQuery } from "@/hooks/queries/useGameFiltersQuery";
import { useGamesQuery } from "@/hooks/queries/useGamesQuery";
import {
  AwardOutlineIcon,
  CalendarOutlineIcon,
  CupOutlineIcon,
  DriverOutlineIcon,
  FlashIcon,
  GameBoyIcon,
  GlobalIcon,
  GpsOutlineIcon,
  LangIcon,
  StarOutlineIcon,
} from "@/components/common/icons";
import { GameCategory } from "@/@types/game.type";
import { JSX } from "react";

type FilterOption = {
  value: string;
  label: string;
};

type FilterSectionItem = {
  key: string;
  label: string;
  icon: JSX.ElementType;
  options: FilterOption[];
  collapsable?: boolean;
  searchable?: boolean;
  expandable?: boolean;
  maxLength?: number;
};

type Props = {
  isOpen: boolean;
  includeGameModes?: boolean;
  onClose: () => void;
};

const DEFAULT_SECTION_MAX_LENGTH = 3;

const getSectionIcon = (label: string) => {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("mode")) return CupOutlineIcon;
  if (normalizedLabel.includes("rank")) return AwardOutlineIcon;
  if (normalizedLabel.includes("region")) return DriverOutlineIcon;
  if (normalizedLabel.includes("age")) return CalendarOutlineIcon;
  if (normalizedLabel.includes("country")) return GlobalIcon;
  if (normalizedLabel.includes("language")) return LangIcon;
  if (normalizedLabel.includes("skill")) return StarOutlineIcon;
  if (normalizedLabel.includes("goal")) return GpsOutlineIcon;
  if (
    normalizedLabel.includes("platform") ||
    normalizedLabel.includes("console")
  ) {
    return GameBoyIcon;
  }

  return FlashIcon;
};

const mapOptions = (items: { id: number; title: string }[]) =>
  items.map((item) => ({
    value: String(item.id),
    label: item.title,
  }));

const mapCategorySection = (category: GameCategory): FilterSectionItem => {
  const maxLength =
    category.limit === -1
      ? category.items.length
      : category.limit || DEFAULT_SECTION_MAX_LENGTH;

  return {
    key: category.category_title.toLowerCase(),
    label: category.category_title,
    icon: getSectionIcon(category.category_title),
    options: mapOptions(category.items),
    maxLength,
    collapsable: true,
    searchable: category.items.length > maxLength,
    expandable: category.items.length > maxLength,
  };
};

const Filter: React.FC<Props> = ({
  isOpen,
  includeGameModes = true,
  onClose,
}) => {
  const [game, setGame] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersRecord>({});

  const pathname = usePathname();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { categoriesQuery, modesQuery } = useGameFiltersQuery(game);
  const { data: games = [] } = useGamesQuery();

  // useEffect(() => {
  //   setFilters({});
  // }, [game]);

  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams.entries());
    setGame(queryParams.game ?? null);

    const urlFilters = Object.entries(queryParams).reduce(
      (acc: FiltersRecord, [key, val]: [string, string]) => {
        if (key === "game") return acc;
        return {
          ...acc,
          [key]: val.split(","),
        };
      },
      {},
    );

    console.log("URL Filters:", urlFilters);

    setFilters(urlFilters);
  }, [searchParams]);

  const handleSubmit = () => {
    const query = Object.entries(filters).reduce(
      (acc: string[], [key, val]) => {
        if (val.length === 0) return acc;
        return [...acc, `${key}=${val}`];
      },
      [],
    );

    if (game) query.unshift(`game=${game}`);

    navigate.push(`${pathname}?${query.join("&")}`, {
      scroll: true,
    });
    onClose();
  };

  const handleClear = useCallback(() => {
    setFilters({});
    navigate.push(pathname, {
      scroll: true,
    });
    onClose();
  }, [navigate, onClose, pathname]);

  const handleChangeFilter = useCallback((key: FiltersKey, val: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  }, []);

  const filterSections = useMemo<FilterSectionItem[]>(() => {
    if (!game) {
      return [];
    }

    const sections: FilterSectionItem[] = [];
    const selectedGame = games.find((item) => item.key === game);
    const platformOptions =
      selectedGame?.platforms.map((platform) => ({
        value: String(platform.id),
        label: platform.title,
      })) ?? [];
    const modeOptions = mapOptions(modesQuery.data?.results ?? []);

    if (platformOptions.length > 0) {
      sections.push({
        key: "consoles",
        label: "Platform",
        icon: GameBoyIcon,
        options: platformOptions,
        maxLength: platformOptions.length,
        collapsable: true,
      });
    }

    if (includeGameModes && modeOptions.length > 0) {
      sections.push({
        key: "modes",
        label: "Game Mode",
        icon: CupOutlineIcon,
        options: modeOptions,
        maxLength: DEFAULT_SECTION_MAX_LENGTH,
        collapsable: true,
        searchable: modeOptions.length > DEFAULT_SECTION_MAX_LENGTH,
        expandable: modeOptions.length > DEFAULT_SECTION_MAX_LENGTH,
      });
    }

    return sections.concat(
      (categoriesQuery.data?.results ?? []).map(mapCategorySection),
    );
  }, [
    categoriesQuery.data,
    game,
    games,
    includeGameModes,
    modesQuery.data,
  ]);

  console.log({ filters });

  return (
    <Modal
      hideCancelButton
      hideCloseButton
      fullScreen
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="h-screen flex flex-col w-full overflow-auto">
        <Header title="Filters" onClose={onClose} />

        <div className="flex flex-col gap-4">
          <FilterGame value={game} onChange={setGame} />
          <div className="flex flex-col gap-1">
            {filterSections.map((fItem) => (
              <FilterSection
                key={fItem.key}
                label={fItem.label}
                icon={fItem.icon}
                options={fItem.options}
                collapsable={fItem.collapsable}
                searchable={fItem.searchable}
                expandable={fItem.expandable}
                maxLength={fItem.maxLength}
                value={filters?.[fItem.key] || []}
                onChange={handleChangeFilter.bind(null, fItem.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex mt-auto items-center gap-3 p-4 sticky bottom-0 left-0 w-full bg-background z-20">
          <Button
            fullWidth
            className="text-white"
            variant="light"
            onPress={handleClear}
          >
            Clear all
          </Button>
          <Button fullWidth color="primary" onPress={handleSubmit}>
            Show +100 LFGs
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Filter;
