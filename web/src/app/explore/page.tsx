import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Anime Database" };

export default function ExplorePage() {
  return (
    <ComingSoon
      title="Anime Database"
      phase="Phase 2 — charting the seas"
      body="Every anime with filters for A–Z, genre, sub/dub, language, platform and year."
    />
  );
}
