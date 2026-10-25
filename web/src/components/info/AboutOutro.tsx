import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";

// End-credits roll for the About story
const CREDITS = [
  ["Story, code & late nights", "One anime fan"],
  ["Anime data", "AniList"],
  ["Artwork", "Its respective studios and owners"],
  ["Price of admission", "Free, forever"],
];

/** The closing scene: a big "Set sail" call to action and a short credits roll. */
export default function AboutOutro() {
  return (
    <section aria-label="Set sail" className="relative overflow-hidden px-4 pb-10 pt-24 text-center sm:px-6 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_40%,rgba(242,201,76,0.14),transparent_70%)]" />

      <Reveal y={12} blur={4}>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-muted sm:text-xs">The end of the prologue</p>
      </Reveal>
      <SplitText
        text="Set sail."
        as="h2"
        by="char"
        stagger={60}
        className="mt-4 font-display text-[clamp(4rem,18vw,13rem)] uppercase leading-[0.85] tracking-wide text-straw text-glow-gold"
      />
      <Reveal delay={300} className="mx-auto mt-6 max-w-lg">
        <p className="leading-relaxed text-muted">
          Find your next anime and exactly where to watch it. Spotted wrong stream info or a missing dub? Tell the captain
          — every message helps the map get better.
        </p>
      </Reveal>

      <Reveal delay={450} className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Magnetic>
          <Link
            href="/explore"
            className="shimmer relative inline-flex overflow-hidden rounded-full bg-straw px-7 py-3.5 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] outline-none transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#ff9fc8]"
          >
            Explore the database →
          </Link>
        </Magnetic>
        <Magnetic>
          <Link
            href="/contact"
            className="glass inline-flex rounded-full px-7 py-3.5 font-extrabold text-text outline-none transition-colors duration-500 hover:text-[#ff9fc8] focus-visible:ring-4 focus-visible:ring-straw"
          >
            Send a message in a bottle
          </Link>
        </Magnetic>
      </Reveal>

      <dl className="mx-auto mt-24 grid max-w-md gap-5 border-t border-white/10 pt-10 font-mono text-xs uppercase tracking-[0.25em]">
        {CREDITS.map(([role, who], i) => (
          <Reveal key={role} delay={i * 90} y={14} blur={3}>
            <dt className="text-white/35">{role}</dt>
            <dd className="mt-1 text-text/85">{who}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
