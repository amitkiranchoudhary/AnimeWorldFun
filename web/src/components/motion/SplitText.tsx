"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { watch } from "@/lib/motion/inView";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

/**
 * A heading that reveals word by word (or letter by letter) as it scrolls into
 * view: each piece slides up from behind an invisible mask with a stagger,
 * like anime title cards. Screen readers get the plain text via aria-label.
 * Styles live in globals.css (.split / .split-piece).
 */
export default function SplitText({
  text,
  as = "h2",
  by = "word",
  stagger = 45,
  delay = 0,
  className = "",
  style,
}: {
  text: string;
  as?: Tag;
  by?: "word" | "char";
  /** ms between pieces */
  stagger?: number;
  /** ms before the first piece */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watch(el, () => el.setAttribute("data-shown", ""));
  }, []);

  const words = text.split(/(\s+)/);
  let i = 0;
  const pieces = words.map((w, wi) => {
    if (/^\s+$/.test(w)) return <Fragment key={wi}> </Fragment>;
    if (by === "word") {
      const idx = i++;
      return (
        <span key={wi} className="split-mask" aria-hidden>
          <span className="split-piece" style={{ "--i": idx } as CSSProperties}>
            {w}
          </span>
        </span>
      );
    }
    // letters stay grouped per word so lines only break between words
    return (
      <span key={wi} className="split-word" aria-hidden>
        {[...w].map((ch, ci) => {
          const idx = i++;
          return (
            <span key={ci} className="split-mask">
              <span className="split-piece" style={{ "--i": idx } as CSSProperties}>
                {ch}
              </span>
            </span>
          );
        })}
      </span>
    );
  });

  const El = as as ElementType;
  return (
    <El
      ref={ref}
      aria-label={text}
      className={`split ${className}`}
      style={{ "--split-stagger": `${stagger}ms`, "--split-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {pieces}
    </El>
  );
}
