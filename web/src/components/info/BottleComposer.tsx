"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ISSUES_URL } from "./links";
import { Bottle } from "./Sea";

const KINDS = [
  { id: "stream", label: "Wrong stream or dub info", prefix: "[Where to watch]" },
  { id: "bug", label: "Something's broken", prefix: "[Bug]" },
  { id: "idea", label: "An idea", prefix: "[Idea]" },
  { id: "hello", label: "Just saying hi", prefix: "[Hello]" },
] as const;

type Kind = (typeof KINDS)[number]["id"];

const MAX = 1500;

/**
 * "Message in a bottle": write a note on parchment, cork it, and cast it.
 * There is no backend — casting opens GitHub's "new issue" form in a new tab
 * with the note filled in (it travels in that page's address), and nothing is
 * posted until you press "Submit new issue" there. Our server never sees it;
 * the draft lives only in this page's memory.
 */
export default function BottleComposer() {
  const uid = useId();
  const [kind, setKind] = useState<Kind>("stream");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [cast, setCast] = useState(false);
  const [hint, setHint] = useState("");
  const doneRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const wasCast = useRef(false);

  // the form goes inert while the bottle sails, so move keyboard focus with it:
  // onto the "cast" panel, and back to the message when writing another
  useEffect(() => {
    if (cast) doneRef.current?.focus({ preventScroll: true });
    else if (wasCast.current) messageRef.current?.focus({ preventScroll: true });
    wasCast.current = cast;
  }, [cast]);

  const prefix = KINDS.find((k) => k.id === kind)!.prefix;
  const title = `${prefix} ${subject.trim() || "A message in a bottle"}`;
  const body = `${message.trim()}\n\n---\n_Cast from the Anime World Fun contact page._`;
  const href = `${ISSUES_URL}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

  const onCast = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!message.trim()) {
      e.preventDefault();
      setHint("Write a few words on the parchment first.");
      return;
    }
    setHint("");
    setCast(true); // the link itself opens GitHub in a new tab
  };

  const reset = () => {
    setCast(false);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="bottle-composer relative" data-cast={cast ? "" : undefined}>
      <form
        className="parchment letter relative rounded-[1.6rem] border-2 border-ink p-5 shadow-[8px_8px_0_var(--ink)] sm:p-8"
        onSubmit={(e) => e.preventDefault()}
        inert={cast}
        aria-describedby={`${uid}-note`}
      >
        <fieldset>
          <legend className="font-display text-2xl tracking-wide text-ink sm:text-3xl">What&apos;s in your bottle?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <label key={k.id} className="kind-chip cursor-pointer">
                <input
                  type="radio"
                  name={`${uid}-kind`}
                  value={k.id}
                  checked={kind === k.id}
                  onChange={() => setKind(k.id)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border-2 border-ink px-3 py-1.5 text-sm font-extrabold text-ink transition-colors peer-checked:bg-ink peer-checked:text-parchment peer-focus-visible:ring-2 peer-focus-visible:ring-sash peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-parchment">
                  {k.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor={`${uid}-subject`} className="mt-6 block text-xs font-extrabold uppercase tracking-[0.2em] text-ink/70">
          Subject <span className="font-bold normal-case tracking-normal text-ink/70">(optional)</span>
        </label>
        <input
          id={`${uid}-subject`}
          value={subject}
          onChange={(e) => setSubject(e.target.value.slice(0, 120))}
          placeholder="e.g. The dub info on a show page is out of date"
          className="mt-1.5 w-full rounded-xl border-2 border-ink/70 bg-white/40 px-4 py-2.5 font-bold text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none focus:ring-2 focus:ring-sash"
        />

        <label htmlFor={`${uid}-message`} className="mt-5 block text-xs font-extrabold uppercase tracking-[0.2em] text-ink/70">
          Your message
        </label>
        <textarea
          ref={messageRef}
          id={`${uid}-message`}
          aria-describedby={`${uid}-count`}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          rows={6}
          placeholder="Dear Captain…"
          className="letter-lines mt-1.5 w-full resize-y rounded-xl border-2 border-ink/70 bg-white/30 px-4 py-3 font-semibold leading-8 text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none focus:ring-2 focus:ring-sash"
        />
        <p id={`${uid}-count`} className="mt-1 text-right text-xs font-bold text-ink/70">
          {message.length} / {MAX}
        </p>

        <p id={`${uid}-note`} className="mt-3 text-sm leading-relaxed text-ink/75">
          Casting opens GitHub in a new tab with your note filled in. Nothing is posted until you press{" "}
          <strong>Submit new issue</strong> there (you&apos;ll need a free GitHub account). Issues are public, so please
          leave out personal details.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCast}
            className="shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-sash px-6 py-3 font-extrabold text-white shadow-[4px_4px_0_var(--ink)] outline-none transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ink"
          >
            Cork it &amp; cast it <span aria-hidden>🌊</span>
            <span className="sr-only">(opens GitHub in a new tab)</span>
          </a>
          <p className="text-sm font-bold text-sash">{hint}</p>
        </div>
      </form>

      {/* one always-present live region (outside the inert form) for announcements */}
      <p className="sr-only" role="status">
        {cast ? "Bottle cast! It's waiting for you on GitHub in a new tab." : hint}
      </p>

      {/* after casting: the bottle sails away, with a note on what happens next */}
      <div className="cast-scene pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden={!cast}>
        <Bottle className="cast-bottle w-48 sm:w-64" />
      </div>
      <div className="cast-done absolute inset-0 grid place-items-center p-6 text-center" hidden={!cast}>
        <div
          ref={doneRef}
          tabIndex={-1}
          aria-labelledby={`${uid}-done`}
          className="glass max-w-sm rounded-3xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-straw"
        >
          <p id={`${uid}-done`} className="font-display text-3xl tracking-wide text-straw text-glow-gold">Bottle cast!</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            It&apos;s waiting for you on GitHub. Press <strong className="text-text">Submit new issue</strong> there to send it
            on its way. The captain answers right on the issue.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full border border-white/20 px-5 py-2 text-sm font-extrabold text-text outline-none transition-colors hover:border-straw hover:text-straw focus-visible:ring-2 focus-visible:ring-straw"
          >
            Write another bottle
          </button>
        </div>
      </div>

      <style href="awf-bottle-composer" precedence="default">{`
        .letter { transition: transform .9s var(--ease-out), opacity .7s var(--ease-out), filter .7s var(--ease-out); transform-origin: 50% 0%; }
        .letter-lines {
          background-image: repeating-linear-gradient(to bottom, transparent 0 31px, rgba(27,20,16,0.12) 31px 32px);
          background-attachment: local;
          background-position: 0 11px;
        }
        .bottle-composer[data-cast] .letter { transform: scaleY(0.04) scaleX(0.4); opacity: 0; filter: blur(6px); pointer-events: none; }
        .cast-bottle { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.6); }
        .bottle-composer[data-cast] .cast-bottle { animation: bottle-away 2.6s var(--ease-out) .35s both; }
        .bottle-composer[data-cast] .cast-done { animation: cast-done-in .8s var(--ease-out) 1.5s both; }
        @keyframes cast-done-in { from { opacity: 0; transform: translate3d(0, 14px, 0); } to { opacity: 1; transform: none; } }
        @keyframes bottle-away {
          0% { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.6) rotate(0deg); }
          25% { opacity: 1; transform: translate3d(0, -10px, 0) scale(1) rotate(-8deg); }
          55% { opacity: 1; transform: translate3d(10vw, 4px, 0) scale(0.8) rotate(8deg); }
          100% { opacity: 0; transform: translate3d(40vw, -30px, 0) scale(0.35) rotate(-6deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bottle-composer[data-cast] .cast-bottle { animation: none; opacity: 0; }
          .bottle-composer[data-cast] .cast-done { animation: none; }
        }
      `}</style>
    </div>
  );
}
