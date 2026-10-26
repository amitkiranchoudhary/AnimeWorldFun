"use client";

import { useEffect, useRef, useState } from "react";

// Click-through sky layer for the Home page:
//  • a 3D canvas (sakura, lanterns) between the night-sky background and the
//    page content, so posters and tiles cover it
//  • a light 2D canvas of sakura petals in front, drifting over and between the tiles
// Three.js loads after the page is up; "reduce motion" users and browsers
// without WebGL skip it.
export default function SkyScene() {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const back = backRef.current;
    if (!back) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    import("@/lib/skyScene3d")
      .then(({ startSkyScene }) => {
        if (cancelled) return;
        try {
          stop = startSkyScene(back, frontRef.current ?? undefined);
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

  const fade = `pointer-events-none fixed inset-0 h-full w-full transition-opacity duration-1000 ${
    ready ? "opacity-100" : "opacity-0"
  }`;
  return (
    <>
      <canvas ref={backRef} aria-hidden className={`${fade} -z-[5]`} />
      <canvas ref={frontRef} aria-hidden className={`${fade} z-30`} />
    </>
  );
}
