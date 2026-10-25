"use client";

import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion/inView";

/**
 * A warm pool of lantern light inside a card that drifts after the mouse, as
 * if you were holding the lantern up to read. It rests at the top centre
 * (under the hanging lantern) on touch screens, for "reduce motion", and when
 * the mouse leaves. Place it in a relative, overflow-hidden parent.
 */
export default function CardLight({ color = "rgba(255,180,80,0.22)" }: { color?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || !hasFinePointer() || prefersReducedMotion()) return;
    let frame = 0;
    let tx = 50; // where the mouse is (% of the card)
    let ty = 0;
    let x = 50; // where the light is; it eases after the mouse
    let y = 0;
    const step = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.setProperty("--mx", `${x.toFixed(2)}%`);
      el.style.setProperty("--my", `${y.toFixed(2)}%`);
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(step) : 0;
    };
    const go = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      go();
    };
    const onLeave = () => {
      tx = 50;
      ty = 0;
      go();
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: `radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), ${color}, transparent 70%)` }}
    />
  );
}
