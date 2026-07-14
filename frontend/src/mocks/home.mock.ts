import { GenderEnum, OnlineStatusEnum } from "@/@types/general.type";
import { LFGItemType } from "@/@types/lfg.type";

export const homeGameFilterItems = [
  {
    id: 1,
    title: "battlefield",
    key: "battlefield",
    imageUrl: "/images/games/battlefield.png",
  },
  {
    id: 2,
    title: "cod-ops",
    key: "cod-ops",
    imageUrl: "/images/games/cod-ops.png",
  },
  {
    id: 3,
    title: "valorant",
    key: "valorant",
    imageUrl: "/images/games/valorant.png",
  },
  {
    id: 4,
    title: "counter-stricke2",
    key: "counter-stricke2",
    imageUrl: "/images/games/counter-stricke2.png",
  },
  {
    id: 5,
    title: "pc26",
    key: "pc26",
    imageUrl: "/images/games/pc26.png",
  },
  {
    id: 6,
    title: "battlegrounds",
    key: "battlegrounds",
    imageUrl: "/images/games/battlegrounds.png",
  },
  {
    id: 7,
    title: "dota2",
    key: "dota2",
    imageUrl: "/images/games/dota2.png",
  },
  {
    id: 8,
    title: "clash",
    key: "clash",
    imageUrl: "/images/games/clash.png",
  },
];

export const GamerItemsMock = [
  {
    id: 1,
    imageUrl: "/images/games/battlefield.png",
    username: "MelanieBear",
    language: "Persian",
    country: "IR",
    gender: GenderEnum.MALE,
    age: 25,
    status: OnlineStatusEnum.ONLINE,
  },
  {
    id: 2,
    imageUrl: "/images/games/valorant.png",
    username: "MelanieBear",
    language: "Persian",
    country: "IR",
    gender: GenderEnum.FEMALE,
    age: 23,
    status: OnlineStatusEnum.AWAY,
  },
];

export const LFGItemsMock: LFGItemType[] = [
  {
    id: 1,
    description:
      "Skilled player looking for friends for Redsec or multiplayer. Have mic :)",
    game: {
      id: 1,
      name: "Battlefield 6",
      imageUrl: "/images/games/battlefield.png",
    },
    user: GamerItemsMock[0],
    options: {
      mic: true,
      platform: "PC",
      mode: "BattleRoyal",
      goal: "Competetive",
      skill: "Intermediate",
    },
    date: "32 minutes ago",
  },
  {
    id: 2,
    description:
      "Skilled player looking for friends for Redsec or multiplayer. Have mic :)",
    game: {
      id: 1,
      name: "Battlefield 6",
      imageUrl: "/images/games/battlefield.png",
    },
    user: GamerItemsMock[1],
    options: {
      mic: false,
      platform: "PC",
      mode: "Duos",
      goal: "Friendly",
      skill: "Pro",
      rank: 10,
      region: "IR",
    },
    date: "32 minutes ago",
  },
  {
    id: 3,
    description: `<p>دو نفر کسی هست بریم ترای هارد</p><p>ترای هارد😁</p>`,
    game: {
      id: 1,
      name: "Battlefield 6",
      imageUrl: "/images/games/battlefield.png",
    },
    user: GamerItemsMock[0],
    options: {
      mic: true,
      platform: "PC",
      crossPlay: true,
      mode: "BattleRoyal",
      goal: "Competetive",
      skill: "Intermediate",
    },
    date: "32 minutes ago",
  },
];
