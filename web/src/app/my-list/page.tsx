import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { displayTitle, getTrending } from "@/lib/anilist";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";
import Marquee from "@/components/motion/Marquee";
import Parallax from "@/components/motion/Parallax";
import LogbookDemo, { type DemoShow } from "@/components/account/LogbookDemo";
import LogbookShelves, { LogbookShelvesSkeleton } from "@/components/account/LogbookShelves";
import LogbookRail from "@/components/account/LogbookRail";
import ScrollLitLine from "@/components/account/ScrollLitLine";
import ProgressRing from "@/components/account/ProgressRing";
import MyListApp from "@/components/account/MyListApp";
import s from "@/components/account/logbook.module.css";

export const metadata: Metadata = {
  title: "My List",
  description:
    "Your anime logbook: track what you're watching, completed or planning, log episodes, rate shows and import from AniList or MyAnimeList. Saved in your browser, no account needed.",
};

/* ── Data pieces (each inside its own <Suspense>) ───────────── */

// three trending covers drifting behind the hero title
async function HeroCovers() {
  const items = (await getTrending()).slice(0, 3);
  const spots = [
    { pos: "left-[-6%] top-[12%] w-32 sm:left-[4%] sm:w-44 lg:w-52", rot: -9, speed: -0.25, float: "0s" },
    { pos: "right-[-8%] top-[6%] w-28 sm:right-[6%] sm:w-40 lg:w-48", rot: 8, speed: -0.12, float: "1.4s" },
    { pos: "right-[10%] bottom-[2%] hidden w-36 md:block lg:w-40", rot: -4, speed: -0.35, float: "2.6s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((a, i) => (
        <Parallax key={a.id} speed={spots[i].speed} className={`absolute ${spots[i].pos}`}>
          <div style={{ animation: `float 7s ease-in-out ${spots[i].float} infinite` }}>
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-2xl border-2 border-ink opacity-35 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:opacity-45"
              style={{ transform: `rotate(${spots[i].rot}deg)`, background: a.coverImage.color ?? "#1d2c5e" }}
            >
              <Image src={a.coverImage.large} alt="" fill sizes="208px" className="object-cover" priority={i === 0} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
            </div>
          </div>
        </Parallax>
      ))}
    </div>
  );
}

async function DemoFromTrending() {
  const shows: DemoShow[] = (await getTrending()).slice(3, 7).map((a) => ({
    id: a.id,
    title: displayTitle(a),
    cover: a.coverImage.large,
    color: a.coverImage.color,
    // keep the bead row tidy: long shows are shown as a 12-episode arc
    episodes: a.episodes && a.episodes <= 24 ? a.episodes : 12,
  }));
  if (shows.length === 0) return <DemoUnavailable />;
  return <LogbookDemo shows={shows} />;
}

async function ShelvesFromTrending() {
  const items = await getTrending();
  if (items.length === 0) return <DemoUnavailable />;
  return <LogbookShelves items={items} />;
}

// the same shelves on one pinned, curved rail (wide screens with motion; CSS decides)
async function RailFromTrending() {
  const items = await getTrending();
  if (items.length === 0) return null;
  return <LogbookRail items={items} />;
}

async function TrendingTicker() {
  const items = await getTrending();
  if (items.length === 0) return null;
  return (
    <Marquee seconds={46} label="Trending shows you could log" className="py-4">
      {items.map((a) => (
        <span key={a.id} className="flex items-center gap-5 px-5 font-display text-3xl tracking-wide text-white/25 sm:text-5xl">
          {displayTitle(a)}
          <span className="text-xl text-sash/70" aria-hidden>
            ✿
          </span>
        </span>
      ))}
    </Marquee>
  );
}

function DemoUnavailable() {
  return (
    <p className="card px-5 py-10 text-center text-muted">
      The seas are rough — couldn&apos;t reach the anime database for the demo covers. Try again in a bit.
    </p>
  );
}

/* ── Layout pieces ─────────────────────────────────────────── */

