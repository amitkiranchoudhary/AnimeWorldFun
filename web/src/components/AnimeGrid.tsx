import Image from "next/image";
import Link from "next/link";
import { type AnimeCard, displayTitle, FORMATS } from "@/lib/anilist";

export function AnimeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

export default function AnimeGrid({ items }: { items: AnimeCard[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((a, i) => (
        <li key={a.id}>
          <Link
            href={`/anime/${a.id}`}
            className="group block overflow-hidden rounded-2xl border-2 border-ink shadow-[4px_4px_0_var(--ink)] transition duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg] focus-visible:outline-2 focus-visible:outline-straw"
            style={{ background: a.coverImage.color ?? "#1d2c5e" }}
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={a.coverImage.large}
                alt={`${displayTitle(a)} cover`}
                fill
                sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 50vw"
                className="object-cover"
                priority={i < 6}
              />
              {a.averageScore != null && (
                <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-xs font-extrabold text-straw">
                  ★ {(a.averageScore / 10).toFixed(1)}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
                <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{displayTitle(a)}</h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-white/70">
                  {[a.format && (FORMATS[a.format] ?? a.format), a.seasonYear, a.episodes && `${a.episodes} eps`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
