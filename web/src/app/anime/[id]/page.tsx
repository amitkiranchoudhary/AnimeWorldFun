import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import AnimeGrid from "@/components/AnimeGrid";
import WhereToWatch from "@/components/WhereToWatch";
import Chapter from "@/components/anime/Chapter";
import HeroBanner from "@/components/anime/HeroBanner";
import AddToList from "@/components/anime/AddToList";
import Logline from "@/components/anime/Logline";
import PosterCarousel, { type Poster } from "@/components/anime/PosterCarousel";
import ScoreRing from "@/components/anime/ScoreRing";
import TrailerFrame from "@/components/anime/TrailerFrame";
import s from "@/components/anime/detail.module.css";
import Marquee from "@/components/motion/Marquee";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import TiltCard from "@/components/motion/TiltCard";
import { type AnimeCard, type AnimeDetail, displayTitle, FORMATS, getAnime, SEASONS, STATUSES } from "@/lib/anilist";
import { descriptionParagraphs, titleCase } from "@/lib/text";

type Props = PageProps<"/anime/[id]">;

const parseId = (raw: string) => (/^\d{1,7}$/.test(raw) ? Number(raw) : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const anime = id ? await getAnime(id) : null;
  if (!anime) return { title: "Anime not found" };
  const summary = descriptionParagraphs(anime.description).join(" ").slice(0, 160);
  return {
    title: displayTitle(anime),
    description: summary || `Where to watch ${displayTitle(anime)}, in which language, and everything about it.`,
    openGraph: { images: [anime.bannerImage ?? anime.coverImage.extraLarge] },
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fuzzyDate(d: { year: number | null; month: number | null; day: number | null }) {
  if (!d.year) return null;
  return [d.day, d.month ? MONTHS[d.month - 1] : null, d.year].filter(Boolean).join(" ");
}

function airingDate(unixSeconds: number) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  }).format(new Date(unixSeconds * 1000));
}

function alsoKnownAs(anime: AnimeDetail) {
  const shown = new Set([anime.title.english, anime.title.romaji].filter(Boolean).map((t) => t!.toLowerCase()));
  const names = [anime.title.native, ...anime.synonyms].filter((n): n is string => !!n && !shown.has(n.toLowerCase()));
  return [...new Set(names)].slice(0, 3).join(" · ") || null;
}

