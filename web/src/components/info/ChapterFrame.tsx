import type { CSSProperties, ReactNode } from "react";

/**
 * The look of one film chapter inside a <ScrollScene> stage: letterbox bars,
 * a giant faint kanji drifting behind the words, a big vertical side label
 * ("CHAPTER 01"), and a small timecode-style header. All decoration is
 * aria-hidden and moves only with the scene's --p (transform/opacity).
 */
export default function ChapterFrame({
  number,
  title,
  kanji,
  kanjiMeaning,
  tint = "255,120,180",
  align = "center",
  overlay,
  children,
}: {
  number: string;
  title: string;
  kanji: string;
  kanjiMeaning: string;
  /** "r,g,b" glow colour for this chapter's light */
  tint?: string;
  /** "top" lifts the words into the upper part of the screen, making room for an overlay */
  align?: "center" | "top";
  /** a full-stage layer above the light, under the letterbox (e.g. <PosterArc>) */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`chapter-frame relative flex h-full min-h-[100svh] flex-col items-center ${align === "top" ? "justify-start pt-[19svh] sm:pt-[21svh]" : "justify-center"}`}
      style={{ "--tint": tint, "--klen": [...kanji].length } as CSSProperties}
    >
      {/* coloured light that swells as the chapter plays */}
      <div aria-hidden className="chapter-light pointer-events-none absolute inset-0" />

      {/* giant kanji, slowly rising and growing through the chapter */}
      <div aria-hidden className="chapter-kanji pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span>{kanji}</span>
      </div>

      {/* vertical side label */}
      <p aria-hidden className="chapter-side pointer-events-none absolute left-2 top-1/2 hidden font-display sm:block">
        Chapter {number}
      </p>

      {/* header: chapter number, title, kanji meaning */}
      <header className="absolute inset-x-4 top-[12svh] flex items-center justify-center gap-3 text-center sm:top-[14svh]">
        <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-[rgba(var(--tint),0.8)] sm:w-16" />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-muted sm:text-xs">
          <span className="text-[rgb(var(--tint))]">Ch. {number}</span> · {title}
          <span className="sr-only">, {kanjiMeaning}</span>
        </p>
        <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-[rgba(var(--tint),0.8)] sm:w-16" />
      </header>

      <div className="relative z-10 w-full px-4 sm:px-8">{children}</div>

      {overlay}

      {/* letterbox */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[7svh] bg-gradient-to-b from-black/90 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[7svh] bg-gradient-to-t from-black/90 to-transparent" />
      <p aria-hidden className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.3em] text-white/30">
        {kanji} · {kanjiMeaning}
      </p>

      <style href="awf-chapter-frame" precedence="default">{`
        .chapter-light {
          background:
            radial-gradient(60% 45% at 50% 55%, rgba(var(--tint),0.22), transparent 70%),
            radial-gradient(120% 80% at 50% 120%, rgba(0,0,0,0.85), transparent 60%);
          opacity: calc(0.35 + var(--p, 1) * 0.65);
        }
        .chapter-kanji span {
          font-size: calc(min(78vw, 70svh) / var(--klen, 1));
          line-height: 1;
          font-weight: 900;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(var(--tint),0.22);
          text-shadow: 0 0 80px rgba(var(--tint),0.12);
          transform: translate3d(0, calc((0.5 - var(--p, 1)) * 18svh), 0) scale(calc(0.86 + var(--p, 1) * 0.22));
          opacity: calc(0.25 + var(--p, 1) * 0.75);
          will-change: transform;
          white-space: nowrap;
        }
        .chapter-side {
          writing-mode: vertical-rl;
          transform: translateY(-50%) rotate(180deg);
          font-size: clamp(2rem, 5vw, 4.5rem);
          letter-spacing: 0.12em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.18);
        }
      `}</style>
    </div>
  );
}
