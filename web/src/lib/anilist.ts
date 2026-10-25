import { cacheLife } from "next/cache";

// Thin client for the public AniList GraphQL API (https://docs.anilist.co).
// Every read is cached for hours so we stay well inside AniList's rate limit.

const ENDPOINT = "https://graphql.anilist.co";

export type AnimeCard = {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; color: string | null };
  bannerImage: string | null;
  averageScore: number | null;
  genres: string[];
  episodes: number | null;
  format: string | null;
  seasonYear: number | null;
  nextAiringEpisode: { episode: number } | null;
  studios: { nodes: { name: string }[] };
};

const CARD_FIELDS = `
  id
  title { romaji english }
  coverImage { large color }
  bannerImage
  averageScore
  genres
  episodes
  format
  seasonYear
  nextAiringEpisode { episode }
  studios(isMain: true) { nodes { name } }
`;

// Throws when AniList is unreachable or errors. "use cache" never stores a thrown
// error, so a hiccup isn't remembered for hours: the cached functions below let it
// throw and their exported wrappers fall back, which retries on the next request.
async function query<T>(gql: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: gql, variables }),
  });
  // a missing id is a 404 with { data: { Media: null } }: a real answer, fine to cache
  if (!res.ok && res.status !== 404) throw new Error(`AniList responded ${res.status}`);
  const json = await res.json();
  return (json.data as T) ?? null;
}

/* ── Home page rows ───────────────────────────────────────── */

async function cachedList(sort: string, extra: string): Promise<AnimeCard[]> {
  "use cache";
  cacheLife("hours");
  const data = await query<{ Page: { media: AnimeCard[] } }>(
    `query { Page(perPage: 12) { media(type: ANIME, sort: ${sort}, isAdult: false ${extra}) { ${CARD_FIELDS} } } }`,
  );
  return data?.Page.media ?? [];
}

const list = (sort: string, extra = ""): Promise<AnimeCard[]> => cachedList(sort, extra).catch(() => []);

export const getTrending = () => list("TRENDING_DESC", ", status: RELEASING");
export const getAllTimeGreats = () => list("SCORE_DESC", ", popularity_greater: 100000");

export const displayTitle = (a: { title: { romaji: string; english: string | null } }) =>
  a.title.english ?? a.title.romaji;

/* ── Explore: search + filters ────────────────────────────── */

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror", "Mahou Shoujo", "Mecha",
  "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export const FORMATS: Record<string, string> = {
  TV: "TV series", MOVIE: "Movie", OVA: "OVA", ONA: "ONA (web)", SPECIAL: "Special", TV_SHORT: "TV short",
};

export const STATUSES: Record<string, string> = {
  RELEASING: "Airing now", FINISHED: "Finished", NOT_YET_RELEASED: "Upcoming", HIATUS: "On hiatus",
};

