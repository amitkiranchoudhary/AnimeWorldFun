"use client";

import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type MouseEvent } from "react";
import { canSpeak, createNarrator, type Narrator, type NarratorMode } from "./narrator";
import s from "./blog.module.css";

// An original sample entry for the preview.
const SAMPLE =
  "Picture the moment the opening theme fades and the first scene breathes in. A lantern sways over a quiet harbour, the crew trades one last joke, and somewhere far off a storm is already waiting for them. That is why we love anime: it can make a single glance feel like a promise, and a goodbye feel like the start of something bigger. Every post in this log will read itself to you like this, one glowing word at a time, so you can sit back, listen, and set sail.";
const WORDS = SAMPLE.split(" ");
const N = WORDS.length;
const SPEEDS = [0.75, 1, 1.25, 1.5];

type Status = "idle" | "playing" | "paused" | "done";

// speech support never changes after load, so there is nothing to subscribe to
const subscribeNever = () => () => {};

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      {playing ? (
        <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />
      ) : (
        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
      )}
    </svg>
  );
}

/**
 * The planned read-along feature, as a working preview: press Play and each
 * word lights up as the browser's voice reads it (word-boundary events), or
 * on a timer when there is no voice. Pause, change speed, toggle the voice,
 * or click any word (or use the arrow keys) to jump there.
 */
export default function ReadAlong() {
  const speechOk = useSyncExternalStore(subscribeNever, canSpeak, () => false);
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(-1);
  const [rate, setRate] = useState(1);
  const [voiceOn, setVoiceOn] = useState(true);
  const [mode, setMode] = useState<NarratorMode | null>(null);
  const narrator = useRef<Narrator | null>(null);
  const at = useRef(-1); // the current word, for the event handlers
  const hintId = useId();

  useEffect(() => {
    const n = createNarrator(WORDS, {
      onWord: (i) => {
        at.current = i;
        setIndex(i);
      },
      onDone: () => {
        at.current = -1;
        setIndex(N);
        setStatus("done");
      },
      onMode: setMode,
    });
    narrator.current = n;
    // Chrome loads its voice list lazily; ask early so it's ready on Play
    if (canSpeak()) window.speechSynthesis.getVoices();
    return () => {
      n.stop();
    };
  }, []);

  const voice = voiceOn && speechOk;

  const start = (from: number, opts: { rate?: number; voice?: boolean } = {}) => {
    narrator.current?.play(from, { rate: opts.rate ?? rate, voice: opts.voice ?? voice });
    setStatus("playing");
  };

  const toggle = () => {
    if (status === "playing") {
      narrator.current?.stop();
      setStatus("paused");
      return;
    }
    start(at.current < 0 || at.current >= N ? 0 : at.current);
  };

  const jump = (i: number) => {
    const to = Math.max(0, Math.min(N - 1, i));
    if (status === "playing") return start(to);
    narrator.current?.stop();
    at.current = to;
    setIndex(to);
    setStatus("paused");
  };

  const changeRate = (r: number) => {
    setRate(r);
    if (status === "playing") start(Math.max(0, at.current), { rate: r });
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    if (status === "playing") start(Math.max(0, at.current), { voice: next && speechOk });
  };

  const onTextClick = (e: MouseEvent<HTMLElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
    if (el) jump(Number(el.dataset.i));
  };

  const onTextKey = (e: KeyboardEvent<HTMLElement>) => {
    const i = Math.max(0, at.current);
    const keys: Record<string, () => void> = {
      ArrowRight: () => jump(at.current < 0 ? 0 : i + 1),
      ArrowLeft: () => jump(i - 1),
      Home: () => jump(0),
      End: () => jump(N - 1),
      " ": toggle,
      Enter: toggle,
    };
    const run = keys[e.key];
    if (!run) return;
    e.preventDefault();
    run();
  };

  const playing = status === "playing";
  const progress = status === "done" ? 1 : index < 0 ? 0 : (index + 1) / N;
  const playLabel = playing ? "Pause" : status === "paused" ? "Resume" : status === "done" ? "Play again" : "Play";

  const note = !speechOk ? (
    <>
      <strong>Silent mode.</strong> This browser has no built-in narrator, so the words light up on a timer instead.
    </>
  ) : !voiceOn ? (
    <>
      <strong>Silent mode.</strong> The voice is off, so the words light up on a timer.
    </>
  ) : mode === "voice-timed" ? (
    <>
      <strong>Narrated by your browser&apos;s voice.</strong> This voice doesn&apos;t report word timing, so the
      highlight follows an estimate, re-synced each sentence.
    </>
  ) : (
    <>
      <strong>Narrated by your browser&apos;s own voice</strong>, word by word. The finished feature will use the
      writer&apos;s recorded narration.
    </>
  );

  const live =
    status === "playing"
      ? `Reading${voice ? " aloud" : ""} at ${rate} times speed.`
      : status === "paused"
        ? `Paused at word ${index + 1} of ${N}: ${WORDS[index] ?? ""}`
        : status === "done"
          ? "Finished. Press Play again to hear it once more."
          : "";

  return (
    <div className={`glass ${s.panel} ${playing ? s.playing : ""} ${status === "paused" ? s.paused : ""}`}>
      <div className={s.panelTop}>
        <span className={s.badge}>
          <span aria-hidden className={s.dot} /> Preview · Phase 4
        </span>
        <p className={s.entryName}>Sample log · &ldquo;Why we watch&rdquo;</p>
      </div>

      <div
        className={s.textBox}
        tabIndex={0}
        role="group"
        aria-label="Sample log entry. Click a word, or use the arrow keys, to choose where reading starts."
        aria-describedby={hintId}
        onClick={onTextClick}
        onKeyDown={onTextKey}
      >
        <p className={s.readText} lang="en">
          {WORDS.map((w, i) => (
            <Fragment key={i}>
              <span
                data-i={i}
                data-state={i < index ? "read" : i === index ? "now" : undefined}
                aria-current={i === index ? "true" : undefined}
                className={s.word}
              >
                {w}
              </span>{" "}
            </Fragment>
          ))}
        </p>
      </div>

      <div aria-hidden className={s.progress}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className={s.controls}>
        <button type="button" onClick={toggle} className={`${s.btn} shimmer`}>
          <PlayIcon playing={playing} />
          {playLabel}
          {playing && voice && (
            <span aria-hidden className={s.eq}>
              <span />
              <span />
              <span />
            </span>
          )}
        </button>

        <button
          type="button"
          className={s.iconBtn}
          onClick={() => start(0)}
          aria-label="Restart from the beginning"
          title="Restart"
        >
          <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v6h6" />
          </svg>
        </button>

        <div role="group" aria-label="Reading speed" className="flex items-center gap-2">
          <span aria-hidden className={s.ctrlLabel}>
            Speed
          </span>
          <span className={s.seg}>
            {SPEEDS.map((r) => (
              <button
                key={r}
                type="button"
                className={s.segBtn}
                aria-pressed={rate === r}
                aria-label={`${r} times speed`}
                onClick={() => changeRate(r)}
              >
                {r}×
              </button>
            ))}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={voice}
          disabled={!speechOk}
          onClick={toggleVoice}
          className={s.switch}
        >
          <span aria-hidden className={s.switchKnob} />
          Voice
        </button>
      </div>

      <p className={s.modeNote}>{note}</p>
      <p id={hintId} className={s.modeNote} style={{ marginTop: "0.3rem" }}>
        Tip: click any word to jump there. With the text focused, ← and → move word by word, and Space plays or
        pauses.
      </p>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
