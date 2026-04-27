import type { MetadataRoute } from "next";

const SITE_URL = "https://voisinons.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/creer`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
