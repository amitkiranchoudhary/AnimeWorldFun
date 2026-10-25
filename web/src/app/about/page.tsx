import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllTimeGreats } from "@/lib/anilist";
import Marquee from "@/components/motion/Marquee";
import ScrollScene from "@/components/info/ScrollScene";
import ChapterFrame from "@/components/info/ChapterFrame";
import ScrubLine from "@/components/info/ScrubLine";
import Subtitles from "@/components/info/Subtitles";
import PosterArc from "@/components/info/PosterArc";
import AboutHero from "@/components/info/AboutHero";
import FeatureDeck from "@/components/info/FeatureDeck";
import AboutOutro from "@/components/info/AboutOutro";
import MapReveal from "@/components/info/MapReveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Why Anime World Fun exists: one fan who kept hunting for where an anime streams and in which language, building the map he wished he had — free, for fans.",
};

const QUESTIONS = ["Where is it streaming?", "Sub or dub?", "Which language?", "Which platform?", "Which season first?", "Is the dub out yet?"];

// AniList posters for the curved gallery (cached for hours in lib/anilist)
async function Posters() {
  const items = (await getAllTimeGreats()).slice(0, 11);
  return items.length > 0 ? <PosterArc items={items} /> : <PosterFrames />;
}

// While the posters load (or if AniList is unreachable): empty glowing frames
function PosterFrames() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[48%] flex justify-center gap-3 px-4 sm:gap-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`aspect-[2/3] w-[clamp(64px,16vw,170px)] shrink-0 rounded-[14px] border border-[rgba(255,150,200,0.25)] bg-white/[0.03] shadow-[0_0_40px_-12px_rgba(255,120,180,0.5)] ${
            i === 0 || i === 4 ? "hidden sm:block" : ""
          }`}
        />
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative overflow-x-clip">
      {/* without JavaScript the scroll chapters can't play, so show them finished */}
      <noscript>
        <style>{`.scroll-scene{--p:1!important}`}</style>
      </noscript>

      <AboutHero />

      {/* ── Chapter 01: the problem ─────────────────────────── */}
      <ScrollScene length={240} label="Chapter one: the hunt" stageClassName="bg-[#0b0b10]/70">
        <ChapterFrame number="01" title="The hunt" kanji="迷子" kanjiMeaning="lost" tint="230,57,70">
          <ScrubLine
            text="I just wanted to *watch* it. Then came the *hunt*."
            as="h2"
            from={0.04}
            to={0.42}
            accent="red"
            className="mx-auto max-w-6xl text-center font-display text-[clamp(2.6rem,9.5vw,8.5rem)] uppercase leading-[0.92] tracking-wide text-text"
          />
        </ChapterFrame>
        <Subtitles
          from={0.38}
          to={0.98}
          lines={[
            "Every new season, the same search.",
            "Is it on Crunchyroll? Netflix? Only in some countries?",
            "Is the dub real — or just a rumour from a forum?",
            "Ten tabs later, the episode still wasn't playing.",
          ]}
        />
      </ScrollScene>

      <div className="relative border-y border-white/5 bg-black/60 py-5">
        <Marquee seconds={36} label="Questions every fan asks">
          {QUESTIONS.map((q) => (
            <span key={q} className="mx-6 flex items-center gap-6 font-display text-2xl tracking-wider text-text/70 sm:text-4xl">
              {q}
              <span aria-hidden className="text-[#ff8fbf] text-glow-pink">✿</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Chapter 02: the answer ──────────────────────────── */}
      <ScrollScene length={260} label="Chapter two: the answer" stageClassName="bg-[#0b0b10]/70">
        <ChapterFrame
          number="02"
          title="The answer"
          kanji="地図"
          kanjiMeaning="map"
          tint="242,201,76"
          overlay={<MapReveal from={0.4} to={0.8} />}
        >
          <ScrubLine
            text="So I drew a *map*. One harbour. Every anime. *Honest* answers."
            from={0.04}
            to={0.36}
            accent="gold"
            className="mx-auto max-w-6xl text-center font-display text-[clamp(2.5rem,9vw,8rem)] uppercase leading-[0.92] tracking-wide text-text"
          />
        </ChapterFrame>
        <Subtitles
          from={0.48}
          to={0.98}
          lines={[
            "Look up any show and see where it streams,",
            "and whether it's subbed, dubbed — and in which language.",
            "If we don't know, we'll say so. No guessing, no clickbait.",
          ]}
        />
      </ScrollScene>

      {/* ── Chapter 03: the posters ─────────────────────────── */}
      <ScrollScene length={300} label="Chapter three: every world" stageClassName="bg-[#08080c]/80">
        <ChapterFrame
          number="03"
          title="Every world"
          kanji="世界"
          kanjiMeaning="world"
          tint="255,120,180"
          align="top"
          overlay={
            <Suspense fallback={<PosterFrames />}>
              <Posters />
            </Suspense>
          }
        >
          <ScrubLine
            text="Thousands of *worlds*. One *harbour*."
            from={0.02}
            to={0.2}
            className="mx-auto max-w-5xl text-center font-display text-[clamp(2rem,6.5vw,5.2rem)] uppercase leading-[0.95] tracking-wide text-text"
          />
        </ChapterFrame>
      </ScrollScene>

      {/* ── What it does ────────────────────────────────────── */}
      <FeatureDeck />

      {/* ── Chapter 04: made by a fan ───────────────────────── */}
      <ScrollScene length={220} label="Chapter four: by a fan, for fans" stageClassName="bg-[#0b0b10]/70">
        <ChapterFrame number="04" title="The crew" kanji="仲間" kanjiMeaning="nakama, crewmates" tint="255,150,200">
          <ScrubLine
            text="Made by a *fan*. For *fans*. *Free* forever."
            from={0.04}
            to={0.45}
            className="mx-auto max-w-6xl text-center font-display text-[clamp(2.7rem,10vw,9rem)] uppercase leading-[0.92] tracking-wide text-text"
          />
        </ChapterFrame>
        <Subtitles
          from={0.45}
          to={0.98}
          lines={[
            "No paywall. No accounts, no sign-ups.",
            "Built in spare time by one fan who kept getting lost —",
            "the map he wished he'd had. Now it's yours too.",
          ]}
        />
      </ScrollScene>

      <AboutOutro />
    </div>
  );
}
