"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { watch } from "@/lib/motion/inView";

type Tag = "div" | "section" | "article" | "header" | "footer" | "aside" | "li" | "ul" | "p" | "span" | "h1" | "h2" | "h3" | "figure";

/**
 * Fades its content in as it scrolls into view: rising a little and coming
 * into focus (from a soft blur). Stagger groups with `delay` (ms).
 * Styles live in globals.css (.reveal); with "reduce motion" it just appears.
 */
export default function Reveal({
  as = "div",
  delay = 0,
  y = 26,
  blur = 8,
  scale = 1,
  className = "",
  style,
  children,
}: {
  as?: Tag;
  delay?: number;
  /** how far it rises, px */
  y?: number;
  /** starting blur, px */
  blur?: number;
  /** starting scale, e.g. 0.96 */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watch(el, () => el.setAttribute("data-shown", ""));
  }, []);

  const El = as as ElementType;
  return (
    <El
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--rv-delay": `${delay}ms`, "--rv-y": `${y}px`, "--rv-blur": `${blur}px`, "--rv-scale": scale, ...style } as CSSProperties}
    >
      {children}
    </El>
  );
}
