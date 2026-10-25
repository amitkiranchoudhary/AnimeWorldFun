"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { renderMarkdown, readMinutes } from "@/lib/markdown";
import { estimateTimings, sentenceStarts, wordAt } from "@/components/blog/timings";
import post from "@/components/blog/post.module.css";

// The owner's writing desk. Everything happens in this browser: the draft is
// kept in localStorage (DRAFT_KEY) so a refresh never loses it, the recording
// is only played locally, and the results are downloaded as files to commit
// (see web/content/blog/README.md). Nothing is uploaded anywhere.

const DRAFT_KEY = "awf-studio-draft";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw";
const field = `w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-text placeholder:text-white/35 ${focus}`;

type Draft = { title: string; slug: string; date: string; summary: string; tags: string; anime: string; body: string };

const STARTER = `Start with a hook — the moment that made you want to write this.

## Why it hits

Say it the way you'd say it to a friend. **Bold** the big idea, hide ||spoilers||, and link to [an anime](/anime/21).

- One point
- Another point
`;

const slugify = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70)
    .replace(/^-|-$/g, "");

const noop = () => () => {};

// today in the owner's own time zone (toISOString would give the UTC date)
const today = () => new Date().toLocaleDateString("en-CA");

function loadDraft(): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    return d && typeof d.body === "string" ? d : null;
  } catch {
    return null;
  }
}

