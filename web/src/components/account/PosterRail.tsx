"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion, watch } from "@/lib/motion/inView";
import s from "./logbook.module.css";

export type RailShelf = { title: string; accent: string; count: number; note: string };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The shelves as a film chapter: the screen pins while every sample poster
 * glides past on a curved 3D rail. The rail bends harder the faster you
 * scroll and relaxes when you stop; the poster in the middle lights up and
 * its line plays as a movie subtitle. Children are the server-rendered
 * <li data-rail-item data-slot> posters. Wide screens with motion only
 * (logbook.module.css swaps in the still shelves otherwise).
 */
export default function PosterRail({
  shelves,
  captions,
  gap,
  children,
}: {
  shelves: RailShelf[];
  /** one subtitle line per poster, in order */
  captions: string[];
  /** extra slots between shelves (matches the data-slot values) */
  gap: number;
  children: ReactNode;
}) {
  const outer = useRef<HTMLElement>(null);
  const [focus, setFocus] = useState(0);

  // which shelf each poster belongs to
  const shelfOf = shelves.flatMap((sh, si) => Array.from({ length: sh.count }, () => si));
  const shelf = shelves[shelfOf[focus] ?? 0];

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    // fills the sample progress rings once the rail is reached
    const stopWatch = watch(el, () => el.setAttribute("data-shown", ""));
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-rail-item]"));
    if (prefersReducedMotion() || items.length === 0 || typeof IntersectionObserver === "undefined") return stopWatch;

    const slots = items.map((it) => Number(it.dataset.slot) || 0);
    const lastSlot = Math.max(1, slots[slots.length - 1]);
    let spacing = 1;
    const measure = () => {
      spacing = items[0].offsetWidth * 1.18; // matches --rail-step in CSS
    };
    measure();

    let frame = 0;
    let active = false;
    let last = Number.NaN;
    let bend = 0;
    let focused = -1;

    const tick = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      // the approach: while the stage scrolls up into place the posters glide in from the right and fade up
      const enter = r.top > 0 ? clamp(1 - r.top / window.innerHeight, 0, 1) : 1;
      // the rail position under the centre of the screen
      const c = p * lastSlot * spacing - (1 - enter) * 3 * spacing;
      const v = Number.isNaN(last) ? 0 : c - last;
      last = c;
      // scroll speed bends the rail; it eases back when the scroll settles
      const target = Math.min(1, Math.abs(v) / 55);
      bend += (target - bend) * 0.12;
      const radius = 2400 - bend * 1300;

      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < items.length; i++) {
        const x = slots[i] * spacing - c;
        const d = Math.abs(x) / spacing;
        const it = items[i];
        if (d > 7) {
          // off-stage: invisible and unclickable, but still reachable by Tab
          it.style.opacity = "0";
          it.style.pointerEvents = "none";
          continue;
        }
        it.style.opacity = enter < 1 ? enter.toFixed(3) : "";
        it.style.pointerEvents = "";
        // a gentle drum: posters recede and turn away the further they are from the middle
        const z = -(x * x) / (2 * radius);
        const turn = Math.atan(x / radius) * 57.2958;
        it.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${turn.toFixed(2)}deg)`;
        it.style.setProperty("--dim", Math.min(0.78, d * 0.2).toFixed(3));
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best !== focused) {
        items[focused]?.removeAttribute("data-focus");
        items[best].setAttribute("data-focus", "");
        focused = best;
        setFocus(best);
      }
      el.style.setProperty("--rail-p", p.toFixed(4));
      // keep animating only while the bend is still settling
      if (active && Math.abs(target - bend) > 0.002) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (active && !frame) frame = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // keyboard users: tabbing to a poster scrolls the page until it is centred
    const onFocusIn = (e: FocusEvent) => {
      const i = items.findIndex((it) => it.contains(e.target as Node));
      if (i < 0) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const y = window.scrollY + r.top + (slots[i] / lastSlot) * span;
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    };

    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (active) {
        measure();
        onScroll();
      }
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    return () => {
      stopWatch();
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  // the real last slot; ~22vh of scroll per poster keeps the pin brisk
  const lastSlot = Math.max(1, captions.length - 1 + (shelves.length - 1) * gap);

  return (
    <section
      ref={outer}
      aria-label="Sample shelves, as a scrolling gallery"
      className={`${s.railOnly} ${s.railOuter} relative`}
      style={{ height: `calc(100svh + ${Math.round(lastSlot * 22)}vh)` }}
    >
      <div className={`${s.railStage} sticky top-0 h-[100svh]`}>
        {/* the current shelf's name, huge and faint behind the posters */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[9%] text-center">
          {shelves.map((sh, i) => (
            <p
              key={sh.title}
              data-active={i === shelfOf[focus] ? "" : undefined}
              className={`${s.railWatermark} absolute inset-x-0 font-display leading-none tracking-wide`}
              style={{ color: sh.accent }}
            >
              {sh.title}
            </p>
          ))}
        </div>

        {/* big side label + counter, like a film's chapter card */}
        <p
          aria-hidden
          className={`${s.sideLabel} absolute left-6 top-1/2 -translate-y-1/2 font-display text-sm text-white/35`}
        >
          SHELF 0{(shelfOf[focus] ?? 0) + 1} — {shelf?.title.toUpperCase()}
        </p>
        <p aria-hidden className="absolute right-8 top-24 font-display text-2xl tracking-widest text-white/40">
          <span className="text-text">{String(focus + 1).padStart(2, "0")}</span> / {String(captions.length).padStart(2, "0")}
        </p>

        {/* the shelf's own card (name, note, count), cross-fading as the shelf changes */}
        <div aria-hidden className="pointer-events-none absolute left-16 top-24 grid max-w-xs">
          {shelves.map((sh, i) => (
            <div
              key={sh.title}
              data-active={i === shelfOf[focus] ? "" : undefined}
              className={`${s.railNote} [grid-area:1/1]`}
            >
              <p
                className="font-display text-3xl tracking-wide"
                style={{ color: sh.accent, textShadow: `0 0 28px color-mix(in srgb, ${sh.accent} 45%, transparent)` }}
              >
                {sh.title}
              </p>
              <p className="text-sm text-muted">{sh.note}</p>
              <span className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-muted">
                Sample shelf · {sh.count} shows
              </span>
            </div>
          ))}
        </div>

        {/* soft floor light the posters stand over (before the track, so it paints under them) */}
        <div aria-hidden className={`${s.railFloor} pointer-events-none absolute inset-x-[10%] bottom-[14%] h-24`} />

        {/* for screen readers: what this flat list of posters is (each link also names its shelf) */}
        <h3 className="sr-only">
          Sample shelves: {shelves.map((sh) => `${sh.title}, ${sh.count} shows`).join("; ")}
        </h3>
        <ul className={s.railTrack}>{children}</ul>

        {/* movie-subtitle line for the poster in the middle */}
        <p aria-hidden className="absolute inset-x-4 bottom-[7%] text-center">
          <span key={focus} className={`${s.subtitle} ${s.captionSwap} rounded px-3 py-1.5 text-base font-bold text-[#fff6d8] lg:text-lg`}>
            {captions[focus]}
          </span>
        </p>

        {/* how far along the rail you are */}
        <div aria-hidden className="absolute inset-x-[30%] bottom-[3.5%] h-0.5 overflow-hidden rounded-full bg-white/10">
          <span className={`${s.railProgress} block h-full`} style={{ background: shelf?.accent, color: shelf?.accent }} />
        </div>
      </div>
    </section>
  );
}
