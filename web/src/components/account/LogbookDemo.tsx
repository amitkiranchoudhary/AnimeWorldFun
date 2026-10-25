"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { prefersReducedMotion } from "@/lib/motion/inView";
import ProgressRing from "./ProgressRing";
import s from "./logbook.module.css";

export type DemoShow = { id: number; title: string; cover: string; color: string | null; episodes: number };

type Status = "plan" | "watching" | "completed";

const STATUS_LABEL: Record<Status, string> = {
  plan: "Plan to watch",
  watching: "Watching",
  completed: "Completed",
};

const statusOf = (ep: number, total: number): Status => (ep === 0 ? "plan" : ep >= total ? "completed" : "watching");

function caption(status: Status, ep: number, total: number) {
  if (status === "plan") return "Added to Plan to watch. The voyage begins soon.";
  if (status === "completed") return "Final episode logged. Stamped into the logbook!";
  const left = total - ep;
  return `Episode ${ep} logged. ${left} more ${left === 1 ? "island" : "islands"} to go.`;
}

/**
 * The tracker, acted out: a real trending show moves from Plan to watch, to
 * Watching (the ring fills one episode at a time), to Completed (a stamp
 * lands), then the next show sails in. It plays only while on screen, can be
 * paused, and visitors can log episodes themselves with the button.
 * "Reduce motion" turns autoplay off; the button still works.
 */
export default function LogbookDemo({ shows }: { shows: DemoShow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [ep, setEp] = useState(0);
  const [visible, setVisible] = useState(false);
  const [auto, setAuto] = useState(true);
  const [still, setStill] = useState(false); // "reduce motion": no autoplay

  const show = shows[idx % shows.length];
  const total = show?.episodes ?? 12;
  const status = statusOf(ep, total);

  // only animate while the panel is on screen (and never for "reduce motion")
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        setStill(prefersReducedMotion());
        setVisible(e.isIntersecting);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // autoplay: one timeout per step, so pausing or leaving the screen stops cleanly
  useEffect(() => {
    if (!visible || !auto || still || !show) return;
    const wait = ep === 0 ? 1500 : ep >= total ? 2800 : 420;
    const t = window.setTimeout(() => {
      if (ep >= total) {
        setIdx((i) => (i + 1) % shows.length);
        setEp(0);
      } else {
        setEp((e) => e + 1);
      }
    }, wait);
    return () => window.clearTimeout(t);
  }, [visible, auto, still, ep, total, show, shows.length]);

  if (!show) return null;

  // manual stepping takes over from autoplay
  const logEpisode = () => {
    setAuto(false);
    if (ep >= total) {
      setIdx((i) => (i + 1) % shows.length);
      setEp(0);
    } else {
      setEp(ep + 1);
    }
  };

  const minutes = ep * 24;

  return (
    <div ref={ref} className="glass relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
      {/* warm lantern light in the corner of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, rgba(242,201,76,0.28), transparent 65%)" }}
      />
      <p className="sr-only">
        Animated demo of the tracker: a show moves from Plan to watch, to Watching as each episode is logged, to
        Completed. Use the buttons below to log episodes yourself or pause the demo.
      </p>

      <div aria-hidden className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
        {/* cover + big ring */}
        <div className="flex items-center justify-center gap-5 sm:flex-col">
          <div
            key={show.id}
            className={`relative w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-ink shadow-[6px_6px_0_var(--ink)] sm:w-44 ${s.coverSwap}`}
            style={{ background: show.color ?? "#1d2c5e" }}
          >
            <div className="relative aspect-[2/3]">
              <Image src={show.cover} alt="" fill sizes="176px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* plan-to-watch ribbon */}
              <span
                className={`absolute left-2 top-0 rounded-b-md bg-sash px-1.5 pb-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg transition-transform duration-500 ${
                  status === "plan" ? "translate-y-0" : "-translate-y-full"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Soon
              </span>
              {/* completed stamp */}
              <span
                className={`absolute inset-0 m-auto grid h-20 w-20 place-items-center rounded-full border-4 border-straw font-display text-lg leading-none tracking-wider text-straw sm:h-24 sm:w-24 sm:text-xl ${s.stamp} ${
                  status === "completed" ? s.stampOn : ""
                }`}
                style={{ background: "rgba(27,20,16,0.72)", boxShadow: "var(--glow-gold)" }}
              >
                <span className="text-center">
                  Logged
                  <br />★
                </span>
              </span>
            </div>
          </div>

          <ProgressRing value={ep / total} size={112} stroke={8} live color={status === "completed" ? "var(--straw)" : "#ff8fc2"}>
            <span className="block font-display text-3xl tracking-wide text-text">
              {ep}
              <span className="text-lg text-muted">/{total}</span>
            </span>
            <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted">eps</span>
          </ProgressRing>
        </div>

        {/* details */}
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-muted">Now in the log</p>
          <h3 key={show.id} className={`mt-1 line-clamp-2 font-display text-3xl leading-none tracking-wide text-text sm:text-4xl ${s.captionSwap}`}>
            {show.title}
          </h3>

          {/* status shelf chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABEL) as Status[]).map((k) => {
              const on = k === status;
              return (
                <span
                  key={k}
                  className={`${s.chip} rounded-full border px-3 py-1 text-xs font-extrabold ${
                    on
                      ? k === "completed"
                        ? "border-straw bg-straw text-ink"
                        : k === "watching"
                          ? "border-[#ff8fc2] bg-[#ff8fc2]/20 text-[#ffd1e6]"
                          : "border-sash bg-sash/20 text-[#ffc9cd]"
                      : "border-white/10 bg-white/5 text-muted"
                  }`}
                  style={on ? { boxShadow: k === "completed" ? "var(--glow-gold)" : "var(--glow-pink)" } : undefined}
                >
                  {STATUS_LABEL[k]}
                </span>
              );
            })}
          </div>

          {/* one bead per episode */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`h-3 w-3 rounded-full bg-white/25 sm:h-3.5 sm:w-3.5 ${s.tick} ${i < ep ? s.tickOn : ""}`} />
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 text-center sm:max-w-sm">
            {[
              ["Watched", `${ep}`],
              ["Left", `${total - ep}`],
              ["Time", minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted">{k}</dt>
                <dd className="font-display text-2xl tracking-wide text-text">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* movie-subtitle caption */}
      <p aria-hidden className="relative mt-6 text-center">
        <span key={`${show.id}-${status}-${ep}`} className={`${s.subtitle} ${s.captionSwap} inline rounded px-2 py-1 text-sm font-bold text-[#fff6d8] sm:text-base`}>
          {caption(status, ep, total)}
        </span>
      </p>

      {/* controls */}
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={logEpisode}
          className="shimmer relative overflow-hidden rounded-full bg-straw px-5 py-2.5 font-extrabold text-ink shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
        >
          {status === "completed" ? "Next show →" : "+ Log an episode"}
        </button>
        {!still && (
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-pressed={!auto}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-muted transition hover:border-straw/60 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
          >
            {auto ? "Pause demo" : "Resume demo"}
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {auto && !still ? "" : `${show.title}: ${STATUS_LABEL[status]}, ${ep} of ${total} episodes.`}
      </p>
    </div>
  );
}
