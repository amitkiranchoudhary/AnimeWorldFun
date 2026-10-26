"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import Magnetic from "./motion/Magnetic";
import { LogoMark } from "./Logo";
import { STORAGE_KEY, TOGGLE_EVENT } from "./StrawHatCursor";

const LINKS = [
  { href: "/", label: "Home", jp: "ホーム", caption: "Back to the harbour" },
  { href: "/explore", label: "Explore", jp: "探索", caption: "Every anime & where to watch it" },
  { href: "/my-list", label: "My List", jp: "記録", caption: "Your personal watch log" },
  { href: "/blog", label: "Blog", jp: "日誌", caption: "Stories from the crew" },
];

// Smaller links shown at the foot of the mobile menu
const EXTRA_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

const isActive = (pathname: string | null, href: string) =>
  pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));

// Decorative sakura blossom (5 petals) for the mobile menu
function Blossom({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden focusable="false">
      {[0, 72, 144, 216, 288].map((r) => (
        <path
          key={r}
          d="M20 20 C 14 12, 15 4, 20 2 C 25 4, 26 12, 20 20 Z"
          fill="#ffc1dc"
          fillOpacity="0.9"
          transform={`rotate(${r} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="2.6" fill="#f2c94c" />
    </svg>
  );
}

/* ── "Back to the top" (rendered by the footer) ────────────────────────── */

// Glides up with Lenis when it's on, then hands keyboard focus to the logo
// link in the visible bar (the mobile menu's links come first in the DOM but
// are hidden or inert, so a generic "header a" query would focus nothing).
export function BackToTop({ className = "", children }: { className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.__lenis) window.__lenis.scrollTo(0, reduce ? { immediate: true } : { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.querySelector<HTMLElement>("[data-home-link]")?.focus({ preventScroll: true });
  };
  return (
    <a href="#top" onClick={onClick} className={className}>
      {children}
    </a>
  );
}

/* ── Straw-hat cursor toggle (desktop mice only) ───────────────────────── */

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

function CursorToggle({ className = "" }: { className?: string }) {
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
      className={`nb-chip hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-muted transition-colors duration-300 hover:border-straw/60 hover:text-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw [@media(pointer:fine)]:inline-flex ${className}`}
      title={off ? "Turn the straw-hat cursor on" : "Turn the straw-hat cursor off"}
      aria-label="Straw-hat cursor"
      aria-pressed={!off}
    >
      {off ? "🖱️ Normal cursor" : "👒 Hat cursor"}
    </button>
  );
}

/* ── Reading the URL ───────────────────────────────────────────────────── */

function CurrentPath({ children }: { children: (pathname: string | null) => ReactNode }) {
  return <>{children(usePathname())}</>;
}

// Reading the URL on dynamic routes has to stream in, so the links render
// un-highlighted first (Suspense fallback) and light up once the path is known.
function WithPathname({ children }: { children: (pathname: string | null) => ReactNode }) {
  return (
    <Suspense fallback={children(null)}>
      <CurrentPath>{children}</CurrentPath>
    </Suspense>
  );
}

/* ── Desktop links: a gold pill slides to the current page ─────────────── */

function DesktopLinks({ pathname }: { pathname: string | null }) {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const activeIndex = LINKS.findIndex((l) => isActive(pathname, l.href));

  // Measure the active link and move the pill there. The very first placement
  // snaps (no slide in from nowhere); later route changes glide.
  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const place = () => {
      const link = activeIndex >= 0 ? list.querySelectorAll<HTMLElement>("[data-navlink]")[activeIndex] : null;
      if (!link) {
        pill.style.opacity = "0";
        return;
      }
      pill.style.opacity = "1";
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translate3d(${link.offsetLeft}px, 0, 0)`;
    };
    place();
    if (!pill.dataset.ready) requestAnimationFrame(() => (pill.dataset.ready = "1"));
    // fonts loading or the window resizing changes link widths
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeIndex]);

  return (
    <ul ref={listRef} className="relative hidden items-center md:flex">
      <span ref={pillRef} aria-hidden className="nb-pill" />
      {LINKS.map((l, i) => {
        const active = i === activeIndex;
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              data-navlink
              aria-current={active ? "page" : undefined}
              data-active={active || undefined}
              className="nb-link group relative z-10 block rounded-full px-4 py-2 text-sm font-extrabold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              {/* the label rolls up and a gold copy rolls in on hover */}
              <span className="nb-roll">
                <span className="nb-roll-a">{l.label}</span>
                <span className="nb-roll-b" aria-hidden>
                  {l.label}
                </span>
              </span>
              <span aria-hidden className="nb-underline" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Mobile full-screen menu: huge display links, revealed with a stagger ─ */

function MenuLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {LINKS.map((l, i) => {
        const active = isActive(pathname, l.href);
        return (
          <li key={l.href} className="nb-item" style={{ "--i": i } as CSSProperties}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="group flex items-end gap-3 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw"
            >
              <span className="mb-[0.6em] w-7 shrink-0 font-sans text-xs font-bold tabular-nums text-muted/80">
                0{i + 1}
              </span>
              <span className="min-w-0">
                <span className="nb-mask">
                  <span
                    className={`nb-big block font-display leading-[0.92] tracking-wide ${
                      active ? "text-straw text-glow-gold" : "text-text"
                    }`}
                  >
                    {l.label}
                  </span>
                </span>
                <span className="nb-caption mt-1 block text-xs font-semibold text-muted">
                  {active ? "● You are here" : l.caption}
                </span>
              </span>
              <span aria-hidden className="nb-jp ml-auto mb-[0.55em] hidden font-display text-2xl text-white/15 min-[400px]:block">
                {l.jp}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Navbar ────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus({ preventScroll: true });
  }, []);

  // Hide while reading downward, slide back on the first scroll up; never
  // hidden near the top. Also drives the thin scroll-progress line.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      header.toggleAttribute("data-scrolled", y > 8);
      if (y < 96) header.removeAttribute("data-hidden");
      else if (dy > 8) header.setAttribute("data-hidden", "");
      else if (dy < -8) header.removeAttribute("data-hidden");
      // small movements add up until they pass the threshold
      if (Math.abs(dy) > 8 || y < 96) lastY = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty("--nb-progress", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // While the menu is open: lock scrolling, move focus in, keep Tab inside
  // the header, close on Escape or when the window grows to desktop size.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.__lenis?.stop();

    const focusTimer = window.setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    }, 80);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = [...headerRef.current.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el) => el.getClientRects().length > 0 && !el.closest("[inert]"),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (current === first || !headerRef.current.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !headerRef.current.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (desktop.matches) close(false);
    };
    desktop.addEventListener("change", onResize);

    return () => {
      html.style.overflow = prevOverflow;
      window.__lenis?.start();
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, close]);

  // The menu unfolds as a circle growing out of the button that opened it
  const toggleMenu = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    menuRef.current?.style.setProperty("--nb-ox", `${r.left + r.width / 2}px`);
    menuRef.current?.style.setProperty("--nb-oy", `${r.top + r.height / 2}px`);
    if (open) close(false);
    else setOpen(true);
  };

  return (
    <header ref={headerRef} className="nb-header pointer-events-none sticky top-0 z-50 px-2.5 pt-2.5 sm:px-5 sm:pt-3" data-open={open || undefined}>
      <style>{NAV_CSS}</style>

      {/* full-screen mobile menu (behind the bar, so the close button stays on top) */}
      <div
        id="site-menu"
        ref={menuRef}
        className="nb-menu pointer-events-auto md:hidden"
        data-open={open || undefined}
        inert={!open}
        data-lenis-prevent
      >
        <div aria-hidden className="nb-menu-glow" />
        <span aria-hidden className="nb-side-label font-display">航海日誌 · Captain&apos;s Log</span>
        <Blossom className="nb-petal" style={{ "--x": "78%", "--y": "18%", "--s": "34px", "--d": "0s" } as CSSProperties} />
        <Blossom className="nb-petal" style={{ "--x": "64%", "--y": "70%", "--s": "22px", "--d": "-2.4s" } as CSSProperties} />
        <Blossom className="nb-petal" style={{ "--x": "10%", "--y": "84%", "--s": "28px", "--d": "-4.1s" } as CSSProperties} />

        <nav aria-label="Menu" className="relative mx-auto flex min-h-full max-w-xl flex-col px-6 pb-8 pt-28">
          <p className="nb-kicker mb-6 text-[11px] font-extrabold uppercase tracking-[0.35em] text-sash">Set sail for</p>
          <WithPathname>{(p) => <MenuLinks pathname={p} onNavigate={() => close(false)} />}</WithPathname>

          <div className="nb-foot mt-auto pt-10">
            <p className="nb-subtitle mb-5 text-center text-sm">
              <span>“The sea is calling, nakama — where to next?”</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-muted">
              {EXTRA_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => close(false)}
                  className="rounded underline-offset-4 transition-colors hover:text-straw hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
                >
                  {l.label}
                </Link>
              ))}
              <CursorToggle />
            </div>
          </div>
        </nav>
      </div>

      {/* the floating glass bar */}
      <nav aria-label="Main" className="nb-bar pointer-events-auto relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[1.6rem] py-1 pl-2.5 pr-2 sm:pl-4 sm:pr-3">
        <Magnetic strength={0.22}>
          <Link
            href="/"
            data-home-link
            className="block shrink-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            aria-label="Anime World Fun home"
            onClick={() => open && close(false)}
          >
            <LogoMark className="nb-logo h-11 sm:h-12" text="text-lg sm:text-xl" />
          </Link>
        </Magnetic>

        <WithPathname>{(p) => <DesktopLinks pathname={p} />}</WithPathname>

        <div className="flex items-center gap-2">
          <CursorToggle className="max-md:hidden!" />
          <button
            ref={toggleRef}
            type="button"
            className="nb-burger relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-text transition-colors hover:border-straw/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw md:hidden"
            onClick={toggleMenu}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span aria-hidden className="nb-burger-lines">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* scroll progress, gold to sakura pink */}
        <span aria-hidden className="nb-progress" />
      </nav>
    </header>
  );
}

/* Page-specific styles. All motion is transform/opacity; the global
   reduced-motion rule in globals.css turns the transitions off. */
const NAV_CSS = `
.nb-bar {
  background: rgba(14, 11, 20, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  transition:
    transform 0.7s var(--ease-out),
    background-color 0.5s var(--ease-out),
    border-color 0.5s var(--ease-out),
    box-shadow 0.5s var(--ease-out);
  will-change: transform;
}
.nb-header[data-scrolled] .nb-bar {
  background: rgba(14, 10, 20, 0.74);
  border-color: rgba(242, 201, 76, 0.16);
  box-shadow:
    0 18px 50px -18px rgba(0, 0, 0, 0.75),
    0 0 40px -12px rgba(255, 120, 180, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}
/* tuck away while scrolling down, unless the menu is open or a keyboard user
   is focused inside the bar (:focus-visible, so a mouse-clicked link that keeps
   focus after navigating doesn't pin the bar open) */
.nb-header[data-hidden]:not([data-open]):not(:has(:focus-visible)) .nb-bar {
  transform: translate3d(0, calc(-100% - 1.5rem), 0);
}
/* browsers without :has() drop the rule above; fall back to :focus-within */
@supports not selector(:has(*)) {
  .nb-header[data-hidden]:not([data-open]):not(:focus-within) .nb-bar {
    transform: translate3d(0, calc(-100% - 1.5rem), 0);
  }
}
.nb-header[data-open] .nb-bar {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.nb-logo {
  transition: transform 0.6s var(--ease-out), filter 0.6s var(--ease-out);
}
.nb-bar a:hover .nb-logo {
  transform: rotate(-4deg) scale(1.06);
  filter: drop-shadow(0 0 14px rgba(242, 201, 76, 0.45));
}

.nb-progress {
  pointer-events: none;
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--straw), #ff8fc4 70%, var(--sash));
  box-shadow: 0 0 12px rgba(255, 143, 196, 0.6);
  transform-origin: left center;
  transform: scaleX(var(--nb-progress, 0));
  opacity: 0;
  transition: opacity 0.4s var(--ease-out);
}
.nb-header[data-scrolled]:not([data-open]) .nb-progress {
  opacity: 0.9;
}

/* desktop links */
.nb-pill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffd96a, var(--straw) 55%, #e4b43a);
  box-shadow: 0 6px 22px -6px rgba(242, 201, 76, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  opacity: 0;
}
.nb-pill[data-ready] {
  transition:
    transform 0.65s cubic-bezier(0.34, 1.35, 0.5, 1),
    width 0.65s cubic-bezier(0.34, 1.35, 0.5, 1),
    opacity 0.35s var(--ease-out);
}
.nb-link {
  color: var(--text);
  transition: color 0.35s var(--ease-out) 0.08s;
}
.nb-link[data-active] {
  color: var(--ink);
}
.nb-roll {
  position: relative;
  display: block;
  overflow: hidden;
  line-height: 1.3;
}
.nb-roll-a,
.nb-roll-b {
  display: block;
  transition: transform 0.55s var(--ease-out);
}
.nb-roll-b {
  position: absolute;
  inset: 0;
  transform: translate3d(0, 105%, 0);
  color: var(--straw);
}
.nb-link[data-active] .nb-roll-b {
  color: var(--ink);
}
.nb-link:hover .nb-roll-a {
  transform: translate3d(0, -105%, 0);
}
.nb-link:hover .nb-roll-b {
  transform: none;
}
.nb-underline {
  pointer-events: none;
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 0.3rem;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--straw), #ff8fc4);
  box-shadow: 0 0 10px rgba(255, 143, 196, 0.55);
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.5s var(--ease-out);
}
.nb-link:hover .nb-underline,
.nb-link:focus-visible .nb-underline {
  transform: scaleX(1);
  transform-origin: left center;
}
.nb-link[data-active] .nb-underline {
  display: none;
}

/* burger -> X */
.nb-burger-lines {
  position: relative;
  display: block;
  width: 20px;
  height: 14px;
}
.nb-burger-lines span {
  position: absolute;
  left: 0;
  height: 2.4px;
  width: 100%;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.5s var(--ease-out), opacity 0.3s var(--ease-out), width 0.5s var(--ease-out);
}
.nb-burger-lines span:nth-child(1) { top: 0; }
.nb-burger-lines span:nth-child(2) { top: 6px; width: 70%; left: auto; right: 0; }
.nb-burger-lines span:nth-child(3) { top: 12px; }
.nb-header[data-open] .nb-burger-lines span:nth-child(1) { transform: translate3d(0, 6px, 0) rotate(45deg); }
.nb-header[data-open] .nb-burger-lines span:nth-child(2) { opacity: 0; transform: translate3d(8px, 0, 0); }
.nb-header[data-open] .nb-burger-lines span:nth-child(3) { transform: translate3d(0, -6px, 0) rotate(-45deg); }
.nb-header[data-open] .nb-burger { border-color: rgba(242, 201, 76, 0.5); color: var(--straw); }

/* mobile menu */
.nb-menu {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #0b0910;
  clip-path: circle(0px at var(--nb-ox, calc(100% - 2.5rem)) var(--nb-oy, 2.5rem));
  visibility: hidden;
  transition:
    clip-path 0.75s cubic-bezier(0.65, 0, 0.35, 1),
    visibility 0s linear 0.75s;
}
.nb-menu[data-open] {
  clip-path: circle(150vmax at var(--nb-ox, calc(100% - 2.5rem)) var(--nb-oy, 2.5rem));
  visibility: visible;
  transition: clip-path 0.85s cubic-bezier(0.65, 0, 0.35, 1);
}
.nb-menu-glow {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 45% at 85% 10%, rgba(255, 120, 180, 0.22), transparent 70%),
    radial-gradient(55% 40% at 0% 100%, rgba(242, 201, 76, 0.14), transparent 70%),
    radial-gradient(80% 60% at 50% 120%, rgba(31, 95, 143, 0.35), transparent 70%);
}
.nb-side-label {
  pointer-events: none;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  writing-mode: vertical-rl;
  transform: translate3d(0, -50%, 0);
  font-size: 0.85rem;
  letter-spacing: 0.4em;
  color: rgba(255, 255, 255, 0.14);
  white-space: nowrap;
}
.nb-petal {
  pointer-events: none;
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--s);
  height: var(--s);
  opacity: 0.55;
  filter: drop-shadow(0 0 10px rgba(255, 150, 200, 0.6));
  animation: float 6s ease-in-out var(--d) infinite;
}

.nb-mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.06em;
}
.nb-big {
  font-size: clamp(3.1rem, 17vw, 5.75rem);
  transform: translate3d(0, 110%, 0) rotate(5deg);
  transform-origin: left bottom;
  transition: transform 0.45s var(--ease-out), color 0.3s var(--ease-out), text-shadow 0.3s var(--ease-out);
}
.nb-caption,
.nb-kicker,
.nb-foot {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}
.nb-menu[data-open] .nb-big {
  transform: none;
  transition: transform 1s var(--ease-out) calc(0.28s + var(--i) * 0.08s), color 0.3s var(--ease-out), text-shadow 0.3s var(--ease-out);
}
.nb-menu[data-open] .nb-caption {
  opacity: 1;
  transform: none;
  transition: opacity 0.8s var(--ease-out) calc(0.45s + var(--i) * 0.08s), transform 0.8s var(--ease-out) calc(0.45s + var(--i) * 0.08s);
}
.nb-menu[data-open] .nb-kicker {
  opacity: 1;
  transform: none;
  transition: opacity 0.8s var(--ease-out) 0.22s, transform 0.8s var(--ease-out) 0.22s;
}
.nb-menu[data-open] .nb-foot {
  opacity: 1;
  transform: none;
  transition: opacity 0.9s var(--ease-out) 0.7s, transform 0.9s var(--ease-out) 0.7s;
}
.nb-item a:hover .nb-big,
.nb-item a:active .nb-big,
.nb-item a:focus-visible .nb-big {
  color: #ffc1dc;
  text-shadow: var(--glow-pink);
}
.nb-subtitle span {
  font-style: italic;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  padding: 0.2em 0.6em;
  line-height: 1.9;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  text-shadow: 0 1px 2px #000;
}

/* reduced motion: the global rule shortens durations, but staggered delays
   would still hold items back, so drop them and keep the petals still */
@media (prefers-reduced-motion: reduce) {
  .nb-menu,
  .nb-menu *,
  .nb-pill[data-ready] {
    transition-delay: 0s !important;
  }
  .nb-petal {
    animation: none;
  }
}
`;
