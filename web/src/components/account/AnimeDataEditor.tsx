"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, useTransition, type FormEvent } from "react";
import { AVAILABILITY, type Availability, type PlatformLanguages } from "@/data/availability";
import { lookupAnime, type LookupResult } from "@/app/studio/anime-data/actions";

// The owner's sub/dub editor. It starts from the committed availability.json,
// lets you tick what you've checked on each platform, and downloads the whole
// updated file to replace web/src/data/availability.json. Only enter what
// you've seen with your own eyes: the site shows "not confirmed yet" otherwise.

const LANGS = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Japanese", "Spanish", "Portuguese", "French", "German", "Arabic", "Korean"];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw";
const month = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

type Pick = "unknown" | "none" | "some";

function LangPicker({ label, value, onChange }: { label: string; value?: string[]; onChange: (v?: string[]) => void }) {
  const mode: Pick = value === undefined ? "unknown" : value.length ? "some" : "none";
  const [other, setOther] = useState("");
  const toggle = (l: string) => {
    const cur = value ?? [];
    onChange(cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]);
  };
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-extrabold uppercase tracking-wider text-muted">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {(["unknown", "none"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => onChange(m === "unknown" ? undefined : [])}
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${focus} ${mode === m ? "bg-white/80 text-ink" : "border border-white/15 text-muted"}`}
          >
            {m === "unknown" ? "Not checked" : "Not available"}
          </button>
        ))}
        {LANGS.map((l) => {
          const on = !!value?.includes(l);
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(l)}
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${focus} ${on ? "bg-straw text-ink" : "border border-white/15 text-text"}`}
            >
              {l}
            </button>
          );
        })}
        {value?.filter((l) => !LANGS.includes(l)).map((l) => (
          <button key={l} type="button" aria-pressed onClick={() => toggle(l)} className={`rounded-full bg-straw px-2.5 py-1 text-xs font-bold text-ink ${focus}`}>
            {l} ✕
          </button>
        ))}
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && other.trim()) {
              e.preventDefault();
              toggle(other.trim());
              setOther("");
            }
          }}
          placeholder="Other + Enter"
          aria-label={`Another ${label.toLowerCase()} language`}
          className={`w-28 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-xs text-text placeholder:text-white/35 ${focus}`}
        />
      </div>
    </fieldset>
  );
}

export default function AnimeDataEditor() {
  const [data, setData] = useState<Availability>(() => structuredClone(AVAILABILITY));
  const [found, setFound] = useState<Extract<LookupResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const qid = useId();

  const onLookup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "");
    setError(null);
    start(async () => {
      const res = await lookupAnime(q);
      if (res.ok) setFound(res);
      else {
        setFound(null);
        setError(res.error);
      }
    });
  };

  const setSite = (id: number, site: string, patch: Partial<PlatformLanguages>) => {
    setDirty(true);
    setData((prev) => {
      const forAnime = { ...(prev[id] ?? {}) };
      const next: PlatformLanguages = { region: "India", ...(forAnime[site] ?? {}), ...patch, checked: month() };
      // nothing known any more: drop the entry so the site says "not confirmed yet"
      // (a region typed in by hand is kept, so the text box doesn't swallow it)
      if (next.sub === undefined && next.dub === undefined && !("region" in patch)) delete forAnime[site];
      else forAnime[site] = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)) as PlatformLanguages;
      const out = { ...prev };
      if (Object.keys(forAnime).length) out[id] = forAnime;
      else delete out[id];
      return out;
    });
  };

  const download = () => {
    const sorted = Object.fromEntries(Object.entries(data).sort((a, b) => Number(a[0]) - Number(b[0])));
    const url = URL.createObjectURL(new Blob([`${JSON.stringify(sorted, null, 2)}\n`], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "availability.json" }).click();
    URL.revokeObjectURL(url);
    setDirty(false);
  };

  const entries = Object.keys(data).length;

  return (
    <div className="space-y-8">
      <form onSubmit={onLookup} className="glass flex flex-wrap items-end gap-3 rounded-3xl p-5">
        <label htmlFor={qid} className="min-w-0 flex-1">
          <span className="text-sm font-extrabold">Anime number or link</span>
          <input
            id={qid}
            name="q"
            required
            placeholder="21  ·  /anime/21  ·  https://anilist.co/anime/21"
            className={`mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-text placeholder:text-white/35 ${focus}`}
          />
        </label>
        <button type="submit" disabled={pending} className={`rounded-full bg-straw px-5 py-2.5 font-extrabold text-ink disabled:opacity-60 ${focus}`}>
          {pending ? "Looking…" : "Load platforms"}
        </button>
        <p role="status" aria-live="polite" className="w-full text-sm font-bold text-[#ff9aa2]">
          {error}
        </p>
      </form>

      {found && (
        <section aria-label={`Platforms for ${found.title}`} className="glass rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
              <Image src={found.cover} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <div>
              <h2 className="font-display text-3xl tracking-wide text-straw">{found.title}</h2>
              <Link href={`/anime/${found.id}`} className={`text-sm font-bold text-muted underline-offset-4 hover:underline ${focus}`}>
                Open its page (/anime/{found.id}) →
              </Link>
            </div>
          </div>
          {found.sites.length === 0 ? (
            <p className="mt-5 text-muted">AniList lists no streaming platforms for this anime, so there&apos;s nothing to fill in.</p>
          ) : (
            <ul className="mt-6 space-y-5">
              {found.sites.map((s) => {
                const cur = data[found.id]?.[s.site];
                return (
                  <li key={s.site} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={`font-extrabold text-text underline-offset-4 hover:underline ${focus}`}>
                        {s.site} ↗
                      </a>
                      <label className="flex items-center gap-2 text-xs font-bold text-muted">
                        Region
                        <input
                          value={cur?.region ?? "India"}
                          onChange={(e) => setSite(found.id, s.site, { region: e.target.value || undefined })}
                          className={`w-28 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-text ${focus}`}
                        />
                      </label>
                    </div>
                    {s.languages.length > 0 && <p className="mt-1 text-xs text-muted">AniList lists: {s.languages.join(", ")}</p>}
                    <div className="mt-3 grid gap-3">
                      <LangPicker label="Subtitles" value={cur?.sub} onChange={(v) => setSite(found.id, s.site, { sub: v })} />
                      <LangPicker label="Dub (audio)" value={cur?.dub} onChange={(v) => setSite(found.id, s.site, { dub: v })} />
                    </div>
                    {cur?.checked && <p className="mt-2 text-[11px] text-muted">Marked as checked {cur.checked}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <div className="glass flex flex-wrap items-center gap-4 rounded-3xl p-5">
        <button type="button" onClick={download} className={`rounded-full bg-straw px-5 py-2.5 font-extrabold text-ink shadow-[3px_3px_0_var(--ink)] ${focus}`}>
          ⤓ Download availability.json
        </button>
        <p className="min-w-0 flex-1 text-sm text-muted">
          {dirty ? <strong className="text-straw">Unsaved changes. </strong> : null}
          {entries} {entries === 1 ? "anime has" : "anime have"} checked data. Replace <code>web/src/data/availability.json</code> with the
          downloaded file, then commit and push.
        </p>
      </div>
    </div>
  );
}
