# Mascot swap: progress

Replacing every piece of copyrighted anime character art with **the Captain**, your original character. The source art is in `mascot/`: master-character-sheet, logo, hero and chibi-poses.

## Status

| Phase | Status | Commit |
|---|---|---|
| 1. Audit | ✅ Done | `3b5327b` "Before mascot swap" + this file |
| 2. Prepare images | ✅ Done | see log |
| 3. Logo and hero | ✅ Done | see log |
| 4. Backgrounds, cursor, decorations | ⏳ Next | |
| 5. Poster credits and cleanup | ⬜ | |
| 6. Test and report | ⬜ | |

**Exact next step:** Phase 4.
1. In `web/src/components/SiteBackground.tsx`, stop using `/images/bg-dark.webp` (the chibi collage). Use an original backdrop (night sea, stars and glow in CSS) instead.
2. Swap the straw hat on the boat sail in `web/src/components/info/Sea.tsx` for the Captain's dark hat.
3. Place the chibis:
   - waving on Home
   - reading on `/blog`
   - cheering for Logbook completion (My List `EntryCard` / `AddToList` when a show is completed)
   - sleeping for empty states (My List `EmptyLog`, Explore `EmptyScene`) and the 404 (`web/src/app/not-found.tsx`)
4. Rename `web/src/components/StrawHatCursor.tsx` to a Captain cursor (an SVG katana), rename the navbar toggle to "Captain cursor", and update the privacy text.

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
