import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { type AnimeCard, displayTitle, FORMATS } from "@/lib/anilist";
import g from "./explore/grid.module.css";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/** Poster-shaped placeholders with a light sweeping across them, rippling left to right. */
export function AnimeGridSkeleton() {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={g.skel} style={{ "--d": `${(i % 6) * 110}ms` } as CSSProperties}>
          <span className={g.skelLine} style={{ bottom: "2.1rem", width: "70%" }} />
          <span className={g.skelLine} style={{ bottom: "1.1rem", width: "45%" }} />
        </div>
      ))}
    </div>
  );
}

function Card({ a, priority }: { a: AnimeCard; priority: boolean }) {
  const title = displayTitle(a);
  const studio = a.studios?.nodes?.[0]?.name;
  const genres = a.genres?.slice(0, 3) ?? [];
  const meta = [a.format && (FORMATS[a.format] ?? a.format), a.seasonYear, a.episodes && `${a.episodes} eps`]
    .filter(Boolean)
    .join(" · ");

  return (
    <TiltCard className={g.tilt} max={8} scale={1.04}>
      <Link
        href={`/anime/${a.id}`}
        className={`${g.card} shimmer`}
        style={a.coverImage.color ? ({ "--c": a.coverImage.color } as CSSProperties) : undefined}
      >
        <div className={g.media}>
          <Image
            src={a.coverImage.large}
            alt={`${title} cover`}
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 50vw"
            className={`${g.cover} object-cover`}
            priority={priority}
          />
        </div>
        {a.nextAiringEpisode && <span className={g.airing}>Airing</span>}
        {a.averageScore != null && <span className={g.score}>★ {(a.averageScore / 10).toFixed(1)}</span>}
        <div className={g.info}>
          <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{title}</h3>
          {meta && <p className="mt-1 line-clamp-1 text-[11px] text-white/75">{meta}</p>}
          {(genres.length > 0 || studio) && (
            <div className={g.more}>
              <div className={g.moreInner}>
                {genres.length > 0 && (
                  <ul className="flex flex-wrap gap-1 pt-2" aria-label="Genres">
                    {genres.map((x) => (
                      <li key={x} className={g.tag}>{x}</li>
                    ))}
                  </ul>
                )}
                {studio && (
                  <p className={`${g.studio} mt-1.5 line-clamp-1 text-[11px] font-bold text-straw`}>
                    <span className="text-white/55">Studio</span> {studio}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </TiltCard>
  );
}

/**
 * A responsive grid of anime poster cards that rise into view in a staggered
 * wave. Used by Explore and by the anime detail page (related, recommended).
 */
export default function AnimeGrid({ items }: { items: AnimeCard[] }) {
  return (
    <ul className={GRID}>
      {items.map((a, i) => (
        <Reveal as="li" key={a.id} delay={(i % 6) * 70} y={36} blur={6} scale={0.96}>
          <Card a={a} priority={i < 6} />
        </Reveal>
      ))}
    </ul>
  );
}
