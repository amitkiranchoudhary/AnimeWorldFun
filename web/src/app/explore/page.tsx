import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import AnimeGrid, { AnimeGridSkeleton } from "@/components/AnimeGrid";
import {
  exploreAnime,
  type ExploreFilters,
  FORMATS,
  GENRES,
  PER_PAGE,
  PLATFORMS,
  SEASONS,
  SORTS,
  STATUSES,
} from "@/lib/anilist";
import AutoSubmit from "./AutoSubmit";

export const metadata: Metadata = {
  title: "Explore anime",
  description: "Browse every anime by genre, format, season, year, status and streaming platform, A to Z.",
};

type RawParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const pick = (v: string | undefined, allowed: Record<string, unknown>) => (v && v in allowed ? v : undefined);

function parseFilters(sp: RawParams): ExploreFilters {
  const year = Number(one(sp.year));
  const page = Number(one(sp.page));
  return {
    q: one(sp.q)?.slice(0, 100),
    genres: many(sp.genre).filter((g) => GENRES.includes(g)),
    format: pick(one(sp.format), FORMATS),
    status: pick(one(sp.status), STATUSES),
    season: pick(one(sp.season), SEASONS),
    year: year >= 1940 && year <= 2100 ? year : undefined,
    platform: pick(one(sp.platform), PLATFORMS),
    sort: pick(one(sp.sort), SORTS),
    page: page >= 1 && page <= 500 ? Math.floor(page) : 1,
  };
}

function toQuery(f: ExploreFilters, overrides: Partial<ExploreFilters> = {}) {
  const merged = { ...f, ...overrides };
  const p = new URLSearchParams();
  if (merged.q) p.set("q", merged.q);
  merged.genres?.forEach((g) => p.append("genre", g));
  for (const key of ["format", "status", "season", "year", "platform", "sort"] as const) {
    if (merged[key]) p.set(key, String(merged[key]));
  }
  if (merged.page && merged.page > 1) p.set("page", String(merged.page));
  const s = p.toString();
  return s ? `/explore?${s}` : "/explore";
}

const selectClass =
  "w-full rounded-xl border-2 border-ink bg-parchment px-3 py-2.5 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-sash";

function Select({ name, label, value, options, any = "Any" }: {
  name: string;
  label: string;
  value?: string | number;
  options: Record<string, string>;
  any?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{label}</span>
      <select name={name} defaultValue={value ?? ""} className={selectClass}>
        <option value="">{any}</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );
}

function ActiveChips({ f }: { f: ExploreFilters }) {
  const chips: { label: string; href: string }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, href: toQuery(f, { q: undefined, page: 1 }) });
  f.genres?.forEach((g) =>
    chips.push({ label: g, href: toQuery(f, { genres: f.genres?.filter((x) => x !== g), page: 1 }) }),
  );
  if (f.format) chips.push({ label: FORMATS[f.format], href: toQuery(f, { format: undefined, page: 1 }) });
  if (f.status) chips.push({ label: STATUSES[f.status], href: toQuery(f, { status: undefined, page: 1 }) });
  if (f.season) chips.push({ label: SEASONS[f.season], href: toQuery(f, { season: undefined, page: 1 }) });
  if (f.year) chips.push({ label: String(f.year), href: toQuery(f, { year: undefined, page: 1 }) });
  if (f.platform) chips.push({ label: PLATFORMS[f.platform].label, href: toQuery(f, { platform: undefined, page: 1 }) });
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="rounded-full bg-straw px-3 py-1 text-xs font-extrabold text-ink transition hover:bg-sash hover:text-white"
          aria-label={`Remove filter ${c.label}`}
        >
          {c.label} ✕
        </Link>
      ))}
      <Link href={toQuery({ sort: f.sort })} className="text-xs font-bold text-muted underline hover:text-text">
        Clear all
      </Link>
    </div>
  );
}

