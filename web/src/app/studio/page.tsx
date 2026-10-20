import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireOwner } from "@/lib/session";
import { logout } from "../login/actions";

export const metadata: Metadata = {
  title: "Captain's Quarters",
  robots: { index: false, follow: false },
};

const TOOLS = [
  { icon: "✍️", title: "Write a blog", body: "Paste or record a post and let the studio lay it out.", phase: "Phase 4" },
  { icon: "🎙️", title: "Voice read-along", body: "Upload your recording; words highlight as you speak.", phase: "Phase 4" },
  { icon: "🗺️", title: "Anime data", body: "Fix sub/dub and where-to-watch info for India.", phase: "Phase 2" },
  { icon: "📊", title: "Site stats", body: "Views, popular posts and searches.", phase: "Later" },
];

async function Quarters() {
  await requireOwner();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-lg tracking-wider text-sash">Owner dashboard</p>
          <h1 className="title-stroke text-5xl sm:text-6xl">Welcome aboard, Captain</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-full border-2 border-straw px-5 py-2 font-extrabold text-straw transition hover:bg-straw/10">
            Log out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <div key={t.title} className="card p-6">
            <div className="flex items-start justify-between">
              <span className="text-4xl" aria-hidden>{t.icon}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-muted">{t.phase}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl tracking-wide text-straw">{t.title}</h2>
            <p className="mt-1 text-sm text-muted">{t.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        These tools switch on as each phase lands. <Link href="/" className="text-straw underline">Back to the site</Link>
      </p>
    </>
  );
}

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Suspense fallback={<p className="text-center text-muted">Checking the captain&apos;s papers…</p>}>
        <Quarters />
      </Suspense>
    </div>
  );
}
