# Mascot swap: progress

Replacing every piece of copyrighted anime character art with **the Captain**, your original character. The source art is in `mascot/`: master-character-sheet, logo, hero and chibi-poses.

## Status

| Phase | Status | Commit |
|---|---|---|
| 1. Audit | ✅ Done | `3b5327b` "Before mascot swap" + this file |
| 2. Prepare images | ✅ Done | see log |
| 3. Logo and hero | ✅ Done | see log |
| 4. Backgrounds, cursor, decorations | ✅ Done | see log |
| 5. Poster credits and cleanup | ✅ Done | see log |
| 6. Test and report | ✅ Done | "Mascot swap complete" |

**All phases done.** See `MASCOT-REPORT.md` for the summary and what needs your attention. Nothing is pushed to GitHub yet.

---

## Phase 1: Audit

### A. Copyrighted character art to REPLACE

| # | What | File | Where it shows | Copyrighted content |
|---|---|---|---|---|
| 1 | Homepage hero collage | `web/public/images/hero-landing.png` (1 MB) | Home hero (`src/app/page.tsx`) | Dozens of characters: Naruto, Goku, Luffy, Gojo, Saitama, Totoro, No-Face, Tanjiro, Nezuko, Eren and more |
| 2 | Share/preview image | `web/public/images/og.jpg` | Link previews for every page (`src/app/layout.tsx`) | A crop of the hero collage above |
| 3 | Logo | `web/public/images/logo.png` | Navbar and footer (`src/components/Logo.tsx`) | Saitama (One-Punch Man), Luffy's straw hat, a Dragon Ball |
| 4 | Favicon | `web/src/app/icon.png` | Browser tab icon | Luffy's straw hat |
| 5 | Background chibi collage | `web/public/images/bg-dark.png` and `bg-dark.webp` | Behind every page (`src/components/SiteBackground.tsx`) | Chibi Naruto, Goku (on the Nimbus and Super Saiyan Blue), Luffy, Gojo, Ichigo, L, Nezuko, Tanjiro, Anya and more, plus **Dragon Ball decorations** (the orange starred balls) |
| 6 | Hat cursor | `web/public/images/cursor-hat.png` (the hand, `cursor-hand.png`, is generic) | Desktop mouse cursor (`src/components/StrawHatCursor.tsx`), plus "Hat cursor" in the navbar | Luffy's straw hat, flipping on a fingertip "Luffy-style" |
| 7 | Straw hat on the sail | Drawn in code: `src/components/info/Sea.tsx` (boat) | 404 page, Contact page | A straw hat with a red band, Luffy's hat |
| 8 | Alt text and comments naming characters | `src/app/page.tsx` (hero alt: "heroes from Naruto, Dragon Ball, One Piece…"), comments in `SkyScene.tsx`, `SiteBackground.tsx` and `StrawHatCursor.tsx` | Text only | Will be reworded with the art |

**Fine to keep (original or licensed):** the compass (`compass.png`, generic), the sakura photo (`sakura-canopy.webp`, CC BY 2.0, credited), and the 3D sky scene (sakura petals, lanterns, sea; all drawn in code, and Goku was already removed).

### B. Anime posters, covers and banners that STAY

These are official covers and banners loaded from AniList (`s4.anilist.co`), always shown next to their titles:

- Explore results grid and the poster ring in the Explore hero (`components/AnimeGrid.tsx`, `components/explore/Hero.tsx`)
- Home "Trending" and "All-time greats" rows (`components/AnimeRow.tsx`)
- Anime pages: banner, cover, "Seasons & related" and "If you liked this" carousels (`app/anime/[id]/page.tsx`, `components/anime/*`)
- My List: hero covers, the demo, sample shelves and rail, and your saved shows (`app/my-list/page.tsx`, `components/account/Logbook*`, `PosterRail`, `MyListApp`)
- Blog: the topic gallery covers and post cover art (`components/blog/TopicGallery.tsx`, `CurvedGallery.tsx`, `app/blog/[slug]/page.tsx`)
- About: the poster arc (`components/info/PosterArc.tsx`)
- Studio → Anime data lookup (`components/account/AnimeDataEditor.tsx`)

