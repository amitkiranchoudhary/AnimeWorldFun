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
import { formatDate, getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Captain's Log",
  description:
    "The Anime World Fun blog: watch-order guides, seasonal picks, reviews and hot takes, with read-along narration where every word lights up as it is spoken.",
};

// The latest posts (from web/content/blog), or nothing while there are none
async function LatestPosts() {
  const posts = await getPosts();
  if (!posts.length) return null;
  return (
    <section id="latest" className={`${s.chapter} mx-auto max-w-5xl px-4 sm:px-6`} aria-label="Latest posts">
      <Reveal>
        <p className={s.kicker}>
          <span aria-hidden className={s.dot} /> Fresh from the galley
        </p>
      </Reveal>
      <SplitText as="h2" text="The latest logs" className={s.chapterTitle} />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {posts.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={i * 90}>
            <Link
              href={`/blog/${p.slug}`}
              className="glass group block h-full rounded-3xl p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[var(--glow-pink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              <span className="flex flex-wrap items-center gap-x-3 text-xs font-bold text-muted">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                {p.audio && <span className="text-straw">🎙️ Narrated</span>}
              </span>
              <span className="mt-2 block font-display text-3xl leading-none tracking-wide text-straw">{p.title}</span>
              {p.summary && <span className="mt-3 block text-sm leading-relaxed text-muted">{p.summary}</span>}
              <span className="mt-4 inline-block text-sm font-extrabold text-text group-hover:text-straw">Read it →</span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

// the closing chapter speaks to whether the first posts are out yet
async function Finale() {
  const any = (await getPosts()).length > 0;
  return (
    <section className={`${s.chapter} ${s.finale}`} aria-label="Chapter end">
      <div aria-hidden className={s.finaleGlow} />
      <Reveal>
        <p className={s.kicker}>
          <span aria-hidden className={s.dot} /> Chapter end
        </p>
      </Reveal>
      <SplitText
        as="h2"
        text={any ? "More logs are on the way." : "The ink is still drying."}
        className={`${s.chapterTitle} mx-auto max-w-4xl`}
      />
      <Reveal delay={150}>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
          {any
            ? "New posts are written in the galley all the time. Meanwhile, chart your own course."
            : "The first logs are being written in the galley right now. Until they land, chart your own course."}
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
  );
}

// /blog in chapters: hero → the latest posts (once there are any) → a line that
// lights up as you scroll → the curved gallery of topics → a working read-along
// preview → the way back.
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

      <LatestPosts />

      <ScrollLitLine
        kicker="Chapter 01 — The voice"
        label={["Chapter 01", "The voice"]}
        text="Every post in this log will speak. Press play, and each word lights up as it's read, like subtitles for your favourite episode."
        accents={["speak", "lights", "up"]}
        note="Read along, or close your eyes and just listen: narration will be built into every post we write."
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

      <Finale />
    </>
  );
}
