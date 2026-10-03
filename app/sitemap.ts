import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { getAllWatches } from "@/lib/watches";
import { getAllArticles } from "@/lib/journal";
import { SITE_URL } from "@/lib/constants";

const STATIC_ROUTES = [
  "",
  "/watches",
  "/archive",
  "/about",
  "/journal",
  "/faq",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const watchEntries = getAllWatches().map((watch) => ({
    url: `${SITE_URL}/watches/${watch.slug}`,
    lastModified: new Date(),
  }));

  const articleEntries = getAllArticles().map((article) => ({
    url: `${SITE_URL}/journal/${article.slug}`,
    lastModified: new Date(article.date),
  }));

  return [...staticEntries, ...watchEntries, ...articleEntries];
}
