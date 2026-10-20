import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <ComingSoon
      title="Privacy Policy"
      phase="Coming soon"
      body="How we handle your data, written before any ads or accounts go live."
    />
  );
}
