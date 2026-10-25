"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";

/**
 * A film "chapter": a tall section whose stage stays pinned to the screen
 * while you scroll through it. It writes its progress (0 → 1) to the CSS
 * variable --p, and a softened scroll speed (0 → 1) to --v, so children can
 * animate purely in CSS (see ScrubLine, Subtitles, PosterArc).
 * One passive scroll listener, rAF-throttled; with "reduce motion" the
 * section collapses to a normal, fully revealed block (--p: 1).
 */
export default function ScrollScene({
  children,
  length = 240,
  className = "",
  stageClassName = "",
  id,
  label,
  style,
}: {
  children: ReactNode;
  /** total height in viewport heights (100 = no pinning) */
  length?: number;
  className?: string;
  stageClassName?: string;
  id?: string;
  /** accessible name for the chapter */
  label?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.still = "";
      el.style.setProperty("--p", "1");
      return;
    }

    let frame = 0;
    let lastY = window.scrollY;
    let v = 0;
    let active = false;
    // last values written, so unchanged frames cost no style recalc
    let lastP = "";
    let lastV = "";
    const write = (p: string, vs: string) => {
      if (p !== lastP) el.style.setProperty("--p", (lastP = p));
      if (vs !== lastV) el.style.setProperty("--v", (lastV = vs));
    };

    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 1;
      // scroll speed, eased so it swells and settles instead of flickering
      const y = window.scrollY;
      const target = Math.min(1, Math.abs(y - lastY) / 70);
      lastY = y;
      v += (target - v) * 0.18;
      if (v < 0.002) v = 0;
      write(p.toFixed(4), v.toFixed(3));
      // keep easing --v back to rest after the scrolling stops
      if (v > 0 && active) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // only listen while the scene is near the screen
    const start = () => {
      if (active) return;
      active = true;
      lastY = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    };
    const stop = () => {
      if (!active) return;
      active = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      frame = 0;
      v = 0;
      // park it finished (above the screen) or unplayed (below)
      write(el.getBoundingClientRect().top > 0 ? "0.0000" : "1.0000", "0.000");
    };

    tick();
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") start();
    else {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "100% 0px" });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      stop();
    };
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={`scroll-scene relative ${className}`}
      style={{ "--p": 0, "--v": 0, height: `${length}svh`, ...style } as CSSProperties}
    >
      <div className={`scroll-scene-stage sticky top-0 h-[100svh] overflow-hidden ${stageClassName}`}>{children}</div>
      <style href="awf-scroll-scene" precedence="default">{`
        .scroll-scene[data-still] { height: auto !important; }
        .scroll-scene[data-still] > .scroll-scene-stage { position: relative; height: auto; min-height: 100svh; }
        /* collapse before hydration too, so reduced-motion visitors get no layout jump */
        @media (prefers-reduced-motion: reduce) {
          .scroll-scene { height: auto !important; --p: 1 !important; --v: 0 !important; }
          .scroll-scene > .scroll-scene-stage { position: relative; height: auto; min-height: 100svh; }
        }
      `}</style>
    </section>
  );
}
