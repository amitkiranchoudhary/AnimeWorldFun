import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

// Blog posts are Markdown files in web/content/blog/ (see the README there).
// A post goes live when its file is committed and the site is rebuilt — no
// database needed. Files starting with "_" (like the template) and posts with
// "draft: true" are never published.

const DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
  /** AniList id of the anime the post is about: its art becomes the cover */
  anime: number | null;
  /** your own recording, a path under /public (e.g. /audio/my-post.mp3) */
  audio: string | null;
  /** word timings made in the Studio for that recording (e.g. /audio/my-post.json) */
  timings: string | null;
};

export type Post = PostMeta & { body: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parse(slug: string, src: string): (Post & { draft?: boolean }) | null {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(src.replace(/\r\n?/g, "\n"));
  if (!m) return null;
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-zA-Z]+)\s*:\s*(.*)$/.exec(line.trim());
    if (kv) fm[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  if (!fm.title || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date ?? "")) return null;
  // media must live in the site's own /public folder
  const local = (p?: string) => (p && /^\/[\w\-./]+$/.test(p) && !p.includes("..") ? p : null);
  return {
    slug,
    title: fm.title,
    date: fm.date,
    summary: fm.summary ?? "",
    tags: (fm.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
    anime: /^\d+$/.test(fm.anime ?? "") ? Number(fm.anime) : null,
    audio: local(fm.audio),
    timings: local(fm.timings),
    draft: /^(true|yes)$/i.test(fm.draft ?? ""),
    body: m[2],
  };
}

async function loadAll(): Promise<Post[]> {
  "use cache";
  // in `next dev` edits to a post show up within seconds; a build reads them once
  if (process.env.NODE_ENV === "development") cacheLife("seconds");
  else cacheLife("max");
  let files: string[] = [];
  try {
    files = await readdir(DIR);
  } catch {
    return [];
  }
  const posts: Post[] = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    if (!f.endsWith(".md") || f.startsWith("_") || !SLUG.test(slug)) continue;
    const post = parse(slug, await readFile(path.join(DIR, f), "utf8"));
    if (!post || post.draft) continue;
    posts.push(post);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function getPosts(): Promise<PostMeta[]> {
  return (await loadAll()).map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    summary: p.summary,
    tags: p.tags,
    anime: p.anime,
    audio: p.audio,
    timings: p.timings,
  }));
}

export async function getPost(slug: string): Promise<Post | null> {
  return (await loadAll()).find((p) => p.slug === slug) ?? null;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
