import { GamePlatformItemType } from "@/@types/game.type";
import {
  MobileIcon,
  NintendoIcon,
  PCIcon,
  PlaystationIcon,
  XboxIcon,
} from "@/components/common/icons";

export const lfgPlatformItems: GamePlatformItemType[] = [
  {
    title: "PC",
    key: "pc",
    icon: PCIcon,
  },
  {
    title: "PS",
    key: "ps",
    icon: PlaystationIcon,
  },
  {
    title: "XB",
    key: "xbox",
    icon: XboxIcon,
  },
  {
    title: "NI",
    key: "nintendo",
    icon: NintendoIcon,
  },
  {
    title: "MB",
    key: "mobile",
    icon: MobileIcon,
  },
];
