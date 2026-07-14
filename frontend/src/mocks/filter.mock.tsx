import { FiltersKey } from "@/@types/filter.type";
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
import { JSX } from "react";

export const filteQuickSelectionOptions = [
  {
    value: "mic-on",
    label: "Mic - On",
  },
  {
    value: "online-status",
    label: "Online Status",
  },
  {
    value: "cross-play",
    label: "Cross Play",
  },
  {
    value: "stats-image",
    label: "Stats Image",
  },
];

export const filteConsoleOptions = [
  {
    value: "pc",
    label: "PC",
  },
  {
    value: "playstation",
    label: "Playstation",
  },
  {
    value: "xbox",
    label: "Xbox",
  },
  {
    value: "mobile",
    label: "Mobile",
  },
  {
    value: "nintendo",
    label: "Nintendo",
  },
];

export const filteSkillOptions = [
  {
    value: "beginner",
    label: "Beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate",
  },
  {
    value: "experienced",
    label: "Experienced",
  },
  {
    value: "veteran",
    label: "Veteran",
  },
  {
    value: "pro",
    label: "Pro",
  },
];

export const filterGoalOptions = [
  {
    value: "competitive",
    label: "Competitive",
  },
  {
    value: "fun",
    label: "Casual Fun",
  },
  {
    value: "improvement",
    label: "Skill Improvement",
  },
  {
    value: "friendship",
    label: "Friendship",
  },
  {
    value: "scrim",
    label: "Scrim",
  },
];

export const filterGameModeOptions = [
  {
    value: "battleroyal",
    label: "BattleRoyal",
  },
  {
    value: "duos",
    label: "Duos",
  },
  {
    value: "warzone",
    label: "Warzone",
  },
  {
    value: "pvp",
    label: "PvP",
  },
  {
    value: "zambie",
    label: "Zambie",
  },
];

export const filterPlayStyleOptions = [
  {
    value: "competitive2",
    label: "Competitive",
  },
  {
    value: "fun2",
    label: "Casual Fun",
  },
  {
    value: "improvement2",
    label: "Skill Improvement",
  },
  {
    value: "friendship2",
    label: "Friendship",
  },
  {
    value: "scrim2",
    label: "Scrim",
  },
];

export const filterRankOptions = [
  {
    value: "1-100",
    label: "1 - 100",
  },
  {
    value: "100-500",
    label: "100 - 500",
  },
  {
    value: "500-1000",
    label: "500 - 1000",
  },
  {
    value: "1000-5000",
    label: "1000 - 5000",
  },
  {
    value: "+5000",
    label: "+5000",
  },
];

export const filterRegionOptions = [
  {
    value: "euro",
    label: "Europ",
  },
  {
    value: "american",
    label: "American",
  },
  {
    value: "africa",
    label: "Africa",
  },
];

export const filterAgeOptions = [
  {
    value: "-12",
    label: "-12",
  },
  {
    value: "12-18",
    label: "12 - 18",
  },
  {
    value: "18-25",
    label: "18 - 25",
  },
  {
    value: "25-35",
    label: "25 - 35",
  },
  {
    value: "35-50",
    label: "35 - 50",
  },
  {
    value: "+50",
    label: "+50",
  },
];

export const filterCountryOptions = [
  {
    value: "euro1",
    label: "Europ",
  },
  {
    value: "american1",
    label: "American",
  },
  {
    value: "africa1",
    label: "Africa",
  },
];

export const filterLangaugeOptions = [
  {
    value: "english",
    label: "English",
  },
  {
    value: "persian",
    label: "Persian",
  },
  {
    value: "french",
    label: "French",
  },
  {
    value: "arabic",
    label: "Arabic",
  },
];

export const filtersMock: {
  key: FiltersKey;
  icon: JSX.ElementType;
  label: string;
  collapsable?: boolean;
  searchable?: boolean;
  expandable?: boolean;
  maxLength?: number;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "quickSelections",
    label: "Quick Selection",
    icon: FlashIcon,
    options: filteQuickSelectionOptions,
  },
  {
    key: "consoles",
    label: "Console",
    icon: GameBoyIcon,
    options: filteConsoleOptions,
  },
  {
    key: "skills",
    label: "Skill",
    icon: StarOutlineIcon,
    options: filteSkillOptions,
  },
  {
    key: "goals",
    label: "Goal",
    icon: GpsOutlineIcon,
    options: filterGoalOptions,
  },
  {
    key: "modes",
    label: "Game Mode",
    icon: CupOutlineIcon,
    options: filterGameModeOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
  {
    key: "ranks",
    label: "Rank",
    icon: AwardOutlineIcon,
    options: filterRankOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
  {
    key: "region",
    label: "Region",
    icon: DriverOutlineIcon,
    options: filterRegionOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
  {
    key: "age",
    label: "Age",
    icon: CalendarOutlineIcon,
    options: filterAgeOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
  {
    key: "countries",
    label: "Country",
    icon: GlobalIcon,
    options: filterCountryOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
  {
    key: "languages",
    label: "Languages",
    icon: LangIcon,
    options: filterLangaugeOptions,
    maxLength: 3,
    collapsable: true,
    searchable: true,
    expandable: true,
  },
];
