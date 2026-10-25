"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { canSpeak, createNarrator, type Narrator } from "./narrator";
import { estimateTimings, wordAt } from "./timings";
import s from "./post.module.css";

type Status = "idle" | "playing" | "paused";
const RATES = [0.75, 1, 1.25, 1.5];
const noop = () => () => {};

/**
 * The read-along for a blog post. With the owner's recording it plays the audio
 * and lights each word as it's spoken (from the Studio's timings, or estimated
 * when there are none); without one, the browser's voice reads the post.
 * Words are the <span data-w> elements renderMarkdown() put in `children`.
 */
export default function PostReader({
  words,
  audio,
  timings: timingsUrl,
  children,
}: {
  words: string[];
  audio: string | null;
  timings: string | null;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLAudioElement>(null);
  const narrator = useRef<Narrator | null>(null);
  const times = useRef<number[] | null>(null);
  const spans = useRef<HTMLElement[]>([]);
  const on = useRef(-1);
  const follow = useRef(true);
  const [status, setStatus] = useState<Status>("idle");
  const [rate, setRate] = useState(1);
  const [at, setAt] = useState(0);
  const [synced, setSynced] = useState<"exact" | "rough" | null>(null);
  const client = useSyncExternalStore(noop, () => true, () => false);
  const speech = useSyncExternalStore(noop, canSpeak, () => false);

  // light word i (and keep it on screen while following along)
  const light = (i: number) => {
    if (i === on.current) return;
    spans.current[on.current]?.removeAttribute("data-on");
    on.current = i;
    const el = spans.current[i];
    if (!el) return;
    el.setAttribute("data-on", "");
    setAt(i);
    if (!follow.current) return;
    const r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 140) {
      const y = window.scrollY + r.top - window.innerHeight * 0.4;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y, { duration: 0.8 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const lightRef = useRef(light);
  useEffect(() => {
    lightRef.current = light;
  });

  useEffect(() => {
    spans.current = [...(box.current?.querySelectorAll<HTMLElement>("[data-w]") ?? [])];
    // the visitor scrolling by hand stops the auto-follow until the next play
    const manual = () => {
      follow.current = false;
    };
    window.addEventListener("wheel", manual, { passive: true });
    window.addEventListener("touchmove", manual, { passive: true });

    if (!audio) {
      narrator.current = createNarrator(words, {
        onWord: (i) => lightRef.current(i),
        onDone: () => setStatus("idle"),
        onMode: () => {},
      });
    }
    const halt = () => {
      narrator.current?.stop();
      player.current?.pause();
      setStatus((st) => (st === "playing" ? "paused" : st));
    };
    window.addEventListener("pagehide", halt);
    return () => {
      halt();
      window.removeEventListener("pagehide", halt);
      window.removeEventListener("wheel", manual);
      window.removeEventListener("touchmove", manual);
    };
  }, [audio, words]);

  // with a recording: follow its clock
  useEffect(() => {
    if (!audio || status !== "playing") return;
    let raf = 0;
    const loop = () => {
      const a = player.current;
      if (a && times.current) lightRef.current(wordAt(times.current, a.currentTime));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [audio, status]);

  async function ensureTimes() {
    if (times.current) return;
    const a = player.current;
    if (timingsUrl) {
      try {
        const data = await (await fetch(timingsUrl)).json();
        const t = Array.isArray(data) ? data : data?.words;
        if (Array.isArray(t) && t.length === words.length && t.every((x) => typeof x === "number")) {
          times.current = t;
          setSynced("exact");
          return;
        }
      } catch {
        // fall through to an estimate
      }
    }
    if (a && !Number.isFinite(a.duration)) {
      await new Promise<void>((ok) => a.addEventListener("loadedmetadata", () => ok(), { once: true }));
    }
    times.current = estimateTimings(words, a?.duration || words.length * 0.4);
    setSynced("rough");
  }

  async function play(from = Math.max(0, on.current)) {
    follow.current = true;
    if (audio) {
      const a = player.current;
      if (!a) return;
      await ensureTimes();
      a.playbackRate = rate;
      if (from !== on.current || a.ended) a.currentTime = times.current?.[from] ?? 0;
      try {
        await a.play();
        setStatus("playing");
      } catch {
        setStatus("paused");
      }
    } else {
      narrator.current?.play(from, { rate, voice: speech });
      setStatus("playing");
    }
  }

  function pause() {
    if (audio) player.current?.pause();
    else narrator.current?.stop();
    setStatus("paused");
  }

  function restart() {
    spans.current[on.current]?.removeAttribute("data-on");
    on.current = -1;
    setAt(0);
    if (status === "playing") void play(0);
    else {
      if (player.current) player.current.currentTime = 0;
      setStatus("idle");
    }
  }

  function changeRate(r: number) {
    setRate(r);
    if (audio && player.current) player.current.playbackRate = r;
    else if (status === "playing") narrator.current?.play(Math.max(0, on.current), { rate: r, voice: speech });
  }

  // click a word to jump there (links still work as links)
  function onClick(e: React.MouseEvent) {
    const t = e.target as HTMLElement;
    if (status === "idle" || t.closest("a")) return;
    const w = t.closest<HTMLElement>("[data-w]");
    if (!w) return;
    const i = Number(w.dataset.w);
    light(i);
    void play(i);
  }

  const pct = words.length ? Math.round(((at + 1) / words.length) * 100) : 0;
  const mode = audio
    ? "Your recording"
    : speech
      ? "Read by your browser's voice"
      : "Silent mode: words light up on a timer";

  return (
    <div className={s.reader} data-reading={status !== "idle" ? "" : undefined}>
      {audio && (
        <audio
          ref={player}
          src={audio}
          preload="metadata"
          onEnded={() => setStatus("idle")}
          onPause={() => setStatus((st) => (st === "playing" ? "paused" : st))}
        />
      )}

      <div className={`${s.bar} glass`} role="group" aria-label="Read-along player">
        <button
          type="button"
          onClick={() => (status === "playing" ? pause() : void play())}
          disabled={!client}
          className={s.play}
        >
          <span aria-hidden>{status === "playing" ? "❚❚" : "▶"}</span>
          {status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Listen"}
        </button>
        <button type="button" onClick={restart} className={s.small} aria-label="Start again from the top" disabled={!client}>
          ↺
        </button>
        <div className={s.rates} role="radiogroup" aria-label="Speed">
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={rate === r}
              onClick={() => changeRate(r)}
              className={rate === r ? s.rateOn : s.rate}
            >
              {r}×
            </button>
          ))}
        </div>
        <p className={s.mode}>
          {mode}
          {synced === "rough" && " · timing estimated"}
        </p>
        <div aria-hidden className={s.progress}>
          <span style={{ width: `${status === "idle" && at === 0 ? 0 : pct}%` }} />
        </div>
        <p className="sr-only" aria-live="polite">
          {status === "playing" ? "Reading aloud" : status === "paused" ? `Paused at word ${at + 1} of ${words.length}` : ""}
        </p>
      </div>

      {/* the article itself; words light up as they're read */}
      <div ref={box} onClick={onClick} className={s.body}>
        {children}
      </div>
    </div>
  );
}
