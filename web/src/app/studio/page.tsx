import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { requireOwner } from "@/lib/session";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import TiltCard from "@/components/motion/TiltCard";
import LogoutButton from "@/components/account/LogoutButton";
import s from "@/components/account/studio.module.css";
import { logout } from "../login/actions";

export const metadata: Metadata = {
  title: "Captain's Quarters",
  robots: { index: false, follow: false },
};

const PHASE_ACCENT: Record<string, string> = {
  "Phase 2": "#7cc6ff",
  "Phase 3": "#ff8fc2",
  "Phase 4": "#f2c94c",
  Later: "#b9c3d6",
};

type Tool = { icon: string; title: string; body: string; phase: string; href: string | null };

const TOOLS: Tool[] = [
  {
    icon: "✍️",
    title: "Write a blog",
    body: "Write or paste a post with a live preview, then download it and commit it to publish.",
    phase: "Phase 4",
    href: "/studio/write",
  },
  {
    icon: "🎙️",
    title: "Voice read-along",
    body: "Load your recording and tap each sentence as you hear it; readers hear you while the words light up.",
    phase: "Phase 4",
    href: "/studio/write#voice",
  },
  { icon: "🗺️", title: "Anime data", body: "Fix sub/dub and where-to-watch info for India.", phase: "Phase 2", href: null },
  { icon: "📊", title: "Site stats", body: "Views, popular posts and searches.", phase: "Later", href: null },
];

// the route ahead, in the order the phases land
const CHART = [
  { phase: "Phase 2", label: "Anime data", href: null },
  { phase: "Phase 3", label: "My List logbook", href: "/my-list" },
  { phase: "Phase 4", label: "Blog & voice studio", href: "/studio/write" },
  { phase: "Later", label: "Site stats", href: null },
];

function ToolCard({ t, i }: { t: Tool; i: number }) {
  const accent = PHASE_ACCENT[t.phase] ?? "#f2c94c";
  return (
    <Reveal as="li" delay={i * 110} y={34} scale={0.97}>
      <TiltCard max={7} className="h-full rounded-3xl">
        <article
          className={`${s.tool} shimmer relative h-full overflow-hidden rounded-3xl p-6 sm:p-7`}
          style={{ "--accent": accent } as CSSProperties}
        >
          <div aria-hidden className={`${s.toolLight} pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full`} />
          <div className="relative flex items-start justify-between gap-3">
            <span
              aria-hidden
              className={`${s.medallion} grid h-16 w-16 place-items-center rounded-2xl text-3xl`}
              style={{ "--fd": `${i * 0.7}s` } as CSSProperties}
            >
              {t.icon}
            </span>
            <span
              className="rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em]"
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              }}
            >
              {t.href ? "Live" : t.phase}
            </span>
          </div>
          <h2 className="relative mt-5 font-display text-3xl tracking-wide text-straw">{t.title}</h2>
          <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{t.body}</p>
          {t.href ? (
            <Link
              href={t.href}
              className="relative mt-5 inline-block rounded-full bg-straw px-4 py-2 text-sm font-extrabold text-ink after:absolute after:inset-[-100vmax] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              Open →
            </Link>
          ) : (
            <p className="relative mt-5 flex items-center gap-2 text-xs font-bold text-white/45">
              <span aria-hidden>🔒</span> Switches on in {t.phase === "Later" ? "a later phase" : t.phase}
            </p>
          )}
        </article>
      </TiltCard>
    </Reveal>
  );
}

// a horizontal (vertical on phones) route through the phases
function VoyageChart() {
  return (
    <Reveal className="glass relative mt-14 overflow-hidden rounded-3xl p-6 sm:p-8">
      <h2 className="font-display text-2xl tracking-wide text-text">The voyage chart</h2>
      <p className="mt-1 text-sm text-muted">What lands next, in order.</p>
      <div className="relative mt-8">
        <div aria-hidden className={`${s.track} absolute bottom-3 left-[7px] top-3 w-0.5 rounded-full sm:inset-x-[12.5%] sm:bottom-auto sm:top-[7px] sm:h-0.5 sm:w-auto`} />
        <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-4">
          {CHART.map((c, i) => {
            const accent = PHASE_ACCENT[c.phase];
            return (
              <Reveal
                as="li"
                key={c.phase}
                delay={300 + i * 160}
                y={12}
                className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-3 sm:text-center"
              >
                <span
                  aria-hidden
                  className={`${s.stop} mt-0.5 h-4 w-4 shrink-0 rounded-full sm:mt-0`}
                  style={{ background: accent, "--accent": accent } as CSSProperties}
                />
                <span>
                  <span className="block text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: accent }}>
                    {c.phase}
                  </span>
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="mt-0.5 inline-block font-bold text-text underline decoration-white/30 underline-offset-4 transition hover:decoration-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
                    >
                      {c.label} · open →
                    </Link>
                  ) : (
                    <span className="mt-0.5 block font-bold text-text">{c.label}</span>
                  )}
                </span>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}

async function Quarters() {
  await requireOwner();

  return (
    <>
      <header className="relative isolate flex flex-wrap items-end justify-between gap-6">
        <div aria-hidden className={`${s.aurora} pointer-events-none absolute -inset-x-4 -top-16 bottom-0 -z-10`} />
        <div className="min-w-0">
          <Reveal y={12}>
            <p className="inline-flex items-center gap-2 font-display text-lg tracking-[0.2em] text-sash">
              <span aria-hidden className="h-2 w-2 rounded-full bg-sash" style={{ boxShadow: "0 0 10px var(--sash)", animation: "glow-pulse 1.8s ease-in-out infinite" }} />
              Owner dashboard
            </p>
          </Reveal>
          <h1 className="mt-2">
            <SplitText text="Welcome aboard," as="span" delay={120} className="block font-display text-4xl tracking-wide text-text text-glow-pink sm:text-6xl" />
            <SplitText text="Captain" as="span" by="char" stagger={60} delay={380} className="title-stroke block text-6xl leading-[0.95] sm:text-8xl" />
          </h1>
          <Reveal delay={700}>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              The captain&apos;s quarters: write posts, sync your voice, and keep the anime data honest.
            </p>
          </Reveal>
        </div>
        <Reveal delay={500}>
          <form action={logout}>
            <LogoutButton />
          </form>
        </Reveal>
      </header>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {TOOLS.map((t, i) => (
          <ToolCard key={t.title} t={t} i={i} />
        ))}
      </ul>

      <VoyageChart />

      <Reveal>
        <p className="mt-10 text-sm text-muted">
          Locked tools switch on as their phase lands.{" "}
          <Link
            href="/"
            className="font-bold text-straw underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
          >
            Back to the site
          </Link>
        </p>
      </Reveal>
    </>
  );
}

function QuartersFallback() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center" role="status">
      <span
        aria-hidden
        className="h-12 w-12 animate-spin rounded-full border-2 border-straw/30 border-t-straw"
        style={{ boxShadow: "var(--glow-gold)" }}
      />
      <p className="text-muted">Checking the captain&apos;s papers…</p>
    </div>
  );
}

export default function StudioPage() {
  return (
    <div className="relative overflow-x-clip">
      <p aria-hidden className={`${s.sideLabel} absolute right-3 top-24 hidden font-display text-sm text-white/20 lg:block`}>
        船長室 — CAPTAIN&apos;S QUARTERS
      </p>
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Suspense fallback={<QuartersFallback />}>
          <Quarters />
        </Suspense>
      </div>
    </div>
  );
}