function Filters({ f }: { f: ExploreFilters }) {
  return (
    <Form action="/explore" className="card space-y-5 p-5 sm:p-6">
      <AutoSubmit />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="explore-q" className="sr-only">Search anime</label>
        <input
          id="explore-q"
          name="q"
          defaultValue={f.q}
          placeholder="Search by title — English, Japanese or romaji…"
          className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-parchment px-4 py-3 font-bold text-ink placeholder:text-ink/45 focus:outline-none focus:ring-2 focus:ring-sash"
        />
        <div className="sm:w-48">
          <label className="sr-only" htmlFor="explore-sort">Sort by</label>
          <select id="explore-sort" name="sort" defaultValue={f.sort ?? ""} className={`${selectClass} h-full`}>
            <option value="">{f.q ? "Best match" : "Most popular"}</option>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-xl bg-sash px-6 py-3 font-display text-xl tracking-wider text-white shadow-[3px_3px_0_var(--ink)]">
          Apply
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Select name="format" label="Format" value={f.format} options={FORMATS} />
        <Select name="status" label="Status" value={f.status} options={STATUSES} />
        <Select name="season" label="Season" value={f.season} options={SEASONS} />
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">Year</span>
          <input name="year" type="number" min={1940} max={2100} defaultValue={f.year} placeholder="Any" className={selectClass} />
        </label>
        <Select
          name="platform"
          label="Streams on"
          value={f.platform}
          any="Any platform"
          options={Object.fromEntries(Object.entries(PLATFORMS).map(([k, v]) => [k, v.label]))}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
          Genres <span className="normal-case tracking-normal">(shows anime with all selected)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <label key={g} className="cursor-pointer">
              <input type="checkbox" name="genre" value={g} defaultChecked={f.genres?.includes(g)} className="peer sr-only" />
              <span className="inline-block rounded-full border-2 border-card-border bg-white/5 px-3 py-1.5 text-xs font-bold text-text transition peer-checked:border-ink peer-checked:bg-straw peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-straw hover:border-straw">
                {g}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </Form>
  );
}

function Pagination({ f, hasNextPage }: { f: ExploreFilters; hasNextPage: boolean }) {
  const page = f.page ?? 1;
  if (page === 1 && !hasNextPage) return null;
  const btn = "rounded-full px-5 py-2.5 font-extrabold transition";
  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={toQuery(f, { page: page - 1 })} className={`${btn} border-2 border-straw text-straw hover:bg-straw/10`}>
          ← Previous
        </Link>
      ) : null}
      <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-muted">Page {page}</span>
      {hasNextPage ? (
        <Link href={toQuery(f, { page: page + 1 })} className={`${btn} bg-straw text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5`}>
          Next →
        </Link>
      ) : null}
    </nav>
  );
}

async function Results({ f }: { f: ExploreFilters }) {
  const result = await exploreAnime(f);

  if (!result.ok) {
    return (
      <p className="card px-5 py-10 text-center text-muted">
        The seas are rough — couldn&apos;t reach the anime database right now. Try again in a moment.
      </p>
    );
  }
  if (!result.items.length) {
    return (
      <div className="card px-5 py-12 text-center">
        <p className="font-display text-3xl tracking-wide text-straw">No anime found</p>
        <p className="mt-2 text-muted">Try removing a filter or two.</p>
      </div>
    );
  }

  const from = ((f.page ?? 1) - 1) * PER_PAGE + 1;
  return (
    <>
      <p className="mb-4 text-sm font-bold text-muted">
        Showing {from}–{from + result.items.length - 1}
        {result.hasNextPage ? " · more on the next page" : ""}
      </p>
      <AnimeGrid items={result.items} />
      <Pagination f={f} hasNextPage={result.hasNextPage} />
    </>
  );
}

async function Explore({ searchParams }: { searchParams: Promise<RawParams> }) {
  const f = parseFilters(await searchParams);
  return (
    <>
      <Filters key={toQuery(f)} f={f} />
      <div className="mt-5">
        <ActiveChips f={f} />
      </div>
      <section className="mt-6" aria-live="polite">
        <Suspense key={toQuery(f)} fallback={<AnimeGridSkeleton />}>
          <Results f={f} />
        </Suspense>
      </section>
    </>
  );
}

export default function ExplorePage(props: PageProps<"/explore">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="font-display text-lg tracking-wider text-sash">The whole ocean</p>
      <h1 className="title-stroke text-5xl sm:text-6xl">Explore anime</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every anime on AniList — filter by genre, format, season, year, status and where it streams, or sort A to Z.
      </p>
      <div className="mt-8">
        <Suspense fallback={<AnimeGridSkeleton />}>
          <Explore searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
