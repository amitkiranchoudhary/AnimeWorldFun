import Form from "next/form";
import Link from "next/link";
import AutoSubmit from "@/app/explore/AutoSubmit";
import { type ExploreFilters, FORMATS, GENRES, PLATFORMS, SEASONS, SORTS, STATUSES } from "@/lib/anilist";
import FilterDock from "./FilterDock";
import { activeCount, toQuery } from "./query";
import s from "./explore.module.css";

const PLATFORM_OPTIONS = Object.fromEntries(Object.entries(PLATFORMS).map(([k, v]) => [k, v.label]));

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function Select({ name, label, value, options, any = "Any" }: {
  name: string;
  label: string;
  value?: string | number;
  options: Record<string, string>;
  any?: string;
}) {
  return (
    <label className="block">
      <span className={s.label}>{label}</span>
      <select name={name} defaultValue={value ?? ""} className={`${s.field} ${value ? s.fieldOn : ""}`}>
        <option value="">{any}</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * The full filter form: search, sort, five dropdowns and genre chips.
 * Selects and chips apply instantly (AutoSubmit); "Apply" covers typing and no-JS.
 */
export function FilterPanel({ f }: { f: ExploreFilters }) {
  return (
    <Form action="/explore" scroll={false} className={`glass ${s.panel} space-y-6 p-4 sm:p-7`}>
      <AutoSubmit />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="explore-q" className="sr-only">Search anime</label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-straw" />
          <input
            id="explore-q"
            name="q"
            type="search"
            defaultValue={f.q}
            placeholder="Search by title — English, Japanese or romaji…"
            className={`${s.field} ${s.search} ${f.q ? s.fieldOn : ""}`}
          />
        </div>
        <div className="flex gap-3">
          <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
            <label className="sr-only" htmlFor="explore-sort">Sort by</label>
            <select id="explore-sort" name="sort" defaultValue={f.sort ?? ""} className={`${s.field} h-full`}>
              <option value="">{f.q ? "Best match" : "Most popular"}</option>
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={`${s.apply} shimmer`}>
            Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Select name="format" label="Format" value={f.format} options={FORMATS} />
        <Select name="status" label="Status" value={f.status} options={STATUSES} />
        <Select name="season" label="Season" value={f.season} options={SEASONS} />
        <label className="block">
          <span className={s.label}>Year</span>
          <input
            name="year"
            type="number"
            inputMode="numeric"
            min={1940}
            max={2100}
            defaultValue={f.year}
            placeholder="Any"
            className={`${s.field} ${f.year ? s.fieldOn : ""}`}
          />
        </label>
        <Select name="platform" label="Streams on" value={f.platform} any="Any platform" options={PLATFORM_OPTIONS} />
      </div>

      {/* min-w-0: a fieldset is min-content wide by default, which would stretch the
          phone chip strip to all 18 chips instead of letting it scroll */}
      <fieldset className="min-w-0">
        <legend className={s.label}>
          Genres <span className="normal-case tracking-normal">(shows anime with all selected)</span>
        </legend>
        <div className={`${s.chipStrip} mt-1 -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0`}>
          {GENRES.map((g) => (
            <label key={g} className={s.chip}>
              <input type="checkbox" name="genre" value={g} defaultChecked={f.genres?.includes(g)} className={`${s.chipInput} sr-only`} />
              <span className={s.chipFace}>
                <span aria-hidden className={s.tick}>✓</span>
                {g}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </Form>
  );
}

/** One removable pill per active filter, plus "Clear all" (which keeps the sort). */
export function ActiveFilters({ f }: { f: ExploreFilters }) {
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
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Link key={c.label} href={c.href} scroll={false} className={s.activePill} aria-label={`Remove filter ${c.label}`}>
          {c.label} <span aria-hidden>✕</span>
        </Link>
      ))}
      <Link href={toQuery({ sort: f.sort })} scroll={false} className={`${s.textLink} px-2 text-xs font-bold text-muted underline underline-offset-4 hover:text-text`}>
        Clear all
      </Link>
    </div>
  );
}

/**
 * The condensed bar: once the big panel scrolls away, a glass dock rises from
 * the bottom with a quick search (keeping every other filter) and a jump back
 * to the full filters.
 */
export function SearchDock({ f }: { f: ExploreFilters }) {
  const n = activeCount(f);
  const keep: [string, string][] = [
    ...(f.genres ?? []).map((g): [string, string] => ["genre", g]),
    ...(["format", "status", "season", "year", "platform", "sort"] as const)
      .filter((k) => f[k])
      .map((k): [string, string] => [k, String(f[k])]),
  ];
  return (
    <FilterDock watchId="explore-filters" endId="explore-end">
      <Form action="/explore" scroll={false} role="search" aria-label="Quick search" className="flex min-w-0 flex-1 items-center gap-1.5">
        <AutoSubmit />
        {keep.map(([k, v]) => (
          <input key={`${k}=${v}`} type="hidden" name={k} value={v} />
        ))}
        <label htmlFor="dock-q" className="sr-only">Search anime</label>
        <input id="dock-q" name="q" type="search" defaultValue={f.q} placeholder="Search titles…" className={s.dockInput} />
        <button type="submit" aria-label="Search" className={`${s.dockBtn} bg-sash px-3 text-white`}>
          <SearchIcon className="size-4" />
        </button>
      </Form>
      <a href="#explore-filters" className={`${s.dockBtn} border border-white/15 text-text hover:border-straw/60`}>
        Filters
        {n > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-straw text-[0.65rem] text-ink">
            <span className="sr-only">(</span>
            {n}
            <span className="sr-only"> active)</span>
          </span>
        )}
        <span aria-hidden>↑</span>
      </a>
    </FilterDock>
  );
}
