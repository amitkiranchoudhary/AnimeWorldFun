import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact"
      phase="Coming soon"
      body="A way to send a message in a bottle."
    />
  );
}
