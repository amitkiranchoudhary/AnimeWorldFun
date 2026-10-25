import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BlogHero from "@/components/blog/BlogHero";
import ReadAlong from "@/components/blog/ReadAlong";
import ScrollLitLine from "@/components/blog/ScrollLitLine";
import TopicGallery, { TopicGalleryFallback } from "@/components/blog/TopicGallery";
import { TOPICS } from "@/components/blog/topics";
import s from "@/components/blog/blog.module.css";
import Magnetic from "@/components/motion/Magnetic";
import Marquee from "@/components/motion/Marquee";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";

export const metadata: Metadata = {
  title: "Captain's Log",
  description:
    "The Anime World Fun blog is coming: watch-order guides, seasonal picks, reviews and hot takes, with read-along narration where every word lights up as it is spoken.",
};

// The blog has no posts yet (Phase 4), so /blog is a cinematic "coming soon"
// in chapters: hero → a line that lights up as you scroll → the curved gallery
// of upcoming topics → a working read-along preview → the way back.
export default function BlogPage() {
  return (
    <>
      <BlogHero />

      <Marquee label="Coming to the Captain's Log" seconds={46} className={s.tickerRow}>
        {TOPICS.map((t) => (
          <span key={t.id} className={s.tickerItem}>
            {t.tag}
            <span aria-hidden className={s.tickerStar}>
              ✦
            </span>
          </span>
        ))}
      </Marquee>

      <ScrollLitLine
        kicker="Chapter 01 — The voice"
        text="Every post in this log will speak. Press play, and each word lights up as it's read, like subtitles for your favourite episode."
        accents={["speak", "lights", "up"]}
        note="Read along, or close your eyes and just listen: narration is built into every post we write."
      />

      <Suspense fallback={<TopicGalleryFallback />}>
        <TopicGallery />
      </Suspense>

      <section id="read-along" className={`${s.chapter} ${s.reader}`} aria-label="Read-along preview">
        <p aria-hidden className={`${s.sideLabel} ${s.sideLeft}`}>
          Chapter 03 <b>·</b> Read-along
        </p>
        <div className={s.readerHead}>
          <Reveal>
            <p className={s.kicker}>
              <span aria-hidden className={s.dot} /> Feature preview
            </p>
          </Reveal>
          <SplitText as="h2" text="Hear it, word by word" className={s.chapterTitle} />
          <Reveal delay={120}>
            <p className={s.readerIntro}>
              A taste of how every post will work. Press Play and your browser reads this sample aloud while each word
              glows as it&apos;s spoken. Pause, change the speed, or click any word to jump there.
            </p>
          </Reveal>
        </div>
        <Reveal delay={200} y={34} scale={0.98}>
          <ReadAlong />
        </Reveal>
      </section>

      <section className={`${s.chapter} ${s.finale}`} aria-label="Chapter end">
        <div aria-hidden className={s.finaleGlow} />
        <Reveal>
          <p className={s.kicker}>
            <span aria-hidden className={s.dot} /> Chapter end
          </p>
        </Reveal>
        <SplitText as="h2" text="The ink is still drying." className={`${s.chapterTitle} mx-auto max-w-4xl`} />
        <Reveal delay={150}>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
            The first logs are being written in the galley right now. Until they land, chart your own course.
          </p>
        </Reveal>
        <Reveal delay={250} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Link href="/explore" className={`${s.btn} shimmer`}>
              Explore anime meanwhile →
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/" className={s.btnGhost}>
              ← Back to the harbour
            </Link>
          </Magnetic>
        </Reveal>
      </section>
    </>
  );
}
