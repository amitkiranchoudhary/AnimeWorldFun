"use client";

import { useFormStatus } from "react-dom";

/** The "Log out" button for the studio's logout form, with a going-ashore state. */
export default function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shimmer relative overflow-hidden rounded-full border-2 border-straw/80 bg-straw/5 px-5 py-2 font-extrabold text-straw transition hover:bg-straw/15 hover:shadow-[var(--glow-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw disabled:cursor-progress disabled:opacity-70"
    >
      {pending ? "Going ashore…" : "Log out"}
    </button>
  );
}
