"use client";

import { useEffect, useRef, useState } from "react";

// Click-through 3D layer (Flying Nimbus, sakura petals, sky lanterns).
// It sits between the chibi background and the page content, so posters and
// tiles cover it and it only shows in open spaces. Three.js loads after the
// page is up; "reduce motion" users and browsers without WebGL skip it.
export default function SkyScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    import("@/lib/skyScene3d")
      .then(({ startSkyScene }) => {
        if (cancelled) return;
        try {
          stop = startSkyScene(canvas);
          requestAnimationFrame(() => setReady(true));
        } catch {
          // no WebGL: the page simply has no sky layer
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
      className={`pointer-events-none fixed inset-0 -z-[5] h-full w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
