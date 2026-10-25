import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BlogWriter from "@/components/account/BlogWriter";
import { requireOwner } from "@/lib/session";

export const metadata: Metadata = {
  title: "Write a blog",
  robots: { index: false, follow: false },
};

async function Desk() {
  await requireOwner();
  return <BlogWriter />;
}

export default function WritePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Link
        href="/studio"
        className="text-sm font-extrabold uppercase tracking-[0.25em] text-sash underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
      >
        ← Captain&apos;s quarters
      </Link>
      <h1 className="mt-3 font-display text-5xl tracking-wide text-text text-glow-pink sm:text-7xl">Write a blog</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Write or paste your post, sync your recording, then download the files and commit them. Nothing here is uploaded —
        it all stays on this computer until you push it.
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="glass h-96 animate-pulse rounded-3xl" aria-hidden />}>
          <Desk />
        </Suspense>
      </div>
    </div>
  );
}
