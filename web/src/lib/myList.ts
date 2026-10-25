import { useSyncExternalStore } from "react";

// The visitor's own anime list. There are no visitor accounts, so it lives in
// this browser's localStorage (key below) and never leaves the device unless
// the visitor downloads a backup. Only client components should import this.

export const LIST_KEY = "awf-my-list";

export const SHELVES = [
  { key: "watching", label: "Watching", short: "Watching" },
  { key: "planning", label: "Plan to watch", short: "Planned" },
  { key: "completed", label: "Completed", short: "Done" },
  { key: "paused", label: "On hold", short: "On hold" },
  { key: "dropped", label: "Dropped", short: "Dropped" },
] as const;

export type Shelf = (typeof SHELVES)[number]["key"];

export type ListEntry = {
  id: number; // AniList id
  title: string;
  cover: string;
  color: string | null;
  episodes: number | null;
  format: string | null;
  status: Shelf;
  progress: number;
  score: number | null; // 1–10, or null when unrated
  notes: string;
  updatedAt: number;
};

/** What a page knows about a show when it's added (the rest gets defaults). */
export type ShowInfo = Pick<ListEntry, "id" | "title" | "cover" | "color" | "episodes" | "format">;

type Store = Record<string, ListEntry>;

const EMPTY: Store = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedStore: Store = EMPTY;

const isShelf = (v: unknown): v is Shelf => SHELVES.some((s) => s.key === v);

// Keep only well-formed entries, so a hand-edited or old backup can't break the page
function clean(input: unknown): Store {
  const out: Store = {};
  if (!input || typeof input !== "object") return out;
  for (const e of Object.values(input as Record<string, unknown>)) {
    if (!e || typeof e !== "object") continue;
    const r = e as Partial<ListEntry>;
    const id = Number(r.id);
    if (!Number.isInteger(id) || id <= 0 || typeof r.title !== "string" || !isShelf(r.status)) continue;
    const episodes = typeof r.episodes === "number" && r.episodes > 0 ? r.episodes : null;
    const progress = Math.max(0, Math.min(Math.floor(Number(r.progress) || 0), episodes ?? 9999));
    const score = typeof r.score === "number" && r.score >= 1 && r.score <= 10 ? Math.round(r.score) : null;
    out[id] = {
      id,
      title: r.title.slice(0, 200),
      // covers only ever come from AniList's CDN (the only host next/image allows)
      cover: typeof r.cover === "string" && r.cover.startsWith("https://s4.anilist.co/") ? r.cover : "",
      color: typeof r.color === "string" && /^#[0-9a-f]{3,8}$/i.test(r.color) ? r.color : null,
      episodes,
      format: typeof r.format === "string" ? r.format.slice(0, 20) : null,
      status: r.status,
      progress,
      score,
      notes: typeof r.notes === "string" ? r.notes.slice(0, 1000) : "",
      updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
    };
  }
  return out;
}

function read(): Store {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LIST_KEY);
  } catch {
    // storage blocked (private mode, settings): behave as an empty list
  }
  if (raw === cachedRaw) return cachedStore;
  cachedRaw = raw;
  try {
    cachedStore = raw ? clean(JSON.parse(raw).entries) : EMPTY;
  } catch {
    cachedStore = EMPTY;
  }
  return cachedStore;
}

function write(next: Store) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify({ v: 1, entries: next }));
  } catch {
    // full or blocked: keep the in-memory copy so this visit still works
    cachedRaw = null;
    cachedStore = next;
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // another tab changed the list
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIST_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The whole list (empty on the server and during hydration). */
export function useMyList(): Store {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** True once we're on the client and the stored list has been read. */
export function useListReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function addShow(show: ShowInfo, status: Shelf = "planning") {
  const store = read();
  const prev = store[show.id];
  const entry: ListEntry = prev
    ? { ...prev, ...show, status, updatedAt: Date.now() }
    : { ...show, status, progress: 0, score: null, notes: "", updatedAt: Date.now() };
  if (status === "completed" && entry.episodes) entry.progress = entry.episodes;
  write({ ...store, [show.id]: entry });
}

export function updateEntry(id: number, patch: Partial<Omit<ListEntry, "id">>) {
  const store = read();
  const prev = store[id];
  if (!prev) return;
  const next = clean({ x: { ...prev, ...patch, updatedAt: Date.now() } })[id];
  if (next) write({ ...store, [id]: next });
}

/** Log one more episode; finishing the last one stamps the show Completed. */
export function logEpisode(id: number) {
  const e = read()[id];
  if (!e) return;
  const progress = e.episodes ? Math.min(e.progress + 1, e.episodes) : e.progress + 1;
  const done = !!e.episodes && progress >= e.episodes;
  updateEntry(id, {
    progress,
    status: done ? "completed" : e.status === "planning" || e.status === "paused" ? "watching" : e.status,
  });
}

export function removeShow(id: number) {
  const store = { ...read() };
  delete store[id];
  write(store);
}

/** Merge imported entries; with `overwrite` false, shows already on the list are kept as they are. */
export function mergeEntries(entries: ListEntry[], overwrite: boolean): { added: number; updated: number } {
  const store = { ...read() };
  let added = 0;
  let updated = 0;
  for (const e of Object.values(clean(Object.fromEntries(entries.map((x) => [x.id, x]))))) {
    if (store[e.id]) {
      if (!overwrite) continue;
      updated++;
    } else added++;
    store[e.id] = { ...e, updatedAt: e.updatedAt || Date.now() };
  }
  write(store);
  return { added, updated };
}

/** Parse a backup file made by downloadBackup(). */
export function parseBackup(text: string): ListEntry[] {
  const data = JSON.parse(text);
  return Object.values(clean(data?.entries ?? data));
}

export function backupJson(): string {
  return JSON.stringify({ v: 1, app: "Anime World Fun", entries: read() }, null, 2);
}
