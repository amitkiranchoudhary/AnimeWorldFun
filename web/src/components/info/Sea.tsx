import { useId, type CSSProperties } from "react";

/*
 * Night-sea scenery shared by the 404 and Contact pages:
 * layered rolling waves, a field of twinkling stars, a glowing moon, a little
 * lantern boat and a message bottle. Pure SVG + CSS (transform/opacity only),
 * server-rendered, all aria-hidden. The global reduced-motion rule in
 * globals.css stills every animation; the rule at the bottom also parks them.
 */

/** One wave outline, `width` wide, repeating every `period` px (so sliding by half loops seamlessly). */
function wavePath(amp: number, period: number, width = 2880, height = 140) {
  const base = amp + 4;
  let d = `M0 ${base} Q ${period / 4} ${base - amp} ${period / 2} ${base}`;
  for (let x = period; x <= width; x += period / 2) d += ` T ${x} ${base}`;
  return { crest: d, body: `${d} V ${height} H 0 Z` };
}

const LAYERS = [
  { amp: 9, period: 480, fill: "rgba(31,95,143,0.45)", foam: "rgba(207,232,255,0.22)", s: 34, top: "0%", reverse: true },
  { amp: 13, period: 720, fill: "rgba(13,47,87,0.85)", foam: "rgba(207,232,255,0.3)", s: 22, top: "22%", reverse: false },
  { amp: 11, period: 360, fill: "rgba(6,18,36,0.96)", foam: "rgba(207,232,255,0.38)", s: 15, top: "46%", reverse: true },
];

export function Waves({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`sea-waves pointer-events-none ${className}`}>
      {LAYERS.map((l, i) => {
        const { crest, body } = wavePath(l.amp, l.period);
        return (
          <div key={i} className="sea-layer" style={{ top: l.top, "--bob-d": `${5 + i * 1.3}s`, "--bob-delay": `${-i * 1.7}s` } as CSSProperties}>
            <svg
              viewBox="0 0 2880 140"
              preserveAspectRatio="none"
              className="sea-strip"
              style={{ animationDuration: `${l.s}s`, animationDirection: l.reverse ? "reverse" : "normal" }}
            >
              <path d={body} fill={l.fill} />
              <path d={crest} fill="none" stroke={l.foam} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* the rest of this layer, below its wavy top */}
            <div className="sea-fill" style={{ background: l.fill }} />
          </div>
        );
      })}
      <style href="awf-sea-waves" precedence="default">{`
        .sea-waves { position: absolute; overflow: hidden; }
        .sea-layer {
          position: absolute; left: 0; right: 0; bottom: 0;
          animation: sea-bob var(--bob-d, 6s) ease-in-out var(--bob-delay, 0s) infinite;
        }
        .sea-strip {
          display: block; width: 200%; height: clamp(46px, 7vw, 90px);
          animation: sea-roll 20s linear infinite;
          will-change: transform;
        }
        .sea-fill { position: absolute; left: 0; right: 0; top: calc(clamp(46px, 7vw, 90px) - 1px); bottom: -20px; }
        @keyframes sea-roll { to { transform: translate3d(-50%, 0, 0); } }
        @keyframes sea-bob { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, 7px, 0); } }
        @media (prefers-reduced-motion: reduce) { .sea-layer, .sea-strip { animation: none; } }
      `}</style>
    </div>
  );
}

