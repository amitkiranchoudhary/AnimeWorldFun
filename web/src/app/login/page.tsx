import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Join the Crew" };

export default function LoginPage() {
  return (
    <ComingSoon
      title="Join the Crew"
      phase="Phase 3 — gangplank being built"
      body="Free accounts to save your list, get dub alerts and comment on posts."
    />
  );
}
