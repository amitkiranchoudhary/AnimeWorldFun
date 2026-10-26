"use client";

import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type MouseEvent } from "react";
import { bestVoice, canSpeak, createNarrator, englishVoices, savedVoiceName, saveVoiceName, voicesReady, type Narrator, type NarratorMode } from "./narrator";
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
const onClient = () => true;
const onServer = () => false;

const isSentenceEnd = (w: string) => /[.!?]["”’)]?$/.test(w);
// the sentence each word belongs to, as [start, end] word indexes (for the subtitle)
const SENTENCES: [number, number][] = [];
for (let i = 0, start = 0; i < N; i++) {
  if (isSentenceEnd(WORDS[i]) || i === N - 1) {
    SENTENCES.push([start, i]);
    start = i + 1;
  }
}
const sentenceOf = (i: number) => SENTENCES.find(([a, b]) => i >= a && i <= b) ?? null;

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
  const speechOk = useSyncExternalStore(subscribeNever, canSpeak, onServer);
  // false on the server and first paint, so the note doesn't flash "no narrator"
  const known = useSyncExternalStore(subscribeNever, onClient, onServer);
  const panelRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(-1);
  const [rate, setRate] = useState(1);
  const [voiceOn, setVoiceOn] = useState(true);
  const [mode, setMode] = useState<NarratorMode | null>(null);
  const [voiceList, setVoiceList] = useState<string[]>([]);
  const [voiceName, setVoiceName] = useState("");
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
    let alive = true;
    voicesReady().then(() => {
      if (!alive) return;
      setVoiceList(englishVoices().map((v) => v.name));
      const saved = savedVoiceName();
      setVoiceName(englishVoices().some((v) => v.name === saved) ? saved : "");
    });
    // Stop speaking when the route is hidden (Next keeps it in <Activity>),
    // unmounted, or the page is left; at.current is kept so Resume picks up here.
    const halt = () => {
      n.stop();
      setStatus((st) => (st === "playing" ? "paused" : st));
    };
    window.addEventListener("pagehide", halt);
    return () => {
      alive = false;
      window.removeEventListener("pagehide", halt);
      halt();
    };
  }, []);

  // cinema mode: while playing, the whole chapter dims around the panel
  const playingNow = status === "playing";
  useEffect(() => {
    const sec = panelRef.current?.closest("section");
    if (!sec) return;
    sec.toggleAttribute("data-cinema", playingNow);
    return () => sec.removeAttribute("data-cinema");
  }, [playingNow]);

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

  const chooseVoice = (name: string) => {
    saveVoiceName(name);
    setVoiceName(name);
    if (status === "playing") start(Math.max(0, at.current));
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

  // the voice really is speaking (not fallen back to the silent timer)
  const aloud = voice && mode !== "timed";

  const note = !known ? (
    <>Press Play to hear it read aloud, one glowing word at a time.</>
  ) : !speechOk ? (
    <>
      <strong>Silent mode.</strong> This browser has no built-in narrator, so the words light up on a timer instead.
    </>
  ) : !voiceOn ? (
    <>
      <strong>Silent mode.</strong> The voice is off, so the words light up on a timer.
    </>
  ) : mode === "timed" ? (
    <>
      <strong>Silent mode.</strong> Your browser&apos;s voice didn&apos;t start, so the words light up on a timer
      instead.
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
      ? `Reading${aloud ? " aloud" : ""} at ${rate} times speed.`
      : status === "paused"
        ? `Paused at word ${index + 1} of ${N}: ${WORDS[index] ?? ""}`
        : status === "done"
          ? "Finished. Press Play again to hear it once more."
          : "";

  const sentence = playing && index >= 0 ? sentenceOf(index) : null;

  return (
    <>
    <div
      ref={panelRef}
      className={`glass ${s.panel} ${playing ? s.playing : ""} ${status === "paused" ? s.paused : ""}`}
    >
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
          {playing && aloud && (
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

        {speechOk && voiceList.length > 0 && (
          <label className="flex items-center gap-2">
            <span className={s.ctrlLabel}>Reader</span>
            <select
              value={voiceName}
              onChange={(e) => chooseVoice(e.target.value)}
              className="max-w-[12rem] rounded-lg border border-white/20 bg-transparent px-2 py-1 text-sm"
            >
              <option value="">Auto: {bestVoice()?.name ?? "calm female"}</option>
              {voiceList.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
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

    {/* Cinema mode's movie subtitle: the line being read, under the "screen".
        Decorative, since the same words are in the panel above. */}
    <div aria-hidden className={`${s.subs} ${s.readSubs}`}>
      {sentence && (
        <span key={sentence[0]} className={s.sub}>
          {WORDS.slice(sentence[0], sentence[1] + 1).map((w, j) => {
            const i = sentence[0] + j;
            return (
              <Fragment key={i}>
                <span className={i === index ? s.subNow : undefined}>{w}</span>{" "}
              </Fragment>
            );
          })}
        </span>
      )}
    </div>
    </>
  );
}