function save(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

export default function BlogWriter() {
  const client = useSyncExternalStore(noop, () => true, () => false);
  if (!client) return <div className="glass h-96 animate-pulse rounded-3xl" aria-hidden />;
  return <Desk />;
}

function Desk() {
  const [d, setD] = useState<Draft>(
    () =>
      loadDraft() ?? {
        title: "",
        slug: "",
        date: today(),
        summary: "",
        tags: "",
        anime: "",
        body: STARTER,
      },
  );
  const [slugTouched, setSlugTouched] = useState(() => !!loadDraft()?.slug);
  const ids = { title: useId(), slug: useId(), date: useId(), summary: useId(), tags: useId(), anime: useId(), body: useId(), audio: useId() };

  // autosave the draft (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      } catch {
        // storage full or blocked: the downloads still work
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [d]);

  const set = (k: keyof Draft) => (e: { target: { value: string } }) =>
    setD((prev) => {
      const next = { ...prev, [k]: e.target.value };
      if (k === "title" && !slugTouched) next.slug = slugify(e.target.value);
      return next;
    });

  const { nodes, words } = useMemo(() => renderMarkdown(d.body), [d.body]);
  const slug = d.slug || "my-post";

  /* ── voice: a local recording, synced by tapping each sentence ── */
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState("");
  const [duration, setDuration] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [anchors, setAnchors] = useState<Map<number, number>>(new Map());
  const [tapIdx, setTapIdx] = useState(0);
  const player = useRef<HTMLAudioElement>(null);
  const previewBox = useRef<HTMLDivElement>(null);
  const starts = useMemo(() => sentenceStarts(words), [words]);
  const times = useMemo(() => (duration ? estimateTimings(words, duration, anchors) : null), [words, duration, anchors]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  // light the preview word under the playhead
  useEffect(() => {
    const a = player.current;
    const box = previewBox.current;
    if (!a || !box || !times) return;
    let raf = 0;
    let lit: Element | null = null;
    const loop = () => {
      if (!a.paused) {
        const el = box.querySelector(`[data-w="${wordAt(times, a.currentTime)}"]`);
        if (el !== lit) {
          lit?.removeAttribute("data-on");
          el?.setAttribute("data-on", "");
          lit = el;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lit?.removeAttribute("data-on");
    };
  }, [times, audioUrl]);

  const startSync = async () => {
    const a = player.current;
    if (!a) return;
    a.currentTime = 0;
    setAnchors(new Map([[0, 0]]));
    setTapIdx(1);
    setSyncing(true);
    try {
      await a.play();
    } catch {
      setSyncing(false);
    }
  };

  const tap = () => {
    const a = player.current;
    if (!a || !syncing || tapIdx >= starts.length) return;
    const t = a.currentTime;
    setAnchors((m) => new Map(m).set(starts[tapIdx], t));
    setTapIdx((i) => i + 1);
  };

  // Space / Enter taps while syncing (anywhere on the page)
  const tapRef = useRef(tap);
  useEffect(() => {
    tapRef.current = tap;
  });
  useEffect(() => {
    if (!syncing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        tapRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [syncing]);

  const mdFile = () => {
    const lines = [
      "---",
      `title: ${d.title || "Untitled"}`,
      `date: ${d.date}`,
      d.summary && `summary: ${d.summary.replace(/\n/g, " ")}`,
      d.tags && `tags: ${d.tags}`,
      /^\d+$/.test(d.anime) && `anime: ${d.anime}`,
      audioUrl && `audio: /audio/${slug}.${audioName.split(".").pop()?.toLowerCase() || "mp3"}`,
      audioUrl && times && `timings: /audio/${slug}.json`,
      "---",
    ].filter(Boolean);
    return `${lines.join("\n")}\n\n${d.body.trim()}\n`;
  };

  const nextSentence = starts[tapIdx] !== undefined ? words.slice(starts[tapIdx], starts[tapIdx] + 8).join(" ") : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── the desk ─────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <label htmlFor={ids.title} className="text-sm font-extrabold">Title</label>
          <input id={ids.title} value={d.title} onChange={set("title")} placeholder="The One Piece watch order, without the filler" className={`${field} mt-1 font-bold`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor={ids.slug} className="text-sm font-extrabold">
              Address <span className="font-bold text-muted">/blog/…</span>
            </label>
            <input
              id={ids.slug}
              value={d.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setD((p) => ({ ...p, slug: slugify(e.target.value) }));
              }}
              placeholder="one-piece-watch-order"
              className={`${field} mt-1 font-mono text-sm`}
            />
          </div>
          <div>
            <label htmlFor={ids.date} className="text-sm font-extrabold">Date</label>
            <input id={ids.date} type="date" value={d.date} onChange={set("date")} className={`${field} mt-1`} />
          </div>
        </div>
        <div>
          <label htmlFor={ids.summary} className="text-sm font-extrabold">Summary</label>
          <textarea id={ids.summary} value={d.summary} onChange={set("summary")} rows={2} placeholder="One or two sentences for the blog page and Google." className={`${field} mt-1`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <div>
            <label htmlFor={ids.tags} className="text-sm font-extrabold">Tags <span className="font-bold text-muted">(comma separated)</span></label>
            <input id={ids.tags} value={d.tags} onChange={set("tags")} placeholder="One Piece, guide" className={`${field} mt-1`} />
          </div>
          <div>
            <label htmlFor={ids.anime} className="text-sm font-extrabold">Anime no.</label>
            <input id={ids.anime} value={d.anime} onChange={set("anime")} inputMode="numeric" placeholder="21" className={`${field} mt-1`} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted">Anime no. = the number in that anime&apos;s address here (/anime/21 → 21). Its art becomes the cover.</p>
        <div>
          <label htmlFor={ids.body} className="text-sm font-extrabold">The post</label>
          <textarea id={ids.body} value={d.body} onChange={set("body")} rows={18} spellCheck className={`${field} mt-1 font-mono text-sm leading-relaxed`} />
          <p className="mt-1 text-xs text-muted">
            ## heading · **bold** · *italic* · - list · &gt; quote · [link](/anime/21) · ||spoiler|| · --- divider
          </p>
        </div>

        {/* ── voice ──────────────────────────────────── */}
        <section id="voice" aria-label="Your recording" className="glass scroll-mt-28 space-y-3 rounded-3xl p-5">
          <h2 className="font-display text-2xl tracking-wide text-straw">🎙️ Your voice</h2>
          <p className="text-sm text-muted">
            Load your recording of this post (it stays on this computer). Press <strong className="text-text">Sync</strong>, then
            tap <kbd className="rounded bg-white/10 px-1.5">Space</kbd> or the big button at the start of each sentence as you
            hear it. The words in between are timed for you.
          </p>
          <label htmlFor={ids.audio} className={`inline-block cursor-pointer rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold hover:border-straw/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-straw`}>
            {audioName ? `🎧 ${audioName}` : "Choose a recording (mp3, m4a, wav…)"}
            <input
              id={ids.audio}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setAudioUrl(URL.createObjectURL(f));
                setAudioName(f.name);
                setAnchors(new Map());
                setSyncing(false);
              }}
            />
          </label>
          {audioUrl && (
            <>
              <audio
                ref={player}
                src={audioUrl}
                controls
                className="w-full"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setSyncing(false)}
              />
              <div className="flex flex-wrap items-center gap-3">
                {!syncing ? (
                  <button type="button" onClick={startSync} className={`rounded-full bg-sash px-4 py-2 text-sm font-extrabold text-white ${focus}`}>
                    ⏺ Sync from the start
                  </button>
                ) : (
                  <button type="button" onClick={tap} className={`rounded-full bg-straw px-6 py-3 font-display text-xl tracking-wider text-ink ${focus}`}>
                    Next sentence ({Math.min(tapIdx, starts.length)}/{starts.length})
                  </button>
                )}
                {syncing && (
                  <button type="button" onClick={() => { player.current?.pause(); setSyncing(false); }} className={`text-sm font-bold text-muted underline ${focus}`}>
                    Stop
                  </button>
                )}
                <span className="text-xs text-muted">
                  {anchors.size > 1 ? `${anchors.size} of ${starts.length} sentences synced` : "Not synced yet — timings will be estimated"}
                </span>
              </div>
              {syncing && nextSentence && (
                <p className="rounded-xl bg-black/30 px-3 py-2 text-sm" aria-live="polite">
                  Tap when you hear: <strong className="text-straw">“{nextSentence}…”</strong>
                </p>
              )}
            </>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save(`${slug}.md`, mdFile(), "text/markdown")}
            className={`rounded-full bg-straw px-5 py-2.5 font-extrabold text-ink shadow-[3px_3px_0_var(--ink)] ${focus}`}
          >
            ⤓ Download post (.md)
          </button>
          <button
            type="button"
            disabled={!times}
            onClick={() => times && save(`${slug}.json`, JSON.stringify({ words: times }), "application/json")}
            className={`rounded-full border border-white/20 bg-black/30 px-5 py-2.5 font-bold disabled:opacity-40 ${focus}`}
          >
            ⤓ Download timings (.json)
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear this draft and start a new post?")) {
                setD({ title: "", slug: "", date: today(), summary: "", tags: "", anime: "", body: STARTER });
                setSlugTouched(false);
              }
            }}
            className={`text-sm font-bold text-muted underline-offset-4 hover:underline ${focus}`}
          >
            New post
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Then put <code>{slug}.md</code> in <code>web/content/blog/</code>
          {audioUrl && (
            <>
              , and the recording (renamed <code>{slug}.{audioName.split(".").pop()?.toLowerCase()}</code>) with <code>{slug}.json</code> in{" "}
              <code>web/public/audio/</code>
            </>
          )}
          . Commit and push — the post goes live on the next build. The draft autosaves in this browser.
        </p>
      </div>

      {/* ── live preview ─────────────────────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sash">Live preview · {readMinutes(words.length)} min read</p>
        <div className="glass mt-3 max-h-[75vh] overflow-y-auto rounded-3xl p-6" ref={previewBox}>
          <h1 className="font-display text-5xl leading-[0.95] tracking-wide text-text">{d.title || "Your title"}</h1>
          {d.summary && <p className="mt-3 text-muted">{d.summary}</p>}
          <div className={`${post.body} mt-6`}>{nodes}</div>
        </div>
      </div>
    </div>
  );
}
