import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AnimeGrid from "@/components/AnimeGrid";
import WhereToWatch from "@/components/WhereToWatch";
import { type AnimeDetail, displayTitle, FORMATS, getAnime, SEASONS, STATUSES } from "@/lib/anilist";
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
            <dt className="text-xs font-extrabold uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-0.5 font-bold text-text">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

async function AnimeContent({ params }: { params: Props["params"] }) {
  const id = parseId((await params).id);
  const anime = id ? await getAnime(id) : null;
  if (!anime) notFound();

  const title = displayTitle(anime);
  const paragraphs = descriptionParagraphs(anime.description);
  const tags = anime.tags.filter((t) => !t.isMediaSpoiler && t.rank >= 60).slice(0, 10);
  const related = anime.relations.edges
    .filter((e) => e.node.type === "ANIME")
    .map((e) => ({ ...e.node, relation: titleCase(e.relationType) }));
  const recs = anime.recommendations.nodes.map((n) => n.mediaRecommendation).filter((m) => m !== null).slice(0, 12);
  const trailer = anime.trailer?.site === "youtube" ? anime.trailer.id : null;

  return (
    <article>
      {/* banner */}
      <div className="relative h-56 w-full overflow-hidden sm:h-80" style={{ background: anime.coverImage.color ?? "#1d2c5e" }}>
        {anime.bannerImage && (
          <Image src={anime.bannerImage} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-[#121212]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-28 grid gap-8 md:grid-cols-[240px_1fr] sm:-mt-36">
          <div className="mx-auto w-44 md:w-full">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border-2 border-ink shadow-[6px_6px_0_var(--ink)]">
              <Image src={anime.coverImage.extraLarge} alt={`${title} cover`} fill priority sizes="240px" className="object-cover" />
            </div>
          </div>

          <div className="md:pt-24">
            <h1 className="title-stroke text-4xl leading-none sm:text-6xl">{title}</h1>
            {anime.title.english && anime.title.romaji !== anime.title.english && (
              <p className="mt-2 font-bold text-muted">{anime.title.romaji}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2 text-sm font-extrabold">
              {anime.averageScore != null && (
                <span className="rounded-full bg-straw px-3 py-1 text-ink">★ {(anime.averageScore / 10).toFixed(1)}</span>
              )}
              {anime.format && <span className="rounded-full bg-white/10 px-3 py-1">{FORMATS[anime.format] ?? anime.format}</span>}
              {anime.episodes && <span className="rounded-full bg-white/10 px-3 py-1">{anime.episodes} episodes</span>}
              {anime.status && <span className="rounded-full bg-white/10 px-3 py-1">{STATUSES[anime.status] ?? anime.status}</span>}
              {anime.seasonYear && <span className="rounded-full bg-white/10 px-3 py-1">{anime.seasonYear}</span>}
            </div>

            {anime.nextAiringEpisode && (
              <p className="mt-4 inline-block rounded-xl bg-sash px-4 py-2 text-sm font-extrabold text-white">
                Episode {anime.nextAiringEpisode.episode} airs {airingDate(anime.nextAiringEpisode.airingAt)} IST
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/explore?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border-2 border-straw/60 px-3 py-1 text-xs font-bold text-straw transition hover:bg-straw hover:text-ink"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* where to watch */}
        <section className="parchment mt-10 rounded-2xl border-2 border-ink p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
          <h2 className="font-display text-3xl tracking-wide">Where to watch</h2>
          <p className="mb-4 text-sm text-ink/70">Hover a platform for sub/dub details · click to open it.</p>
          <WhereToWatch animeId={anime.id} links={anime.externalLinks} />
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="font-display text-3xl tracking-wide text-straw">Story</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-text/90">
              {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-muted">No synopsis yet.</p>}
            </div>
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t.name} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-foam">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-display text-3xl tracking-wide text-straw">The basics</h2>
            <Info anime={anime} />
          </section>
        </div>

        {trailer && (
          <section className="mt-12">
            <h2 className="font-display text-3xl tracking-wide text-straw">Trailer</h2>
            <div className="mt-4 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-ink shadow-[6px_6px_0_var(--ink)]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer)}`}
                title={`${title} trailer`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl tracking-wide text-straw">Seasons &amp; related</h2>
            <p className="mb-4 text-sm text-muted">
              {related.map((r) => `${r.relation}: ${displayTitle(r)}`).slice(0, 3).join(" · ")}
            </p>
            <AnimeGrid items={related.slice(0, 12)} />
          </section>
        )}

        {recs.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl tracking-wide text-straw">If you liked this</h2>
            <div className="mt-4">
              <AnimeGrid items={recs} />
            </div>
          </section>
        )}

        <p className="mt-12 text-xs text-muted">
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
    <div>
      <div className="h-56 w-full animate-pulse bg-white/5 sm:h-80" />
      <div className="mx-auto -mt-28 max-w-7xl px-4 sm:-mt-36 sm:px-6">
        <div className="aspect-[2/3] w-44 animate-pulse rounded-2xl bg-white/10 md:w-60" />
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