/** Deterministic star field (no Math.random during server rendering). */
export function Stars({ count = 46, className = "" }: { count?: number; className?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    x: (i * 37.7 + 11) % 100,
    y: (i * 53.3 + 7) % 62,
    r: 1 + ((i * 7) % 3) * 0.6,
    d: 2.4 + ((i * 13) % 5) * 0.7,
    delay: -((i * 1.37) % 5),
  }));
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="sea-star"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, animationDuration: `${s.d}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
      <style href="awf-sea-stars" precedence="default">{`
        .sea-star {
          position: absolute; border-radius: 9999px; background: #fff7e0;
          box-shadow: 0 0 6px rgba(255,240,200,0.8);
          animation: sea-twinkle 3s ease-in-out infinite;
        }
        @keyframes sea-twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .sea-star { animation: none; opacity: 0.6; } }
      `}</style>
    </div>
  );
}

/** A soft glowing moon with a halo. */
export function Moon({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <div className="sea-moon-halo absolute -inset-[120%] rounded-full" />
      <div className="sea-moon relative h-full w-full rounded-full" />
      <style href="awf-sea-moon" precedence="default">{`
        .sea-moon {
          background: radial-gradient(circle at 38% 36%, #fffdf2, #f6e7c8 45%, #d9c193 100%);
          box-shadow: 0 0 40px rgba(255,236,190,0.55), 0 0 120px rgba(255,200,230,0.25);
        }
        .sea-moon::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background:
            radial-gradient(circle at 62% 58%, rgba(170,140,100,0.35) 0 9%, transparent 10%),
            radial-gradient(circle at 34% 64%, rgba(170,140,100,0.25) 0 6%, transparent 7%),
            radial-gradient(circle at 58% 30%, rgba(170,140,100,0.2) 0 5%, transparent 6%);
        }
        .sea-moon-halo {
          background: radial-gradient(circle, rgba(255,214,235,0.22), rgba(255,150,200,0.06) 40%, transparent 65%);
          animation: glow-pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/** A little sailboat with the Captain's hat on its sail and a glowing lantern at the bow, bobbing on the swell. */
export function LanternBoat({ className = "" }: { className?: string }) {
  const glow = `awf-lantern-${useId()}`;
  return (
    <div aria-hidden className={`sea-boat pointer-events-none ${className}`}>
      {/* lantern light spilling on the water */}
      <div className="sea-boat-reflection" />
      <svg viewBox="0 0 140 120" className="relative h-auto w-full overflow-visible">
        <defs>
          <radialGradient id={glow}>
            <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#f2c94c" stopOpacity="0.45" />
            <stop offset="1" stopColor="#f2c94c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* mast + flag */}
        <line x1="72" y1="14" x2="72" y2="84" stroke="#3b2416" strokeWidth="3" strokeLinecap="round" />
        <path d="M73 14 L92 19 L73 24 Z" fill="#e63946" className="sea-flag" />
        {/* sails */}
        <path d="M75 26 Q100 50 104 80 L75 80 Z" fill="#f6e7c8" stroke="#1b1410" strokeWidth="2" strokeLinejoin="round" />
        <path d="M69 32 Q50 56 44 80 L69 80 Z" fill="#e9d6ad" stroke="#1b1410" strokeWidth="2" strokeLinejoin="round" />
        {/* the Captain's dark wide-brimmed hat on the big sail */}
        <path d="M76.5 62.5 Q88 58.5 99.5 62.5 Q88 66 76.5 62.5 Z" fill="#3b3634" stroke="#1b1410" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M82 61.5 Q82.5 52.5 88 52 Q93.5 52.5 94 61.5 Z" fill="#45403d" stroke="#1b1410" strokeWidth="1.5" />
        <path d="M82.2 59 Q88 60.4 93.8 59 L93.9 61.2 Q88 62.6 82.1 61.2 Z" fill="#7a5233" />
        {/* hull */}
        <path d="M24 82 L120 82 Q114 98 100 102 L42 102 Q30 96 24 82 Z" fill="#5a3520" stroke="#1b1410" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M30 89 L116 89" stroke="#3b2416" strokeWidth="2" />
        {/* lantern on a little pole at the bow */}
        <path d="M30 82 L30 60 L22 60" fill="none" stroke="#3b2416" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="70" r="22" fill={`url(#${glow})`} className="sea-lantern-glow" />
        <line x1="22" y1="60" x2="22" y2="63" stroke="#1b1410" strokeWidth="1.5" />
        <rect x="17" y="63" width="10" height="13" rx="3" fill="#ffd36b" stroke="#1b1410" strokeWidth="1.5" />
        <rect x="17" y="63" width="10" height="2.5" fill="#e63946" />
        <rect x="17" y="73.5" width="10" height="2.5" fill="#e63946" />
      </svg>
      <style href="awf-sea-boat" precedence="default">{`
        .sea-boat { position: absolute; animation: sea-boat-bob 5.2s ease-in-out infinite; transform-origin: 50% 85%; }
        .sea-boat-reflection {
          position: absolute; left: -2%; right: 40%; top: 86%; height: 26%;
          background: radial-gradient(50% 50% at 30% 50%, rgba(242,201,76,0.45), transparent 70%);
          filter: blur(6px);
          animation: glow-pulse 2.6s ease-in-out infinite;
        }
        .sea-lantern-glow { animation: sea-flicker 2.2s ease-in-out infinite; transform-origin: 22px 70px; }
        .sea-flag { animation: sea-flag 1.6s ease-in-out infinite; transform-origin: 73px 19px; }
        @keyframes sea-boat-bob {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-3deg); }
          50% { transform: translate3d(0, -9px, 0) rotate(3.5deg); }
        }
        @keyframes sea-flicker { 0%, 100% { opacity: 0.75; transform: scale(0.95); } 45% { opacity: 1; transform: scale(1.06); } 60% { opacity: 0.85; } }
        @keyframes sea-flag { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.8) skewY(4deg); } }
        @media (prefers-reduced-motion: reduce) { .sea-boat, .sea-boat-reflection, .sea-lantern-glow, .sea-flag { animation: none; } }
      `}</style>
    </div>
  );
}

/** A corked glass bottle with a rolled message inside. Bobbing is up to the caller (className). */
export function Bottle({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const glass = `awf-bottle-${useId()}`;
  return (
    <svg aria-hidden viewBox="0 0 160 70" className={className} style={style}>
      <defs>
        <linearGradient id={glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe6ff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#7fc4e8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2f7fb0" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {/* body + neck */}
      <path
        d="M14 22 Q14 10 30 10 L100 10 Q112 10 118 20 L128 26 L142 26 L142 44 L128 44 L118 50 Q112 60 100 60 L30 60 Q14 60 14 48 Z"
        fill={`url(#${glass})`}
        stroke="rgba(207,232,255,0.85)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* cork */}
      <rect x="140" y="24" width="14" height="22" rx="3" fill="#b07a45" stroke="#1b1410" strokeWidth="2" />
      <path d="M144 28 L144 42 M149 28 L149 42" stroke="#8a5a2e" strokeWidth="1.5" />
      {/* rolled message */}
      <rect x="32" y="22" width="64" height="26" rx="13" fill="#f6e7c8" stroke="#d9c193" strokeWidth="2" />
      <path d="M44 24 L44 46 M84 24 L84 46" stroke="#d9c193" strokeWidth="1.5" />
      <rect x="61" y="21" width="7" height="28" rx="2" fill="#e63946" />
      {/* glass highlights */}
      <path d="M26 17 Q60 14 98 16" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M30 54 Q50 56 64 55" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A few glowing sakura petals drifting across a scene (deterministic, CSS only). */
export function DriftPetals({ count = 9, className = "" }: { count?: number; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="sea-petal"
          style={
            {
              left: `${(i * 23 + 5) % 100}%`,
              "--petal-s": `${0.7 + ((i * 5) % 4) * 0.2}`,
              animationDuration: `${11 + ((i * 7) % 6) * 1.6}s`,
              animationDelay: `${-((i * 2.9) % 14)}s`,
            } as CSSProperties
          }
        />
      ))}
      <style href="awf-sea-petals" precedence="default">{`
        .sea-petal {
          position: absolute; top: -6%; width: 14px; height: 10px;
          background: linear-gradient(135deg, #ffd6e6, #ff8fbf);
          border-radius: 80% 0 80% 0;
          box-shadow: 0 0 12px rgba(255,150,200,0.7);
          opacity: 0.85;
          animation: sea-petal-fall 14s linear infinite;
        }
        @keyframes sea-petal-fall {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(var(--petal-s, 1)); opacity: 0; }
          10% { opacity: 0.9; }
          50% { transform: translate3d(-12vw, 55svh, 0) rotate(220deg) scale(var(--petal-s, 1)); }
          90% { opacity: 0.8; }
          100% { transform: translate3d(-4vw, 112svh, 0) rotate(420deg) scale(var(--petal-s, 1)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .sea-petal { display: none; } }
      `}</style>
    </div>
  );
}
