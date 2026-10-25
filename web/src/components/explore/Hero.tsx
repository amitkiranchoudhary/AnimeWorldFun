import Link from "next/link";
import { Suspense } from "react";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { getAllTimeGreats, getTrending } from "@/lib/anilist";
import PosterRing from "./PosterRing";
import { toQuery } from "./query";
import s from "./explore.module.css";

// Ready-made voyages: one click into a popular filter combination
const PRESETS = [
  { label: "Airing now", icon: "📡", href: toQuery({ status: "RELEASING", sort: "trending" }) },
  { label: "Top rated", icon: "★", href: toQuery({ sort: "score" }) },
  { label: "Movies", icon: "🎬", href: toQuery({ format: "MOVIE", sort: "score" }) },
  { label: "Coming soon", icon: "🏮", href: toQuery({ status: "NOT_YET_RELEASED" }) },
  { label: "Romance", icon: "🌸", href: toQuery({ genres: ["Romance"] }) },
];

/** The curved wall of posters behind the title: trending + all-time greats. */
async function HeroRing() {
  const [trending, greats] = await Promise.all([getTrending(), getAllTimeGreats()]);
  const seen = new Set<number>();
  const posters = [...trending, ...greats]
    .filter((a) => !seen.has(a.id) && seen.add(a.id))
    .slice(0, 24)
    .map((a) => ({ id: a.id, src: a.coverImage.large, color: a.coverImage.color }));
  // too few posters would leave gaps in the ring
  if (posters.length < 12) return null;
  return <PosterRing posters={posters} />;
}

/** Cinematic opening scene: poster ring, glowing title, subtitle captions, quick links. */
export default function ExploreHero() {
  return (
    <section className={s.hero} aria-labelledby="explore-title">
      <div aria-hidden className={s.glow} style={{ left: "-10%", top: "4%", width: "46vw", height: "46vw", background: "rgba(255, 110, 180, 0.22)" }} />
      <div aria-hidden className={s.glow} style={{ right: "-12%", top: "18%", width: "40vw", height: "40vw", background: "rgba(242, 201, 76, 0.16)", animationDelay: "-3s" }} />
      <div aria-hidden className={s.glow} style={{ left: "30%", bottom: "-20%", width: "50vw", height: "30vw", background: "rgba(230, 57, 70, 0.18)", animationDelay: "-5s" }} />

      <Suspense fallback={null}>
        <HeroRing />
      </Suspense>
      <div aria-hidden className={s.vignette} />

      {/* big side labels, like a film's spine */}
      <span aria-hidden className={`${s.sideLabel} absolute left-4 top-1/2 hidden -translate-y-1/2 md:block lg:left-6`}>
        探索 · Explore
      </span>
      <span aria-hidden className={`${s.sideLabel} absolute right-4 top-1/2 hidden -translate-y-1/2 md:block lg:right-6`}>
        Vol. 01 · The whole ocean
      </span>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 md:px-14 lg:px-16">
        <Reveal y={14} blur={4}>
          <p className={`${s.kicker} font-display text-base sm:text-lg`}>The whole ocean · 全ての海</p>
        </Reveal>

        <h1 id="explore-title" className={`${s.heroTitle} mt-3`}>
          <span className="sr-only">Explore anime</span>
          <span aria-hidden className="block">
            <SplitText as="span" by="char" text="Explore" stagger={45} delay={120} />
          </span>
          <span aria-hidden className="block pl-[10vw] sm:pl-[16vw]">
            <SplitText as="span" by="char" text="anime" stagger={45} delay={480} className={s.heroTitleOutline} />
          </span>
        </h1>

        <Reveal delay={750} y={18} className="mt-6">
          <p className={s.subtitle}>
            <span>
              Every anime on AniList — filter by genre, format, season, year, status and where it streams, or sort A to Z.
            </span>
          </p>
        </Reveal>

        <Reveal delay={950} y={18} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
          <Magnetic strength={0.22}>
            <a href="#explore-filters" className={`${s.cta} shimmer`}>
              Start exploring <span aria-hidden className={s.ctaArrow}>↓</span>
            </a>
          </Magnetic>
          <nav aria-label="Quick voyages" className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Link key={p.label} href={p.href} className={`${s.preset} shimmer`}>
                <span aria-hidden>{p.icon}</span>
                {p.label}
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>

      <div aria-hidden className="absolute bottom-8 right-6 hidden flex-col items-center gap-3 md:flex lg:right-10">
        <span className="font-display text-xs tracking-[0.4em] text-white/40 [writing-mode:vertical-rl]">Scroll</span>
        <span className={s.cue} />
      </div>
    </section>
  );
}
