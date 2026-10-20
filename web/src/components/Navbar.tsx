"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";
import { LogoMark } from "./Logo";
import { STORAGE_KEY, TOGGLE_EVENT } from "./StrawHatCursor";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/my-list", label: "My List" },
  { href: "/blog", label: "Blog" },
];

function subscribeCursorPref(onChange: () => void) {
  window.addEventListener(TOGGLE_EVENT, onChange);
  return () => window.removeEventListener(TOGGLE_EVENT, onChange);
}

function readCursorOff() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function CursorToggle() {
  const off = useSyncExternalStore(subscribeCursorPref, readCursorOff, () => false);

  const toggle = () => {
    const next = !off;
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
    window.dispatchEvent(new Event(TOGGLE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="hidden rounded-full border border-card-border px-3 py-1.5 text-xs font-bold text-muted transition hover:border-straw hover:text-straw [@media(pointer:fine)]:inline-flex"
      title={off ? "Turn the straw-hat cursor on" : "Turn the straw-hat cursor off"}
    >
      {off ? "🖱️ Normal cursor" : "👒 Hat cursor"}
    </button>
  );
}

type LinkStyle = (active: boolean) => string;

function NavLinks({ pathname, linkClass, onNavigate }: { pathname: string | null; linkClass: LinkStyle; onNavigate?: () => void }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return LINKS.map((l) => (
    <li key={l.href}>
      <Link href={l.href} onClick={onNavigate} className={linkClass(isActive(l.href))}>
        {l.label}
      </Link>
    </li>
  ));
}

// Reading the URL on dynamic routes has to stream in, so the links render
// un-highlighted first (Suspense fallback) and light up once the path is known.
function ActiveNavLinks(props: { linkClass: LinkStyle; onNavigate?: () => void }) {
  return <NavLinks pathname={usePathname()} {...props} />;
}

function Links(props: { linkClass: LinkStyle; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavLinks pathname={null} {...props} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}

const desktopLink: LinkStyle = (active) =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-straw text-ink" : "text-text hover:bg-white/10"}`;
const mobileLink: LinkStyle = (active) => `block rounded-lg px-3 py-3 font-bold ${active ? "text-straw" : "text-text"}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-black/65 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Anime World Fun home">
          <LogoMark className="h-16 w-auto transition hover:scale-105" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <Links linkClass={desktopLink} />
        </ul>

        <div className="flex items-center gap-2">
          <CursorToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-text md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-card-border px-4 pb-4 md:hidden">
          <Links linkClass={mobileLink} onNavigate={() => setOpen(false)} />
        </ul>
      )}
    </header>
  );
}
