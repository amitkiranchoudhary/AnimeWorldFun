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
      <div className="awf-finger relative" style={{ transform: "translate(-7px, 0)" }}>
        {/* Luffy-style: the hat balances on the fingertip and flips over and over */}
        <div ref={hopRef} className="absolute" style={{ left: -11, top: -38, perspective: 120 }}>
          {/* speed lines either side of the flipping hat */}
          <svg
            className="awf-streaks absolute"
            viewBox="0 0 56 40"
            width={56}
            height={40}
            style={{ left: -10, top: -2 }}
          >
            <path d="M8 6 Q 0 20 8 34" />
            <path d="M3 12 Q -1 20 3 28" />
            <path d="M48 6 Q 56 20 48 34" />
            <path d="M53 12 Q 57 20 53 28" />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cursor-hat.png"
            alt=""
            width={36}
            height={36}
            className="awf-hat relative block drop-shadow-[0_3px_3px_rgba(0,0,0,0.55)]"
            style={{ animation: "hat-flip .8s linear infinite" }}
            draggable={false}
          />
        </div>

        {/* Pointing hand, index finger straight up */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cursor-hand.png"
          alt=""
          width={28}
          height={47}
          className="block drop-shadow-[2px_3px_2px_rgba(0,0,0,0.5)]"
          draggable={false}
        />
      </div>

      <style>{`
        .awf-cursor-root .awf-finger { transition: scale .15s ease; transform-origin: 7px 0; }
        .awf-cursor-root[data-hover="1"] .awf-finger { scale: 1.12; }
        .awf-cursor-root[data-hover="1"] .awf-hat { animation-duration: .35s !important; }
        .awf-cursor-root .awf-streaks path {
          fill: none; stroke: #fff; stroke-width: 1.6; stroke-linecap: round;
          animation: hat-streak .4s ease-in-out infinite alternate;
        }
        .awf-cursor-root .awf-streaks path:nth-child(even) { animation-delay: .2s; }
        .awf-cursor-root[data-hover="1"] .awf-streaks path { animation-duration: .18s; }
      `}</style>
    </div>
  );
}
