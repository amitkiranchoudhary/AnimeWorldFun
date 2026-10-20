import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Captain's Log" };

export default function BlogPage() {
  return (
    <ComingSoon
      title="Captain's Log"
      phase="Phase 4 — ink still drying"
      body="Blogs with read-along narration, where every word lights up as it is spoken."
    />
  );
}
