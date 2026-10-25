import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AnimeDataEditor from "@/components/account/AnimeDataEditor";
import { requireOwner } from "@/lib/session";

export const metadata: Metadata = {
  title: "Anime data",
  robots: { index: false, follow: false },
};

async function Editor() {
  await requireOwner();
  return <AnimeDataEditor />;
}

export default function AnimeDataPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <Link
        href="/studio"
        className="text-sm font-extrabold uppercase tracking-[0.25em] text-sash underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
      >
        ← Captain&apos;s quarters
      </Link>
      <h1 className="mt-3 font-display text-5xl tracking-wide text-text text-glow-pink sm:text-7xl">Anime data</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Fill in the sub and dub languages you&apos;ve checked on each platform (India by default). Only add what you&apos;ve
        seen yourself: anything left “Not checked” shows as “not confirmed yet” on the site.
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="glass h-40 animate-pulse rounded-3xl" aria-hidden />}>
          <Editor />
        </Suspense>
      </div>
    </div>
  );
}
