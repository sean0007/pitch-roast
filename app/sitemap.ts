import type { MetadataRoute } from "next";
import { EXAMPLES } from "@/lib/roast";
import { resultPath } from "@/lib/site";

const SITE_URL = "https://pitch-roast.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/legal/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...EXAMPLES.map((e) => ({ url: `${SITE_URL}${resultPath(e.pitch, e.stage, e.category)}`.replace(/&/g, "&amp;"), lastModified: now, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
