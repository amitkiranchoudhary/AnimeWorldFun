"use server";

import { findByMalIds, getUserAnimeList, type AniListEntry, type ImportedShow } from "@/lib/anilist";

// Imports for My List. Our server asks AniList on the visitor's behalf, so their
// browser only ever talks to this site; nothing is stored here — the result goes
// straight back to the visitor's browser, which saves it in its own list.

export type ImportResult =
  | { ok: true; entries: (ImportedShow & { status: string; progress: number; score: number | null; notes: string })[] }
  | { ok: false; error: string };

const ANILIST_STATUS: Record<AniListEntry["status"], string> = {
  CURRENT: "watching",
  REPEATING: "watching",
  PLANNING: "planning",
  COMPLETED: "completed",
  PAUSED: "paused",
  DROPPED: "dropped",
};

export async function importFromAniList(userName: string): Promise<ImportResult> {
  const name = String(userName ?? "").trim();
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(name)) {
    return { ok: false, error: "That doesn't look like an AniList username (letters, numbers, - and _ only)." };
  }
  try {
    const list = await getUserAnimeList(name);
    if (!list) return { ok: false, error: `Couldn't find a public anime list for “${name}” on AniList.` };
    if (!list.length) return { ok: false, error: `“${name}” has no anime on their AniList list yet.` };
    return {
      ok: true,
      entries: list.map((e) => ({
        ...e,
        status: ANILIST_STATUS[e.status] ?? "planning",
        score: e.score > 0 ? e.score : null,
        notes: e.notes ?? "",
      })),
    };
  } catch {
    return {
      ok: false,
      error: "AniList didn't answer — the list may be private, or the seas are rough. Try again in a minute.",
    };
  }
}

const MAL_LIMIT = 2000;

/** Match a MyAnimeList export (already parsed in the browser) to AniList shows. */
export async function matchMalEntries(
  rows: { malId: number; status: string; progress: number; score: number; notes: string }[],
): Promise<ImportResult> {
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "No anime found in that file." };
  const clean = rows
    .slice(0, MAL_LIMIT)
    .filter((r) => Number.isInteger(r?.malId) && r.malId > 0);
  try {
    const shows = await findByMalIds([...new Set(clean.map((r) => r.malId))]);
    const byMal = new Map(shows.map((s) => [s.idMal, s]));
    const entries = clean.flatMap((r) => {
      const show = byMal.get(r.malId);
      if (!show) return [];
      return [
        {
          ...show,
          status: String(r.status),
          progress: Number(r.progress) || 0,
          score: Number(r.score) > 0 ? Number(r.score) : null,
          notes: String(r.notes ?? "").slice(0, 1000),
        },
      ];
    });
    if (!entries.length) return { ok: false, error: "None of those shows could be matched on AniList." };
    return { ok: true, entries };
  } catch {
    return { ok: false, error: "AniList didn't answer while matching your shows. Try again in a minute." };
  }
}
