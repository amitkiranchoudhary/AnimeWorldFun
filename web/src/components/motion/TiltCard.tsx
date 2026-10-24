"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion/inView";

/**
 * Tilts in 3D toward the mouse with a soft moving glare, like a holographic
 * trading card, and settles back when the mouse leaves. Mouse/trackpad only;
 * touch screens and "reduce motion" get a plain card.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  max = 9,
  scale = 1.03,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** max tilt in degrees */
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let frame = 0;
    let px = 0.5;
    let py = 0.5;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--tilt-x", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--tilt-y", `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty("--glare-x", `${px * 100}%`);
      el.style.setProperty("--glare-y", `${py * 100}%`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      el.dataset.tilting = "1";
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = py = 0.5;
      delete el.dataset.tilting;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className}`} style={{ "--tilt-scale": scale, ...style } as CSSProperties}>
      {children}
      {glare && <span className="tilt-glare" aria-hidden />}
    </div>
  );
}
