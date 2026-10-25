import type { CSSProperties } from "react";
import s from "./night.module.css";

// A tiny seeded random, so the stars land in the same places on the server
// and in the browser (Math.random() would break prerendering).
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1664525 + 1013904223) % 4294967296;
    return t / 4294967296;
  };
}

const rand = seeded(7);
const STARS = Array.from({ length: 46 }, () => ({
  x: rand() * 100,
  y: rand() * 62,
  size: 1 + rand() * 2.2,
  dur: 2.8 + rand() * 4,
  delay: rand() * 5,
}));

// sky lanterns: left %, size, rise time, start delay, sideways drift
const LANTERNS = [
  { x: 8, w: 12, d: 22, dl: 0, lx: 30 },
  { x: 22, w: 18, d: 26, dl: 7, lx: -24 },
  { x: 74, w: 14, d: 20, dl: 3, lx: 18 },
  { x: 88, w: 20, d: 28, dl: 11, lx: -30 },
  { x: 58, w: 10, d: 24, dl: 15, lx: 22 },
];

// one wave row, drawn twice side by side so it can loop seamlessly
function WaveRow({ fill, top, dur, reverse = false }: { fill: string; top: string; dur: number; reverse?: boolean }) {
  const path = "M0 30 Q 75 10 150 30 T 300 30 T 450 30 T 600 30 V 80 H 0 Z";
  return (
    <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top }}>
      <div
        className={`${s.waves} flex h-full`}
        style={{ "--wd": `${dur}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
      >
        {[0, 1].map((k) => (
          <svg key={k} viewBox="0 0 600 80" preserveAspectRatio="none" className="h-full w-1/2 shrink-0">
            <path d={path} fill={fill} />
          </svg>
        ))}
      </div>
    </div>
  );
}

/**
 * The backdrop for the Captain's Login: a starry night over the harbour, a
 * glowing moon, sky lanterns drifting up and slow layered waves. Purely
 * decorative (aria-hidden), and it never overflows the viewport.
 */
export default function NightHarbour() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${s.sky}`} />

      {STARS.map((st, i) => (
        <span
          key={i}
          className={s.star}
          style={
            {
              left: `${st.x.toFixed(2)}%`,
              top: `${st.y.toFixed(2)}%`,
              width: `${st.size.toFixed(2)}px`,
              height: `${st.size.toFixed(2)}px`,
              "--tw": `${st.dur.toFixed(2)}s`,
              "--td": `${st.delay.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}

      {/* moon + its light on the water */}
      <div className={`${s.moon} absolute right-[8%] top-[9%] h-20 w-20 rounded-full sm:right-[14%] sm:h-28 sm:w-28`} />
      <div className={`${s.moonPath} absolute bottom-0 right-[8%] h-[24%] w-20 sm:right-[14%] sm:w-28`} />

      {LANTERNS.map((l, i) => (
        <span
          key={i}
          className={s.skyLantern}
          style={
            {
              left: `${l.x}%`,
              "--lw": `${l.w}px`,
              "--ld": `${l.d}s`,
              "--ldl": `${l.dl}s`,
              "--lx": `${l.lx}px`,
            } as CSSProperties
          }
        />
      ))}

      {/* layered sea, back to front */}
      <WaveRow fill="rgba(29,44,94,0.55)" top="70%" dur={30} />
      <WaveRow fill="rgba(18,30,66,0.75)" top="78%" dur={22} reverse />
      <WaveRow fill="rgba(14,16,28,0.95)" top="86%" dur={16} />
    </div>
  );
}
