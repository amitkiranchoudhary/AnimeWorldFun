"use client";

import { useEffect, useRef, useState } from "react";

// Full-screen, click-through canvas holding the 3D straw hat.
// Three.js is loaded only after the page is up, and the hat is skipped
// entirely for "reduce motion" users or browsers without WebGL.
export default function FloatingHat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    import("@/lib/strawHat3d")
      .then(({ startFloatingHat }) => {
        if (cancelled) return;
        try {
          stop = startFloatingHat(canvas);
          requestAnimationFrame(() => setReady(true));
        } catch {
          // no WebGL: the page simply has no floating hat
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-40 h-full w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
