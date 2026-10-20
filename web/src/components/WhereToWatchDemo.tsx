// Home-page preview of the "Where to watch" buttons that Phase 2 wires to real data.
// Hover (or focus) a platform to see its sub/dub languages; the tooltip is pure CSS.

type Platform = {
  name: string;
  color: string;
  href: string;
  sub: string[];
  dub: string[];
};

const SAMPLE: Platform[] = [
  {
    name: "Crunchyroll",
    color: "#f47521",
    href: "https://www.crunchyroll.com",
    sub: ["English", "Hindi", "Spanish", "Portuguese"],
    dub: ["English", "Hindi", "Tamil", "Telugu"],
  },
  {
    name: "Netflix",
    color: "#e50914",
    href: "https://www.netflix.com",
    sub: ["English", "Hindi", "Japanese"],
    dub: ["English", "Hindi"],
  },
  {
    name: "Prime Video",
    color: "#1399ff",
    href: "https://www.primevideo.com",
    sub: ["English"],
    dub: [],
  },
];

function LangList({ label, langs }: { label: string; langs: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">{label}</p>
      {langs.length ? (
        <p className="text-sm font-bold text-ink">{langs.join(", ")}</p>
      ) : (
        <p className="text-sm font-bold text-sash">Not available</p>
      )}
    </div>
  );
}

export default function WhereToWatchDemo() {
  return (
    <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div>
        <p className="font-display text-lg tracking-wider text-sash">The feature I always wanted</p>
        <h2 className="title-stroke mt-1 text-4xl sm:text-5xl">Where can I watch it — and in which language?</h2>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          Every anime page shows the platforms that stream it in your country. Hover a platform to see whether it&apos;s
          subbed or dubbed and in which languages — click to jump straight there.
        </p>
      </div>

      <div className="parchment rounded-2xl border-2 border-ink p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl tracking-wide">Where to watch</h3>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-parchment">India · sample</span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-3">
          {SAMPLE.map((p) => (
            <li key={p.name} className="group relative">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2.5 font-extrabold text-white shadow-[3px_3px_0_var(--ink)] transition group-hover:-translate-y-0.5"
                style={{ background: p.color }}
              >
                ▶ {p.name}
              </a>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 translate-y-1 rounded-xl border-2 border-ink bg-parchment p-3 opacity-0 shadow-[4px_4px_0_var(--ink)] transition group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <div className="space-y-2">
                  <LangList label="Subtitles" langs={p.sub} />
                  <LangList label="Dub (audio)" langs={p.dub} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-24 text-xs text-ink/60 sm:mt-20">
          Sample data for the preview — real availability arrives with the Explore database.
        </p>
      </div>
    </div>
  );
}
