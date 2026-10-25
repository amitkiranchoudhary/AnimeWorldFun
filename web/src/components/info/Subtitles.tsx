import type { CSSProperties } from "react";

/**
 * Movie-subtitle captions along the bottom of a <ScrollScene>: each line
 * cross-fades in for its share of the scene's progress (--p), like dialogue
 * on a film. All lines stay in the DOM, so screen readers read them as a list.
 */
export default function Subtitles({
  lines,
  from = 0.1,
  to = 0.95,
  className = "",
}: {
  lines: string[];
  /** scene progress where the first line appears */
  from?: number;
  /** scene progress where the last line ends */
  to?: number;
  className?: string;
}) {
  return (
    <ol
      className={`subtitles pointer-events-none absolute inset-x-4 bottom-[9svh] grid place-items-center text-center ${className}`}
      style={{ "--from": from, "--to": to, "--m": lines.length } as CSSProperties}
    >
      {lines.map((line, k) => (
        <li key={k} className="subtitle-line col-start-1 row-start-1" style={{ "--k": k } as CSSProperties}>
          <span>{line}</span>
        </li>
      ))}
      <style href="awf-subtitles" precedence="default">{`
        .subtitle-line {
          /* where we are inside this line's slot, in "lines" (0 = start, 1 = end) */
          --t: calc((var(--p, 1) - var(--from)) / (var(--to) - var(--from)) * var(--m) - var(--k));
          --show: min(clamp(0, calc(var(--t) * 5), 1), clamp(0, calc((1 - var(--t)) * 5), 1));
          opacity: var(--show);
          transform: translate3d(0, calc((1 - var(--show)) * 10px), 0);
          max-width: 46rem;
        }
        .subtitle-line > span {
          display: inline;
          font-weight: 800;
          font-size: clamp(1rem, 2.6vw, 1.35rem);
          line-height: 1.5;
          color: #fffbe6;
          letter-spacing: 0.01em;
          background: rgba(0,0,0,0.55);
          padding: 0.15em 0.55em;
          border-radius: 0.3em;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          text-shadow: 0 2px 0 #000;
        }
        /* the last line stays on screen once reached */
        .subtitle-line:last-child { --show: clamp(0, calc(var(--t) * 5), 1); }
        .scroll-scene[data-still] .subtitles { position: static; display: flex; flex-direction: column; gap: .5rem; margin-top: 2rem; }
        .scroll-scene[data-still] .subtitle-line { opacity: 1; transform: none; }
      `}</style>
    </ol>
  );
}
