"use client";

import Image from "next/image";
import { useState } from "react";
import s from "./detail.module.css";

/**
 * The trailer inside a film strip with a camera viewfinder. It shows a still
 * (the anime's own banner) until you press play, so YouTube only loads when
 * someone actually wants to watch.
 */
export default function TrailerFrame({ videoId, title, still }: { videoId: string; title: string; still: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={s.film}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-lenis-prevent
            // the smooth-scroll stylesheet disables pointer events on iframes; the player needs them
            style={{ pointerEvents: "auto" }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play the ${title} trailer`}
            className="group absolute inset-0 block h-full w-full text-left focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-straw"
          >
            <Image
              src={still}
              alt=""
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="scale-105 object-cover opacity-60 transition duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-110 group-hover:opacity-80"
            />
            <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75))]" />

            {/* viewfinder */}
            <span aria-hidden className={`${s.corner} left-4 top-4 border-l-2 border-t-2`} />
            <span aria-hidden className={`${s.corner} right-4 top-4 border-r-2 border-t-2`} />
            <span aria-hidden className={`${s.corner} bottom-4 left-4 border-b-2 border-l-2`} />
            <span aria-hidden className={`${s.corner} bottom-4 right-4 border-b-2 border-r-2`} />
            <span aria-hidden className="absolute left-8 top-7 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/85 sm:left-10 sm:top-9">
              <span className={`${s.rec} size-2 rounded-full bg-sash shadow-[0_0_10px_var(--sash)]`} />
              Trailer
            </span>
            <span aria-hidden className="absolute right-8 top-7 font-mono text-[11px] tracking-widest text-white/60 sm:right-10 sm:top-9">
              16:9 · HD
            </span>

            {/* play button */}
            <span aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className={`${s.playRing} absolute inset-0 rounded-full border-2 border-[#ff8fc0]`} />
              <span className="relative grid size-16 place-items-center rounded-full bg-white/10 shadow-[var(--glow-pink)] backdrop-blur-md transition duration-500 ease-[var(--ease-out)] group-hover:scale-110 group-hover:bg-white/20 sm:size-20">
                <svg viewBox="0 0 24 24" className="ml-1 size-7 fill-white sm:size-8">
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>
            </span>

            <span aria-hidden className="absolute inset-x-0 bottom-6 px-6 text-center text-sm sm:bottom-9 sm:text-base">
              <span className={s.subtitle}>[ Press play ] {title}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