---

## Changes log
- Phase 1: committed `mascot/` untouched (the "Before mascot swap" commit) and wrote this audit. No site changes yet.
- Phase 2: `web/scripts/make-captain-images.mjs` (rerunnable: `cd web && node scripts/make-captain-images.mjs`) wrote `web/public/images/captain/`:
  - **logo-256 / logo-512**: the logo portrait masked to a circle (WebP + PNG).
  - **hero-desktop** (1920px) and **hero-mobile** (900px portrait crop centred on the Captain): WebP + **JPEG** fallback. A PNG of this painting would be about 4 MB, so JPEG is the sensible fallback.
  - **chibi-waving / reading / cheering / sleeping**: 640px, transparent background (white removed by flood fill), pale ground shadow turned into a soft dark shadow, and the "Hi!" and its sparkle removed from waving (WebP + palette PNG).
  - **Favicon** `web/src/app/icon.png`: the Captain's head in a gold ring. Already live, because Next.js picks it up automatically.
  - **Link preview** `web/public/images/og.jpg`: regenerated from the Captain hero (1200×630).
  - The hero's AI-generator sparkle watermark (bottom-right) is patched over with nearby sea.
- **For you to know:**
  - The katana can't be cut out of the chibi sheet cleanly (in every pose it touches the Captain), so the Phase 4 cursor will be a hand-drawn SVG of his katana in the same colours.
  - `master-character-sheet.jpg` also has the generator sparkle; it isn't used on the site.
- Phase 3:
  - **Logo:** `web/src/components/Logo.tsx` is now the Captain badge (`captain/logo-256.png`, served as WebP/AVIF by next/image) in a gold ring, with an "Anime / World Fun" wordmark beside it. Used in the navbar (still links home) and the footer.
  - **Hero:** in `web/src/app/page.tsx`, the hero collage is replaced by an art-directed `<picture>` (`getImageProps`). Desktop: `hero-desktop` full width, the Captain on the left, and a visible h1 "Anime World Fun" with the text, search and buttons on the right over the sky. Phones: `hero-mobile` on top, text stacked below. Checked at 1280px and 375px, with no sideways scroll. The sakura layer (SkyScene) is unchanged.
  - The link-preview alt text in `layout.tsx` now describes the Captain.
  - The old `public/images/hero-landing.png` and `logo.png` are unused now; they're deleted in Phase 5.
- Phase 4:
  - **Background** (`SiteBackground.tsx`): the chibi collage (Naruto, Goku, Luffy, Gojo, Dragon Balls…) is replaced by an original night sky drawn in CSS (two drifting star layers, moon glow, sea-blue wash). No image file needed.
  - **Sail** (`info/Sea.tsx`, used on the 404 and Contact pages): the straw hat with the red band is now the Captain's dark hat with a brown band.
  - **Chibis** (new `components/CaptainChibi.tsx`):
    - waving: the Home "Free for every fan" card
    - reading: above the blog's read-along
    - cheering: My List cards for completed shows, and "Completed!" on anime pages
    - sleeping: the 404, the empty My List and Explore's "No anime found"
  - **Cursor:** `StrawHatCursor.tsx` → `CaptainCursor.tsx`, the Captain's katana as an SVG (white blade, gold guard, maroon grip). The blade tip is the pointer. It tilts and glints over links and swings on click. The navbar toggle now reads "⚔️ Captain cursor", and the privacy text is updated (same storage key).
  - Removed a stale "Goku on the Flying Nimbus" comment in `SkyScene.tsx`.
- Phase 5:
  - **Footer:** now says "Data and images from AniList. All anime titles, posters and artwork belong to their respective owners." plus "The Captain, our mascot, is an original Anime World Fun character."
  - **Deleted** `public/images/hero-landing.png`, `logo.png`, `bg-dark.png`, `bg-dark.webp`, `cursor-hat.png` and `cursor-hand.png`. They're still in git history.
  - **Removed** the unused hat cursor keyframes from `globals.css`.
  - No references to the old files remain; the build passes.
- Phase 6: tested desktop (1280px) and phone (375px) widths and all links; wrote `MASCOT-REPORT.md`.