export const SEASONS: Record<string, string> = { WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" };

export const SORTS: Record<string, { label: string; value: string[] }> = {
  popular: { label: "Most popular", value: ["POPULARITY_DESC"] },
  score: { label: "Top rated", value: ["SCORE_DESC"] },
  trending: { label: "Trending", value: ["TRENDING_DESC"] },
  // English title, falling back to romaji — the same title the cards show
  az: { label: "A → Z", value: ["TITLE_ENGLISH"] },
  za: { label: "Z → A", value: ["TITLE_ENGLISH_DESC"] },
  newest: { label: "Newest", value: ["START_DATE_DESC"] },
};

// AniList "external link source" ids for the streaming platforms we let people filter by
export const PLATFORMS: Record<string, { label: string; ids: number[] }> = {
  crunchyroll: { label: "Crunchyroll", ids: [5] },
  netflix: { label: "Netflix", ids: [10] },
  prime: { label: "Prime Video", ids: [21, 261] },
  disney: { label: "Disney+ / Hotstar", ids: [118] },
  hidive: { label: "HIDIVE", ids: [20] },
  youtube: { label: "YouTube", ids: [13] },
  bilibili: { label: "Bilibili TV", ids: [119] },
  hulu: { label: "Hulu", ids: [7] },
};

export type ExploreFilters = {
  q?: string;
  genres?: string[];
  format?: string;
  status?: string;
  season?: string;
  year?: number;
  platform?: string;
  sort?: string;
  page?: number;
};

export type ExploreResult = {
  items: AnimeCard[];
  page: number;
  hasNextPage: boolean;
  ok: boolean;
};

export const PER_PAGE = 30;

export const exploreAnime = (f: ExploreFilters): Promise<ExploreResult> =>
  cachedExplore(f).catch(() => ({ items: [], page: f.page ?? 1, hasNextPage: false, ok: false }));

async function cachedExplore(f: ExploreFilters): Promise<ExploreResult> {
  "use cache";
  cacheLife("hours");

  const sort = f.q && !f.sort ? ["SEARCH_MATCH"] : (SORTS[f.sort ?? "popular"] ?? SORTS.popular).value;
  const variables = {
    page: f.page ?? 1,
    perPage: PER_PAGE,
    search: f.q || undefined,
    genres: f.genres?.length ? f.genres : undefined,
    format: f.format ? [f.format] : undefined,
    status: f.status || undefined,
    season: f.season || undefined,
    year: f.year || undefined,
    sites: f.platform ? PLATFORMS[f.platform]?.ids : undefined,
    sort,
  };

  // pageInfo.total isn't reliable on AniList (it's capped), so we only page forward/back
  const data = await query<{
    Page: { pageInfo: { currentPage: number; hasNextPage: boolean }; media: AnimeCard[] };
  }>(
    `query ($page: Int, $perPage: Int, $search: String, $genres: [String], $format: [MediaFormat],
            $status: MediaStatus, $season: MediaSeason, $year: Int, $sites: [Int], $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { currentPage hasNextPage }
        media(type: ANIME, isAdult: false, search: $search, genre_in: $genres, format_in: $format,
              status: $status, season: $season, seasonYear: $year, licensedById_in: $sites, sort: $sort) {
          ${CARD_FIELDS}
        }
      }
    }`,
    variables,
  );

  if (!data) throw new Error("AniList returned no data");
  return {
    items: data.Page.media,
    page: data.Page.pageInfo.currentPage,
    hasNextPage: data.Page.pageInfo.hasNextPage,
    ok: true,
  };
}

/* ── Anime detail page ────────────────────────────────────── */

export type ExternalLink = {
  id: number;
  site: string;
  siteId: number | null;
  url: string;
  type: string;
  language: string | null;
  notes: string | null;
  color: string | null;
  icon: string | null;
  isDisabled: boolean | null;
};

export type AnimeDetail = AnimeCard & {
  title: { romaji: string; english: string | null; native: string | null };
  coverImage: { large: string; extraLarge: string; color: string | null };
  description: string | null;
  season: string | null;
  status: string | null;
  duration: number | null;
  source: string | null;
  popularity: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  endDate: { year: number | null; month: number | null; day: number | null };
  synonyms: string[];
  countryOfOrigin: string | null;
  tags: { name: string; rank: number; isMediaSpoiler: boolean }[];
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  studios: { nodes: { name: string }[] };
  allStudios: { edges: { isMain: boolean; node: { name: string } }[] };
  staff: { edges: { role: string; node: { id: number; name: { full: string } } }[] };
  externalLinks: ExternalLink[];
  relations: { edges: { relationType: string; node: AnimeCard & { type: string } }[] };
  recommendations: { nodes: { mediaRecommendation: AnimeCard | null }[] };
};

// A failed fetch falls back to null (the page's not-found) without being cached
export const getAnime = (id: number): Promise<AnimeDetail | null> => cachedAnime(id).catch(() => null);

async function cachedAnime(id: number): Promise<AnimeDetail | null> {
  "use cache";
  cacheLife("hours");

  const data = await query<{ Media: AnimeDetail | null }>(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${CARD_FIELDS}
        title { romaji english native }
        coverImage { large extraLarge color }
        description(asHtml: false)
        season
        status
        duration
        source
        popularity
        startDate { year month day }
        endDate { year month day }
        synonyms
        countryOfOrigin
        isAdult
        tags { name rank isMediaSpoiler }
        trailer { id site }
        nextAiringEpisode { episode airingAt }
        allStudios: studios { edges { isMain node { name } } }
        staff(perPage: 12, sort: RELEVANCE) { edges { role node { id name { full } } } }
        externalLinks { id site siteId url type language notes color icon isDisabled }
        relations { edges { relationType node { ${CARD_FIELDS} type } } }
        recommendations(perPage: 12, sort: RATING_DESC) { nodes { mediaRecommendation { ${CARD_FIELDS} } } }
      }
    }`,
    { id },
  );
  const media = data?.Media as (AnimeDetail & { isAdult?: boolean }) | null | undefined;
  if (!media || media.isAdult) return null;
  return media;
}

/* ── My List import (never cached: it's one visitor's own list) ── */

export type ImportedShow = {
  id: number;
  idMal: number | null;
  title: string;
  cover: string;
  color: string | null;
  episodes: number | null;
  format: string | null;
};

type ImportMedia = {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; color: string | null };
  episodes: number | null;
  format: string | null;
  isAdult: boolean | null;
};

const IMPORT_FIELDS = "id idMal title { romaji english } coverImage { large color } episodes format isAdult";

const toShow = (m: ImportMedia): ImportedShow => ({
  id: m.id,
  idMal: m.idMal,
  title: displayTitle(m),
  cover: m.coverImage.large,
  color: m.coverImage.color,
  episodes: m.episodes,
  format: m.format,
});

export type AniListEntry = ImportedShow & {
  status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";
  progress: number;
  score: number;
  notes: string | null;
};

/** A public AniList user's anime list, or null when the user doesn't exist or is private. */
export async function getUserAnimeList(userName: string): Promise<AniListEntry[] | null> {
  const data = await query<{
    MediaListCollection: {
      lists: { entries: { status: AniListEntry["status"]; progress: number; score: number; notes: string | null; media: ImportMedia }[] }[];
    } | null;
  }>(
    `query ($name: String) {
      MediaListCollection(userName: $name, type: ANIME) {
        lists { entries { status progress score(format: POINT_10) notes media { ${IMPORT_FIELDS} } } }
      }
    }`,
    { name: userName },
  );
  if (!data?.MediaListCollection) return null;
  return data.MediaListCollection.lists
    .flatMap((l) => l.entries)
    .filter((e) => !e.media.isAdult)
    .map((e) => ({ ...toShow(e.media), status: e.status, progress: e.progress, score: e.score, notes: e.notes }));
}

/** Look up shows by their MyAnimeList ids (for a MAL export), 50 per request. */
export async function findByMalIds(ids: number[]): Promise<ImportedShow[]> {
  const out: ImportedShow[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const data = await query<{ Page: { media: ImportMedia[] } }>(
      `query ($ids: [Int]) { Page(perPage: 50) { media(idMal_in: $ids, type: ANIME) { ${IMPORT_FIELDS} } } }`,
      { ids: ids.slice(i, i + 50) },
    );
    for (const m of data?.Page.media ?? []) if (!m.isAdult) out.push(toShow(m));
  }
  return out;
}
