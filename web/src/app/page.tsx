import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import heroDesktop from "../../public/images/captain/hero-desktop.jpg";
import heroMobile from "../../public/images/captain/hero-mobile.jpg";
import compass from "../../public/images/compass.png";
import AnimeRow, { AnimeRowSkeleton } from "@/components/AnimeRow";
import SkyScene from "@/components/SkyScene";
import CaptainChibi from "@/components/CaptainChibi";
import WhereToWatchDemo from "@/components/WhereToWatchDemo";
import { getAllTimeGreats, getTrending } from "@/lib/anilist";

const FEATURES = [
  {
    icon: "compass",
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

// The Captain on the bow of his ship. Desktop: the wide painting fills the hero,
// the Captain stands on the left and the words sit over the open sky and sea on
// the right. Phones: a portrait crop of the Captain on top, the words below.
function Hero() {
  const common = {
    alt: "The Captain, Anime World Fun's mascot, standing on the bow of his ship under a starry night sky",
    sizes: "100vw",
    loading: "eager" as const,
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: heroDesktop });
  const {
    props: { srcSet: mobile, ...img },
  } = getImageProps({ ...common, src: heroMobile });

  return (
    <section className="relative md:h-[clamp(560px,52vw,800px)]">
      <div
        className="relative h-[66svh] max-h-[620px] min-h-[380px] w-full overflow-hidden md:absolute md:inset-0 md:h-full md:max-h-none"
        style={{
          maskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
        }}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={desktop} />
          <source srcSet={mobile} />
          <img {...img} alt={common.alt} className="absolute inset-0 h-full w-full object-cover object-top md:object-[28%_center]" />
        </picture>
        {/* keeps the words readable over the sky without hiding the Captain */}
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-[#0a0f24]/10 to-[#070a18]/70 md:block" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 sm:px-6 md:mt-0 md:flex md:h-full md:items-center md:justify-end">
        <div className="text-center md:w-[min(46%,560px)] md:pt-16 md:text-left">
          <p className="font-display text-lg tracking-[0.3em] text-[#ff9fc8] [text-shadow:0_2px_10px_#000]">Welcome aboard</p>
          <h1 className="title-stroke mt-1 text-[clamp(3rem,11vw,5.6rem)] leading-[0.9] md:text-[clamp(3.4rem,5.6vw,5.8rem)]">
            Anime World Fun
          </h1>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-text/95 [text-shadow:0_2px_8px_#000] sm:text-xl">
            Find <strong className="text-straw">where to watch</strong> any anime,{" "}
            <strong className="text-straw">in which language</strong>, track every episode — and read tales from the
            crew.
          </p>

          <form
            action="/explore"
            className="mx-auto mt-6 flex max-w-2xl overflow-hidden rounded-2xl border-2 border-ink bg-parchment shadow-[5px_5px_0_var(--ink)] md:mx-0"
          >
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

          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/explore" className="rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5">
              Explore the database
            </Link>
            <Link href="/my-list" className="rounded-full border-2 border-straw bg-black/40 px-6 py-3 font-extrabold text-straw transition hover:bg-straw/10">
              Start my watchlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SkyScene />

      <Hero />

    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">

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
              {f.icon === "compass" ? (
                <Image src={compass} alt="" className="h-11 w-auto transition group-hover:rotate-12" />
              ) : (
                <span className="text-4xl" aria-hidden>{f.icon}</span>
              )}
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
          <CaptainChibi pose="waving" float className="-mb-2 w-28 sm:w-36" label="The Captain waving hello" />
          <h2 className="title-stroke text-4xl sm:text-6xl">Free for every fan, forever</h2>
          <p className="max-w-lg text-muted">
            No subscriptions, no treasure required. Watchlists, dub alerts and comments are on their way.
          </p>
          <Link href="/explore" className="rounded-full bg-sash px-8 py-3.5 font-display text-2xl tracking-wider text-white shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5">
            Start exploring
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
