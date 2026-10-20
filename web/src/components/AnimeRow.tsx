import Image from "next/image";
import Link from "next/link";
import { type AnimeCard, displayTitle } from "@/lib/anilist";

export function AnimeRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-[300px] w-[180px] shrink-0 animate-pulse rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

export default function AnimeRow({ items }: { items: AnimeCard[] }) {
  if (items.length === 0) {
    return (
      <p className="card px-5 py-8 text-center text-muted">
        The seas are rough — couldn&apos;t reach the anime database right now. Try again in a bit.
      </p>
    );
  }

  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-color:var(--straw)_transparent] [scrollbar-width:thin] sm:-mx-6 sm:px-6">
      {items.map((a, i) => (
        <li key={a.id} className="w-[160px] shrink-0 snap-start sm:w-[180px]">
          <Link
            href={`/anime/${a.id}`}
            className="group relative block overflow-hidden rounded-2xl border-2 border-ink shadow-[4px_4px_0_var(--ink)] transition duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg] focus-visible:outline-2 focus-visible:outline-straw"
            style={{ background: a.coverImage.color ?? "#1d2c5e" }}
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={a.coverImage.large}
                alt={`${displayTitle(a)} cover`}
                fill
                sizes="180px"
                className="object-cover"
                priority={i < 4}
              />
              {a.averageScore != null && (
                <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-xs font-extrabold text-straw">
                  ★ {(a.averageScore / 10).toFixed(1)}
                </span>
              )}
              {a.nextAiringEpisode && (
                <span className="absolute left-2 top-2 rounded-full bg-sash px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                  Ep {a.nextAiringEpisode.episode} soon
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
                <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{displayTitle(a)}</h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-white/70">
                  {[a.studios.nodes[0]?.name, a.seasonYear].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 bg-sea-deep/95 p-2">
              {a.genres.slice(0, 2).map((g) => (
                <span key={g} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-foam">
                  {g}
                </span>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
