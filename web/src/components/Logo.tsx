import StrawHat from "./StrawHat";

// Ship's wheel used as the "o" in "World" (a nod to the old logo's chakra)
function Wheel({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-[-0.12em]" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 20 20)`}>
          <line x1="20" y1="20" x2="20" y2="1.5" stroke="#1b1410" strokeWidth="5" strokeLinecap="round" />
          <line x1="20" y1="20" x2="20" y2="1.5" stroke="#8a5a2b" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="20" cy="20" r="12" fill="none" stroke="#1b1410" strokeWidth="6" />
      <circle cx="20" cy="20" r="12" fill="none" stroke="#b07a3c" strokeWidth="3.4" />
      <circle cx="20" cy="20" r="4.5" fill="#f2c94c" stroke="#1b1410" strokeWidth="2" />
    </svg>
  );
}

/** Compact wordmark for the navbar. */
export function LogoMark() {
  return (
    <span className="relative inline-flex items-end gap-1.5 font-display leading-none">
      <StrawHat width={34} className="-mb-0.5 -rotate-12" />
      <span className="text-2xl tracking-wide text-straw [text-shadow:2px_2px_0_var(--ink)]">Anime</span>
      <span className="text-2xl tracking-wide text-foam [text-shadow:2px_2px_0_var(--ink)]">
        W<Wheel size={18} />rld
      </span>
      <span className="text-2xl tracking-wide text-sash [text-shadow:2px_2px_0_var(--ink)]">Fun</span>
    </span>
  );
}

/** Big stacked logo for the hero. */
export function LogoHero() {
  return (
    <div className="relative inline-block select-none font-display leading-[0.85]" aria-label="Anime World Fun">
      <StrawHat width={150} className="absolute -left-10 -top-14 -rotate-[18deg] drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)] sm:-left-14 sm:-top-16" />
      <div className="title-stroke text-[clamp(4rem,11vw,8rem)]">Anime</div>
      <div className="flex items-center gap-3 pl-[0.4em]">
        <span className="title-stroke text-[clamp(3rem,8vw,5.75rem)]" style={{ color: "var(--foam)" }}>
          W<Wheel size={64} />rld
        </span>
        <span className="title-stroke text-[clamp(3rem,8vw,5.75rem)]" style={{ color: "var(--sash)" }}>
          Fun
        </span>
      </div>
    </div>
  );
}
