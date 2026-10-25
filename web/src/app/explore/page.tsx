import type { Metadata } from "next";
import { Suspense } from "react";
import AnimeGrid, { AnimeGridSkeleton } from "@/components/AnimeGrid";
import Reveal from "@/components/motion/Reveal";
import Bands from "@/components/explore/Bands";
import Chapter from "@/components/explore/Chapter";
import { ActiveFilters, FilterPanel, SearchDock } from "@/components/explore/Filters";
import ExploreHero from "@/components/explore/Hero";
import Pagination from "@/components/explore/Pagination";
import { activeCount, parseFilters, type RawParams, toQuery } from "@/components/explore/query";
import { EmptyScene, ErrorScene } from "@/components/explore/Scenes";
import s from "@/components/explore/explore.module.css";
import { exploreAnime, type ExploreFilters, PER_PAGE, SORTS } from "@/lib/anilist";

export const metadata: Metadata = {
  title: "Explore anime",
  description: "Browse every anime by genre, format, season, year, status and streaming platform, A to Z.",
};

async function Results({ f }: { f: ExploreFilters }) {
  const result = await exploreAnime(f);

  if (!result.ok) return <ErrorScene retryHref={toQuery(f)} />;
  if (!result.items.length) {
    return <EmptyScene clearHref={activeCount(f) ? toQuery({ sort: f.sort }) : undefined} />;
  }

  const from = ((f.page ?? 1) - 1) * PER_PAGE + 1;
  const sortLabel = f.sort ? SORTS[f.sort].label : f.q ? "Best match" : "Most popular";
  return (
    <>
      <Reveal y={10} blur={3} className="mb-5">
        <p className={s.subtitle}>
          <span>
            Showing {from}–{from + result.items.length - 1} · {sortLabel}
            {result.hasNextPage ? " · more on the next page" : ""}
          </span>
        </p>
      </Reveal>
      <AnimeGrid items={result.items} />
      <Pagination f={f} hasNextPage={result.hasNextPage} />
    </>
  );
}

// Everything that depends on the URL: the filters, the results and the dock
async function Explore({ searchParams }: { searchParams: Promise<RawParams> }) {
  const f = parseFilters(await searchParams);
  const key = toQuery(f);
  return (
    <>
      <section id="explore-filters" aria-label="Filters" className="scroll-mt-28">
        <Chapter num="01" kicker="Chapter one · 航路" title="Chart your course" />
        <Reveal y={30} blur={6}>
          <FilterPanel key={key} f={f} />
        </Reveal>
        <ActiveFilters f={f} />
      </section>

      <section id="explore-results" aria-label="Results" className="mt-16 scroll-mt-28 sm:mt-20">
        <Chapter num="02" kicker="Chapter two · 獲物" title="The catch" />
        <div aria-live="polite">
          <Suspense key={key} fallback={<AnimeGridSkeleton />}>
            <Results f={f} />
          </Suspense>
        </div>
      </section>

      <SearchDock key={`dock-${key}`} f={f} />
    </>
  );
}

function ExploreFallback() {
  return (
    <div aria-hidden>
      <div className={`${s.skel} mb-16 h-72 rounded-[1.75rem] sm:h-60`} />
      <AnimeGridSkeleton />
    </div>
  );
}

export default function ExplorePage(props: PageProps<"/explore">) {
  return (
    <div className="pb-24">
      <ExploreHero />
      <Bands />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <Suspense fallback={<ExploreFallback />}>
          <Explore searchParams={props.searchParams} />
        </Suspense>
      </div>
      {/* when this reaches the screen the floating search dock tucks away */}
      <div id="explore-end" aria-hidden className="-mt-40 h-px" />
    </div>
  );
}
