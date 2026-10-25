"use server";

import { displayTitle, getAnime } from "@/lib/anilist";
import { isOwner } from "@/lib/session";

export type SiteInfo = { site: string; languages: string[]; url: string };
export type LookupResult = { ok: true; id: number; title: string; cover: string; sites: SiteInfo[] } | { ok: false; error: string };

/** The streaming platforms AniList lists for an anime (for the owner's Anime data tool). */
export async function lookupAnime(raw: string): Promise<LookupResult> {
  if (!(await isOwner())) return { ok: false, error: "Please sign in again." };
  // accept "21", "/anime/21" or a full anilist.co / site link
  const id = Number(/(\d{1,7})(?!.*\d)/.exec(String(raw ?? ""))?.[1]);
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Type the anime's number (from /anime/21 → 21) or paste its link." };
  const anime = await getAnime(id);
  if (!anime) return { ok: false, error: `No anime with number ${id} on AniList (or AniList didn't answer).` };
  const sites = new Map<string, SiteInfo>();
  for (const l of anime.externalLinks) {
    if (l.type !== "STREAMING" || l.isDisabled) continue;
    const prev = sites.get(l.site);
    const langs = l.language ? [l.language] : [];
    sites.set(l.site, prev ? { ...prev, languages: [...new Set([...prev.languages, ...langs])] } : { site: l.site, languages: langs, url: l.url });
  }
  return { ok: true, id: anime.id, title: displayTitle(anime), cover: anime.coverImage.large, sites: [...sites.values()] };
}
