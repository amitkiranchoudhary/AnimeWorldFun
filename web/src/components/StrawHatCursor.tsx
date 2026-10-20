"use client";

import { useEffect, useRef, useState } from "react";

// A pointing finger with a straw hat spinning on its fingertip.
// Only runs on mouse/trackpad devices, and can be switched off from the navbar
// (preference kept in localStorage under STORAGE_KEY).

export const STORAGE_KEY = "awf-cursor-off";
export const TOGGLE_EVENT = "awf-cursor-toggle";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary";

function readDisabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function StrawHatCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide whether the custom cursor should run at all
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(finePointer.matches && !readDisabled());
    update();
    finePointer.addEventListener("change", update);
    window.addEventListener(TOGGLE_EVENT, update);
    return () => {
      finePointer.removeEventListener("change", update);
      window.removeEventListener(TOGGLE_EVENT, update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;

    document.documentElement.classList.add("awf-cursor");

    let x = -100;
    let y = -100;
    let frame = 0;

    const render = () => {
      frame = 0;
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      root.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      root.dataset.hover = target?.closest(INTERACTIVE) ? "1" : "0";
    };

    const onDown = () => {
      const hop = hopRef.current;
      if (!hop) return;
      hop.style.animation = "none";
      void hop.offsetWidth; // restart the hop animation
      hop.style.animation = "hat-hop 0.45s cubic-bezier(.3,1.6,.5,1)";
    };

    const onLeave = () => {
      root.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("awf-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className="awf-cursor-root pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-150"
      aria-hidden
    >
      {/* Offset so the fingertip (not the image corner) is the hotspot */}
      <div className="relative" style={{ transform: "translate(-2px, -2px)" }}>
        {/* Straw hat (cut from the logo) spinning on the fingertip */}
        <div ref={hopRef} className="absolute" style={{ left: -16, top: -24, perspective: 140 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/straw-hat.png"
            alt=""
            width={38}
            height={28}
            className="awf-hat block drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
            style={{ animation: "hat-spin 1s linear infinite" }}
            draggable={false}
          />
        </div>

        {/* Saitama-glove pointing finger from the old site */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/glove-cursor.png"
          alt=""
          width={44}
          height={45}
          className="awf-finger block drop-shadow-[2px_3px_2px_rgba(0,0,0,0.45)]"
          draggable={false}
        />
      </div>

      <style>{`
        .awf-cursor-root .awf-finger { transition: transform .15s ease; transform-origin: 2px 2px; }
        .awf-cursor-root[data-hover="1"] .awf-finger { transform: scale(1.12) rotate(-6deg); }
        .awf-cursor-root[data-hover="1"] .awf-hat { animation-duration: .4s !important; }
      `}</style>
    </div>
  );
}
