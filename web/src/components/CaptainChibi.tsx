import Image from "next/image";
import waving from "../../public/images/captain/chibi-waving.png";
import reading from "../../public/images/captain/chibi-reading.png";
import cheering from "../../public/images/captain/chibi-cheering.png";
import sleeping from "../../public/images/captain/chibi-sleeping.png";

// The chibi Captain in his four moods. next/image serves the PNGs as WebP/AVIF
// where supported. Decorative by default (alt=""); pass `label` when the pose
// carries meaning on its own.
const POSES = { waving, reading, cheering, sleeping };

export type Pose = keyof typeof POSES;

export default function CaptainChibi({
  pose,
  className = "w-32",
  label,
  float = false,
}: {
  pose: Pose;
  className?: string;
  label?: string;
  /** gently bob up and down (off with reduced motion, via the `float` keyframes' motion-safe use) */
  float?: boolean;
}) {
  return (
    <Image
      src={POSES[pose]}
      alt={label ?? ""}
      sizes="(min-width: 640px) 220px, 160px"
      className={`h-auto select-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] ${float ? "motion-safe:animate-[float_6s_ease-in-out_infinite]" : ""} ${className}`}
      draggable={false}
    />
  );
}
