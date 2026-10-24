import type { CSSProperties, ReactNode } from "react";

/**
 * An endless horizontal ticker (titles, genres, credits). The content is shown
 * twice and slid by half its width, so the loop is seamless. Pauses on hover;
 * with "reduce motion" it stays still. Styles live in globals.css (.marquee).
 */
export default function Marquee({
  children,
  seconds = 40,
  reverse = false,
  className = "",
  label,
}: {
  children: ReactNode;
  /** time for one full loop */
  seconds?: number;
  reverse?: boolean;
  className?: string;
  /** accessible name for the ticker, e.g. "Trending titles" */
  label?: string;
}) {
  return (
    <div className={`marquee ${className}`} role={label ? "marquee" : undefined} aria-label={label}>
      <div
        className="marquee-track"
        style={{ "--marquee-s": `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
      >
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
