import Image from "next/image";
import type { CSSProperties } from "react";
import { displayTitle, type AnimeCard } from "@/lib/anilist";

/**
 * A curved 3D wall of anime posters (like a cinema screen seen from the
 * front row) that slides past as you scroll the surrounding <ScrollScene>,
 * and bends deeper the faster you scroll (--v). The poster in the middle
 * names itself in a subtitle. Every frame is CSS reading --p / --v.
 * With "reduce motion" it becomes a simple wrapped row of posters.
 */
export default function PosterArc({ items }: { items: AnimeCard[] }) {
  const n = items.length;
  return (
    <div className="poster-arc-wrap absolute inset-0" style={{ "--n": Math.max(n, 1) } as CSSProperties}>
      <ul className="poster-arc" aria-label="Some of the anime that made us fans">
        {items.map((a, i) => (
          <li key={a.id} className="poster" style={{ "--i": i, "--c": a.coverImage.color ?? "#e63946" } as CSSProperties}>
            <figure className="poster-card">
              <Image
                src={a.coverImage.large}
                alt={displayTitle(a)}
                fill
                sizes="(max-width: 640px) 36vw, 250px"
                className="object-cover"
              />
              <span aria-hidden className="poster-sheen" />
            </figure>
          </li>
        ))}
      </ul>

      {/* the centred poster's title, as a subtitle */}
      <div aria-hidden className="poster-captions pointer-events-none absolute inset-x-4 bottom-[8svh] grid place-items-center text-center">
        {items.map((a, i) => (
          <p key={a.id} className="poster-caption col-start-1 row-start-1" style={{ "--i": i } as CSSProperties}>
            <span>{displayTitle(a)}</span>
          </p>
        ))}
      </div>

      <style href="awf-poster-arc" precedence="default">{`
        .poster-arc-wrap {
          /* 0 → 1 over the middle of the scene, so it rests a moment at each end */
          --q: clamp(0, calc((var(--p, 1) - 0.12) / 0.8), 1);
          --gap: clamp(118px, 26vw, 290px);
          --curve: calc(30px + var(--v, 0) * 46px);
          perspective: 1100px;
          perspective-origin: 50% 45%;
        }
        .poster-arc { position: absolute; inset: 0; list-style: none; margin: 0; padding: 0; transform-style: preserve-3d; }
        .poster {
          /* distance from the centre of the screen, in posters */
          --x: calc(var(--i) - var(--q) * (var(--n) - 1));
          --ax: max(var(--x), calc(var(--x) * -1));
          position: absolute;
          left: 50%;
          top: 57%;
          width: clamp(104px, min(22vw, 25svh), 240px);
          aspect-ratio: 2 / 3;
          margin-left: calc(clamp(104px, min(22vw, 25svh), 240px) / -2);
          transform:
            translate3d(calc(var(--x) * var(--gap)), calc(-50% + var(--ax) * var(--v, 0) * 18px), calc(var(--ax) * var(--ax) * var(--curve)))
            rotateY(calc(var(--x) * (-15deg - var(--v, 0) * 10deg)));
          opacity: clamp(0, calc(4.4 - var(--ax)), 1);
          will-change: transform, opacity;
        }
        .poster-card {
          position: absolute; inset: 0; margin: 0; overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: var(--c);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.9);
        }
        /* glow and dimming are static layers that only fade (opacity), so scrolling never repaints the shadows */
        .poster::before {
          content: ""; position: absolute; inset: -14%; z-index: -1; border-radius: 30%;
          background: radial-gradient(closest-side, var(--c), transparent);
          opacity: calc(clamp(0, calc(1 - var(--ax) * 0.35), 1) * 0.5);
        }
        .poster-card::after {
          content: ""; position: absolute; inset: 0; background: #000; pointer-events: none;
          opacity: calc(min(var(--ax), 3) * 0.15);
        }
        .poster-sheen {
          position: absolute; inset: 0;
          background: linear-gradient(115deg, rgba(255,255,255,0.22), transparent 38%, transparent 70%, rgba(255,150,200,0.18));
          mix-blend-mode: screen;
        }
        .poster-caption {
          --show: clamp(0, calc(1 - max(calc(var(--i) - var(--q) * (var(--n) - 1)), calc((var(--i) - var(--q) * (var(--n) - 1)) * -1)) * 2.4), 1);
          opacity: var(--show);
          transform: translate3d(0, calc((1 - var(--show)) * 8px), 0);
        }
        .poster-caption > span {
          font-weight: 800; color: #fffbe6; font-size: clamp(0.95rem, 2.4vw, 1.25rem);
          background: rgba(0,0,0,0.55); padding: 0.15em 0.6em; border-radius: 0.3em; text-shadow: 0 2px 0 #000;
        }
        .scroll-scene[data-still] .poster-arc-wrap { position: relative; perspective: none; padding: 2rem 1rem 3rem; }
        .scroll-scene[data-still] .poster-arc { position: static; display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
        .scroll-scene[data-still] .poster { position: relative; left: auto; top: auto; margin: 0; transform: none; opacity: 1; width: 120px; }
        .scroll-scene[data-still] .poster-captions { display: none; }
        .scroll-scene[data-still] .poster-card::after { opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          .scroll-scene .poster-arc-wrap { position: relative; perspective: none; padding: 2rem 1rem 3rem; }
          .scroll-scene .poster-arc { position: static; display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
          .scroll-scene .poster { position: relative; left: auto; top: auto; margin: 0; transform: none; opacity: 1; width: 120px; }
          .scroll-scene .poster-captions { display: none; }
          .scroll-scene .poster-card::after { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
