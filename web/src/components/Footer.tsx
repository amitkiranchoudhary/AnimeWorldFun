import Link from "next/link";
import { cacheLife } from "next/cache";
import type { CSSProperties, ReactNode } from "react";
import { LogoMark } from "./Logo";
import { BackToTop } from "./Navbar";
import Reveal from "./motion/Reveal";
import SplitText from "./motion/SplitText";
import Marquee from "./motion/Marquee";
import Magnetic from "./motion/Magnetic";
import { GENRES } from "@/lib/anilist";

async function Year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

// every AniList genre except the one that is not family-friendly
const TICKER_GENRES = GENRES.filter((g) => g !== "Ecchi");

const genreHref = (g: string) => `/explore?genre=${encodeURIComponent(g)}`;

const COLUMNS = [
  {
    title: "Explore",
    jp: "探索",
    links: [
      { href: "/explore", label: "Anime Database" },
      { href: "/my-list", label: "My List" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Genres",
    jp: "ジャンル",
    links: ["Action", "Adventure", "Romance", "Slice of Life"].map((g) => ({ href: genreHref(g), label: g })),
  },
  {
    title: "About",
    jp: "案内",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/about#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

// Fan favourites for the slow ticker (plain text, not links)
const TITLES = [
  "One Piece", "Spirited Away", "Frieren", "Cowboy Bebop", "Naruto", "Your Name", "Fullmetal Alchemist",
  "Haikyu!!", "Attack on Titan", "Spy × Family", "Demon Slayer", "Mob Psycho 100",
];

/* ── Small pieces ──────────────────────────────────────────────────────── */

// Decorative sakura blossom (5 petals). Kept server-side here so the genre
// ticker renders plain SVG instead of many client references.
function Blossom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      {[0, 72, 144, 216, 288].map((r) => (
        <path
          key={r}
          d="M20 20 C 14 12, 15 4, 20 2 C 25 4, 26 12, 20 20 Z"
          fill="#ffc1dc"
          fillOpacity="0.9"
          transform={`rotate(${r} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="2.6" fill="#f2c94c" />
    </svg>
  );
}

// A link whose gradient underline draws in from the left on hover/focus
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="ft-link group relative inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-semibold text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
    >
      <span aria-hidden className="ft-arrow text-straw">
        →
      </span>
      <span className="ft-label">{children}</span>
    </Link>
  );
}

// A hanging paper lantern that sways in the sea breeze
function Lantern({ id, className = "", style }: { id: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 140" className={`ft-lantern ${className}`} style={style} aria-hidden focusable="false">
      <line x1="30" y1="0" x2="30" y2="46" stroke="rgba(242,201,76,0.45)" strokeWidth="1.5" />
      <rect x="20" y="44" width="20" height="8" rx="2" fill="#2a1a10" />
      <ellipse cx="30" cy="84" rx="26" ry="32" fill={`url(#${id})`} />
      {[70, 84, 98].map((y) => (
        <path key={y} d={`M6 ${y} Q30 ${y + 6} 54 ${y}`} stroke="rgba(80,10,10,0.35)" strokeWidth="1.2" fill="none" />
      ))}
      <rect x="20" y="114" width="20" height="8" rx="2" fill="#2a1a10" />
      <line x1="30" y1="122" x2="30" y2="138" stroke="#f2c94c" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ffb36b" />
          <stop offset="0.55" stopColor="#e63946" />
          <stop offset="1" stopColor="#8f1d26" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// One period of a rolling wave, repeated so the strip can slide by half its
// width and loop seamlessly (viewBox is 2880 wide: two screens of waves).
function wavePath(top: number, amp: number) {
  let d = `M0 ${top} Q 180 ${top - amp} 360 ${top}`;
  for (let x = 720; x <= 2880; x += 360) d += ` T ${x} ${top}`;
  return `${d} V 120 H 0 Z`;
}

// The sea the wordmark sits on: two wave layers drifting at different speeds,
// a glint of sunset on the water and a little pirate ship sailing past.
function Sea() {
  return (
    <div aria-hidden className="ft-sea pointer-events-none relative">
      <svg className="ft-wave ft-wave-back" viewBox="0 0 2880 120" preserveAspectRatio="none" focusable="false">
        <path d={wavePath(46, 22)} fill="rgba(31, 95, 143, 0.38)" />
      </svg>
      <div className="ft-ship-lane">
        <svg className="ft-ship" viewBox="0 0 64 56" focusable="false">
          <line x1="32" y1="4" x2="32" y2="40" stroke="#3a2416" strokeWidth="2.4" />
          <path d="M33 7 Q 52 15 50 31 L 33 31 Z" fill="#fff3d6" />
          <circle cx="41" cy="20" r="4.2" fill="#2a1a10" />
          <path d="M35.6 19 H 46.4" stroke="#f2c94c" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M31 10 Q 18 18 20 31 L 31 31 Z" fill="#ffe9b8" opacity="0.85" />
          <path d="M32 2 L 40 4.5 L 32 7 Z" fill="#e63946" />
          <path d="M6 38 H 58 L 50 50 Q 32 54 14 50 Z" fill="#5a341c" />
          <path d="M8 40.5 H 56" stroke="#f2c94c" strokeWidth="1.4" opacity="0.8" />
        </svg>
      </div>
      <svg className="ft-wave ft-wave-front" viewBox="0 0 2880 120" preserveAspectRatio="none" focusable="false">
        <path d={wavePath(64, 14)} fill="#0b1726" />
      </svg>
      <span className="ft-glint" />
    </div>
  );
}

function Sep() {
  return <Blossom className="mx-5 h-5 w-5 shrink-0 self-center opacity-80 sm:mx-7 sm:h-6 sm:w-6" />;
}

/* ── Footer ────────────────────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="ft relative mt-24 overflow-hidden">
      <style>{FOOTER_CSS}</style>

      {/* scenery: sunset glow on the horizon, warm and cool light pools */}
      <div aria-hidden className="ft-sky pointer-events-none absolute inset-0" />
      <div aria-hidden className="ft-horizon pointer-events-none absolute inset-x-0 top-0" />
      <span aria-hidden className="ft-side-label pointer-events-none absolute right-4 top-40 hidden font-display lg:block">
        最終回 · The End · Anime World Fun
      </span>

      {/* ── Chapter end: next-episode card ── */}
      <section aria-label="Next episode" className="relative mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pt-24">
        <Lantern id="ft-lantern-a" className="absolute left-[3%] top-0 hidden w-10 sm:block" style={{ "--d": "-1.2s" } as CSSProperties} />
        <Lantern id="ft-lantern-b" className="absolute right-[5%] top-0 w-8 sm:w-12" style={{ "--d": "0s" } as CSSProperties} />

        <Reveal as="p" y={14} className="mb-5 text-center text-[11px] font-extrabold uppercase tracking-[0.4em] text-sash">
          次回予告 · Next episode
        </Reveal>
        <SplitText
          as="h2"
          text="The adventure continues next episode"
          stagger={70}
          className="ft-headline mx-auto max-w-4xl text-center font-display leading-[0.95] tracking-wide text-text"
        />
        <Reveal delay={350} y={12} className="mt-7 text-center">
          <p className="ft-subtitle text-sm sm:text-base">
            <span>Keep sailing, nakama — new stories wash ashore every week.</span>
          </p>
        </Reveal>
        <Reveal delay={500} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic strength={0.25}>
            <Link
              href="/explore"
              className="shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[0_10px_34px_-10px_rgba(242,201,76,0.75)] transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw"
            >
              Explore anime <span aria-hidden>→</span>
            </Link>
          </Magnetic>
          <Magnetic strength={0.25}>
            <Link
              href="/blog"
              className="glass shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-extrabold text-text transition-colors duration-500 hover:text-straw focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw"
            >
              Read the crew&apos;s blog
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      {/* ── Crossing ribbons: genres and fan favourites ── */}
      <div className="relative py-10 sm:py-14">
        <div className="ft-ribbon ft-ribbon-gold">
          <Marquee seconds={55} label="Anime genres" className="py-3 sm:py-4">
            {TICKER_GENRES.map((g) => (
              <span key={g} className="flex items-center">
                <span className="font-display text-3xl tracking-wide text-ink sm:text-5xl">{g}</span>
                <Sep />
              </span>
            ))}
          </Marquee>
        </div>
        <div className="ft-ribbon ft-ribbon-dark">
          <Marquee seconds={70} reverse label="Fan-favourite titles" className="py-2.5 sm:py-3">
            {TITLES.map((t) => (
              <span key={t} className="flex items-center">
                <span className="ft-outline font-display text-2xl tracking-wider sm:text-4xl">{t}</span>
                <span aria-hidden className="mx-5 text-sm text-straw/70 sm:mx-7">
                  ✦
                </span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ── Credits and link columns ── */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 pb-6 pt-6 sm:px-6 md:grid-cols-[1.7fr_1fr_1fr_1fr]">
        <Reveal className="col-span-2 md:col-span-1">
          <LogoMark className="h-20" text="text-3xl" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A fan-made harbour for anime lovers: find where to watch, in which language, track what you&apos;ve seen,
            and read stories from the crew.
          </p>
          <p className="mt-4 text-xs text-muted/80">
            Anime data provided by{" "}
            <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="ft-inline">
              AniList
            </a>
            . All anime titles and artwork belong to their respective owners.
          </p>
          <p className="mt-2 text-xs text-muted/80">
            Cherry blossom photo:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Sakura_branch_(52013006346).jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-inline"
            >
              &ldquo;Sakura branch&rdquo; by Raita Futo
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer" className="ft-inline">
              CC BY 2.0
            </a>
            , background removed.
          </p>
        </Reveal>
        {COLUMNS.map((col, i) => (
          <Reveal key={col.title} delay={120 + i * 110} className={i === 2 ? "col-span-2 sm:col-span-1" : undefined}>
            <h3 className="flex items-baseline gap-2 font-display text-xl tracking-wide text-straw">
              {col.title}
              <span aria-hidden className="text-sm text-white/25">
                {col.jp}
              </span>
            </h3>
            <ul className="mt-3 space-y-1.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      {/* ── Giant outlined wordmark (decorative: the logo above names the site) ── */}
      <div aria-hidden className="ft-mark-wrap relative mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <SplitText as="div" by="char" stagger={40} text="ANIME WORLD FUN" className="ft-mark text-center font-display leading-none" />
      </div>

      <Sea />

      {/* ── End credits bar: the deep water under the waves ── */}
      <div className="ft-deep relative">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-muted sm:flex-row sm:px-6 sm:text-left">
          <p>
            © <Year /> Anime World Fun · Made with 🍖 by a fan, for fans ·{" "}
            <Link
              href="/login"
              className="rounded underline-offset-2 hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              Captain&apos;s login
            </Link>
          </p>
          <Magnetic strength={0.3}>
            <BackToTop className="ft-top group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-bold text-text transition-colors duration-300 hover:border-straw/60 hover:text-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw">
              Back to the top
              <span aria-hidden className="ft-top-arrow inline-block">
                ↑
              </span>
            </BackToTop>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}

/* Footer-only styles. Motion is transform/opacity (plus a slow stroke-colour
   wave on the wordmark); reduced motion is handled at the bottom. */
const FOOTER_CSS = `
.ft-sky {
  background:
    radial-gradient(70% 38% at 50% 0%, rgba(255, 120, 180, 0.16), transparent 70%),
    radial-gradient(45% 30% at 0% 55%, rgba(242, 201, 76, 0.08), transparent 70%),
    radial-gradient(60% 40% at 100% 100%, rgba(31, 95, 143, 0.22), transparent 70%),
    linear-gradient(180deg, rgba(10, 8, 15, 0.5) 0%, rgba(10, 8, 15, 0.9) 14rem, #0a080f 100%);
}
.ft-horizon {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff8fc4 30%, var(--straw) 50%, #ff8fc4 70%, transparent);
  box-shadow: 0 0 18px 1px rgba(255, 143, 196, 0.55);
  opacity: 0.8;
}
.ft-side-label {
  writing-mode: vertical-rl;
  font-size: 0.85rem;
  letter-spacing: 0.45em;
  color: rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.ft-headline {
  font-size: clamp(2.6rem, 9vw, 6.5rem);
  text-shadow: 0 0 30px rgba(255, 150, 200, 0.35), 0 0 80px rgba(255, 120, 180, 0.18);
}
.ft-subtitle span {
  font-style: italic;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.25em 0.7em;
  line-height: 2;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  text-shadow: 0 1px 2px #000;
}

@keyframes ft-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
.ft-lantern {
  transform-origin: 50% 0;
  filter: drop-shadow(0 0 16px rgba(255, 140, 90, 0.55));
  animation: ft-sway 5.5s ease-in-out var(--d, 0s) infinite;
}

/* two ribbons crossing like festival banners; extra width hides the tilted ends */
.ft-ribbon {
  position: relative;
  width: 112%;
  margin-left: -6%;
}
.ft-ribbon-gold {
  z-index: 1;
  transform: rotate(-2.2deg);
  background: linear-gradient(90deg, #e9b93a, var(--straw) 40%, #ffd96a 60%, var(--straw));
  box-shadow: 0 14px 40px -14px rgba(242, 201, 76, 0.6);
}
.ft-ribbon-dark {
  margin-top: -0.75rem;
  transform: rotate(1.6deg);
  background: rgba(14, 10, 20, 0.88);
  border-block: 1px solid rgba(255, 143, 196, 0.25);
  box-shadow: 0 0 40px -10px rgba(255, 120, 180, 0.35);
}
.ft-outline {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 193, 220, 0.75);
}

/* link columns: arrow slides in, gradient underline draws from the left */
.ft-link {
  transition: color 0.35s var(--ease-out);
}
.ft-arrow {
  display: inline-block;
  width: 0;
  opacity: 0;
  transform: translate3d(-6px, 0, 0);
  transition: width 0.45s var(--ease-out), opacity 0.35s var(--ease-out), transform 0.45s var(--ease-out);
}
.ft-label {
  position: relative;
}
.ft-label::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1.5px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--straw), #ff8fc4);
  box-shadow: 0 0 8px rgba(255, 143, 196, 0.5);
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.5s var(--ease-out);
}
.ft-link:hover,
.ft-link:focus-visible,
.ft-link:active {
  color: var(--text);
}
.ft-link:hover .ft-arrow,
.ft-link:focus-visible .ft-arrow {
  width: 1em;
  opacity: 1;
  transform: none;
}
.ft-link:hover .ft-label::after,
.ft-link:focus-visible .ft-label::after,
.ft-link:active .ft-label::after {
  transform: scaleX(1);
  transform-origin: left center;
}
.ft-inline {
  text-decoration: underline;
  text-underline-offset: 2px;
  border-radius: 2px;
  transition: color 0.3s var(--ease-out);
}
.ft-inline:hover {
  color: var(--straw);
}
.ft-inline:focus-visible {
  outline: 2px solid var(--straw);
  outline-offset: 2px;
}

/* the giant wordmark: gold outlines, a pink lantern-light wave rolls across
   the letters, and hovering fills them with gold one after another */
.ft-mark {
  font-size: min(12vw, 10.5rem);
  letter-spacing: 0.02em;
  filter: drop-shadow(0 0 22px rgba(255, 120, 180, 0.28));
}
@keyframes ft-stroke-wave {
  0%, 14%, 100% { -webkit-text-stroke-color: rgba(242, 201, 76, 0.5); }
  6% { -webkit-text-stroke-color: #ffc1dc; }
}
.ft-mark .split-piece {
  color: rgba(242, 201, 76, 0.03);
  -webkit-text-stroke: 1.5px rgba(242, 201, 76, 0.5);
  animation: ft-stroke-wave 9s ease-in-out infinite;
  animation-delay: calc(1.8s + var(--i, 0) * 0.09s);
  transition-property: transform, opacity, color;
  transition-duration: 0.9s, 0.6s, 0.5s;
  transition-timing-function: var(--ease-out);
  transition-delay:
    calc(var(--split-delay, 0ms) + var(--i, 0) * var(--split-stagger, 45ms)),
    calc(var(--split-delay, 0ms) + var(--i, 0) * var(--split-stagger, 45ms)),
    calc(var(--i, 0) * 30ms);
}
.ft-mark:hover .split-piece {
  color: var(--straw);
}
@media (min-width: 640px) {
  .ft-mark .split-piece {
    -webkit-text-stroke-width: 2px;
  }
}
/* where the browser supports scroll-driven animation, the wordmark rises
   out of the dark as the bottom of the page arrives. The range ends once the
   wrap has fully entered, which is always reached at the end of the page. */
@keyframes ft-rise {
  from { transform: translate3d(0, 28%, 0) scale(0.94); opacity: 0.35; }
  to { transform: none; opacity: 1; }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .ft-mark-wrap {
      animation: ft-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 100%;
    }
    /* the tide swells up under the wordmark as the credits arrive */
    .ft-sea {
      animation: ft-swell linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 100%;
    }
  }
}
@keyframes ft-swell {
  from { transform: translate3d(0, 22%, 0); }
  to { transform: none; }
}

/* the sea: the wordmark dips into a translucent back wave; the opaque front
   wave flows straight into the deep-water credits bar below */
.ft-sea {
  height: clamp(72px, 10vw, 140px);
  margin-top: calc(-1 * clamp(0.5rem, 3.2vw, 3.4rem));
  /* skip painting the endless waves and ship while far off screen */
  content-visibility: auto;
  contain-intrinsic-size: auto clamp(72px, 10vw, 140px);
}
@keyframes ft-tide {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.ft-wave {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 200%;
  height: 100%;
  animation: ft-tide 26s linear infinite;
}
.ft-wave-back {
  animation-duration: 38s;
  animation-direction: reverse;
  filter: drop-shadow(0 -6px 18px rgba(255, 143, 196, 0.18));
}
.ft-deep {
  background: #0b1726;
}
.ft-glint {
  position: absolute;
  left: 25%;
  right: 25%;
  top: 48%;
  height: 18%;
  border-radius: 50%;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 193, 220, 0.4), rgba(242, 201, 76, 0.12) 55%, transparent 75%);
  mix-blend-mode: screen;
  animation: glow-pulse 5s ease-in-out infinite;
}
/* the ship crosses the whole width (lane slides by its own width), bobbing;
   the lane sits low so only the mast tip grazes the feet of the letters and
   the front wave hides the waterline */
@keyframes ft-sail {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(100% + 160px), 0, 0); }
}
@keyframes ft-bob {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-3deg); }
  50% { transform: translate3d(0, -4px, 0) rotate(3deg); }
}
.ft-ship-lane {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 32%;
  height: clamp(36px, 4.6vw, 58px);
  animation: ft-sail 60s linear -21s infinite;
}
.ft-ship {
  position: absolute;
  left: -80px;
  bottom: 0;
  height: 100%;
  width: auto;
  aspect-ratio: 64 / 56;
  transform-origin: 50% 85%;
  filter: drop-shadow(0 0 10px rgba(242, 201, 76, 0.25));
  animation: ft-bob 3.4s ease-in-out infinite;
}

.ft-top-arrow {
  transition: transform 0.5s var(--ease-out);
}
.ft-top:hover .ft-top-arrow,
.ft-top:focus-visible .ft-top-arrow {
  transform: translate3d(0, -3px, 0);
}

@media (prefers-reduced-motion: reduce) {
  .ft-lantern,
  .ft-mark .split-piece,
  .ft-wave,
  .ft-ship,
  .ft-glint {
    animation: none;
  }
  /* the ship lies at anchor at the right edge of the sea */
  .ft-ship-lane {
    animation: none;
    transform: translate3d(100%, 0, 0);
  }
  .ft-sea {
    animation: none;
  }
  .ft-mark .split-piece {
    transition-delay: 0s;
  }
}
`;
