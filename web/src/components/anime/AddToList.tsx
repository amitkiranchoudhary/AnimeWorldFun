"use client";

import Link from "next/link";
import CaptainChibi from "@/components/CaptainChibi";
import { addShow, logEpisode, removeShow, SHELVES, updateEntry, useListReady, useMyList, type Shelf, type ShowInfo } from "@/lib/myList";

const btn =
  "rounded-full px-5 py-2.5 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw disabled:opacity-50";

/** "Add to My List" on an anime page; once added, it becomes a tiny log for that show. */
export default function AddToList({ show }: { show: ShowInfo }) {
  const ready = useListReady();
  const entry = useMyList()[show.id];

  // same footprint before the stored list is read, so nothing jumps on load
  if (!ready) {
    return (
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        <button type="button" disabled className={`${btn} bg-straw text-ink`}>
          ＋ Add to My List
        </button>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
        <button
          type="button"
          onClick={() => addShow(show, "planning")}
          className={`${btn} bg-straw text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink),var(--glow-gold)]`}
        >
          ＋ Add to My List
        </button>
        <button
          type="button"
          onClick={() => addShow(show, "watching")}
          className={`${btn} border border-white/20 bg-black/30 text-text hover:border-straw/60`}
        >
          ▶ I&apos;m watching it
        </button>
      </div>
    );
  }

  const total = entry.episodes;
  return (
    <div className="glass inline-flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-3xl px-4 py-3 md:justify-start">
      {entry.status === "completed" ? (
        <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-straw">
          <CaptainChibi pose="cheering" className="-my-3 w-12" /> Completed!
        </span>
      ) : (
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-straw">✓ On My List</span>
      )}
      <label className="flex items-center gap-2 text-sm font-bold">
        <span className="sr-only">Shelf</span>
        <select
          value={entry.status}
          onChange={(e) => updateEntry(show.id, { status: e.target.value as Shelf, ...(e.target.value === "completed" && total ? { progress: total } : {}) })}
          className="rounded-full border border-white/15 bg-[#1a1622] px-3 py-1.5 text-text focus-visible:outline-2 focus-visible:outline-straw"
        >
          {SHELVES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <span className="flex items-center gap-2 text-sm font-bold tabular-nums" aria-live="polite">
        Ep {entry.progress}
        {total ? ` / ${total}` : ""}
        <button
          type="button"
          onClick={() => logEpisode(show.id)}
          disabled={!!total && entry.progress >= total}
          aria-label={`Log episode ${entry.progress + 1}`}
          className="grid size-8 place-items-center rounded-full bg-sash text-base font-black text-white transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw disabled:opacity-40 disabled:hover:scale-100"
        >
          +1
        </button>
      </span>
      <Link href="/my-list#my-log" className="text-sm font-extrabold text-straw underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-straw">
        Open My List →
      </Link>
      <button
        type="button"
        onClick={() => removeShow(show.id)}
        className="text-xs font-bold text-muted underline-offset-4 hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-straw"
      >
        Remove
      </button>
    </div>
  );
}
