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

async function query<T>(gql: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gql, variables }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as T) ?? null;
  } catch {
    return null;
  }
}

/* ── Home page rows ───────────────────────────────────────── */

async function list(sort: string, extra = ""): Promise<AnimeCard[]> {
  "use cache";
  cacheLife("hours");
  const data = await query<{ Page: { media: AnimeCard[] } }>(
    `query { Page(perPage: 12) { media(type: ANIME, sort: ${sort}, isAdult: false ${extra}) { ${CARD_FIELDS} } } }`,
  );
  return data?.Page.media ?? [];
}

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

export async function exploreAnime(f: ExploreFilters): Promise<ExploreResult> {
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

  if (!data) return { items: [], page: variables.page, hasNextPage: false, ok: false };
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

export async function getAnime(id: number): Promise<AnimeDetail | null> {
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
