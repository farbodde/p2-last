export type SeoImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type PageSeo = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  images?: SeoImage[];
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
};
