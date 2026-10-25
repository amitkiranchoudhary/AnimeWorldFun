import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { type AnimeCard, displayTitle } from "@/lib/anilist";
import Reveal from "@/components/motion/Reveal";
import CurvedShelf from "./CurvedShelf";
import ProgressRing from "./ProgressRing";
import s from "./logbook.module.css";

export type Kind = "watching" | "completed" | "plan";

export const SHELVES: { kind: Kind; title: string; note: string; accent: string }[] = [
  { kind: "watching", title: "Watching", note: "Rings fill as you log episodes", accent: "#ff8fc2" },
  { kind: "completed", title: "Completed", note: "Every finished voyage gets a stamp", accent: "var(--straw)" },
  { kind: "plan", title: "Plan to watch", note: "Lanterns lit for the next adventure", accent: "var(--sash)" },
];

/** Four trending shows per shelf, in shelf order (empty shelves dropped). */
export const shelfRows = (items: AnimeCard[]) =>
  SHELVES.map((shelf, si) => ({ shelf, row: items.slice(si * 4, si * 4 + 4) })).filter((r) => r.row.length > 0);

// sample progress for the preview (fixed, so server renders stay stable)
const SAMPLE = [0.35, 0.62, 0.84, 0.5];

const totalEps = (a: AnimeCard) => a.episodes ?? (a.nextAiringEpisode ? a.nextAiringEpisode.episode + 2 : 12);

/** The made-up logbook entry for a poster: episodes watched and how to say it. */
export function sampleOf(a: AnimeCard, kind: Kind, i: number) {
  const total = totalEps(a);
  const watched = kind === "completed" ? total : kind === "watching" ? Math.max(1, Math.round(total * SAMPLE[i % 4])) : 0;
  const label =
    kind === "watching" ? `${watched} of ${total} episodes` : kind === "completed" ? "completed" : "plan to watch";
  const caption =
    kind === "watching" ? `Ep ${watched} of ${total}` : kind === "completed" ? `${total} eps · done` : "Set sail soon";
  return { total, watched, label, caption };
}

/** One cover on a shelf: links to the show, with its sample ring / stamp / lantern. */
export function PosterCard({ a, kind, i, sizes }: { a: AnimeCard; kind: Kind; i: number; sizes: string }) {
  const { total, watched, label, caption } = sampleOf(a, kind, i);
  const title = displayTitle(a);

  return (
    <Reveal delay={(i % 4) * 90} y={34} scale={0.96}>
      <Link
        href={`/anime/${a.id}`}
        aria-label={`${title}, sample: ${label}`}
        className={`${s.poster} group relative block overflow-hidden rounded-2xl border-2 border-ink shadow-[5px_5px_0_var(--ink)] transition duration-300 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw`}
        style={{ background: a.coverImage.color ?? "#1d2c5e" }}
      >
        <div className="relative aspect-[2/3]">
          <Image
            src={a.coverImage.large}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {kind === "watching" && (
            <span className="absolute right-2 top-2 rounded-full bg-ink/80 p-1 backdrop-blur-sm">
              <ProgressRing value={watched / total} size={46} stroke={4} color="#ff8fc2" delay={300 + (i % 4) * 120}>
                <span className="text-[10px] font-extrabold text-white">
                  {watched}/{total}
                </span>
              </ProgressRing>
            </span>
          )}
          {kind === "completed" && (
            <span
              aria-hidden
              className="absolute right-2 top-2 rotate-[-10deg] rounded-md border-2 border-straw bg-ink/80 px-2 py-0.5 font-display text-sm tracking-wider text-straw"
              style={{ boxShadow: "var(--glow-gold)" }}
            >
              ★ Logged
            </span>
          )}
          {kind === "plan" && (
            <span aria-hidden className="absolute right-3 top-0 flex flex-col items-center">
              <span className="h-4 w-px bg-straw/70" />
              <span
                className={`h-7 w-5 rounded-[40%] bg-gradient-to-b from-[#ffb347] to-sash ${s.lanternGlow}`}
                style={{ boxShadow: "0 0 18px rgba(255,170,70,0.8), 0 0 40px rgba(230,57,70,0.5)", animationDelay: `${i * 0.4}s` }}
              />
            </span>
          )}

          <div className={`${s.posterCaption} absolute inset-x-0 bottom-0 p-3`}>
            <h4 className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{title}</h4>
            <p className="mt-0.5 text-[11px] font-bold text-white/70">{caption}</p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/**
 * Watching / Completed / Plan-to-watch shelves filled with real trending covers.
 * This is the phone and "reduce motion" layout: a swipeable curved rail per
 * shelf on phones, a gently curved still grid otherwise. Wide screens with
 * motion get the pinned <PosterRail> instead (see logbook.module.css).
 */
export default function LogbookShelves({ items }: { items: AnimeCard[] }) {
  return (
    <div className="space-y-16 sm:space-y-24">
      {shelfRows(items).map(({ shelf, row }) => (
        <section key={shelf.kind} aria-labelledby={`shelf-${shelf.kind}`}>
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3
                id={`shelf-${shelf.kind}`}
                className="font-display text-4xl tracking-wide sm:text-5xl"
                style={{ color: shelf.accent, textShadow: `0 0 28px color-mix(in srgb, ${shelf.accent} 45%, transparent)` }}
              >
                {shelf.title}
              </h3>
              <p className="text-sm text-muted">{shelf.note}</p>
            </div>
            <span className="flex items-center gap-3">
              <span aria-hidden className={`${s.swipeHint} text-xs font-extrabold uppercase tracking-[0.2em] text-straw`}>
                Swipe →
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted">
                Sample shelf · {row.length} shows
              </span>
            </span>
          </Reveal>
          <CurvedShelf className="grid grid-cols-2 gap-4 px-1 sm:grid-cols-4 sm:gap-6">
            {row.map((a, i) => {
              const k = row.length > 1 ? (i - (row.length - 1) / 2) / ((row.length - 1) / 2) : 0;
              return (
                <li key={a.id} className={s.shelfItem} style={{ "--k": k.toFixed(3) } as CSSProperties}>
                  <PosterCard a={a} kind={shelf.kind} i={i} sizes="(min-width: 640px) 200px, 60vw" />
                </li>
              );
            })}
          </CurvedShelf>
          <div aria-hidden className={`${s.plank} mx-auto mt-3 h-3 rounded-full sm:h-4`} />
        </section>
      ))}
    </div>
  );
}

export function LogbookShelvesSkeleton() {
  return (
    <div className="space-y-16" aria-hidden>
      {[0, 1, 2].map((r) => (
        <div key={r}>
          <div className="mb-6 h-10 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
