"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./detail.module.css";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * A film-chapter moment: the story's opening line is pinned full-screen and
 * lights up word by word as you scroll through it. It repeats the synopsis,
 * so it's hidden from screen readers. With "reduce motion" it's a plain,
 * fully lit quote.
 */
export default function Logline({ text, credit }: { text: string; credit?: string | null }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.static = "";
      return () => {
        delete el.dataset.static;
      };
    }
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    const last = spans.map(() => -1);
    el.dataset.live = "";
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return; // far away: nothing to do
      // 0 when the scene pins, 1 just before it lets go
      const p = clamp01(-r.top / Math.max(1, r.height - vh));
      const q = clamp01((p - 0.04) / 0.78) * (spans.length + 1);
      el.style.setProperty("--p", p.toFixed(3));
      spans.forEach((w, i) => {
        const lit = clamp01(q - i);
        if (Math.abs(lit - last[i]) > 0.01) {
          last[i] = lit;
          w.style.setProperty("--lit", lit.toFixed(3));
        }
      });
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
      delete el.dataset.live;
    };
  }, []);

  return (
    <section ref={ref} className={s.logline} aria-hidden>
      <div className={s.loglinePin}>
        {/* the anime's colour glowing behind the line */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--anime) 45%, transparent), transparent)" }}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 font-display text-sm tracking-[0.6em] text-white/25 [writing-mode:vertical-rl] sm:block">
          LOGLINE
        </span>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-10">
          <p className="mb-6 text-[11px] font-extrabold uppercase tracking-[0.45em] text-sash">In one line</p>
          <p className="font-display text-[clamp(1.9rem,6.4vw,5.6rem)] leading-[1.02] tracking-wide text-text">
            {words.map((w, i) => (
              <span key={i}>
                <span data-w className={s.word}>
                  {w}
                </span>{" "}
              </span>
            ))}
          </p>
          {credit && (
            <p className="mt-8 text-sm">
              <span className={s.subtitle}>— {credit}</span>
            </p>
          )}
          <div className="mx-auto mt-10 h-px w-40 overflow-hidden bg-white/10">
            <div className={`${s.loglineBar} h-full bg-gradient-to-r from-sash via-[#ff8fc0] to-straw`} />
          </div>
        </div>
      </div>
    </section>
  );
}
