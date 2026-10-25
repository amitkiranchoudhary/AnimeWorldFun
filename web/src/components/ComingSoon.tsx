import Image from "next/image";
import Link from "next/link";
import compass from "../../public/images/compass.png";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import { Stars, Waves } from "@/components/info/Sea";

// Placeholder for pages that land in later phases: a compass glowing over a
// night sea, with the page's name and a way back to the harbour.
export default function ComingSoon({ title, phase, body }: { title: string; phase: string; body: string }) {
  return (
    <section className="relative isolate flex min-h-[80svh] flex-col items-center overflow-hidden px-4 pb-[max(calc(22svh+2.5rem),170px)] pt-24 text-center sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_30%,rgba(242,201,76,0.12),transparent_70%)]" />
      <Stars count={28} className="-z-10 opacity-70" />

      <Reveal scale={0.9} className="relative">
        <span aria-hidden className="soon-ring absolute -inset-6 rounded-full" />
        <Image
          src={compass}
          alt=""
          className="relative h-auto w-32 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          style={{ animation: "compass-wobble 3s ease-in-out infinite" }}
        />
      </Reveal>
      <Reveal delay={150} y={14}>
        <p className="mt-8 font-display text-lg tracking-[0.2em] text-sash">{phase}</p>
      </Reveal>
      <Reveal delay={250} as="h1" className="title-stroke mt-1 text-5xl sm:text-6xl">
        {title}
      </Reveal>
      <Reveal delay={380} className="mx-auto mt-5 max-w-2xl">
        <p className="leading-relaxed text-muted">{body}</p>
      </Reveal>
      <Reveal delay={500} className="relative z-10 mt-8">
        <Magnetic>
          <Link
            href="/"
            className="shimmer relative inline-flex overflow-hidden rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] outline-none focus-visible:ring-4 focus-visible:ring-[#ff9fc8]"
          >
            ← Back to the harbour
          </Link>
        </Magnetic>
      </Reveal>

      <Waves className="inset-x-0 bottom-0 -z-10 h-[22svh] min-h-[130px]" />

      <style href="awf-coming-soon" precedence="default">{`
        .soon-ring {
          border: 1px dashed rgba(242,201,76,0.35);
          box-shadow: 0 0 40px rgba(242,201,76,0.2), inset 0 0 30px rgba(242,201,76,0.12);
          animation: soon-spin 24s linear infinite;
        }
        @keyframes soon-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .soon-ring { animation: none; } }
      `}</style>
    </section>
  );
}
