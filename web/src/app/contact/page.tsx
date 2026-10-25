import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import TiltCard from "@/components/motion/TiltCard";
import BottleComposer from "@/components/info/BottleComposer";
import { ISSUES_URL, PROFILE_URL } from "@/components/info/links";
import { Bottle, Moon, Stars, Waves } from "@/components/info/Sea";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a message in a bottle: report wrong streaming or dub info, a bug, or an idea through Anime World Fun's GitHub issues.",
};

const HARBOURS = [
  {
    kicker: "Best for most messages",
    title: "The issue board",
    body: "Bugs, wrong where-to-watch or dub info, missing shows and ideas all go here — public, so other fans can add to them too.",
    href: ISSUES_URL,
    cta: "Open the issues",
    glow: "255,120,180",
  },
  {
    kicker: "Who's behind the wheel",
    title: "The captain on GitHub",
    body: "Anime World Fun is built by one fan. Find the profile, the code and everything else that's being worked on.",
    href: PROFILE_URL,
    cta: "Visit the profile",
    glow: "242,201,76",
  },
];

const GOOD_BOTTLES = [
  { icon: "📺", title: "Stream or dub info is wrong", body: "Name the anime, the platform and your country — dubs differ by region." },
  { icon: "🔧", title: "Something broke", body: "What you did, what you expected, and your device and browser." },
  { icon: "💡", title: "An idea for the ship", body: "A feature, a filter, a blog topic, a watch-order guide you'd love." },
  { icon: "🌸", title: "Kind words", body: "Always welcome. They keep the lantern lit on late nights." },
];

export default function ContactPage() {
  return (
    <div className="relative overflow-x-clip">
      {/* ── Hero: a bottle bobbing on a moonlit sea ─────────── */}
      <section className="relative isolate flex min-h-[92svh] flex-col items-center overflow-hidden px-4 pt-28 text-center sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,6,13,0.6)_0%,rgba(10,20,48,0.85)_55%,#0d2f57_100%)]" />
        <Stars className="-z-10" />
        <Moon className="left-[12%] top-[16%] -z-10 h-14 w-14 sm:left-[16%] sm:h-20 sm:w-20" />

        <Reveal y={12} blur={4}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-muted sm:text-xs">
            <span className="text-sash">●</span> Contact
          </p>
        </Reveal>
        <SplitText
          text="Message in a bottle"
          as="h1"
          by="char"
          stagger={32}
          delay={100}
          className="mt-4 max-w-5xl font-display text-[clamp(3.1rem,12vw,9rem)] uppercase leading-[0.9] tracking-wide text-text text-glow-pink"
        />
        <Reveal delay={600} className="mx-auto mt-6 max-w-xl">
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            There&apos;s no inbox on this island and no email address. Every bottle washes up on{" "}
            <strong className="text-text">GitHub</strong>, where the captain reads them — and answers right there.
          </p>
        </Reveal>
        <Reveal delay={800} className="relative z-10 mt-8">
          <a
            href="#write"
            className="inline-flex items-center gap-2 rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)] outline-none transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#ff9fc8]"
          >
            Write your message ↓
          </a>
        </Reveal>

        <div aria-hidden className="relative mt-auto h-[30svh] min-h-[190px] w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
          <Waves className="inset-0" />
          <div className="contact-bottle absolute left-[58%] top-[4%] w-[min(42vw,230px)] sm:left-[62%]">
            <Bottle className="h-auto w-full drop-shadow-[0_0_24px_rgba(160,220,255,0.35)]" />
          </div>
        </div>
      </section>

      {/* ── Two harbours ───────────────────────────────────── */}
      <section aria-label="Where to reach the captain" className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <ul className="grid gap-5 sm:grid-cols-2">
          {HARBOURS.map((h, i) => (
            <Reveal as="li" key={h.title} delay={i * 120} scale={0.97}>
              <TiltCard max={6} className="h-full rounded-[1.4rem]">
                <article
                  className="harbour glass shimmer group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] p-6 sm:p-8"
                  style={{ "--hg": h.glow } as CSSProperties}
                >
                  <span aria-hidden className="harbour-glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" />
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[rgb(var(--hg))]">{h.kicker}</p>
                  <h2 className="mt-3 font-display text-3xl tracking-wide text-text sm:text-4xl">{h.title}</h2>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{h.body}</p>
                  <a
                    href={h.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-fit items-center gap-2 font-extrabold text-straw outline-none after:absolute after:inset-0 after:rounded-[1.4rem] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-straw"
                  >
                    {h.cta}
                    <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1.5">
                      ↗
                    </span>
                    <span className="sr-only">(opens GitHub in a new tab)</span>
                  </a>
                  <p className="mt-2 break-all font-mono text-[11px] text-white/60">{h.href.replace("https://", "")}</p>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── Write a bottle ─────────────────────────────────── */}
      <section id="write" aria-label="Write a message" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.25fr]">
          <div className="lg:sticky lg:top-28">
            <Reveal y={12} blur={4}>
              <p className="font-display text-lg tracking-[0.2em] text-sash">Write a bottle</p>
            </Reveal>
            <SplitText
              text="Good things to put inside"
              as="h2"
              className="mt-1 font-display text-[clamp(2.4rem,6vw,4rem)] leading-none tracking-wide text-straw"
            />
            <ul className="mt-8 space-y-5">
              {GOOD_BOTTLES.map((g, i) => (
                <Reveal as="li" key={g.title} delay={i * 90} className="flex gap-4">
                  <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                    {g.icon}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-text">{g.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{g.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={400}>
              <p className="mt-8 text-sm leading-relaxed text-muted">
                Curious what happens to your data? Short answer: nothing on this page is sent to our server. Casting just opens GitHub with your note
                filled in. The long answer is in the{" "}
                <Link href="/privacy" className="font-bold text-straw underline-offset-4 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
            </Reveal>
          </div>

          <Reveal scale={0.97} delay={150}>
            <BottleComposer />
          </Reveal>
        </div>
      </section>

      <style href="awf-contact" precedence="default">{`
        .contact-bottle { animation: contact-bob 4.6s ease-in-out infinite; transform-origin: 50% 70%; z-index: 2; }
        @keyframes contact-bob {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-7deg); }
          50% { transform: translate3d(-10px, 12px, 0) rotate(5deg); }
        }
        .harbour-glow { background: radial-gradient(circle, rgba(var(--hg),0.35), transparent 70%); transition: transform .8s var(--ease-out), opacity .8s var(--ease-out); opacity: .6; }
        .harbour:hover .harbour-glow, .harbour:focus-within .harbour-glow { transform: scale(1.5); opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .contact-bottle { animation: none; } }
      `}</style>
    </div>
  );
}
