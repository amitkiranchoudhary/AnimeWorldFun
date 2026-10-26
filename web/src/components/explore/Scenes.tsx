import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import CaptainChibi from "@/components/CaptainChibi";
import s from "./explore.module.css";

/* Little animated scenes for "nothing here" and "something went wrong". */

function Waves({ stormy = false }: { stormy?: boolean }) {
  // one wave path, drawn twice side by side so the slide loops seamlessly
  const d = "M0 30 Q 50 10 100 30 T 200 30 T 300 30 T 400 30 V60 H0 Z";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden">
      <svg viewBox="0 0 800 60" preserveAspectRatio="none" className={`${s.wave} ${s.waveSlow} absolute bottom-2 h-12 opacity-40`}>
        <path d={d} fill="var(--sea-light)" />
        <path d={d} transform="translate(400 0)" fill="var(--sea-light)" />
      </svg>
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        className={`${s.wave} absolute bottom-0 h-10 opacity-70`}
        style={stormy ? { animationDuration: "4s" } : undefined}
      >
        <path d={d} fill="var(--sea)" />
        <path d={d} transform="translate(400 0)" fill="var(--sea)" />
      </svg>
    </div>
  );
}

function Lantern({ stormy = false }: { stormy?: boolean }) {
  return (
    <div aria-hidden className={`${s.sway} ${stormy ? s.stormy : ""} mx-auto w-16`}>
      <div className="mx-auto h-6 w-px bg-white/30" />
      <svg viewBox="0 0 64 84" className="w-16 drop-shadow-[0_0_22px_rgba(230,57,70,0.75)]">
        <rect x="22" y="0" width="20" height="8" rx="2" fill="var(--ink)" />
        <ellipse cx="32" cy="42" rx="28" ry="34" fill="var(--sash)" />
        <path d="M10 30h44M6 42h52M10 54h44" stroke="#8f1d29" strokeWidth="2" />
        <ellipse cx="24" cy="34" rx="7" ry="12" fill="rgba(255,255,255,0.22)" />
        <rect x="22" y="74" width="20" height="8" rx="2" fill="var(--ink)" />
        <path d="M32 82v2" stroke="var(--straw)" strokeWidth="2" />
      </svg>
    </div>
  );
}

function Scene({ title, children, stormy }: { title: string; children: ReactNode; stormy?: boolean }) {
  return (
    <Reveal className={`glass ${s.scene} px-6 pb-24 pt-12 text-center`} y={20}>
      <div className={s.floaty}>
        <Lantern stormy={stormy} />
      </div>
      <p className="mt-6 font-display text-4xl tracking-wide text-straw text-glow-gold sm:text-5xl">{title}</p>
      {children}
      <Waves stormy={stormy} />
    </Reveal>
  );
}

export function EmptyScene({ clearHref }: { clearHref?: string }) {
  return (
    <Scene title="No anime found">
      <CaptainChibi pose="sleeping" className="mx-auto mt-4 w-36 sm:w-44" />
      <p className="mx-auto mt-3 max-w-md text-muted">Only open water out here. Try removing a filter or two.</p>
      {clearHref && (
        <Link
          href={clearHref}
          scroll={false}
          className={`${s.pageBtn} ${s.pageNext} shimmer mt-7`}
        >
          Clear all filters
        </Link>
      )}
    </Scene>
  );
}

export function ErrorScene({ retryHref }: { retryHref: string }) {
  return (
    <Scene title="Rough seas" stormy>
      <p className="mx-auto mt-3 max-w-md text-muted" role="alert">
        The seas are rough — couldn&apos;t reach the anime database right now. Try again in a moment.
      </p>
      {/* a plain full reload of the same URL; failures aren't cached, so this really asks again */}
      <a href={retryHref} className={`${s.pageBtn} ${s.pagePrev} mt-7`}>
        <span aria-hidden>↻</span> Try again
      </a>
    </Scene>
  );
}
