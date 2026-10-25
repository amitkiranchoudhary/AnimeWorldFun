import type { CSSProperties, ReactNode } from "react";
import s from "./logbook.module.css";

/**
 * A circular progress ring (SVG). It starts empty and fills when a <Reveal>
 * ancestor scrolls into view; with `live` it follows `value` immediately
 * (used by the animated demo). Decorative: pass the real numbers as text.
 */
export default function ProgressRing({
  value,
  size = 64,
  stroke = 5,
  color = "var(--straw)",
  delay = 0,
  live = false,
  className = "",
  children,
}: {
  /** 0 … 1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  /** ms before it starts filling */
  delay?: number;
  live?: boolean;
  className?: string;
  /** centred label, e.g. "7/12" */
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      className={`relative inline-grid place-items-center ${live ? s.ringLive : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`absolute inset-0 ${s.ring}`}>
        <circle className={s.ringTrack} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className={s.ringArc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={color}
          style={
            {
              color,
              "--c": `${c.toFixed(2)}px`,
              "--p": Math.max(0, Math.min(1, value)).toFixed(3),
              "--ring-delay": `${delay}ms`,
            } as CSSProperties
          }
        />
      </svg>
      {children != null && <span className="relative text-center leading-none">{children}</span>}
    </span>
  );
}
