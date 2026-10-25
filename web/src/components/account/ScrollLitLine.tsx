"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./logbook.module.css";

/**
 * A film-chapter moment: one big line pinned to the screen while its words
 * light up one by one as you scroll through the section. Words listed in
 * `gold` glow gold instead of pink. "Reduce motion" shows the line fully lit
 * and unpinned.
 */
export default function ScrollLitLine({
  text,
  gold = [],
  eyebrow,
}: {
  text: string;
  gold?: string[];
  eyebrow?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const words = text.split(/\s+/);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const pieces = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    if (prefersReducedMotion()) {
      el.dataset.still = "";
      pieces.forEach((p) => p.setAttribute("data-lit", ""));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      // finish lighting a little before the end so the full line can be read
      const lit = Math.round(Math.min(1, p * 1.25) * pieces.length);
      pieces.forEach((w, i) => w.toggleAttribute("data-lit", i < lit));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goldSet = new Set(gold.map((g) => g.toLowerCase()));

  return (
    <div ref={outer} className={`relative h-[170vh] sm:h-[220vh] ${s.litOuter}`}>
      <div className={`sticky top-0 flex h-[100svh] flex-col items-center justify-center px-4 text-center sm:px-6 ${s.litSticky}`}>
        {eyebrow && (
          <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.4em] text-sash">{eyebrow}</p>
        )}
        <p className="mx-auto max-w-5xl font-display text-[2.6rem] leading-[1.02] tracking-wide text-text sm:text-7xl lg:text-8xl">
          {words.map((w, i) => {
            const isGold = goldSet.has(w.replace(/[^\w']/g, "").toLowerCase());
            return (
              <span key={i}>
                <span data-word className={`${s.litWord} ${isGold ? s.litWordGold : ""}`}>
                  {w}
                </span>{" "}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
