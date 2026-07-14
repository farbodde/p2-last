import { AppName } from "@/constants/AppConstants";

export const seoConfig = {
  appName: AppName,
  defaultTitle: AppName,
  titleTemplate: `%s | ${AppName}`,
  defaultDescription:
    "Player2 helps gamers discover teammates, publish LFG posts, and connect faster.",
  defaultKeywords: [
    "Player2",
    "gaming",
    "LFG",
    "find teammates",
    "multiplayer",
    "gamer profile",
  ],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://player2.app",
  defaultLocale: "en_US",
  defaultOgImage: "/images/logo.png",
  xHandle: "@player2app",
} as const;
