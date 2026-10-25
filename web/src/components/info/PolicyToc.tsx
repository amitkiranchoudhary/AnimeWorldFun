"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Item = { id: string; title: string };

/**
 * "On this page" for the privacy policy: a sticky list on wide screens and a
 * fold-out menu on phones. It highlights the section you're reading using an
 * IntersectionObserver (no scroll listener).
 */
export default function PolicyToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        // the first section (in page order) inside the reading band wins
        const first = items.find((it) => visible.get(it.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  // onPick lets the phone menu fold itself away after a jump
  const list = (onPick?: (e: MouseEvent<HTMLAnchorElement>) => void) => (
    <ol className="space-y-1">
      {items.map((it, i) => {
        const on = it.id === active;
        return (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={on ? "location" : undefined}
              onClick={onPick}
              className={`toc-link group flex items-baseline gap-3 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-straw ${
                on ? "bg-white/[0.06] font-extrabold text-text" : "text-muted hover:text-text"
              }`}
            >
              <span className={`font-mono text-[11px] ${on ? "text-[#ff9fc8]" : "text-white/50"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span>{it.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <nav aria-label="On this page" className="hidden lg:block">
        <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/60">On this page</p>
        {list()}
      </nav>
      <details className="glass group rounded-2xl lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold text-text outline-none focus-visible:ring-2 focus-visible:ring-straw [&::-webkit-details-marker]:hidden">
          On this page
          <span aria-hidden className="transition-transform duration-300 group-open:rotate-180">
            ▾
          </span>
        </summary>
        <nav aria-label="On this page" className="px-1 pb-3">
          {list((e) => {
            const menu = e.currentTarget.closest("details");
            if (menu) menu.open = false;
          })}
        </nav>
      </details>
    </>
  );
}
