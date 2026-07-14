import type { Metadata } from "next";
import { seoConfig } from "@/config/seo.config";
import type { PageSeo, SeoImage } from "@/types/common.types";

const toAbsoluteUrl = (path = "/") => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, seoConfig.siteUrl).toString();
};

const toOpenGraphImages = (images?: SeoImage[]) => {
  const seoImages = images?.length
    ? images
    : [
        {
          url: seoConfig.defaultOgImage,
          alt: seoConfig.appName,
        },
      ];

  return seoImages.map((image) => ({
    ...image,
    url: toAbsoluteUrl(image.url),
  }));
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  applicationName: seoConfig.appName,
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.defaultKeywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: seoConfig.appName,
    locale: seoConfig.defaultLocale,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    images: toOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    creator: seoConfig.xHandle,
    site: seoConfig.xHandle,
    images: toOpenGraphImages().map((image) => image.url),
  },
};

export const createMetadata = ({
  title,
  description,
  path = "/",
  keywords = [],
  images,
  noIndex = false,
  type = "website",
}: PageSeo): Metadata => {
  const absoluteUrl = toAbsoluteUrl(path);
  const openGraphImages = toOpenGraphImages(images);

  return {
    title,
    description,
    keywords: [...seoConfig.defaultKeywords, ...keywords],
    alternates: {
      canonical: absoluteUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type,
      title,
      description,
      url: absoluteUrl,
      siteName: seoConfig.appName,
      locale: seoConfig.defaultLocale,
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: seoConfig.xHandle,
      site: seoConfig.xHandle,
      images: openGraphImages.map((image) => image.url),
    },
  };
};
