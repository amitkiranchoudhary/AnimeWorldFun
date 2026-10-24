"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";

// Ambience for every page except Home (which has its own sky scene): softly
// glowing, slightly out-of-focus sakura petals drifting through the dark behind
// the content, with a few big, faint orbs of light (bokeh) — the mood of
// ameen-abdullah.dev's intro. One small 2D canvas; pauses in background tabs,
// off for "reduce motion".

type Mote = { x: number; y: number; z: number; size: number; vx: number; vy: number; rot: number; spin: number; phase: number; kind: "petal" | "orb" };

function sprite(kind: "petal" | "orb", dpr: number) {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = c.height = S * dpr;
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(S / 2, S / 2);
  if (kind === "orb") {
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, S / 2);
    grad.addColorStop(0, "rgba(255,190,220,0.55)");
    grad.addColorStop(0.5, "rgba(255,150,200,0.18)");
    grad.addColorStop(1, "rgba(255,140,190,0)");
    g.fillStyle = grad;
    g.fillRect(-S / 2, -S / 2, S, S);
    return c;
  }
  // a petal with a soft pink glow around it
  const s = S * 0.2;
  g.shadowColor = "rgba(255,150,200,0.9)";
  g.shadowBlur = 14;
  g.beginPath();
  g.moveTo(0, s);
  g.bezierCurveTo(s * 0.9, s * 0.5, s * 0.8, -s * 0.6, s * 0.22, -s);
  g.quadraticCurveTo(0, -s * 0.78, -s * 0.22, -s);
  g.bezierCurveTo(-s * 0.8, -s * 0.6, -s * 0.9, s * 0.5, 0, s);
  const grad = g.createLinearGradient(0, -s, 0, s);
  grad.addColorStop(0, "#fff2f7");
  grad.addColorStop(1, "#f6a7c6");
  g.fillStyle = grad;
  g.fill();
  return c;
}

function Sky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let petal: HTMLCanvasElement;
    let orb: HTMLCanvasElement;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      petal = sprite("petal", dpr);
      orb = sprite("orb", dpr);
    };
    resize();

    const phone = w < 768;
    const spawn = (kind: Mote["kind"], anywhere: boolean): Mote => {
      const z = 0.4 + Math.random() * 0.9;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -40,
        z,
        size: kind === "orb" ? (60 + Math.random() * 120) * z : (14 + Math.random() * 10) * z,
        vx: (Math.random() * 0.6 + 0.2) * 14 * z,
        vy: (kind === "orb" ? 4 : 18 + Math.random() * 14) * z,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.4,
        phase: Math.random() * 100,
        kind,
      };
    };
    const motes: Mote[] = [
      ...Array.from({ length: phone ? 12 : 26 }, () => spawn("petal", true)),
      ...Array.from({ length: phone ? 3 : 6 }, () => spawn("orb", true)),
    ];

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      const t = now / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      for (const m of motes) {
        const sway = Math.cos(t * 0.9 + m.phase) * 18 * m.z;
        m.x += (m.vx + sway) * dt;
        m.y += m.vy * (0.6 + 0.6 * Math.cos(t * 0.9 + m.phase) ** 2) * dt;
        m.rot += m.spin * dt;
        if (m.y > h + 80 || m.x > w + 80) Object.assign(m, spawn(m.kind, false), { x: Math.random() * w * 1.1 - w * 0.1 });
        const img = m.kind === "orb" ? orb : petal;
        g.save();
        g.translate(m.x, m.y);
        g.rotate(m.rot);
        if (m.kind === "petal") g.scale(Math.max(0.2, Math.abs(Math.cos(t * 1.3 + m.phase))), 1);
        // far motes are dimmer, like out-of-focus bokeh
        g.globalAlpha = m.kind === "orb" ? 0.35 * m.z : 0.35 + 0.45 * Math.min(1, m.z);
        g.drawImage(img, -m.size / 2, -m.size / 2, m.size, m.size);
        g.restore();
      }
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-[5] h-full w-full" />;
}

function OnInnerPages() {
  return usePathname() === "/" ? null : <Sky />;
}

export default function AmbientSky() {
  // reading the URL has to stream in on dynamic routes, so it sits behind Suspense
  return (
    <Suspense fallback={null}>
      <OnInnerPages />
    </Suspense>
  );
}
