"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState, useTransition, type FormEvent } from "react";
import {
  backupJson,
  logEpisode,
  mergeEntries,
  parseBackup,
  removeShow,
  SHELVES,
  updateEntry,
  useListReady,
  useMyList,
  type ListEntry,
  type Shelf,
} from "@/lib/myList";
import { importFromAniList, matchMalEntries, type ImportResult } from "@/app/my-list/actions";
import ProgressRing from "./ProgressRing";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw";
// big imported lists render a page of cards at a time
const PAGE = 24;
const SORTS = { recent: "Recently updated", title: "Title A → Z", score: "My rating" } as const;
type Sort = keyof typeof SORTS;

/** The visitor's real logbook: shelves, episode logging, ratings, notes, import and backup. */
export default function MyListApp() {
  const ready = useListReady();
  const list = useMyList();
  const entries = useMemo(() => Object.values(list), [list]);
  const [picked, setPicked] = useState<Shelf | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const counts = useMemo(() => {
    const c = Object.fromEntries(SHELVES.map((s) => [s.key, 0])) as Record<Shelf, number>;
    for (const e of entries) c[e.status]++;
    return c;
  }, [entries]);

  // open the first shelf that has something on it, until the visitor picks one
  const shelf: Shelf = picked ?? SHELVES.find((s) => counts[s.key] > 0)?.key ?? "watching";

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = entries.filter((e) => e.status === shelf && (!needle || e.title.toLowerCase().includes(needle)));
    return rows.sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "score"
          ? (b.score ?? 0) - (a.score ?? 0) || b.updatedAt - a.updatedAt
          : b.updatedAt - a.updatedAt,
    );
  }, [entries, shelf, sort, q]);

  const episodes = entries.reduce((n, e) => n + e.progress, 0);
  const rated = entries.filter((e) => e.score);
  const mean = rated.length ? (rated.reduce((n, e) => n + (e.score ?? 0), 0) / rated.length).toFixed(1) : null;

  if (!ready) return <div className="glass h-72 animate-pulse rounded-[2rem]" aria-hidden />;

  return (
    <div className="space-y-8">
      {entries.length === 0 ? (
        <EmptyLog />
      ) : (
        <>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold text-muted">
            <span>
              <strong className="text-text">{entries.length}</strong> {entries.length === 1 ? "show" : "shows"}
            </span>
            <span>
              <strong className="text-text">{episodes}</strong> episodes logged
            </span>
            {mean && (
              <span>
                <strong className="text-text">★ {mean}</strong> average rating
              </span>
            )}
          </p>

          {/* shelf tabs */}
          <div role="tablist" aria-label="Shelves" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {SHELVES.map((s) => {
              const on = s.key === shelf;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setPicked(s.key);
                    setLimit(PAGE);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${focus} ${
                    on ? "bg-straw text-ink shadow-[var(--glow-gold)]" : "border border-white/15 bg-black/30 text-text hover:border-straw/60"
                  }`}
                >
                  {s.label} <span className={on ? "text-ink/70" : "text-muted"}>{counts[s.key]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search your list</span>
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setLimit(PAGE);
                }}
                placeholder="Search this shelf…"
                className={`w-full rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-text placeholder:text-white/40 ${focus}`}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-muted">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className={`rounded-full border border-white/15 bg-[#1a1622] px-3 py-2 text-text ${focus}`}
              >
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div role="tabpanel" aria-label={SHELVES.find((s) => s.key === shelf)?.label}>
            {shown.length === 0 ? (
              <p className="card px-5 py-10 text-center text-muted">
                {q ? "Nothing on this shelf matches that search." : "This shelf is empty for now."}
              </p>
            ) : (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.slice(0, limit).map((e) => (
                    <EntryCard key={e.id} e={e} />
                  ))}
                </ul>
                {shown.length > limit && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setLimit((n) => n + PAGE)}
                      className={`rounded-full border border-white/20 bg-black/30 px-5 py-2.5 text-sm font-bold text-text hover:border-straw/60 ${focus}`}
                    >
                      Show more ({shown.length - limit} left)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <ImportPanel hasList={entries.length > 0} />
    </div>
  );
}

function EmptyLog() {
  return (
    <div className="glass rounded-[2rem] px-6 py-12 text-center">
      <p className="font-display text-4xl tracking-wide text-straw">Your logbook is empty</p>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
        Open any anime and press <strong className="text-text">＋ Add to My List</strong>, or bring your list over from
        AniList or MyAnimeList below. It&apos;s saved in this browser — no account needed.
      </p>
      <Link
        href="/explore"
        className={`mt-7 inline-block rounded-full bg-straw px-6 py-3 font-display text-xl tracking-wider text-ink shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 ${focus}`}
      >
        Find a show →
      </Link>
    </div>
  );
}

function EntryCard({ e }: { e: ListEntry }) {
  const [confirm, setConfirm] = useState(false);
  const notesId = useId();
  const total = e.episodes;
  const value = total ? e.progress / total : e.status === "completed" ? 1 : 0;
  const done = !!total && e.progress >= total;

  return (
    <li className="glass relative flex gap-4 overflow-hidden rounded-3xl p-3.5">
      <Link
        href={`/anime/${e.id}`}
        className={`relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-2xl ${focus}`}
        style={{ background: e.color ?? "#1d2c5e" }}
      >
        {e.cover && <Image src={e.cover} alt="" fill sizes="96px" className="object-cover" />}
        <span className="sr-only">Open {e.title}</span>
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 font-extrabold leading-snug">
          <Link href={`/anime/${e.id}`} className={`hover:text-straw ${focus}`}>
            {e.title}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-3">
          <ProgressRing value={value} size={44} stroke={4} live color={done ? "var(--straw)" : "#ff8fc2"}>
            <span className="text-[10px] font-black">{Math.round(value * 100)}%</span>
          </ProgressRing>
          <p className="whitespace-nowrap text-sm font-bold tabular-nums" aria-live="polite">
            Ep {e.progress}
            {total ? ` / ${total}` : ""}
          </p>
          <button
            type="button"
            onClick={() => logEpisode(e.id)}
            disabled={done}
            aria-label={`Log episode ${e.progress + 1} of ${e.title}`}
            className={`ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-sash text-sm font-black text-white transition hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${focus}`}
          >
            +1
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label>
            <span className="sr-only">Shelf for {e.title}</span>
            <select
              value={e.status}
              onChange={(ev) =>
                updateEntry(e.id, { status: ev.target.value as Shelf, ...(ev.target.value === "completed" && total ? { progress: total } : {}) })
              }
              className={`rounded-full border border-white/15 bg-[#1a1622] px-2.5 py-1 text-xs font-bold text-text ${focus}`}
            >
              {SHELVES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Your rating for {e.title}</span>
            <select
              value={e.score ?? ""}
              onChange={(ev) => updateEntry(e.id, { score: ev.target.value ? Number(ev.target.value) : null })}
              className={`rounded-full border border-white/15 bg-[#1a1622] px-2.5 py-1 text-xs font-bold text-text ${focus}`}
            >
              <option value="">★ Rate</option>
              {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
                <option key={n} value={n}>
                  ★ {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <details className="group mt-2">
          <summary className={`cursor-pointer list-none text-xs font-bold text-muted hover:text-text ${focus}`}>
            {e.notes ? "✎ Your note" : "＋ Add a note"}
          </summary>
          <label htmlFor={notesId} className="sr-only">
            Note for {e.title}
          </label>
          <textarea
            id={notesId}
            defaultValue={e.notes}
            maxLength={1000}
            rows={3}
            onBlur={(ev) => ev.target.value !== e.notes && updateEntry(e.id, { notes: ev.target.value })}
            placeholder="Favourite arc, where you stopped, who recommended it…"
            className={`mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-2 text-sm text-text placeholder:text-white/35 ${focus}`}
          />
        </details>

        <div className="mt-1 text-right">
          {confirm ? (
            <span className="text-xs font-bold">
              Remove it?{" "}
              <button type="button" onClick={() => removeShow(e.id)} className={`text-sash underline ${focus}`}>
                Yes
              </button>{" "}
              ·{" "}
              <button type="button" onClick={() => setConfirm(false)} className={`text-muted underline ${focus}`}>
                No
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className={`text-xs font-bold text-muted hover:text-text ${focus}`}>
              Remove
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

const MAL_STATUS: Record<string, Shelf> = {
  watching: "watching",
  completed: "completed",
  "on-hold": "paused",
  dropped: "dropped",
  "plan to watch": "planning",
};

async function readFileText(file: File): Promise<string> {
  // MyAnimeList exports come gzipped; modern browsers can unzip them for us
  if (file.name.endsWith(".gz") && "DecompressionStream" in window) {
    return new Response(file.stream().pipeThrough(new DecompressionStream("gzip"))).text();
  }
  return file.text();
}

function parseMalXml(text: string) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const txt = (el: Element, tag: string) => el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
  return [...doc.getElementsByTagName("anime")].map((a) => ({
    malId: Number(txt(a, "series_animedb_id")),
    status: MAL_STATUS[txt(a, "my_status").toLowerCase()] ?? "planning",
    progress: Number(txt(a, "my_watched_episodes")) || 0,
    score: Number(txt(a, "my_score")) || 0,
    notes: txt(a, "my_comments"),
  }));
}

function ImportPanel({ hasList }: { hasList: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const ids = { user: useId(), mal: useId(), backup: useId(), over: useId() };

  const apply = (res: ImportResult, from: string) => {
    if (!res.ok) return setMsg({ ok: false, text: res.error });
    const { added, updated } = mergeEntries(res.entries as unknown as ListEntry[], overwrite);
    setMsg({
      ok: true,
      text: `Imported from ${from}: ${added} new ${added === 1 ? "show" : "shows"}${updated ? `, ${updated} updated` : ""}${
        !overwrite && res.entries.length > added ? ` (${res.entries.length - added} already on your list were kept as they are)` : ""
      }.`,
    });
  };

  const onAniList = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const name = String(new FormData(ev.currentTarget).get("user") ?? "");
    setMsg(null);
    start(async () => apply(await importFromAniList(name), "AniList"));
  };

  const onMal = (file: File | undefined) => {
    if (!file) return;
    setMsg(null);
    start(async () => {
      try {
        const rows = parseMalXml(await readFileText(file));
        if (!rows.length) return setMsg({ ok: false, text: "That file has no anime in it — is it a MyAnimeList export?" });
        apply(await matchMalEntries(rows), "MyAnimeList");
      } catch {
        setMsg({ ok: false, text: "Couldn't read that file. Unzip it first if your browser can't, then try the .xml." });
      }
    });
  };

  const onRestore = (file: File | undefined) => {
    if (!file) return;
    setMsg(null);
    file
      .text()
      .then((t) => {
        const rows = parseBackup(t);
        if (!rows.length) throw new Error("empty");
        const { added, updated } = mergeEntries(rows, true);
        setMsg({ ok: true, text: `Backup restored: ${added} added, ${updated} updated.` });
      })
      .catch(() => setMsg({ ok: false, text: "That isn't an Anime World Fun backup file." }));
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([backupJson()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "anime-world-fun-my-list.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileBtn = `inline-block cursor-pointer rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold text-text transition hover:border-straw/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-straw`;

  return (
    <section aria-label="Import and back up" className="glass rounded-[2rem] p-5 sm:p-7">
      <h3 className="font-display text-3xl tracking-wide text-straw">Bring your log aboard</h3>
      <p className="mt-1 text-sm text-muted">
        Imports only read your list — nothing is changed on AniList or MyAnimeList, and nothing is stored on our server.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={onAniList} className="space-y-2">
          <label htmlFor={ids.user} className="block text-sm font-extrabold">
            From AniList <span className="font-bold text-muted">(public lists)</span>
          </label>
          <div className="flex gap-2">
            <input
              id={ids.user}
              name="user"
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="Your AniList username"
              className={`min-w-0 flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-text placeholder:text-white/40 ${focus}`}
            />
            <button type="submit" disabled={pending} className={`shrink-0 rounded-full bg-straw px-4 py-2 text-sm font-extrabold text-ink disabled:opacity-60 ${focus}`}>
              {pending ? "Importing…" : "Import"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-sm font-extrabold">
            From MyAnimeList <span className="font-bold text-muted">(export file)</span>
          </p>
          <label htmlFor={ids.mal} className={fileBtn}>
            Choose your MAL export (.xml or .xml.gz)
            <input
              id={ids.mal}
              type="file"
              accept=".xml,.gz,application/xml,text/xml,application/gzip"
              className="sr-only"
              disabled={pending}
              onChange={(ev) => {
                onMal(ev.target.files?.[0]);
                ev.target.value = "";
              }}
            />
          </label>
          <p className="text-xs text-muted">
            On MyAnimeList: Profile → Export → Anime List.
          </p>
        </div>
      </div>

      <label htmlFor={ids.over} className="mt-5 flex items-center gap-2 text-sm text-muted">
        <input id={ids.over} type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="size-4 accent-[var(--straw)]" />
        When a show is already on my list, replace it with the imported one
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <span className="text-sm font-extrabold">Backup</span>
        <button type="button" onClick={download} disabled={!hasList} className={`rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold text-text hover:border-straw/60 disabled:opacity-40 ${focus}`}>
          ⤓ Download my list
        </button>
        <label htmlFor={ids.backup} className={fileBtn}>
          ⤒ Restore a backup
          <input
            id={ids.backup}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(ev) => {
              onRestore(ev.target.files?.[0]);
              ev.target.value = "";
            }}
          />
        </label>
        <span className="text-xs text-muted">Your list lives only in this browser — download a backup to move it.</span>
      </div>

      <p role="status" aria-live="polite" className={`mt-4 min-h-5 text-sm font-bold ${msg?.ok ? "text-straw" : "text-[#ff9aa2]"}`}>
        {pending ? "Working on it…" : msg?.text}
      </p>
    </section>
  );
}
