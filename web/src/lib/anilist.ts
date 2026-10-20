import { cacheLife } from "next/cache";

// Thin client for the public AniList GraphQL API (https://docs.anilist.co).
// Phase 2 replaces this with our own synced database; for now the home page
// reads straight from AniList and caches for an hour.

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

export const displayTitle = (a: AnimeCard) => a.title.english ?? a.title.romaji;
