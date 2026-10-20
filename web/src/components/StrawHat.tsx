// Original straw hat drawing (side view), reused by the logo, mascot and icon.
export default function StrawHat({ className, width = 120 }: { className?: string; width?: number }) {
  return (
    <svg className={className} viewBox="0 0 120 56" width={width} height={(width * 56) / 120} aria-hidden>
      {/* brim */}
      <ellipse cx="60" cy="42" rx="58" ry="12" fill="#e9b941" stroke="#1b1410" strokeWidth="3" />
      <ellipse cx="60" cy="40" rx="50" ry="8" fill="#f6d264" />
      {/* crown */}
      <path d="M30 40 C 30 8, 90 8, 90 40 Z" fill="#f2c94c" stroke="#1b1410" strokeWidth="3" strokeLinejoin="round" />
      {/* red band */}
      <path d="M31 33 C 45 38, 75 38, 89 33 L 90 40 C 75 45, 45 45, 30 40 Z" fill="#e63946" stroke="#1b1410" strokeWidth="2.5" strokeLinejoin="round" />
      {/* weave texture */}
      <path d="M40 22 C 50 18, 70 18, 80 22 M36 28 C 50 24, 70 24, 84 28" stroke="#c9962a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M14 46 Q 30 52 46 50 M74 50 Q 90 52 106 46" stroke="#c9962a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* shine */}
      <path d="M44 16 C 50 12, 58 11, 64 12" stroke="#fff6cf" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
