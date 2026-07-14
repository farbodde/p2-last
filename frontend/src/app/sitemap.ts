import type { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo.config";
import { getGamerUsernames, getLfgIds } from "@/services/content.service";

const staticRoutes = ["/", "/landing"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [gamerUsernames, lfgIds] = await Promise.all([
    getGamerUsernames(),
    getLfgIds(),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: new URL(route, seoConfig.siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  const gamerEntries = gamerUsernames.map((username) => ({
    url: new URL(`/gamer/${username}`, seoConfig.siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const lfgEntries = lfgIds.map((id) => ({
    url: new URL(`/lfg/${id}`, seoConfig.siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  return [...staticEntries, ...gamerEntries, ...lfgEntries];
}
