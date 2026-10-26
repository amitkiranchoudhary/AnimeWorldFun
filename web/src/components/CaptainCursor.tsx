"use client";

import { useEffect, useRef, useState } from "react";

// The Captain cursor: his katana (white blade, gold guard, maroon wrapped grip),
// pointing with the blade tip, which is the hotspot. Over links and buttons the
// blade tilts and glints; a click gives it a quick swing. Only runs on
// mouse/trackpad devices, and can be switched off from the navbar (preference
// kept in localStorage under STORAGE_KEY).

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

function Katana() {
  return (
    <svg viewBox="0 0 40 40" width={38} height={38} className="awf-katana block overflow-visible">
      <defs>
        <linearGradient id="awf-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e3e8ef" />
          <stop offset="1" stopColor="#aeb8c6" />
        </linearGradient>
      </defs>
      {/* blade: tip at the top-left corner */}
      <path d="M1 1 Q12 8.5 26.5 22.4 L22.4 26.5 Q8.5 12 1 1 Z" fill="url(#awf-steel)" stroke="#2a1c12" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 3.2 Q13 9.6 24.6 21" fill="none" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
      {/* gold guard (tsuba) */}
      <ellipse cx="24.6" cy="24.6" rx="5.6" ry="2.3" transform="rotate(-45 24.6 24.6)" fill="#e0b33a" stroke="#2a1c12" strokeWidth="1.2" />
      {/* maroon grip with gold diamond wrap */}
      <path d="M26.6 26.6 L35.6 35.6" stroke="#2a1c12" strokeWidth="6.4" strokeLinecap="round" />
      <path d="M26.6 26.6 L35.6 35.6" stroke="#7a1f2b" strokeWidth="4.2" strokeLinecap="round" />
      {[28.6, 31.1, 33.6].map((c) => (
        <rect key={c} x={c - 0.9} y={c - 0.9} width="1.8" height="1.8" transform={`rotate(45 ${c} ${c})`} fill="#e0b33a" />
      ))}
      <circle cx="36.6" cy="36.6" r="2.1" fill="#e0b33a" stroke="#2a1c12" strokeWidth="1.1" />
      {/* glint that sweeps along the blade on hover */}
      <path className="awf-glint" d="M6 4.5 Q14 10.5 22 18.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function CaptainCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);
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
      const swing = swingRef.current;
      if (!swing) return;
      swing.style.animation = "none";
      void swing.offsetWidth; // restart the swing animation
      swing.style.animation = "awf-swing 0.38s cubic-bezier(.3,1.5,.5,1)";
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
      {/* the blade tip sits exactly on the pointer */}
      <div ref={swingRef} className="awf-blade" style={{ transform: "translate(-1px, -1px)", transformOrigin: "1px 1px" }}>
        <div className="awf-tilt drop-shadow-[2px_3px_2px_rgba(0,0,0,0.55)]" style={{ transformOrigin: "1px 1px" }}>
          <Katana />
        </div>
      </div>

      <style>{`
        .awf-cursor-root .awf-tilt { transition: rotate .2s ease, scale .2s ease; }
        .awf-cursor-root[data-hover="1"] .awf-tilt { rotate: -10deg; scale: 1.08; }
        .awf-cursor-root .awf-glint { opacity: 0; stroke-dasharray: 6 40; stroke-dashoffset: 46; }
        .awf-cursor-root[data-hover="1"] .awf-glint { opacity: .95; animation: awf-glint .9s ease-in-out infinite; }
        @keyframes awf-glint { from { stroke-dashoffset: 46; } to { stroke-dashoffset: 0; } }
        @keyframes awf-swing { 0% { rotate: 0deg; } 40% { rotate: -28deg; } 100% { rotate: 0deg; } }
        @media (prefers-reduced-motion: reduce) {
          .awf-cursor-root .awf-tilt { transition: none; }
          .awf-cursor-root[data-hover="1"] .awf-glint { animation: none; }
        }
      `}</style>
    </div>
  );
}
