import { Fragment, type CSSProperties, type ElementType } from "react";

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * A huge line of display type that lights up word by word as you scroll
 * through the surrounding <ScrollScene> (it reads --p from it). Wrap words in
 * *asterisks* to give them the glowing accent colour. Pure CSS per frame:
 * each word's brightness and lift come from --p, so there is no React work
 * while scrolling. Screen readers get the plain sentence.
 */
export default function ScrubLine({
  text,
  as = "h2",
  from = 0.05,
  to = 0.55,
  accent = "pink",
  className = "",
  style,
}: {
  text: string;
  as?: Tag;
  /** scene progress where the first word starts to light */
  from?: number;
  /** scene progress where the last word is fully lit */
  to?: number;
  accent?: "pink" | "gold" | "red";
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const plain = text.replace(/\*/g, "");
  const El = as as ElementType;

  return (
    <El
      aria-label={plain}
      className={`scrub-line scrub-${accent} ${className}`}
      style={{ "--from": from, "--to": to, "--n": words.length, ...style } as CSSProperties}
    >
      {words.map((w, i) => {
        const isAccent = w.startsWith("*");
        return (
          <Fragment key={i}>
            <span aria-hidden className={`scrub-word ${isAccent ? "scrub-accent" : ""}`} style={{ "--i": i } as CSSProperties}>
              {w.replace(/\*/g, "")}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
      <style href="awf-scrub-line" precedence="default">{`
        .scrub-line { --accent: 255,150,200; overflow-wrap: anywhere; }
        .scrub-gold { --accent: 242,201,76; }
        .scrub-red { --accent: 255,96,108; }
        .scrub-word {
          /* 0 → 1 as the scroll passes this word */
          --lit: clamp(0, calc((var(--p, 1) - var(--from)) / (var(--to) - var(--from)) * var(--n) - var(--i)), 1);
          display: inline-block;
          opacity: calc(0.1 + var(--lit) * 0.9);
          transform: translate3d(0, calc((1 - var(--lit)) * 0.22em), 0) scale(calc(0.96 + var(--lit) * 0.04));
          transform-origin: 50% 100%;
          text-shadow: 0 0 0.35em rgba(255,255,255,0.18);
          will-change: opacity, transform;
        }
        .scrub-accent {
          color: rgb(var(--accent));
          text-shadow: 0 0 0.25em rgba(var(--accent),0.55), 0 0 0.9em rgba(var(--accent),0.3);
        }
      `}</style>
    </El>
  );
}
