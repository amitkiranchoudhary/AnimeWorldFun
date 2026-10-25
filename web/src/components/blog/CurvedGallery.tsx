"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import TiltCard from "@/components/motion/TiltCard";
import { prefersReducedMotion } from "@/lib/motion/inView";
import type { Topic } from "./topics";
import s from "./blog.module.css";

type GalleryTopic = Topic & { cover?: string | null };

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * "On the horizon": upcoming post topics as posters on a curved 3D drum.
 * The screen pins and vertical scrolling slides the posters sideways; each
 * one turns and sinks back as it leaves the middle, and the whole strip
 * bends a little more the faster you scroll, then relaxes.
 * Without JS or with "reduce motion" it is a plain swipeable row.
 */
export default function CurvedGallery({ topics }: { topics: GalleryTopic[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current;
    if (!sec || prefersReducedMotion()) return;
    const stage = sec.querySelector<HTMLElement>("[data-stage]");
    const track = sec.querySelector<HTMLElement>("[data-track]");
    const bar = sec.querySelector<HTMLElement>("[data-bar]");
    const counter = sec.querySelector<HTMLElement>("[data-counter-n]");
    const slots = Array.from(sec.querySelectorAll<HTMLElement>("[data-slot]"));
    if (!stage || !track || !slots.length) return;
    sec.setAttribute("data-pinned", "");

    let vw = 0;
    let travel = 0;
    let centers: number[] = [];
    let frame = 0;
    let bend = 0;
    let lastY = window.scrollY;
    let active = -1;

    const measure = () => {
      vw = stage.clientWidth;
      // offsetLeft ignores transforms, so this is the resting layout
      centers = slots.map((el) => el.offsetLeft + el.offsetWidth / 2);
      travel = Math.max(0, track.scrollWidth - vw);
      // a little extra scroll per poster so each one gets its moment
      sec.style.height = `calc(100svh + ${Math.round(travel * 1.15)}px)`;
    };

    const update = () => {
      frame = 0;
      const r = sec.getBoundingClientRect();
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      // ease the bend toward the current scroll speed
      bend += (clamp(v * 0.3, -12, 12) - bend) * 0.16;
      if (r.bottom < -50 || r.top > window.innerHeight + 50) {
        bend = 0;
        return;
      }
      const span = r.height - stage.offsetHeight;
      const p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      const x = -p * travel;
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;

      const reach = Math.max(vw * 0.55, 300);
      let best = 0;
      let bestD = Infinity;
      slots.forEach((el, i) => {
        const d = clamp((centers[i] + x - vw / 2) / reach, -2.4, 2.4);
        const ad = Math.abs(d);
        // a drum seen from outside: off-centre posters turn away and sink back
        el.style.transform = `translate3d(0, ${(ad * ad * 12).toFixed(1)}px, ${(-ad * ad * 110).toFixed(1)}px) rotateY(${(d * 30 - bend).toFixed(2)}deg)`;
        el.style.opacity = (1 - Math.min(ad, 2) * 0.26).toFixed(3);
        if (ad < bestD) {
          bestD = ad;
          best = i;
        }
      });
      if (best !== active) {
        slots[active]?.removeAttribute("data-active");
        slots[best].setAttribute("data-active", "");
        active = best;
        if (counter) counter.textContent = pad(best + 1);
      }
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      // keep easing the bend back to rest after the scroll stops
      if (Math.abs(bend) > 0.05) frame = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    update();
    let lastW = vw;
    const ro = new ResizeObserver(() => {
      // phones resize the viewport height as the URL bar slides; only re-lay out for width
      if (stage.clientWidth === lastW) return;
      lastW = stage.clientWidth;
      measure();
      onScroll();
    });
    ro.observe(stage);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      sec.removeAttribute("data-pinned");
      sec.style.height = "";
      track.style.transform = "";
      slots.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
        el.removeAttribute("data-active");
      });
    };
  }, []);

  return (
    <section ref={ref} id="on-the-horizon" className={`${s.chapter} ${s.gallery}`} aria-labelledby="horizon-title">
      <p aria-hidden className={`${s.sideLabel} ${s.sideRight}`}>
        Chapter 02 <b>·</b> On the horizon
      </p>
      <div data-stage className={s.galleryStage}>
        <div className={s.galleryHead}>
          <div>
            <p className={s.kicker}>
              <span aria-hidden className={s.dot} /> Coming to the log
            </p>
            <h2 id="horizon-title" className={s.chapterTitle}>
              On the horizon
            </h2>
          </div>
          <div aria-hidden className={s.galleryMeta}>
            {/* the effect rewrites only the inner number, never React's own text nodes */}
            <span>
              <span data-counter-n>01</span> / {pad(topics.length)}
            </span>
            <span className={s.galleryBar}>
              <span data-bar />
            </span>
          </div>
        </div>

        <div className={s.viewport}>
          <ul data-track className={s.track}>
            {topics.map((t, i) => (
              <li key={t.id} data-slot className={s.slot} style={{ "--accent": t.accent } as CSSProperties}>
                <TiltCard className={s.tilt} max={7}>
                  <article className={s.poster} aria-labelledby={`topic-${t.id}`}>
                    {t.cover && (
                      <Image src={t.cover} alt="" fill sizes="(max-width: 640px) 68vw, 290px" className={s.posterArt} />
                    )}
                    <span aria-hidden className={s.posterShade} />
                    <span aria-hidden className={s.posterLog}>
                      Log {pad(i + 1)}
                    </span>
                    <span aria-hidden className={s.posterGlyph}>
                      {t.glyph}
                    </span>
                    <div className={s.posterBody}>
                      <p className={s.posterTag}>{t.tag}</p>
                      <h3 id={`topic-${t.id}`} className={s.posterTitle}>
                        {t.title}
                      </h3>
                      <p className={s.posterBlurb}>{t.blurb}</p>
                      <span className={s.posterStatus}>Ink drying</span>
                    </div>
                  </article>
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>
        <p aria-hidden className={s.galleryHint}>
          <span className={s.hintPinned}>Keep scrolling · the posters turn with you</span>
          <span className={s.hintRow}>Swipe for more · ink still drying</span>
        </p>
      </div>
    </section>
  );
}
