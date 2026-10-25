import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const PAGES = ["", "/explore", "/my-list", "/blog", "/about", "/contact", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    ...PAGES.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: p === "" ? ("daily" as const) : ("weekly" as const),
      priority: p === "" ? 1 : 0.6,
    })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
