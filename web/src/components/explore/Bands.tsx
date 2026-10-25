import { Fragment } from "react";
import Marquee from "@/components/motion/Marquee";
import { GENRES } from "@/lib/anilist";
import s from "./explore.module.css";

const WORDS = ["探索", "Explore", "冒険", "Adventure", "桜", "Sakura", "海", "The open sea", "提灯", "Lanterns", "夢", "Dreams"];

/** Two crossing ribbons under the hero: every genre in gold, a sea-shanty of words in red. */
export default function Bands() {
  return (
    <div className={s.bands}>
      <div className={`${s.band} ${s.bandGold} py-2.5`}>
        <Marquee seconds={46} label="Genres you can explore">
          {GENRES.map((g) => (
            <Fragment key={g}>
              <span className="whitespace-nowrap px-5 font-display text-2xl tracking-wider sm:text-3xl">{g}</span>
              <span aria-hidden className="self-center text-sash">✦</span>
            </Fragment>
          ))}
        </Marquee>
      </div>
      <div aria-hidden className={`${s.band} ${s.bandRed} py-2`}>
        <Marquee seconds={58} reverse>
          {WORDS.map((w) => (
            <Fragment key={w}>
              <span className="whitespace-nowrap px-5 font-display text-lg tracking-[0.2em] sm:text-xl">{w}</span>
              <span className="self-center text-straw/80">❀</span>
            </Fragment>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
