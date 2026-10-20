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
      {/* Offset so the fingertip (not the hand's corner) is the hotspot */}
      <div className="relative" style={{ transform: "translate(-12px, -1px)" }}>
        {/* Hat sitting on the fingertip, tilted to read as a spinning disc */}
        <div ref={hopRef} className="absolute" style={{ left: -9, top: -22 }}>
          <div style={{ transform: "perspective(120px) rotateX(64deg)" }}>
            <svg
              className="awf-hat"
              viewBox="0 0 40 40"
              width="40"
              height="40"
              style={{ animation: "hat-spin 0.9s linear infinite" }}
            >
              <defs>
                <radialGradient id="awf-brim" cx="50%" cy="50%" r="50%">
                  <stop offset="55%" stopColor="#f6d264" />
                  <stop offset="100%" stopColor="#c9962a" />
                </radialGradient>
              </defs>
              <circle cx="20" cy="20" r="19" fill="url(#awf-brim)" stroke="#7a5414" strokeWidth="1" />
              {/* straw weave spokes make the spin visible */}
              {Array.from({ length: 12 }, (_, i) => (
                <line
                  key={i}
                  x1="20"
                  y1="8"
                  x2="20"
                  y2="1.5"
                  stroke="#a8781e"
                  strokeWidth="1"
                  transform={`rotate(${i * 30} 20 20)`}
                />
              ))}
              <circle cx="20" cy="20" r="11.5" fill="#e63946" />
              <circle cx="20" cy="20" r="9" fill="#f2c94c" />
              <circle cx="16.5" cy="16.5" r="3" fill="#fff4c2" opacity="0.8" />
              {/* a frayed straw on the brim */}
              <path d="M36 14 L 39.5 12.5" stroke="#7a5414" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Pointing hand */}
        <svg className="awf-finger" viewBox="0 0 26 34" width="26" height="34">
          <path
            d="M9.5 2.5c0-1.4 1.1-2.3 2.3-2.3s2.3.9 2.3 2.3v10.2c.3-.9 1.2-1.5 2.2-1.5 1.3 0 2.2 1 2.2 2.3v.6c.4-.7 1.1-1.1 2-1.1 1.2 0 2.1 1 2.1 2.2v1c.4-.5 1-.8 1.7-.8 1.1 0 1.9.9 1.9 2v6.8c0 5.6-4.1 9.6-9.6 9.6h-1.2c-3.1 0-5.6-1.3-7.4-3.7L1.3 21.4c-.8-1-.6-2.4.4-3.1 1-.7 2.3-.5 3.1.4l2.6 3V2.5z"
            fill="#fff2df"
            stroke="#1b1410"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14.1 13v5M18.5 14v4.4M22.6 15.6v3.4" stroke="#1b1410" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      <style>{`
        .awf-cursor-root .awf-finger { transition: transform .15s ease; transform-origin: 12px 2px; }
        .awf-cursor-root[data-hover="1"] .awf-finger { transform: scale(1.12) rotate(-6deg); }
        .awf-cursor-root[data-hover="1"] .awf-hat { animation-duration: .35s !important; }
      `}</style>
    </div>
  );
}
