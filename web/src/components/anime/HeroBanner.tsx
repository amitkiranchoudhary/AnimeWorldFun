"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./detail.module.css";

/**
 * The opening shot of an anime page: the banner eases in from a close-up,
 * then drifts slowly (Ken Burns) while scrolling pushes it back in parallax
 * and fades the credits. Without a banner, the blurred cover stands in.
 */
export default function HeroBanner({
  banner,
  cover,
  children,
}: {
  banner: string | null;
  cover: string;
  /** overlay content, e.g. opening credits */
  children?: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer || prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const h = root.offsetHeight || 1;
      const y = Math.min(Math.max(window.scrollY, 0), h);
      layer.style.transform = `translate3d(0, ${(y * 0.38).toFixed(1)}px, 0)`;
      root.style.setProperty("--hero-out", (y / h).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[54vh] max-h-[660px] min-h-[340px] w-full overflow-hidden sm:h-[64vh]"
      style={{ background: "var(--anime)" }}
    >
      <div ref={layerRef} className={s.bannerLayer} aria-hidden>
        <div className={s.openShot}>
          <div className={s.kenBurns}>
            {banner ? (
              <Image src={banner} alt="" fill preload sizes="100vw" className="object-cover" />
            ) : (
              <Image src={cover} alt="" fill preload sizes="100vw" className="scale-110 object-cover opacity-70 blur-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* grade: colour bloom, vignette, then fade into the page */}
      <div aria-hidden className={s.lightLeak} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.6) 100%)" }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#121212]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#121212] to-transparent" />

      {children && <div className={`${s.credits} absolute inset-0`}>{children}</div>}
    </div>
  );
}
