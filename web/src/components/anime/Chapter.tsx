import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import s from "./detail.module.css";

/**
 * A section heading styled like a film chapter card: a big outlined number,
 * the title sliding up word by word, and an optional subtitle-style caption.
 */
export default function Chapter({
  n,
  title,
  caption,
  size = "lg",
}: {
  n: number;
  title: string;
  caption?: ReactNode;
  size?: "lg" | "md";
}) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-end gap-4">
        <Reveal as="span" y={14} blur={4} className={`${s.chapterNum} shrink-0 text-6xl sm:text-8xl`}>
          <span aria-hidden>{String(n).padStart(2, "0")}</span>
        </Reveal>
        <div className="min-w-0 pb-1">
          <Reveal as="p" y={10} blur={0} className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.35em] text-sash">
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-sash" />
            Chapter {n}
          </Reveal>
          <SplitText
            as="h2"
            text={title}
            stagger={60}
            delay={120}
            className={`mt-1 font-display leading-[0.92] tracking-wide text-text text-glow-pink ${
              size === "lg" ? "text-[2.6rem] sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl"
            }`}
          />
        </div>
      </div>
      {caption && (
        <Reveal as="p" delay={300} y={10} blur={2} className="mt-4 text-sm sm:text-base">
          <span className={s.subtitle}>{caption}</span>
        </Reveal>
      )}
    </header>
  );
}
