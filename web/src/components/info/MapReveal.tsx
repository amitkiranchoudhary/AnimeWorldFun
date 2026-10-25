import type { CSSProperties } from "react";

// An illustrative "where to watch" card, shaped like the one on anime pages.
const ROWS = [
  { platform: "Crunchyroll", tags: ["SUB", "DUB · EN / ES"], tone: "255,140,60" },
  { platform: "Netflix", tags: ["SUB", "DUB · EN"], tone: "230,57,70" },
  { platform: "HIDIVE", tags: ["SUB"], tone: "80,170,255" },
  { platform: "Hindi dub", tags: ["Not confirmed yet"], tone: "160,160,170", unknown: true },
];

/**
 * Chapter two's payoff: a glass "where to watch" card that rises once the
 * big line has played, and whose platform rows light up one by one with the
 * scene's --p (opacity and transform only, like ScrubLine). Fully lit when
 * the scene is still (reduced motion / no JavaScript, where --p is 1).
 */
export default function MapReveal({ from = 0.42, to = 0.85 }: { from?: number; to?: number }) {
  return (
    <div
      aria-hidden
      className="map-reveal pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 pb-[16svh] pt-[22svh]"
      style={{ "--from": from, "--to": to, "--rows": ROWS.length } as CSSProperties}
    >
      <div className="map-dim absolute inset-0 bg-[#07070b]" />
      <div className="map-card glass relative w-full max-w-md rounded-3xl p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl tracking-wide text-straw text-glow-gold sm:text-3xl">Where to watch</p>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/60">Example</p>
        </div>
        <ul className="mt-4 grid gap-2.5">
          {ROWS.map((r, i) => (
            <li
              key={r.platform}
              className="map-row relative flex flex-wrap items-center justify-between gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5"
              style={{ "--r": i, "--tone": r.tone } as CSSProperties}
            >
              <span aria-hidden className="map-row-glow absolute inset-0" />
              <span className="relative flex items-center gap-2.5 font-extrabold text-text">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--tone))] shadow-[0_0_10px_rgb(var(--tone))]" />
                {r.platform}
              </span>
              <span className="relative flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider ${
                      r.unknown ? "border border-dashed border-white/30 text-muted" : "bg-straw text-ink"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style href="awf-map-reveal" precedence="default">{`
        .map-reveal {
          /* --in: the card arriving; --m: 0 → 1 across the rows */
          --in: clamp(0, calc((var(--p, 1) - var(--from)) / 0.08), 1);
          --m: clamp(0, calc((var(--p, 1) - var(--from)) / (var(--to) - var(--from))), 1);
        }
        .map-dim { opacity: calc(var(--in) * 0.62); }
        .map-card {
          opacity: var(--in);
          transform: translate3d(0, calc((1 - var(--in)) * 28px), 0) scale(calc(0.95 + var(--in) * 0.05));
          box-shadow: 0 40px 90px -30px rgba(242,201,76,0.35);
          will-change: opacity, transform;
        }
        .map-row {
          --lit: clamp(0, calc(var(--m) * var(--rows) - var(--r)), 1);
          opacity: calc(0.2 + var(--lit) * 0.8);
          transform: translate3d(calc((1 - var(--lit)) * -14px), 0, 0);
        }
        .map-row-glow {
          background: linear-gradient(90deg, rgba(var(--tone),0.28), transparent 75%);
          opacity: var(--lit);
        }
        .scroll-scene[data-still] .map-reveal { position: relative; inset: auto; padding: 2rem 1rem 0; }
        .scroll-scene[data-still] .map-dim { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .scroll-scene .map-reveal { position: relative; inset: auto; padding: 2rem 1rem 0; }
          .scroll-scene .map-dim { display: none; }
        }
      `}</style>
    </div>
  );
}
