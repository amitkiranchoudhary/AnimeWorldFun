import Link from "next/link";
import { Suspense } from "react";
import { LogoHero } from "@/components/Logo";
import Mascot from "@/components/Mascot";
import AnimeRow, { AnimeRowSkeleton } from "@/components/AnimeRow";
import WhereToWatchDemo from "@/components/WhereToWatchDemo";
import { getAllTimeGreats, getTrending } from "@/lib/anilist";

const FEATURES = [
  {
    icon: "🧭",
    title: "Explore every anime",
    body: "Thousands of titles you can filter by A–Z, genre, sub or dub, language, platform, year and more.",
    href: "/explore",
  },
  {
    icon: "📜",
    title: "Track your voyage",
    body: "Mark Watching, Completed or Plan to Watch, log episodes, and import your AniList or MAL list.",
    href: "/my-list",
  },
  {
    icon: "🔔",
    title: "Dub drop alerts",
    body: "Get told the moment a show you want lands in Hindi or English dub on your platform.",
    href: "/my-list",
  },
  {
    icon: "🎙️",
    title: "Read-along blogs",
    body: "Hit play and hear the writer narrate — each word lights up as it's spoken.",
    href: "/blog",
  },
];

const BLOG_TEASERS = [
  { tag: "Coming soon", title: "The Captain's first log", body: "Stories, reviews and hot takes are being written in the galley." },
  { tag: "Coming soon", title: "Watch-order guides", body: "Never get lost in a franchise again — the right order, filler marked." },
  { tag: "Coming soon", title: "Seasonal picks", body: "What's worth your time this season, and where to stream it." },
];

async function TrendingRow() {
  return <AnimeRow items={await getTrending()} />;
}

async function GreatsRow() {
  return <AnimeRow items={await getAllTimeGreats()} />;
}

function SectionHeading({ kicker, title, href, cta }: { kicker: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="font-display text-lg tracking-wider text-sash">{kicker}</p>
        <h2 className="title-stroke text-4xl sm:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-extrabold text-straw underline-offset-4 hover:underline">
          {cta} →
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ── Hero ── */}
      <section className="grid items-center gap-10 pb-16 pt-20 sm:pt-24 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <LogoHero />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-text/90 sm:text-xl">
            Set sail for your next anime. Find <strong className="text-straw">where to watch it</strong>,{" "}
            <strong className="text-straw">in which language</strong>, keep track of every episode — and read tales
            from the crew.
          </p>

          <form action="/explore" className="mt-8 flex max-w-xl overflow-hidden rounded-2xl border-2 border-ink bg-parchment shadow-[5px_5px_0_var(--ink)]">
            <label htmlFor="hero-search" className="sr-only">Search anime</label>
            <input
              id="hero-search"
              name="q"
              placeholder="Search One Piece, Frieren, Solo Leveling…"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 font-bold text-ink placeholder:text-ink/45 focus:outline-none"
            />
            <button type="submit" className="bg-sash px-5 font-display text-xl tracking-wider text-white transition hover:bg-[#c92d3a] sm:px-7">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/explore" className="rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5">
              Explore the database
            </Link>
            <Link href="/my-list" className="rounded-full border-2 border-straw px-6 py-3 font-extrabold text-straw transition hover:bg-straw/10">
              Start my watchlist
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[380px]">
          <div className="parchment absolute -top-6 right-0 z-10 rounded-2xl border-2 border-ink px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_var(--ink)] sm:-right-4">
            Ahoy! What are we watching today?
            <span className="absolute -bottom-2.5 left-10 h-4 w-4 rotate-45 border-b-2 border-r-2 border-ink bg-parchment" />
          </div>
          <Mascot className="aspect-[260/300] w-full" />
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="py-10">
        <SectionHeading kicker="Sailing this season" title="Trending now" href="/explore" cta="See all" />
        <Suspense fallback={<AnimeRowSkeleton />}>
          <TrendingRow />
        </Suspense>
      </section>

      {/* ── Where to watch ── */}
      <section className="py-10">
        <WhereToWatchDemo />
      </section>

      {/* ── Features ── */}
      <section className="py-10">
        <SectionHeading kicker="Your ship, your rules" title="What's on board" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="card group p-6 transition hover:-translate-y-1 hover:border-straw/60"
            >
              <span className="text-4xl" aria-hidden>{f.icon}</span>
              <h3 className="mt-3 font-display text-2xl tracking-wide text-straw">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── All-time greats ── */}
      <section className="py-10">
        <SectionHeading kicker="Legends of the sea" title="All-time greats" href="/explore" cta="Browse more" />
        <Suspense fallback={<AnimeRowSkeleton />}>
          <GreatsRow />
        </Suspense>
      </section>

      {/* ── Blog ── */}
      <section className="py-10">
        <SectionHeading kicker="From the galley" title="Captain's Log" href="/blog" cta="All posts" />
        <div className="grid gap-5 md:grid-cols-3">
          {BLOG_TEASERS.map((b, i) => (
            <article
              key={b.title}
              className="parchment rounded-2xl border-2 border-ink p-6 shadow-[5px_5px_0_var(--ink)]"
              style={{ transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)` }}
            >
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-straw">
                {b.tag}
              </span>
              <h3 className="mt-3 font-display text-3xl tracking-wide">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Join ── */}
      <section className="py-10">
        <div className="card flex flex-col items-center gap-5 px-6 py-12 text-center">
          <h2 className="title-stroke text-4xl sm:text-6xl">Join the crew — it&apos;s free</h2>
          <p className="max-w-lg text-muted">
            Save your watchlist, get dub alerts and comment on blogs. No subscriptions, no treasure required.
          </p>
          <Link href="/login" className="rounded-full bg-sash px-8 py-3.5 font-display text-2xl tracking-wider text-white shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5">
            Hop aboard
          </Link>
        </div>
      </section>
    </div>
  );
}
