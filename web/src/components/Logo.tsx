import Image from "next/image";
import badge from "../../public/images/captain/logo-256.png";

/**
 * The Anime World Fun logo: the Captain in a round gold-ringed badge, with the
 * name beside it. next/image serves the PNG as WebP/AVIF where supported.
 * `className` sizes the badge (e.g. "h-12"); the wordmark scales with `text`.
 */
export function LogoMark({
  className = "h-12",
  text = "text-xl",
  wordmark = true,
}: {
  className?: string;
  text?: string;
  wordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src={badge}
        alt={wordmark ? "" : "Anime World Fun"}
        priority
        sizes="96px"
        className={`aspect-square w-auto rounded-full ring-2 ring-straw/80 shadow-[0_0_18px_-4px_rgba(242,201,76,0.6)] ${className}`}
      />
      {wordmark && (
        <span className={`font-display leading-[0.85] tracking-wide text-straw [text-shadow:2px_2px_0_var(--ink)] ${text}`}>
          Anime
          <br />
          <span className="text-text">World Fun</span>
        </span>
      )}
    </span>
  );
}