// a film-chapter heading with a big vertical side label on wide screens
function Chapter({
  n,
  label,
  title,
  lead,
  children,
  after,
  id,
}: {
  n: string;
  label: string;
  title: string;
  lead: string;
  children: ReactNode;
  /** full-width content after the chapter column (e.g. the pinned rail) */
  after?: ReactNode;
  id: string;
}) {
  return (
    <section id={id} aria-label={title} className="relative">
      {/* with a pinned rail after it, the column hands straight over to the stage on wide screens */}
      <div className={`relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:pl-24 ${after ? "lg:motion-safe:pb-0" : ""}`}>
        <p
          aria-hidden
          className={`${s.sideLabel} absolute left-4 top-28 hidden font-display text-sm text-white/25 lg:block`}
        >
          CH.{n} — {label}
        </p>
        <Reveal>
          <p className="font-display text-lg tracking-[0.25em] text-sash">Chapter {n}</p>
        </Reveal>
        <SplitText
          text={title}
          as="h2"
          className="mt-1 font-display text-5xl leading-[0.95] tracking-wide text-text sm:text-7xl"
        />
        <Reveal delay={150}>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{lead}</p>
        </Reveal>
        <div className={after ? "mt-12 lg:motion-safe:mt-0" : "mt-12"}>{children}</div>
      </div>
      {after}
    </section>
  );
}

const FEATURES = [
  {
    ring: 1,
    title: "Five shelves",
    body: "Watching, Plan to watch, Completed, On hold and Dropped — move a show between them in one tap.",
  },
  {
    ring: 0.58,
    title: "Episode rings",
    body: "Log each episode with +1 and watch the ring fill. The last episode stamps it Completed.",
  },
  {
    ring: 0.82,
    title: "Bring your log",
    body: "Import your list from AniList or MyAnimeList, and download a backup to move it to another device.",
  },
];

