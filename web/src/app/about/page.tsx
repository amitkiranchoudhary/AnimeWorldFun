import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <ComingSoon
      title="About Us"
      phase="Coming soon"
      body="The story behind Anime World Fun."
    />
  );
}
