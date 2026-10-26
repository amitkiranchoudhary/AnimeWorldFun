import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";
import CaptainChibi from "@/components/CaptainChibi";
import { DriftPetals, LanternBoat, Moon, Stars, Waves } from "@/components/info/Sea";

export const metadata: Metadata = {
  title: "Lost at sea",
  robots: { index: false, follow: false },
};

// 404: a little lantern boat drifting alone on a moonlit sea, far from any page.
export default function NotFound() {
  return (
    <section className="lost relative isolate flex min-h-[calc(100svh-4rem)] flex-col items-center overflow-hidden px-4 pt-24 text-center sm:px-6 sm:pt-28">
      {/* night sky */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#05060d_0%,#0a1430_45%,#1d2c5e_78%,#3a2a55_100%)]" />
      <Stars className="-z-10" />
      <Moon className="right-[10%] top-[14%] -z-10 h-16 w-16 sm:h-24 sm:w-24" />
      <DriftPetals count={8} className="-z-10" />

      {/* huge faint 404 in the sky */}
      <p aria-hidden className="lost-404 pointer-events-none absolute left-1/2 top-[8%] -z-10 -translate-x-1/2 select-none font-display leading-none">
        404
      </p>

      <Reveal y={12} blur={4}>
        <p className="font-display text-lg tracking-[0.25em] text-sash">404 · no island here</p>
      </Reveal>
      <SplitText
        text="Lost at sea"
        as="h1"
        by="char"
        stagger={45}
        delay={120}
        className="mt-2 font-display text-[clamp(3.4rem,14vw,8.5rem)] uppercase leading-[0.9] tracking-wide text-text text-glow-pink"
      />
      <Reveal delay={350} className="mt-4">
        <CaptainChibi pose="sleeping" className="w-40 sm:w-52" label="The Captain asleep on his hat" />
      </Reveal>
      <Reveal delay={500} className="mx-auto mt-3 max-w-md">
        <p className="leading-relaxed text-muted">
          This page sailed off the edge of the map. The link may be old, or the page never existed. Let&apos;s light the
          lantern and head somewhere real.
        </p>
      </Reveal>
      <Reveal delay={700} className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
        <Magnetic>
          <Link
            href="/"
            className="shimmer relative inline-flex overflow-hidden rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] outline-none focus-visible:ring-4 focus-visible:ring-[#ff9fc8]"
          >
            ← Back to the harbour
          </Link>
        </Magnetic>
        <Magnetic>
          <Link
            href="/explore"
            className="glass inline-flex rounded-full px-6 py-3 font-extrabold text-text outline-none transition-colors duration-500 hover:text-straw focus-visible:ring-4 focus-visible:ring-straw"
          >
            Explore every anime
          </Link>
        </Magnetic>
      </Reveal>

      {/* the sea, with the boat riding the middle swell */}
      <div aria-hidden className="relative mt-auto h-[34svh] min-h-[200px] w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
        <div className="lost-moonpath pointer-events-none absolute bottom-0 top-[18%]" />
        <Waves className="inset-0" />
        <LanternBoat className="z-[2] left-[8%] top-[-6%] w-[min(38vw,180px)] sm:left-[14%]" />
      </div>

      <style href="awf-lost-at-sea" precedence="default">{`
        .lost-404 {
          font-size: clamp(10rem, 42vw, 26rem);
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,150,200,0.16);
          text-shadow: 0 0 80px rgba(255,120,180,0.18);
          animation: float 9s ease-in-out infinite;
        }
        /* moonlight shimmering on the water, under the waves' crests */
        .lost-moonpath {
          right: 2%; left: auto; width: 34%;
          background: radial-gradient(40% 60% at 70% 40%, rgba(255,236,190,0.25), transparent 70%);
          filter: blur(4px);
          animation: glow-pulse 3.4s ease-in-out infinite;
          z-index: 1;
        }
        @media (prefers-reduced-motion: reduce) { .lost-404, .lost-moonpath { animation: none; } }
      `}</style>
    </section>
  );
}
