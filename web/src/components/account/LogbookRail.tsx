import type { CSSProperties } from "react";
import { type AnimeCard, displayTitle } from "@/lib/anilist";
import { PosterCard, sampleOf, shelfRows } from "./LogbookShelves";
import PosterRail from "./PosterRail";
import s from "./logbook.module.css";

// extra space between shelves on the rail, in poster slots
const SHELF_GAP = 0.8;

/** The wide-screen version of the sample shelves: every poster on one curved, pinned rail. */
export default function LogbookRail({ items }: { items: AnimeCard[] }) {
  const rows = shelfRows(items);
  const captions: string[] = [];
  const posters: {
    a: AnimeCard;
    kind: (typeof rows)[number]["shelf"]["kind"];
    shelfTitle: string;
    accent: string;
    i: number;
    slot: number;
  }[] = [];
  let n = 0;
  rows.forEach(({ shelf, row }, si) => {
    row.forEach((a, i) => {
      posters.push({ a, kind: shelf.kind, shelfTitle: shelf.title, accent: shelf.accent, i, slot: n + si * SHELF_GAP });
      captions.push(`${shelf.title} — ${displayTitle(a)} · ${sampleOf(a, shelf.kind, i).caption}`);
      n++;
    });
  });
  if (posters.length === 0) return null;

  return (
    <PosterRail
      shelves={rows.map((r) => ({ title: r.shelf.title, accent: r.shelf.accent, count: r.row.length, note: r.shelf.note }))}
      captions={captions}
      gap={SHELF_GAP}
    >
      {posters.map((p) => (
        <li
          key={p.a.id}
          data-rail-item
          data-slot={p.slot}
          className={s.railItem}
          style={{ "--slot": p.slot, "--accent": p.accent } as CSSProperties}
        >
          <PosterCard a={p.a} kind={p.kind} i={p.i} sizes="270px" reveal={false} shelfTitle={p.shelfTitle} />
        </li>
      ))}
    </PosterRail>
  );
}
