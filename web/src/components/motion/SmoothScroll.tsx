"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/motion/inView";

// Silky, inertial scrolling for mouse wheels and trackpads (the same Lenis
// library ameen-abdullah.dev uses). Touch screens keep their native scrolling,
// and "reduce motion" users keep the browser's normal scroll.
// It drives the real window scroll, so scroll listeners elsewhere just work;
// add data-lenis-prevent to anything that must scroll on its own (modals, lists).

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
  return null;
}
