"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./logbook.module.css";

/**
 * A row of posters standing on a gently curved shelf. The curve deepens as the
 * shelf enters or leaves the screen and relaxes to face you in the middle,
 * so the row seems to bend with the scroll. Writes one CSS variable (--bend)
 * per frame, only while on screen; flat for "reduce motion".
 */
export default function CurvedShelf({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    let frame = 0;
    let active = false;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (below the fold) … 0 (centred) … 1 (scrolled past)
      const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      el.style.setProperty("--bend", Math.min(1, Math.abs(t) * 1.4).toFixed(3));
    };
    const onScroll = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (active) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ul ref={ref} className={`${s.shelf} ${className}`}>
      {children}
    </ul>
  );
}
