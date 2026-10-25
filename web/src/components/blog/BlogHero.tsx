import type { CSSProperties } from "react";
import Magnetic from "@/components/motion/Magnetic";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import HeroSubtitles from "./HeroSubtitles";
import s from "./blog.module.css";

// Paper lanterns hung over the harbour at different depths: the bigger
// (closer) ones drift faster against the scroll than the small far ones.
const LANTERNS = [
  { left: "7%", top: "14%", w: 50, speed: -0.32, sway: 6.5, delay: 0, mark: "航" },
  { left: "84%", top: "10%", w: 62, speed: -0.4, sway: 7.2, delay: 1.4, mark: "海" },
  { left: "18%", top: "58%", w: 30, speed: -0.14, sway: 5.4, delay: 0.7, mark: "記", far: true },
  { left: "76%", top: "56%", w: 38, speed: -0.2, sway: 6, delay: 2.1, mark: "録", far: true },
  { left: "56%", top: "5%", w: 24, speed: -0.08, sway: 5, delay: 1, mark: "夢", far: true },
];

/** Two layers of rolling sea along the bottom edge of the hero. */
function Sea() {
  // swells repeat every 720 units, so sliding the 2×-wide svg by half loops seamlessly
  const crest = (y: number) => `M0 ${y} Q 180 ${y - 22} 360 ${y} T 720 ${y} T 1080 ${y} T 1440 ${y}`;
  const wave = (y: number) => `${crest(y)} V 200 H 0 Z`;
  return (
    <div className={s.sea}>
      <svg className={s.wave} style={{ "--wave-s": "22s" } as CSSProperties} viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d={wave(90)} fill="rgba(31, 95, 143, 0.28)" />
      </svg>
      <svg className={s.wave} style={{ "--wave-s": "14s", opacity: 0.9 } as CSSProperties} viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d={wave(130)} fill="rgba(13, 47, 87, 0.6)" />
        <path d={crest(128)} fill="none" stroke="rgba(207, 232, 255, 0.22)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function BlogHero() {
  return (
    <section className={`${s.chapter} ${s.hero}`} aria-label="Captain's Log">
      {/* the scene: bloom, lanterns, the sea (all decorative) */}
      <div aria-hidden className={s.backdrop}>
        <div className={s.glow} style={{ left: 0, right: 0, top: "18%", marginInline: "auto", width: "min(90vw, 760px)", height: 420, background: "rgba(255, 110, 180, 0.22)" }} />
        <div className={s.glow} style={{ left: "-10%", bottom: "8%", width: 420, height: 300, background: "rgba(242, 201, 76, 0.12)", animationDelay: "-3s" }} />
        <div className={s.glow} style={{ right: "-8%", top: "12%", width: 360, height: 280, background: "rgba(230, 57, 70, 0.16)", animationDelay: "-5s" }} />
        {LANTERNS.map((l) => (
          <Parallax
            key={l.mark}
            speed={l.speed}
            className={`absolute ${l.far ? "hidden sm:block" : ""}`}
            style={{ left: l.left, top: l.top, filter: l.far ? "blur(1.5px)" : undefined, opacity: l.far ? 0.7 : 1 }}
          >
            <span
              className={s.lantern}
              style={{ "--w": `${l.w}px`, "--sway": `${l.sway}s`, animationDelay: `-${l.delay}s` } as CSSProperties}
            >
              <span className={s.lanternGlow} />
              <span className={s.lanternBody}>{l.mark}</span>
            </span>
          </Parallax>
        ))}
        <Sea />
        <div className={s.vignette} />
      </div>

      <p aria-hidden className={`${s.sideLabel} ${s.sideLeft}`}>
        航海日誌 <b>·</b> The Captain&apos;s Log
      </p>
      <p aria-hidden className={`${s.sideLabel} ${s.sideRight}`}>
        Vol. 04 <b>·</b> Ink still drying
      </p>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Reveal delay={80} y={14} blur={4}>
          <p className={s.kicker}>
            <span aria-hidden className={s.dot} /> Phase 4 — ink still drying
          </p>
        </Reveal>

        <h1 className={s.title}>
          <span className="sr-only">Captain&apos;s Log</span>
          <span aria-hidden>
            <SplitText as="span" text="Captain's" by="char" stagger={38} delay={180} className={s.titleTop} />
            <SplitText as="span" text="Log" by="char" stagger={110} delay={520} className={s.titleBig} />
          </span>
        </h1>

        <p className="sr-only">
          Blogs with read-along narration, where every word lights up as it is spoken: watch orders, seasonal picks,
          reviews and hot takes.
        </p>
        <Reveal delay={950} y={12}>
          <HeroSubtitles />
        </Reveal>

        <Reveal delay={1150} y={16} className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <a href="#read-along" className={`${s.btn} shimmer`}>
              <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
              </svg>
              Hear a sample
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#on-the-horizon" className={s.btnGhost}>
              See what&apos;s coming
            </a>
          </Magnetic>
        </Reveal>
      </div>

      <div aria-hidden className={s.cue}>
        Scroll to set sail
        <span className={s.cueLine} />
      </div>
    </section>
  );
}
