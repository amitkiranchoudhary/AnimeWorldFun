import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "My List" };

export default function MyListPage() {
  return (
    <ComingSoon
      title="My List"
      phase="Phase 3 — logbook in progress"
      body="Track what you are watching, completed or planning, and import from AniList or MyAnimeList."
    />
  );
}
