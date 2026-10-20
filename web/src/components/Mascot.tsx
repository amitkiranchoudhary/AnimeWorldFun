import StrawHat from "./StrawHat";

// "Otto" — the site's original mascot: a sea-otter deckhand in a straw hat,
// peering through a spyglass for the next anime to watch.
export default function Mascot({ className }: { className?: string }) {
  const outline = { stroke: "#1b1410", strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <div className={`relative ${className ?? ""}`} style={{ animation: "float 5s ease-in-out infinite" }}>
      <svg viewBox="0 0 260 300" className="h-full w-full overflow-visible" role="img" aria-label="Otto the otter, the Anime World Fun mascot">
        {/* tail */}
        <path d="M70 250 C 20 260, 10 220, 30 200 C 40 230, 60 236, 86 232 Z" fill="#7a4a2a" {...outline} />

        {/* body */}
        <path d="M70 160 C 60 230, 80 280, 130 282 C 180 280, 200 230, 190 160 Z" fill="#8b5a34" {...outline} />
        <path d="M95 180 C 92 230, 105 266, 130 268 C 155 266, 168 230, 165 180 Z" fill="#e8c9a0" />

        {/* red sash/scarf */}
        <path d="M74 158 C 100 176, 160 176, 186 158 L 190 176 C 160 194, 100 194, 70 176 Z" fill="#e63946" {...outline} />
        <path d="M172 178 L 196 214 L 178 212 L 170 226 L 160 186 Z" fill="#e63946" {...outline} />

        {/* feet */}
        <ellipse cx="102" cy="284" rx="22" ry="11" fill="#6a3f22" {...outline} />
        <ellipse cx="158" cy="284" rx="22" ry="11" fill="#6a3f22" {...outline} />

        {/* head */}
        <circle cx="72" cy="78" r="16" fill="#7a4a2a" {...outline} />
        <circle cx="188" cy="78" r="16" fill="#7a4a2a" {...outline} />
        <ellipse cx="130" cy="110" rx="70" ry="62" fill="#8b5a34" {...outline} />
        <ellipse cx="130" cy="132" rx="46" ry="34" fill="#f1dcbc" />

        {/* eyes: one open, one squinting into the spyglass */}
        <ellipse cx="102" cy="104" rx="12" ry="15" fill="#1b1410" />
        <circle cx="106" cy="98" r="5" fill="#fff" />
        <circle cx="99" cy="110" r="2.4" fill="#fff" />
        <path d="M148 104 Q 158 96 168 104" stroke="#1b1410" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* blush */}
        <ellipse cx="86" cy="128" rx="10" ry="5" fill="#ff8a8a" opacity="0.6" />
        <ellipse cx="174" cy="128" rx="10" ry="5" fill="#ff8a8a" opacity="0.6" />

        {/* nose, mouth, whiskers */}
        <path d="M120 118 Q 130 112 140 118 Q 130 130 120 118 Z" fill="#1b1410" />
        <path d="M116 136 Q 123 146 130 136 Q 137 146 144 136" stroke="#1b1410" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M128 141 Q 130 152 136 144" fill="#e63946" />
        <path d="M92 132 L 62 126 M92 140 L 64 142 M168 132 L 198 126 M168 140 L 196 142" stroke="#1b1410" strokeWidth="2" strokeLinecap="round" />

        {/* spyglass held to the right eye */}
        <g transform="rotate(-18 200 100)">
          <rect x="166" y="92" width="34" height="22" rx="4" fill="#b07a3c" {...outline} />
          <rect x="196" y="88" width="44" height="30" rx="5" fill="#c99a52" {...outline} />
          <rect x="236" y="84" width="14" height="38" rx="4" fill="#f2c94c" {...outline} />
          <circle cx="250" cy="103" r="9" fill="#7fd3ff" opacity="0.7" />
        </g>
        {/* paws */}
        <ellipse cx="178" cy="148" rx="16" ry="13" fill="#7a4a2a" {...outline} />
        <ellipse cx="88" cy="196" rx="16" ry="14" fill="#7a4a2a" {...outline} />
      </svg>

      {/* hat sits on top as its own drawing */}
      <StrawHat width={190} className="absolute left-[13%] top-[0%] w-[72%] rotate-[-8deg]" />
    </div>
  );
}
