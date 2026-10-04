import type { MetadataRoute } from "next";
import { getAllWatches, getSoldWatches } from "@/lib/watches";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Archív má zmysel, až keď je v ňom aspoň jeden predaný kus.
  const routes = ["", "/watches", ...(getSoldWatches().length > 0 ? ["/archive"] : []), "/about", "/faq", "/contact"];

  const staticEntries = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const watchEntries = getAllWatches().map((watch) => ({
    url: `${SITE_URL}/watches/${watch.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...watchEntries];
}
