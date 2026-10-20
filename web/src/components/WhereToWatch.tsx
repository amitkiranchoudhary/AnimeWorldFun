import { AVAILABILITY } from "@/data/availability";
import type { ExternalLink } from "@/lib/anilist";

// Platform buttons for an anime. Hover/focus shows what we know about
// subtitles and dubs; click opens the platform in a new tab.

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

export default function WhereToWatch({ animeId, links }: { animeId: number; links: ExternalLink[] }) {
  // One button per platform; AniList sometimes lists a site more than once (per language/region)
  const bySite = new Map<string, ExternalLink[]>();
  for (const l of links) {
    if (l.type !== "STREAMING" || l.isDisabled) continue;
    bySite.set(l.site, [...(bySite.get(l.site) ?? []), l]);
  }

  if (!bySite.size) {
    return (
      <p className="text-sm text-ink/70">
        No streaming platforms are listed for this anime yet. It may not be licensed in most regions.
      </p>
    );
  }

  const known = AVAILABILITY[animeId] ?? {};

  return (
    <>
      <ul className="flex flex-wrap gap-3">
        {[...bySite].map(([site, siteLinks]) => {
          const info = known[site];
          const linkLangs = [...new Set(siteLinks.map((l) => l.language).filter(Boolean))] as string[];
          return (
            <li key={site} className="group relative">
              <a
                href={siteLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2.5 font-extrabold text-white shadow-[3px_3px_0_var(--ink)] transition group-hover:-translate-y-0.5"
                style={{ background: siteLinks[0].color ?? "#334" }}
              >
                {siteLinks[0].icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={siteLinks[0].icon} alt="" width={18} height={18} className="rounded-sm" />
                )}
                {site}
                <span aria-hidden>↗</span>
              </a>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-20 mt-3 hidden w-64 max-w-[80vw] rounded-xl border-2 border-ink bg-parchment p-3 shadow-[4px_4px_0_var(--ink)] group-focus-within:block group-hover:block"
              >
                <p className="font-display text-lg tracking-wide text-ink">{site}</p>
                {(info?.region || linkLangs.length > 0) && (
                  <p className="mb-2 text-xs font-bold text-ink/70">
                    {info?.region ? `Region: ${info.region}` : `Listed language: ${linkLangs.join(", ")}`}
                  </p>
                )}
                <div className="space-y-2">
                  <LangLine label="Subtitles" langs={info?.sub} />
                  <LangLine label="Dub (audio)" langs={info?.dub} />
                </div>
                <p className="mt-2 text-[11px] text-ink/60">
                  {info?.checked ? `Checked ${info.checked}. ` : ""}Availability varies by country.
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
