# Mascot swap: progress

Replacing every piece of copyrighted anime character art with **the Captain**, your original character. The source art is in `mascot/`: master-character-sheet, logo, hero and chibi-poses.

## Status

| Phase | Status | Commit |
|---|---|---|
| 1. Audit | ✅ Done | `3b5327b` "Before mascot swap" + this file |
| 2. Prepare images | ⏳ Next | |
| 3. Logo and hero | ⬜ | |
| 4. Backgrounds, cursor, decorations | ⬜ | |
| 5. Poster credits and cleanup | ⬜ | |
| 6. Test and report | ⬜ | |

**Exact next step:** Phase 2. Make optimized WebP and PNG versions from `mascot/` into `web/public/images/captain/`:
- From the logo: a circular navbar logo and a favicon (`web/src/app/icon.png`).
- From the hero: a desktop version and a mobile crop.
- Split `chibi-poses` into waving, reading, cheering and sleeping, with transparent backgrounds, and remove the "Hi!" from the waving one.

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
