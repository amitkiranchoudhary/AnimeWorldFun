import type { CSSProperties } from "react";
import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";

// Paper lanterns hanging in the dark around the title (deterministic layout)
const LANTERNS = [
  { left: "7%", top: "18%", size: 46, speed: -0.18, delay: 0 },
  { left: "84%", top: "14%", size: 58, speed: -0.3, delay: -1.6 },
  { left: "76%", top: "62%", size: 34, speed: -0.1, delay: -3.1 },
  { left: "14%", top: "70%", size: 30, speed: -0.24, delay: -2.2 },
  { left: "52%", top: "8%", size: 24, speed: -0.06, delay: -0.8 },
];

const LINES = [
  { text: "Every anime.", className: "text-text", delay: 150 },
  { text: "Every language.", className: "text-[#ff9fc8] text-glow-pink", delay: 420 },
  { text: "One harbour.", className: "text-straw text-glow-gold", delay: 700 },
];

/** The opening title card of the About story. */
export default function AboutHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-28 text-center sm:px-8">
      {/* light + lanterns */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(255,120,180,0.18),transparent_70%),radial-gradient(90%_60%_at_50%_110%,rgba(0,0,0,0.9),transparent_60%)]" />
        {LANTERNS.map((l, i) => (
          <Parallax key={i} speed={l.speed} className="absolute" style={{ left: l.left, top: l.top }}>
            <span className="about-lantern" style={{ "--l-size": `${l.size}px`, animationDelay: `${l.delay}s` } as CSSProperties} />
          </Parallax>
        ))}
      </div>

      {/* big side labels */}
      <p aria-hidden className="about-side pointer-events-none absolute left-1 top-1/2 hidden font-display md:block">About</p>
      <p aria-hidden className="about-side about-side-r pointer-events-none absolute right-1 top-1/2 hidden font-display md:block">
        物語
      </p>

      <Reveal y={10} blur={4}>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-muted sm:text-xs">
          <span className="text-sash">●</span> About Anime World Fun
        </p>
      </Reveal>

      <h1 className="relative mt-6 font-display uppercase leading-[0.9] tracking-wide">
        <span className="sr-only">Every anime. Every language. One harbour.</span>
        <span aria-hidden className="block">
          {LINES.map((l) => (
            <SplitText
              key={l.text}
              as="span"
              text={l.text}
              by="char"
              stagger={28}
              delay={l.delay}
              className={`block text-[clamp(3rem,13vw,10.5rem)] ${l.className}`}
            />
          ))}
        </span>
      </h1>

      <Reveal delay={900} className="mx-auto mt-8 max-w-xl">
        <p className="text-base leading-relaxed text-muted sm:text-lg">
          A fan-made guide to <strong className="text-text">where anime streams</strong> and{" "}
          <strong className="text-text">in which language</strong> — built because finding that out used to take ten
          tabs and a lot of luck. This is its story, in four short chapters.
        </p>
      </Reveal>

      {/* film-credit line + scroll cue */}
      <Reveal delay={1150} className="absolute inset-x-4 bottom-6 flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">A fan production · 4 chapters · runtime: one scroll</p>
        <span aria-hidden className="about-cue" />
      </Reveal>

      <style href="awf-about-hero" precedence="default">{`
        .about-lantern {
          display: block; width: var(--l-size); height: calc(var(--l-size) * 1.25);
          border-radius: 45% 45% 40% 40% / 50% 50% 45% 45%;
          background:
            repeating-linear-gradient(0deg, transparent 0 22%, rgba(120,20,20,0.35) 22% 25%),
            radial-gradient(circle at 50% 45%, #ffe3a0, #f2994a 45%, #c0392b 100%);
          box-shadow: 0 0 calc(var(--l-size) * 0.8) rgba(255,170,90,0.55), 0 0 calc(var(--l-size) * 2) rgba(255,120,180,0.25);
          animation: float 7s ease-in-out infinite, glow-pulse 4s ease-in-out infinite;
          position: relative;
        }
        .about-lantern::before, .about-lantern::after {
          content: ""; position: absolute; left: 30%; right: 30%; height: 8%; background: #2a1a12; border-radius: 2px;
        }
        .about-lantern::before { top: -6%; }
        .about-lantern::after { bottom: -6%; }
        .about-side {
          writing-mode: vertical-rl;
          transform: translateY(-50%);
          font-size: clamp(3rem, 7vw, 6.5rem);
          letter-spacing: 0.14em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.14);
        }
        .about-side:not(.about-side-r) { transform: translateY(-50%) rotate(180deg); }
        .about-cue {
          display: block; width: 1px; height: 46px;
          background: linear-gradient(to bottom, rgba(255,150,200,0), rgba(255,150,200,0.9));
          transform-origin: top;
          animation: about-cue 2.2s var(--ease-out) infinite;
        }
        @keyframes about-cue { 0% { transform: scaleY(0); opacity: 1; } 70% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .about-lantern, .about-cue { animation: none; } }
      `}</style>
    </section>
  );
}
