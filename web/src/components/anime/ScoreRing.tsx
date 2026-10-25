"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, watch } from "@/lib/motion/inView";
import s from "./detail.module.css";

const R = 34;
const C = 2 * Math.PI * R;

/**
 * The average score (0–100) as a glowing ring that fills while the number
 * counts up, once it scrolls into view. Server-rendered with the final value,
 * so it reads correctly before (or without) JavaScript.
 */
export default function ScoreRing({ score }: { score: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const final = (score / 10).toFixed(1);
  const filled = C * (1 - score / 100);

  useEffect(() => {
    const el = ref.current;
    const num = numRef.current;
    const arc = arcRef.current;
    if (!el || !num || !arc || prefersReducedMotion()) return;
    let raf = 0;
    // start empty (without animating the emptying), then fill once seen
    arc.style.transition = "none";
    arc.style.strokeDashoffset = String(C);
    arc.getBoundingClientRect();
    arc.style.transition = "";
    num.textContent = "0.0";
    const stop = watch(el, () => {
      arc.style.strokeDashoffset = String(filled);
      const start = performance.now() + 350;
      const step = (t: number) => {
        const k = Math.min(1, Math.max(0, (t - start) / 1800));
        const eased = 1 - Math.pow(1 - k, 4);
        num.textContent = ((score * eased) / 10).toFixed(1);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      arc.style.strokeDashoffset = "";
      num.textContent = final;
    };
  }, [score, filled, final]);

  return (
    <div ref={ref} role="img" aria-label={`Average score ${final} out of 10`} className="relative size-[84px] shrink-0">
      <svg viewBox="0 0 84 84" className="size-full -rotate-90 drop-shadow-[0_0_12px_rgba(242,201,76,0.55)]" aria-hidden>
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--straw)" />
            <stop offset="100%" stopColor="#ff8fc0" />
          </linearGradient>
        </defs>
        <circle cx="42" cy="42" r={R} fill="rgba(10,10,14,0.65)" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          ref={arcRef}
          className={s.ringArc}
          cx="42"
          cy="42"
          r={R}
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={filled}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
        <div>
          <span ref={numRef} className="block font-display text-[1.7rem] leading-none tracking-wide text-straw">
            {final}
          </span>
          <span className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted">score</span>
        </div>
      </div>
    </div>
  );
}
