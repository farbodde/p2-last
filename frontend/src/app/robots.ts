import type { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth",
          "/auth/signin",
          "/auth/signup",
          "/auth/forgot",
          "/notifications",
        ],
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
    host: seoConfig.siteUrl,
  };
}
