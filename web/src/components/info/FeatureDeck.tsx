import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import TiltCard from "@/components/motion/TiltCard";

// What the site does today, and what's still being built — said plainly.
const FEATURES = [
  {
    no: "01",
    title: "Explore every anime",
    body: "Search thousands of titles in English, Japanese or romaji, and filter by genre, format, status, season, year and streaming platform.",
    status: "live" as const,
    href: "/explore",
    cta: "Open the database",
  },
  {
    no: "02",
    title: "Where to watch — honestly",
    body: "Every anime page lists its official streaming platforms with what we know about subs and dubs, and says “not confirmed yet” instead of guessing.",
    status: "live" as const,
    href: "/explore",
    cta: "Pick a show",
  },
  {
    no: "03",
    title: "Track your voyage",
    body: "Mark shows as Watching, Completed or Plan to Watch and keep count of episodes. Being built in the shipyard right now.",
    status: "soon" as const,
    href: "/my-list",
    cta: "Peek at My List",
  },
  {
    no: "04",
    title: "Read-along blogs",
    body: "Reviews, watch-order guides and seasonal picks you can listen to, each word lighting up as it's read aloud.",
    status: "soon" as const,
    href: "/blog",
    cta: "Visit the blog",
  },
];

/** "The ship's log": the four things Anime World Fun does, as tilting glass cards. */
export default function FeatureDeck() {
  return (
    <section aria-label="What Anime World Fun does" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="text-center">
        <Reveal y={12} blur={4}>
          <p className="font-display text-lg tracking-[0.2em] text-sash">The ship&apos;s log</p>
        </Reveal>
        <SplitText
          text="What the ship carries"
          as="h2"
          className="title-stroke mt-1 text-[clamp(2.6rem,8vw,5rem)] leading-none"
          style={{ textShadow: "none" }}
        />
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f, i) => (
          <Reveal as="li" key={f.no} delay={i * 110} scale={0.97}>
            <TiltCard max={6} className="h-full rounded-[1.4rem]">
              <article className="feature-card glass shimmer group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] p-6 sm:p-8">
                <span aria-hidden className="feature-no pointer-events-none absolute -right-2 -top-6 font-display">
                  {f.no}
                </span>
                <p
                  className={`w-fit rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] ${
                    f.status === "live" ? "bg-straw text-ink" : "border border-white/20 text-muted"
                  }`}
                >
                  {f.status === "live" ? "Live now" : "Coming soon"}
                </p>
                <h3 className="mt-5 font-display text-3xl tracking-wide text-text sm:text-4xl">{f.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{f.body}</p>
                <Link
                  href={f.href}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full font-extrabold text-straw outline-none after:absolute after:inset-0 after:rounded-[1.4rem] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-straw"
                >
                  {f.cta}
                  <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </ul>

      <style href="awf-feature-deck" precedence="default">{`
        .feature-card { transition: border-color .5s var(--ease-out), box-shadow .5s var(--ease-out); }
        .feature-card:hover, .feature-card:focus-within {
          border-color: rgba(255,150,200,0.35);
          box-shadow: 0 30px 80px -30px rgba(255,120,180,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .feature-no {
          font-size: 8.5rem; line-height: 1; color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,150,200,0.22);
          transition: -webkit-text-stroke-color .5s var(--ease-out), transform .7s var(--ease-out);
        }
        .feature-card:hover .feature-no { -webkit-text-stroke-color: rgba(255,150,200,0.55); transform: translateY(6px); }
      `}</style>
    </section>
  );
}
