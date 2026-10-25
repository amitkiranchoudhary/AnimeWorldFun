"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./detail.module.css";

export type Poster = {
  id: number;
  title: string;
  image: string;
  color: string | null;
  score: number | null;
  /** short line for the subtitle caption, e.g. "Sequel" or "TV · 2019" */
  note: string | null;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const DEG = 180 / Math.PI;

/**
 * Posters on the inside of a curved cinema screen. Page scroll slides them
 * along, dragging (mouse or touch) spins them with a little fling, and the
 * curve bends harder while it moves. Arrow keys / buttons step through, and
 * the centred poster's title shows below like a film subtitle.
 * Without JS or with "reduce motion" it's a plain scroll-snap row.
 */
export default function PosterCarousel({ items, label }: { items: Poster[]; label: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const slides = [...stage.querySelectorAll<HTMLElement>("[data-slide]")];
    const n = slides.length;
    if (!n) return;

    // ── flat fallback: native scrolling, buttons scroll to a poster ──
    if (prefersReducedMotion()) {
      const centreOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
      goRef.current = (i) => {
        const el = slides[clamp(i, 0, n - 1)];
        stage.scrollTo({ left: centreOf(el) - stage.clientWidth / 2 });
      };
      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const mid = stage.scrollLeft + stage.clientWidth / 2;
          let best = 0;
          slides.forEach((el, i) => {
            if (Math.abs(centreOf(el) - mid) < Math.abs(centreOf(slides[best]) - mid)) best = i;
          });
          setActive(best);
        });
      };
      stage.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        cancelAnimationFrame(frame);
        stage.removeEventListener("scroll", onScroll);
      };
    }

    // ── curved mode ──
    stage.dataset.curved = "";
    let S = 0; // distance between poster centres along the curve
    let R = 0; // curve radius
    let max = 0;
    let scrollPart = 0; // offset contributed by page scroll
    let drag = 0; // offset contributed by dragging / keys / buttons
    let current = 0;
    let vel = 0;
    let raf = 0;
    let shown = -1;
    let inView = false;
    let dragging = false;
    let moved = false;
    let pid = -1;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;
    let flick = 0;

    const measure = () => {
      const w = slides[0].offsetWidth;
      S = w * 1.06 + 14;
      R = Math.max(stage.clientWidth * 0.72, w * 2.6);
      max = (n - 1) * S;
    };
    const readScroll = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      // the middle poster is centred when the gallery is mid-screen
      scrollPart = max / 2 + (p - 0.5) * Math.min(max, vh * 1.2);
    };
    const target = () => clamp(scrollPart + drag, 0, max);

    const render = () => {
      const r = R / (1 + Math.min(Math.abs(vel) * 0.012, 0.6)); // bends harder in motion
      const sway = clamp(vel * 0.004, -0.2, 0.2);
      for (let i = 0; i < n; i++) {
        const th = clamp((i * S - current) / r, -1.45, 1.45);
        const a = Math.abs(th);
        const x = r * Math.sin(th);
        const z = r * (1 - Math.cos(th)) * 0.4;
        const lift = Math.max(0, 1 - a * 2.4) * 0.06;
        const el = slides[i];
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${((-th - sway) * DEG).toFixed(2)}deg) scale(${(1 + lift).toFixed(3)})`;
        el.style.opacity = clamp(1.4 - a, 0, 1).toFixed(3);
        el.style.visibility = a > 1.38 ? "hidden" : "";
        el.style.setProperty("--shade", Math.min(a * 0.85, 0.72).toFixed(3));
      }
    };
    const syncActive = () => {
      const idx = clamp(Math.round(current / (S || 1)), 0, n - 1);
      if (idx !== shown) {
        shown = idx;
        setActive(idx);
      }
    };
    const tick = () => {
      raf = 0;
      const t = target();
      const prev = current;
      current += (t - current) * (dragging ? 0.32 : 0.085);
      vel = vel * 0.75 + (current - prev) * 0.25;
      const settled = Math.abs(t - current) < 0.25 && Math.abs(vel) < 0.03;
      if (settled) {
        current = t;
        vel = 0;
      }
      render();
      syncActive();
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    goRef.current = (i) => {
      drag = clamp(i, 0, n - 1) * S - scrollPart;
      kick();
    };

    // page scroll drives it, but only while it's near the screen
    const onScroll = () => {
      if (!inView) return;
      readScroll();
      kick();
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) onScroll();
    }, { rootMargin: "200px 0px" });
    io.observe(stage);
    const ro = new ResizeObserver(() => {
      measure();
      readScroll();
      kick();
    });
    ro.observe(stage);

    // drag: only takes over after a few px sideways, so taps still open posters
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      pid = e.pointerId;
      startX = lastX = e.clientX;
      lastT = e.timeStamp;
      flick = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      if (!moved) {
        if (Math.abs(e.clientX - startX) < 6) return;
        moved = true;
        try {
          stage.setPointerCapture(pid);
        } catch {
          // pointer already gone; the drag still works while it's over the stage
        }
        stage.dataset.dragging = "";
      }
      const dx = e.clientX - lastX;
      flick = dx / Math.max(1, e.timeStamp - lastT);
      lastX = e.clientX;
      lastT = e.timeStamp;
      drag -= dx * 1.15;
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      if (!moved) return;
      delete stage.dataset.dragging;
      if (stage.hasPointerCapture(pid)) stage.releasePointerCapture(pid);
      // fling a little further, then settle on the nearest poster
      const goal = clamp(scrollPart + drag - flick * 240, 0, max);
      drag = Math.round(goal / S) * S - scrollPart;
      kick();
    };
    // a drag shouldn't also count as a click on the poster under the pointer
    const onClick = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    const onFocus = (e: FocusEvent) => {
      const i = slides.findIndex((el) => el.contains(e.target as Node));
      if (i >= 0) goRef.current(i);
    };

    measure();
    readScroll();
    current = target();
    render();
    kick();

    stage.addEventListener("pointerdown", onDown, { passive: true });
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerup", onUp, { passive: true });
    stage.addEventListener("pointercancel", onUp, { passive: true });
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("focusin", onFocus);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("focusin", onFocus);
      window.removeEventListener("scroll", onScroll);
      delete stage.dataset.curved;
      delete stage.dataset.dragging;
      for (const el of slides) {
        el.style.transform = el.style.opacity = el.style.visibility = "";
        el.style.removeProperty("--shade");
      }
    };
  }, []);

  // ← / → move focus to the neighbouring poster (which centres it)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const links = [...(stageRef.current?.querySelectorAll<HTMLElement>("[data-slide] a") ?? [])];
    const from = links.findIndex((l) => l === document.activeElement);
    const to = clamp((from < 0 ? active : from) + (e.key === "ArrowRight" ? 1 : -1), 0, links.length - 1);
    e.preventDefault();
    links[to]?.focus({ preventScroll: true });
  };

  const centred = items[active] ?? items[0];

  return (
    <div className={s.carousel} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={stageRef} className={s.stage} onKeyDown={onKeyDown}>
        <ul className={s.track}>
          {items.map((it, i) => (
            <li key={it.id} data-slide className={s.slide} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
              <Link
                href={`/anime/${it.id}`}
                draggable={false}
                aria-label={it.note ? `${it.title} (${it.note})` : it.title}
                className={s.poster}
                style={{ "--c": it.color ?? "#1d2c5e" } as CSSProperties}
              >
                <Image
                  src={it.image}
                  alt=""
                  fill
                  draggable={false}
                  sizes="240px"
                  className={s.posterImg}
                />
                {it.score != null && (
                  <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-xs font-extrabold text-straw">
                    ★ {(it.score / 10).toFixed(1)}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-12">
                  <span className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{it.title}</span>
                  {it.note && <span className="mt-1 block truncate text-[11px] font-bold text-straw/85">{it.note}</span>}
                </span>
                <span className={s.shade} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* controls + subtitle caption for the centred poster */}
      <div className="mt-3 flex items-center justify-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => goRef.current(active - 1)}
          disabled={active === 0}
          aria-label="Previous poster"
          className="glass grid size-11 shrink-0 place-items-center rounded-full text-lg text-straw transition hover:shadow-[var(--glow-gold)] focus-visible:outline-2 focus-visible:outline-straw disabled:opacity-30"
        >
          ←
        </button>
        <p aria-hidden className="min-w-0 max-w-xl flex-1 text-center text-sm sm:text-base">
          <span className={s.subtitle}>
            {centred.note && <span className="text-straw">{centred.note}: </span>}
            {centred.title}
          </span>
        </p>
        <button
          type="button"
          onClick={() => goRef.current(active + 1)}
          disabled={active === items.length - 1}
          aria-label="Next poster"
          className="glass grid size-11 shrink-0 place-items-center rounded-full text-lg text-straw transition hover:shadow-[var(--glow-gold)] focus-visible:outline-2 focus-visible:outline-straw disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}