/** The synopsis' opening sentence, for the pinned logline (skips "Gol D." style abbreviations). */
function logline(paragraphs: string[]) {
  const first = paragraphs[0];
  if (!first) return null;
  for (const m of first.matchAll(/[.!?]["')\]]?(?=\s|$)/g)) {
    const candidate = first.slice(0, (m.index ?? 0) + m[0].length);
    if (candidate.split(/\s+/).length >= 6 && !/\b[A-Z][a-z]?\.$/.test(candidate)) {
      const words = candidate.split(/\s+/);
      return words.length > 28 ? `${words.slice(0, 24).join(" ")}…` : candidate;
    }
  }
  const words = first.split(/\s+/);
  if (words.length < 6) return null;
  return words.length > 28 ? `${words.slice(0, 24).join(" ")}…` : first;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function toPoster(a: AnimeCard, note: string | null): Poster {
  return {
    id: a.id,
    title: displayTitle(a),
    image: a.coverImage.large,
    color: a.coverImage.color,
    score: a.averageScore,
    note,
  };
}

const CREATOR_ROLES =/^(original creator|original story|original work|original concept)/i;

function Info({ anime }: { anime: AnimeDetail }) {
  const creators = [...new Set(anime.staff.edges.filter((e) => CREATOR_ROLES.test(e.role)).map((e) => e.node.name.full))];
  const studios = anime.allStudios.edges.filter((e) => e.isMain).map((e) => e.node.name);
  const producers = anime.allStudios.edges.filter((e) => !e.isMain).map((e) => e.node.name).slice(0, 4);
  const aired = [fuzzyDate(anime.startDate), fuzzyDate(anime.endDate)].filter(Boolean);
  const director = anime.staff.edges.find((e) => /^director/i.test(e.role))?.node.name.full;

  const rows: [string, string | null | undefined][] = [
    ["Created by", creators.join(", ") || null],
    ["Studio", studios.join(", ") || null],
    ["Director", director],
    ["Producers", producers.join(", ") || null],
    ["Source", anime.source ? titleCase(anime.source) : null],
    ["Format", anime.format ? (FORMATS[anime.format] ?? anime.format) : null],
    ["Episodes", anime.episodes ? `${anime.episodes}${anime.duration ? ` × ${anime.duration} min` : ""}` : null],
    ["Status", anime.status ? (STATUSES[anime.status] ?? titleCase(anime.status)) : null],
    ["Aired", aired.length ? aired.join(" → ") : null],
    ["Season", anime.season && anime.seasonYear ? `${SEASONS[anime.season]} ${anime.seasonYear}` : null],
    ["Country", anime.countryOfOrigin === "JP" ? "Japan" : anime.countryOfOrigin],
    ["Also known as", alsoKnownAs(anime)],
  ];

  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="border-b border-white/10 pb-2">
            <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-straw/75">{k}</dt>
            <dd className="mt-0.5 break-words font-bold text-text">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Floating cover art: a holographic tilt card with a hanko seal popping off it in 3D. */
function Cover({ anime, title }: { anime: AnimeDetail; title: string }) {
  const seal = anime.format ? (FORMATS[anime.format] ?? anime.format) : null;
  return (
    <Reveal scale={0.92} y={40} blur={10} className="relative mx-auto w-48 sm:w-56 md:w-full">
      <div aria-hidden className={s.coverGlow} />
      <div className={s.floaty}>
        <TiltCard max={12} className="rounded-2xl">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border-2 border-ink shadow-[0_40px_70px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)]">
            <Image src={anime.coverImage.extraLarge} alt={`${title} cover`} fill preload sizes="(min-width: 768px) 260px, 224px" className="object-cover" />
          </div>
          {seal && seal.length <= 8 && (
            <span aria-hidden className={s.hanko}>
              {seal}
            </span>
          )}
        </TiltCard>
      </div>
    </Reveal>
  );
}

async function AnimeContent({ params }: { params: Props["params"] }) {
  const id = parseId((await params).id);
  const anime = id ? await getAnime(id) : null;
  if (!anime) notFound();

  const title = displayTitle(anime);
  const accent = anime.coverImage.color ?? "#e63946";
  const paragraphs = descriptionParagraphs(anime.description);
  const tags = anime.tags.filter((t) => !t.isMediaSpoiler && t.rank >= 60).slice(0, 10);
  const related = anime.relations.edges
    .filter((e) => e.node.type === "ANIME")
    .map((e) => ({ ...e.node, relation: titleCase(e.relationType) }));
  const recs = anime.recommendations.nodes.map((n) => n.mediaRecommendation).filter((m) => m !== null).slice(0, 12);
  // AniList ids sometimes carry stray whitespace (a trailing tab breaks the embed)
  const trailerId = anime.trailer?.site === "youtube" ? anime.trailer.id.trim() : "";
  const trailer = /^[\w-]{6,20}$/.test(trailerId) ? trailerId : null;
  const studio = anime.allStudios.edges.find((e) => e.isMain)?.node.name ?? null;
  const line = logline(paragraphs);
  const format = anime.format ? (FORMATS[anime.format] ?? anime.format) : null;

  const chips = [
    format,
    anime.episodes ? `${anime.episodes} episodes` : null,
    anime.status ? (STATUSES[anime.status] ?? anime.status) : null,
    anime.seasonYear ? String(anime.seasonYear) : null,
    anime.popularity ? `♥ ${compact.format(anime.popularity)} fans` : null,
  ].filter((c): c is string => !!c);

  // credits ticker: genres then tags, repeated so the loop never shows a gap
  const tickerBase = [...anime.genres, ...tags.slice(0, 4).map((t) => t.name)];
  const ticker = tickerBase.length ? Array.from({ length: Math.max(8, tickerBase.length) }, (_, i) => tickerBase[i % tickerBase.length]) : [];

  // chapters are numbered in the order they appear
  let chapter = 0;
  const next = () => ++chapter;

  return (
    <article className="relative overflow-x-clip" style={{ "--anime": accent } as CSSProperties}>
      {/* the anime's own colour bleeding into the page */}
      <div aria-hidden className={s.ambient} />

      <HeroBanner banner={anime.bannerImage} cover={anime.coverImage.large}>
        {studio && (
          <div className="mx-auto max-w-7xl px-4 pt-[12%] sm:px-6 sm:pt-[7%]">
            <p className="text-xs font-extrabold uppercase text-white/85 [text-shadow:0_1px_8px_#000] sm:text-sm">
              {studio} <span className="text-[#ff8fc0]">presents</span>
            </p>
          </div>
        )}
      </HeroBanner>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* big vertical side label: the native title */}
        {anime.title.native && (
          <p
            aria-hidden
            className="pointer-events-none absolute -top-24 right-2 hidden max-h-[34rem] overflow-hidden text-[5.5rem] font-black leading-none tracking-[0.12em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)] [writing-mode:vertical-rl] lg:block"
          >
            {anime.title.native}
          </p>
        )}

        <header className="relative z-10 -mt-40 grid gap-8 sm:-mt-48 md:grid-cols-[260px_1fr] lg:gap-12">
          <Cover anime={anime} title={title} />

          <div className="text-center md:pt-36 md:text-left">
            <Reveal as="p" y={10} blur={0} delay={150} className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-straw/85">
              {[format, anime.season && anime.seasonYear ? `${SEASONS[anime.season]} ${anime.seasonYear}` : anime.seasonYear]
                .filter(Boolean)
                .join(" · ") || "Now showing"}
            </Reveal>
            <SplitText
              as="h1"
              text={title}
              stagger={70}
              delay={250}
              className="title-stroke mt-2 text-[clamp(2.5rem,10vw,5rem)] leading-[0.95]"
            />
            {anime.title.english && anime.title.romaji !== anime.title.english && (
              <Reveal as="p" delay={600} y={8} blur={4} className="mt-3 font-bold text-muted">
                {anime.title.romaji}
              </Reveal>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              {anime.averageScore != null && (
                <Reveal scale={0.6} y={0} blur={0} delay={450}>
                  <ScoreRing score={anime.averageScore} />
                </Reveal>
              )}
              <ul className="flex max-w-xl flex-wrap justify-center gap-2 text-sm font-extrabold md:justify-start">
                {chips.map((c, i) => (
                  <Reveal
                    as="li"
                    key={c}
                    scale={0.6}
                    y={14}
                    blur={0}
                    delay={550 + i * 80}
                    className="glass rounded-full px-3.5 py-1.5 text-text"
                  >
                    {c}
                  </Reveal>
                ))}
              </ul>
            </div>

            {anime.nextAiringEpisode && (
              <Reveal delay={900} y={10} blur={0} className="mt-5">
                <p className="inline-flex items-center gap-2.5 rounded-xl bg-sash px-4 py-2 text-sm font-extrabold text-white shadow-[0_0_30px_-6px_var(--sash)]">
                  <span aria-hidden className="relative flex size-2.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/80" />
                    <span className="relative size-2.5 rounded-full bg-white" />
                  </span>
                  Episode {anime.nextAiringEpisode.episode} airs {airingDate(anime.nextAiringEpisode.airingAt)} IST
                </p>
              </Reveal>
            )}

            <Reveal delay={800} y={12} blur={0} className="mt-6">
              <AddToList
                show={{
                  id: anime.id,
                  title,
                  cover: anime.coverImage.large,
                  color: anime.coverImage.color,
                  episodes: anime.episodes,
                  format: anime.format,
                }}
              />
            </Reveal>

            <Reveal delay={1000} y={12} blur={4} className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/explore?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-straw/50 bg-black/20 px-3 py-1 text-xs font-bold text-straw transition duration-300 hover:bg-straw hover:text-ink hover:shadow-[var(--glow-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
                >
                  {g}
                </Link>
              ))}
            </Reveal>
          </div>
        </header>
      </div>

      {/* credits ticker */}
      {ticker.length > 0 && (
        <div aria-hidden className="relative left-1/2 mt-16 w-[110vw] -translate-x-1/2 -rotate-2 border-y border-white/5 bg-black/30 py-3 sm:mt-24">
          <Marquee seconds={60}>
            {ticker.map((w, i) => (
              <span
                key={i}
                className="flex items-center gap-6 px-6 font-display text-4xl tracking-wide text-transparent [-webkit-text-stroke:1px_rgba(242,201,76,0.55)] sm:text-6xl"
              >
                {w}
                <span className="text-2xl text-sash [-webkit-text-stroke:0] sm:text-3xl">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* where to watch */}
        <section className="relative z-20 mt-16 sm:mt-24">
          <Chapter
            n={next()}
            title="Where to watch"
            caption={
              <>
                <span className={s.onHover}>Hover a platform for sub/dub details · click to open it.</span>
                <span className={s.onTouch}>Tap “Sub &amp; dub” for language details · tap a platform to open it.</span>
              </>
            }
          />
          <Reveal className="glass relative rounded-3xl p-5 shadow-[0_0_60px_-20px_rgba(255,140,190,0.35)] sm:p-8">
            <WhereToWatch animeId={anime.id} links={anime.externalLinks} />
          </Reveal>
        </section>
      </div>

      {line && <Logline text={line} credit={`${title}${anime.seasonYear ? `, ${anime.seasonYear}` : ""}`} />}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* story + basics */}
        <section className={line ? "mt-4" : "mt-20 sm:mt-28"}>
          <Chapter n={next()} title="The story" />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
            <Reveal className="glass rounded-3xl p-5 sm:p-8">
              <div className="space-y-4 leading-relaxed text-text/90">
                {paragraphs.length ? (
                  paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-lg leading-relaxed text-text first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-straw"
                          : undefined
                      }
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-muted">No synopsis yet.</p>
                )}
              </div>
              {tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <Reveal
                      as="li"
                      key={t.name}
                      scale={0.7}
                      y={10}
                      blur={0}
                      delay={i * 50}
                      className="rounded-full border border-foam/20 bg-foam/5 px-2.5 py-1 text-xs font-bold text-foam"
                    >
                      {t.name}
                    </Reveal>
                  ))}
                </ul>
              )}
            </Reveal>
            <Reveal delay={150} as="section" className="glass rounded-3xl p-5 sm:p-8">
              <h2 className="mb-5 font-display text-3xl tracking-wide text-straw text-glow-gold">The basics</h2>
              <Info anime={anime} />
            </Reveal>
          </div>
        </section>

        {trailer && (
          <section className="mt-20 sm:mt-28">
            <Chapter n={next()} title="Trailer" caption="Lights down. Press play when you're ready." />
            <Reveal scale={0.95} y={40} className="mx-auto max-w-4xl">
              <TrailerFrame videoId={trailer} title={title} still={anime.bannerImage ?? anime.coverImage.extraLarge} />
            </Reveal>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <Chapter
              n={next()}
              title="Seasons & related"
              caption={related.map((r) => `${r.relation}: ${displayTitle(r)}`).slice(0, 3).join(" · ")}
            />
            {related.length >= 4 ? (
              <PosterCarousel label="Seasons and related anime" items={related.slice(0, 12).map((r) => toPoster(r, r.relation))} />
            ) : (
              <AnimeGrid items={related} />
            )}
          </section>
        )}

        {recs.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <Chapter n={next()} title="If you liked this" caption={recs.length >= 4 ? "Drag, swipe or use the arrows to browse the reel." : undefined} />
            {recs.length >= 4 ? (
              <PosterCarousel
                label="Recommended anime"
                items={recs.map((r) =>
                  toPoster(r, [r.format && (FORMATS[r.format] ?? r.format), r.seasonYear].filter(Boolean).join(" · ") || null),
                )}
              />
            ) : (
              <AnimeGrid items={recs} />
            )}
          </section>
        )}

        <p className="mt-16 text-xs text-muted">
          Data from{" "}
          <a href={`https://anilist.co/anime/${anime.id}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-straw">
            AniList
          </a>
          .
        </p>
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading anime…</span>
      <div aria-hidden className="h-[54vh] max-h-[660px] min-h-[340px] w-full animate-pulse bg-gradient-to-b from-white/[0.06] to-transparent sm:h-[64vh]" />
      <div className="mx-auto -mt-40 grid max-w-7xl gap-8 px-4 sm:-mt-48 sm:px-6 md:grid-cols-[260px_1fr]">
        <div aria-hidden className="mx-auto aspect-[2/3] w-48 animate-pulse rounded-2xl bg-white/10 sm:w-56 md:w-full" />
        <div aria-hidden className="space-y-4 md:pt-36">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-14 w-3/4 animate-pulse rounded-xl bg-white/10" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnimePage(props: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AnimeContent params={props.params} />
    </Suspense>
  );
}
