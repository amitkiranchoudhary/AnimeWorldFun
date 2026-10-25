import { getAllTimeGreats } from "@/lib/anilist";
import CurvedGallery from "./CurvedGallery";
import { TOPICS } from "./topics";

// Dresses each upcoming-topic poster in (dimmed) cover art of a much-loved
// anime from AniList. If AniList is down, the posters keep their plain art.
export default async function TopicGallery() {
  const art = await getAllTimeGreats();
  return <CurvedGallery topics={TOPICS.map((t, i) => ({ ...t, cover: art[i]?.coverImage.large ?? null }))} />;
}

/** The same gallery without cover art, while AniList answers. */
export function TopicGalleryFallback() {
  return <CurvedGallery topics={TOPICS} />;
}
