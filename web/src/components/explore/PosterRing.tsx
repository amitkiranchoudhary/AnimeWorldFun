"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion/inView";
import s from "./explore.module.css";

type RingPoster = { id: number; src: string; color: string | null };

/**
 * A curved wall of anime posters on the inside of a slowly turning cylinder
 * (pure CSS 3D). It drifts on its own, spins faster as you scroll, sinks a
 * little for depth and leans toward the mouse. Decorative only.
 * "Reduce motion" keeps it still; the loop only runs while it's on screen.
 */
export default function PosterRing({ posters }: { posters: RingPoster[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const st = stage.current;
    const r = ring.current;
    if (!w || !st || !r || prefersReducedMotion()) return;

    let frame = 0;
    let visible = false;
    let last = 0;
    let drift = 0; // degrees turned by the idle drift
    let lean = 0; // current mouse lean (smoothed)
    let leanTarget = 0;

    const loop = (t: number) => {
      frame = 0;
      if (!visible) return;
      const dt = Math.min(64, t - (last || t));
      last = t;
      drift += dt * 0.006; // ~6°/s idle turn
      lean += (leanTarget - lean) * 0.06;
      const y = window.scrollY;
      r.style.transform = `rotateX(${(-5 + lean).toFixed(2)}deg) rotateY(${(-(drift + y * 0.11)).toFixed(2)}deg)`;
      st.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    });
    io.observe(w);

    // lean the wall toward the mouse (no hover on touch screens)
    const onMove = (e: PointerEvent) => {
      leanTarget = (e.clientY / window.innerHeight - 0.5) * -6;
    };
    const fine = hasFinePointer();
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      if (fine) window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrap} className={s.ringWrap} aria-hidden>
      <div ref={stage} className={s.stage}>
        <div ref={ring} className={s.ring} style={{ "--n": posters.length } as CSSProperties}>
          {posters.map((p, i) => (
            <div key={p.id} className={s.poster} style={{ "--i": i, "--c": p.color ?? undefined } as CSSProperties}>
              {/* eager: posters turned away still need to be ready when they swing round */}
              <Image src={p.src} alt="" fill sizes="150px" loading="eager" fetchPriority="low" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
