// Fixed, full-screen "Grand Line at dusk" scene: starry sky, sunset glow,
// drifting clouds, a little ship on the horizon and layered rolling waves.
// Pure SVG + CSS so it renders on the server and costs no JS.

// Deterministic star field (no Math.random, so server and client match)
const STARS = Array.from({ length: 70 }, (_, i) => {
  const x = (i * 137.508) % 100;
  const y = ((i * 61.803) % 55) + 1;
  const r = (i % 3) * 0.35 + 0.6;
  const delay = (i % 7) * 0.6;
  return { x, y, r, delay };
});

const CLOUDS = [
  { top: "12%", scale: 1, duration: 140, delay: -20, opacity: 0.18 },
  { top: "24%", scale: 0.7, duration: 110, delay: -70, opacity: 0.14 },
  { top: "36%", scale: 1.3, duration: 180, delay: -120, opacity: 0.12 },
];

function Wave({ color, height, duration, offset, opacity = 1 }: {
  color: string;
  height: number;
  duration: number;
  offset: number;
  opacity?: number;
}) {
  // One path tile repeated twice; translating by -50% loops seamlessly
  const tile = "M0 40 Q 75 10 150 40 T 300 40 T 450 40 T 600 40 V 120 H 0 Z";
  return (
    <div
      className="absolute inset-x-0 overflow-hidden"
      style={{ bottom: offset, height, opacity }}
    >
      <svg
        className="absolute bottom-0 left-0 h-full"
        style={{ width: "200%", animation: `wave-drift ${duration}s linear infinite` }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={tile} fill={color} />
        <path d={tile} fill={color} transform="translate(600 0)" />
      </svg>
    </div>
  );
}

function Ship() {
  return (
    <svg viewBox="0 0 120 100" width="84" height="70" aria-hidden>
      {/* mast + sails */}
      <rect x="58" y="8" width="3" height="62" fill="#20140c" />
      <path d="M61 14 Q 92 30 61 52 Z" fill="#f6e7c8" />
      <path d="M58 18 Q 30 34 58 54 Z" fill="#e8d4a8" />
      {/* flag: red pennant with a tiny straw hat */}
      <path d="M61 8 L 82 12 L 61 17 Z" fill="#e63946" />
      <ellipse cx="68" cy="12.5" rx="3.4" ry="1.1" fill="#f2c94c" />
      <ellipse cx="68" cy="11.6" rx="1.8" ry="1.3" fill="#f2c94c" />
      {/* hull */}
      <path d="M18 68 H 104 L 92 88 H 30 Z" fill="#3a2214" />
      <path d="M18 68 H 104 L 101 73 H 21 Z" fill="#5b3620" />
      <circle cx="42" cy="78" r="2.4" fill="#f2c94c" />
      <circle cx="60" cy="78" r="2.4" fill="#f2c94c" />
      <circle cx="78" cy="78" r="2.4" fill="#f2c94c" />
      {/* figurehead */}
      <circle cx="108" cy="64" r="6" fill="#f2c94c" />
    </svg>
  );
}

export default function OceanBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 38%, #6a3f6e 54%, var(--sky-low) 64%, #f4a259 68%, var(--sea) 68.2%, var(--sea-deep) 100%)",
        }}
      />

      {/* stars */}
      <svg className="absolute inset-0 h-full w-full">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#fff"
            style={{ animation: `twinkle ${3 + (i % 4)}s ease-in-out ${s.delay}s infinite` }}
          />
        ))}
      </svg>

      {/* setting sun */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: "56%",
          width: "min(34vw, 340px)",
          aspectRatio: "1",
          background: "radial-gradient(circle, #ffe08a 0%, #ffb35c 45%, rgba(255,140,80,0) 70%)",
          filter: "blur(1px)",
        }}
      />

      {/* clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: c.top,
            opacity: c.opacity,
            animation: `cloud-drift ${c.duration}s linear ${c.delay}s infinite`,
          }}
        >
          <svg width={260 * c.scale} height={80 * c.scale} viewBox="0 0 260 80">
            <path
              d="M20 70 Q 0 70 6 52 Q 12 34 38 40 Q 46 10 84 18 Q 110 0 138 22 Q 170 8 190 34 Q 236 26 244 54 Q 258 72 230 72 Z"
              fill="#fff"
            />
          </svg>
        </div>
      ))}

      {/* ship on the horizon */}
      <div
        className="absolute"
        style={{ top: "calc(68% - 62px)", animation: "ship-sail 120s linear -40s infinite" }}
      >
        <div style={{ animation: "ship-bob 4s ease-in-out infinite" }}>
          <Ship />
        </div>
      </div>

      {/* sun glitter on the water */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "68.2%",
          width: "min(40vw, 420px)",
          height: "18%",
          background:
            "repeating-linear-gradient(180deg, rgba(255,214,140,0.35) 0 2px, transparent 2px 9px)",
          maskImage: "radial-gradient(ellipse at top, #000 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at top, #000 0%, transparent 70%)",
        }}
      />

      {/* waves, back to front */}
      <Wave color="#14406e" height={90} duration={38} offset={70} opacity={0.7} />
      <Wave color="#0f3360" height={100} duration={26} offset={35} opacity={0.85} />
      <Wave color="#0a2547" height={110} duration={18} offset={0} />

      {/* soft vignette so foreground text stays readable */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,8,20,0.55) 100%)" }}
      />
    </div>
  );
}
