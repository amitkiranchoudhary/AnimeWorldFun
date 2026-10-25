import { type ExploreFilters, FORMATS, GENRES, PLATFORMS, SEASONS, SORTS, STATUSES } from "@/lib/anilist";

// Reading the Explore URL into filters, and building clean URLs back from them
// (?genre=Romance&sort=score, never ?q=&format=&…). Shared by every Explore piece.

export type RawParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const pick = (v: string | undefined, allowed: Record<string, unknown>) => (v && v in allowed ? v : undefined);

export function parseFilters(sp: RawParams): ExploreFilters {
  const year = Number(one(sp.year));
  const page = Number(one(sp.page));
  return {
    q: one(sp.q)?.slice(0, 100),
    genres: many(sp.genre).filter((g) => GENRES.includes(g)),
    format: pick(one(sp.format), FORMATS),
    status: pick(one(sp.status), STATUSES),
    season: pick(one(sp.season), SEASONS),
    year: year >= 1940 && year <= 2100 ? year : undefined,
    platform: pick(one(sp.platform), PLATFORMS),
    sort: pick(one(sp.sort), SORTS),
    page: page >= 1 && page <= 500 ? Math.floor(page) : 1,
  };
}

export function toQuery(f: ExploreFilters, overrides: Partial<ExploreFilters> = {}) {
  const merged = { ...f, ...overrides };
  const p = new URLSearchParams();
  if (merged.q) p.set("q", merged.q);
  merged.genres?.forEach((g) => p.append("genre", g));
  for (const key of ["format", "status", "season", "year", "platform", "sort"] as const) {
    if (merged[key]) p.set(key, String(merged[key]));
  }
  if (merged.page && merged.page > 1) p.set("page", String(merged.page));
  const s = p.toString();
  return s ? `/explore?${s}` : "/explore";
}

/** How many filters are narrowing the results (search text included, sort not). */
export const activeCount = (f: ExploreFilters) =>
  (f.q ? 1 : 0) +
  (f.genres?.length ?? 0) +
  [f.format, f.status, f.season, f.year, f.platform].filter(Boolean).length;
