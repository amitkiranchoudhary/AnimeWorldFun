import SplitText from "@/components/motion/SplitText";
import s from "./explore.module.css";

/** A film-chapter heading: a huge outlined number, a glowing kicker and a title that reveals word by word. */
export default function Chapter({
  num,
  kicker,
  title,
}: {
  num: string;
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-end gap-3 sm:gap-5">
      <span aria-hidden className={s.chapterNum}>
        {num}
      </span>
      <div className="min-w-0 pb-1">
        <p className={`${s.kicker} font-display text-sm`}>{kicker}</p>
        <SplitText as="h2" text={title} stagger={60} className="font-display text-4xl leading-none tracking-wide text-text sm:text-5xl" />
      </div>
    </div>
  );
}