export default function MyListPage() {
  return (
    <div className="relative overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────── */}
      <header className="relative flex min-h-[88svh] items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6">
        <div aria-hidden className={s.heroGlow} />
        <Suspense fallback={null}>
          <HeroCovers />
        </Suspense>
        <p aria-hidden className={`${s.sideLabel} absolute right-4 top-1/2 hidden -translate-y-1/2 font-display text-sm text-white/25 lg:block`}>
          航海日誌 — THE LOGBOOK
        </p>

        <div className="relative max-w-4xl">
          <Reveal y={14}>
            <span className="inline-flex items-center gap-2 rounded-full border border-sash/50 bg-sash/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-[#ffc9cd]">
              <span className="h-2 w-2 rounded-full bg-sash" style={{ animation: "glow-pulse 1.6s ease-in-out infinite", boxShadow: "0 0 10px var(--sash)" }} />
              Saved in your browser · no account
            </span>
          </Reveal>
          <h1 className="mt-6">
            <SplitText
              text="Your voyage"
              as="span"
              delay={150}
              className="block font-display text-5xl tracking-wide text-text text-glow-pink sm:text-7xl"
            />
            <SplitText
              text="Logbook"
              as="span"
              by="char"
              stagger={55}
              delay={420}
              className="title-stroke block text-[5.2rem] leading-[0.9] sm:text-[9rem] lg:text-[11rem]"
            />
          </h1>
          <Reveal delay={900}>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed">
              <span className={`${s.subtitle} rounded px-2 py-1 font-bold text-[#fff6d8]`}>
                Every show you watch, written down like a captain&apos;s log.
              </span>
            </p>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted">
              Five shelves, episode rings, your own ratings and notes. Add shows from any anime page, or import
              your list from AniList or MyAnimeList. It stays in this browser — no sign-up.
            </p>
          </Reveal>
          <Reveal delay={1100} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#my-log"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-text transition hover:border-straw/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              Open your logbook ↓
            </a>
            <Link
              href="/explore"
              className="text-sm font-extrabold text-straw underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              or explore anime now →
            </Link>
          </Reveal>
        </div>
      </header>

      {/* ── Chapter 01: the visitor's real logbook ───── */}
      <div id="my-log" className="scroll-mt-20">
        <Chapter
          n="01"
          id="ch-log"
          label="YOUR LOG"
          title="Your logbook"
          lead="Everything you've added, shelf by shelf. Log an episode with +1, rate it, jot a note — it saves as you go."
        >
          <MyListApp />
        </Chapter>
      </div>

      {/* ── Chapter 02: the demo ─────────────────────── */}
      <div id="how-it-works" className="scroll-mt-20">
        <Chapter
          n="02"
          id="ch-demo"
          label="HOW IT WORKS"
          title="Log it, episode by episode"
          lead="Add a show to Plan to watch, log episodes as you go and see the ring fill, then stamp it Completed. Try the button — this one's just a demo."
        >
          <Reveal scale={0.97}>
            <Suspense fallback={<div className="glass h-[420px] animate-pulse rounded-[2rem]" />}>
              <DemoFromTrending />
            </Suspense>
          </Reveal>
        </Chapter>
      </div>

      {/* ── Chapter 02: a line that owns the screen ──── */}
      <ScrollLitLine
        eyebrow="Chapter 03 · The log"
        text="Every episode you watch becomes a line in your logbook."
        gold={["episode", "logbook"]}
      />

      {/* ── Chapter 03: the shelves ──────────────────── */}
      <Chapter
        n="04"
        id="ch-shelves"
        label="NEED IDEAS?"
        title="What the crew is watching"
        lead="A sample logbook stocked with what's trending right now — tap a cover to open the show and add it to yours."
        after={
          <Suspense fallback={<div aria-hidden className={`${s.railOnly} h-[100svh]`} />}>
            <RailFromTrending />
          </Suspense>
        }
      >
        <Suspense fallback={<LogbookShelvesSkeleton />}>
          <ShelvesFromTrending />
        </Suspense>
      </Chapter>

      <Suspense fallback={null}>
        <TrendingTicker />
      </Suspense>

      {/* ── Chapter 04: what's coming ────────────────── */}
      <Chapter
        n="05"
        id="ch-features"
        label="ON BOARD"
        title="What your logbook can do"
        lead="No account, no tracking — just your list, kept on your own device."
      >
        <ul className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 120} className="glass relative overflow-hidden rounded-3xl p-6">
              <ProgressRing value={f.ring} size={56} stroke={5} color={i === 1 ? "#ff8fc2" : "var(--straw)"} delay={200 + i * 150} />
              <h3 className="mt-4 font-display text-3xl tracking-wide text-straw">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              <span className="mt-4 inline-block rounded-full bg-straw/15 px-2.5 py-0.5 text-xs font-bold text-straw">Live now</span>
            </Reveal>
          ))}
        </ul>
      </Chapter>

      {/* ── Finale: call to action ───────────────────── */}
      <section aria-label="Find your next voyage" className="relative px-4 pb-28 pt-10 text-center sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242,201,76,0.16), transparent 65%)" }}
        />
        <div className="relative">
          <SplitText
            text="Find your next voyage"
            as="h2"
            className="mx-auto max-w-3xl font-display text-5xl leading-[0.95] tracking-wide text-text text-glow-gold sm:text-7xl"
          />
          <Reveal delay={250}>
            <p className="mx-auto mt-5 max-w-md text-muted">
              Open any anime and press “Add to My List” — it&apos;ll be waiting for you here.
            </p>
          </Reveal>
          <Reveal delay={400} className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Magnetic>
              <Link
                href="/explore"
                className="shimmer relative inline-block overflow-hidden rounded-full bg-straw px-8 py-4 font-display text-2xl tracking-wider text-ink shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw"
                style={{ boxShadow: "4px 4px 0 var(--ink), var(--glow-gold)" }}
              >
                Explore anime →
              </Link>
            </Magnetic>
            <Link
              href="/"
              className="font-bold text-muted underline-offset-4 transition hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              ← Back to the harbour
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
