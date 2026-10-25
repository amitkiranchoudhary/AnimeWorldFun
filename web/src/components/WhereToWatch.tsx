import type { CSSProperties } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { AVAILABILITY } from "@/data/availability";
import type { ExternalLink } from "@/lib/anilist";
import s from "@/components/anime/detail.module.css";

// Platform buttons for an anime, glowing in each platform's own colour.
// Hover/focus shows what we know about subtitles and dubs (touch screens get
// a "Sub & dub" disclosure instead); click opens the platform in a new tab.

function LangLine({ label, langs }: { label: string; langs?: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">{label}</p>
      {langs === undefined ? (
        <p className="text-sm font-bold text-ink/70">Not confirmed yet</p>
      ) : langs.length ? (
        <p className="text-sm font-bold text-ink">{langs.join(", ")}</p>
      ) : (
        <p className="text-sm font-bold text-sash">Not available</p>
      )}
    </div>
  );
}

function Details({ site, region, langs, info }: {
  site: string;
  region?: string;
  langs: string[];
  info?: { sub?: string[]; dub?: string[]; checked?: string };
}) {
  return (
    <>
      <p className="font-display text-lg tracking-wide text-ink">{site}</p>
      {(region || langs.length > 0) && (
        <p className="mb-2 text-xs font-bold text-ink/70">{region ? `Region: ${region}` : `Listed language: ${langs.join(", ")}`}</p>
      )}
      <div className="space-y-2">
        <LangLine label="Subtitles" langs={info?.sub} />
        <LangLine label="Dub (audio)" langs={info?.dub} />
      </div>
      <p className="mt-2 text-[11px] text-ink/60">{info?.checked ? `Checked ${info.checked}. ` : ""}Availability varies by country.</p>
    </>
  );
}

export default function WhereToWatch({ animeId, links }: { animeId: number; links: ExternalLink[] }) {
  // One button per platform; AniList sometimes lists a site more than once (per language/region)
  const bySite = new Map<string, ExternalLink[]>();
  for (const l of links) {
    if (l.type !== "STREAMING" || l.isDisabled) continue;
    bySite.set(l.site, [...(bySite.get(l.site) ?? []), l]);
  }

  if (!bySite.size) {
    return (
      <p className="text-sm text-muted">
        No streaming platforms are listed for this anime yet. It may not be licensed in most regions.
      </p>
    );
  }

  const known = AVAILABILITY[animeId] ?? {};

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-5">
      {[...bySite].map(([site, siteLinks], i) => {
        const info = known[site];
        const linkLangs = [...new Set(siteLinks.map((l) => l.language).filter(Boolean))] as string[];
        const tipId = `wtw-${animeId}-${i}`;
        return (
          <li key={site} className={s.platform}>
            <Magnetic strength={0.22}>
              <a
                href={siteLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby={tipId}
                className={`${s.platformBtn} shimmer`}
                style={{ "--c": siteLinks[0].color ?? "#4a4a6a" } as CSSProperties}
              >
                {siteLinks[0].icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={siteLinks[0].icon} alt="" width={18} height={18} className="rounded-sm" />
                )}
                {site}
                <span aria-hidden>↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Magnetic>

            {/* hover / keyboard focus: floating card */}
            <div
              id={tipId}
              role="tooltip"
              className={`${s.platformCard} rounded-xl border-2 border-ink bg-parchment p-3 shadow-[4px_4px_0_var(--ink),0_0_40px_-10px_rgba(255,140,190,0.5)]`}
            >
              <Details site={site} region={info?.region} langs={linkLangs} info={info} />
            </div>

            {/* touch screens: tap to open the same details inline */}
            <details className={s.platformMore}>
              <summary>Sub &amp; dub ▾</summary>
              <div className="parchment mt-2 w-60 max-w-[calc(100vw-4rem)] rounded-xl border-2 border-ink p-3 shadow-[3px_3px_0_var(--ink)]">
                <Details site={site} region={info?.region} langs={linkLangs} info={info} />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
