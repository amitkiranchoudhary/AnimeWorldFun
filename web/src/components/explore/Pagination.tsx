import Link from "next/link";
import Magnetic from "@/components/motion/Magnetic";
import type { ExploreFilters } from "@/lib/anilist";
import { toQuery } from "./query";
import s from "./explore.module.css";

/** Previous / page number / next, with buttons that lean toward the mouse. */
export default function Pagination({ f, hasNextPage }: { f: ExploreFilters; hasNextPage: boolean }) {
  const page = f.page ?? 1;
  if (page === 1 && !hasNextPage) return null;
  return (
    <nav className="mt-14 flex items-center justify-center gap-3 sm:gap-6" aria-label="Pagination">
      {page > 1 ? (
        <Magnetic strength={0.3}>
          <Link href={toQuery(f, { page: page - 1 })} className={`${s.pageBtn} ${s.pagePrev}`}>
            <span aria-hidden className={s.pageArrow}>←</span> Previous
          </Link>
        </Magnetic>
      ) : null}
      <p className="flex flex-col items-center leading-none">
        <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.3em] text-muted">Page</span>
        <span className="title-stroke mt-1 text-4xl sm:text-5xl">{page}</span>
      </p>
      {hasNextPage ? (
        <Magnetic strength={0.3}>
          <Link href={toQuery(f, { page: page + 1 })} className={`${s.pageBtn} ${s.pageNext} shimmer`}>
            Next <span aria-hidden className={s.pageArrow}>→</span>
          </Link>
        </Magnetic>
      ) : null}
    </nav>
  );
}
