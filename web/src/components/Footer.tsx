import Link from "next/link";
import { cacheLife } from "next/cache";
import { LogoMark } from "./Logo";

async function Year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Anime Database" },
      { href: "/my-list", label: "My List" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-card-border bg-black/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <LogoMark className="h-28 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A fan-made harbour for anime lovers: find where to watch, in which language, track what you&apos;ve seen,
            and read stories from the crew.
          </p>
          <p className="mt-4 text-xs text-muted/80">
            Anime data provided by{" "}
            <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-straw">
              AniList
            </a>
            . All anime titles and artwork belong to their respective owners.
          </p>
          <p className="mt-2 text-xs text-muted/80">
            Cherry blossom photo:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Sakura_branch_(52013006346).jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-straw"
            >
              &ldquo;Sakura branch&rdquo; by Raita Futo
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-straw">
              CC BY 2.0
            </a>
            , background removed.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-xl tracking-wide text-straw">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition hover:text-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-card-border py-5 text-center text-xs text-muted">
        © <Year /> Anime World Fun · Made with 🍖 by a fan, for fans ·{" "}
        <Link href="/login" className="underline-offset-2 hover:text-text hover:underline">
          Captain&apos;s login
        </Link>
      </div>
    </footer>
  );
}
