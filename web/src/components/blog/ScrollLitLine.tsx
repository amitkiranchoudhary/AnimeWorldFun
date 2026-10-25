"use client";

import { Fragment, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./blog.module.css";

/**
 * A film-chapter scene: the screen pins while one big line of text lights up
 * word by word as you scroll, a scroll-driven taste of the read-along feature.
 * Pinning only switches on from JS when motion is allowed; otherwise (and
 * without JS) it is a normal, fully lit section.
 */
export default function ScrollLitLine({
  kicker,
  text,
  accents = [],
  note,
}: {
  kicker: string;
  text: string;
  /** words (lower case, no punctuation) drawn in gold */
  accents?: string[];
  note?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const sec = ref.current;
    if (!sec || prefersReducedMotion()) return;
    const els = Array.from(sec.querySelectorAll<HTMLElement>("[data-w]"));
    sec.setAttribute("data-pinned", "");

    let frame = 0;
    let lit = -1;
    const update = () => {
      frame = 0;
      const r = sec.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      // start a little before the pin, finish a little before it lets go
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / (span * 0.9 || 1)));
      const n = Math.round(p * els.length);
      if (n === lit) return;
      lit = n;
      els.forEach((el, i) => {
        el.toggleAttribute("data-lit", i < n);
        el.toggleAttribute("data-hot", i === n - 1 && n < els.length);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      sec.removeAttribute("data-pinned");
      els.forEach((el) => {
        el.removeAttribute("data-lit");
        el.removeAttribute("data-hot");
      });
    };
  }, []);

  return (
    <section ref={ref} className={`${s.chapter} ${s.lit}`} aria-label={kicker}>
      <p aria-hidden className={`${s.sideLabel} ${s.sideLeft}`}>
        Chapter 01 <b>·</b> The voice
      </p>
      <div className={s.litStage}>
        <p className={s.kicker}>
          <span aria-hidden className={s.dot} /> {kicker}
        </p>
        <p className={s.litLine}>
          {words.map((w, i) => {
            const plain = w.toLowerCase().replace(/[^a-z']/g, "");
            return (
              <Fragment key={i}>
                <span data-w className={`${s.litWord} ${accents.includes(plain) ? s.litAccent : ""}`}>
                  {w}
                </span>{" "}
              </Fragment>
            );
          })}
        </p>
        {note && <p className={s.litNote}>{note}</p>}
      </div>
    </section>
  );
}
