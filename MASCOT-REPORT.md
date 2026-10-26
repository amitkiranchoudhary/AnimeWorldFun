# Mascot swap report: the Captain

All the copyrighted character art on the website is replaced by the Captain, your original character. Anime posters, covers and banners from AniList stay, always shown next to their titles and now credited in the footer.

Every phase is committed separately; the full log is in `PROGRESS-MASCOT.md`. Nothing is pushed to GitHub yet.

## What changed

| Before | After |
|---|---|
| Hero collage (Naruto, Goku, Luffy, Gojo, Saitama, Totoro…) | The Captain on the bow of his ship. **Desktop:** the Captain on the left; the "Anime World Fun" heading, text, search bar and buttons on the right over the sky and sea. **Phones:** a portrait crop of the Captain on top, the text below. The sakura petals and branches are unchanged. |
| Logo with Saitama, Luffy's straw hat and a Dragon Ball | The Captain's portrait in a round gold-ringed badge, with an "Anime / World Fun" wordmark beside it (navbar and footer; it still links home) |
| Straw-hat favicon | The Captain's head in a gold ring |
| Link-preview image (a crop of the collage) | A crop of the Captain's hero painting (1200×630) |
| Background chibi collage (Naruto, Goku, Luffy, Gojo, Ichigo, L, Nezuko, Tanjiro, Anya, Dragon Balls) on every page | An original starry night sky drawn in CSS (drifting stars, moon glow, sea-blue wash). It uses no image file. |
| "👒 Hat cursor": Luffy's straw hat flipping on a fingertip | "⚔️ Captain cursor": the Captain's katana (white blade, gold guard, maroon grip). The blade tip points, it tilts and glints over links, and swings when you click. It can still be switched off in the navbar. |
| A straw hat on the boat's sail (404 and Contact pages) | The Captain's dark hat with a brown band |
| (no mascot moments) | Chibi Captains: **waving** on Home ("Free for every fan" card), **reading** above the blog's read-along, **cheering** on completed shows in My List and "Completed!" on anime pages, **sleeping** on the 404, the empty My List and Explore's "No anime found" |
| Footer: "Anime data provided by AniList" | "**Data and images from AniList.** All anime titles, posters and artwork belong to their respective owners." plus "The Captain, our mascot, is an original Anime World Fun character." |

- **Image files:** `web/public/images/captain/` holds WebP files plus fallbacks: palette PNGs for the transparent art, and JPEG for the hero painting, because a PNG of it would be about 4 MB. Total about 1.1 MB for everything. Next.js also serves them resized and in modern formats.
- **Rebuilding them:** `cd web && node scripts/make-captain-images.mjs` remakes every image from `mascot/` if you update the source art.
- **Deleted:** `hero-landing.png`, `logo.png`, `bg-dark.png`, `bg-dark.webp`, `cursor-hat.png` and `cursor-hand.png`. They're still in git history.

## Tested

- Type check, lint and production build all pass.
- All 68 internal links (including 20 anime pages) work. The only 404 is the deliberate test page.
- **375px phone width:** none of the 11 pages scroll sideways (Home, Explore, Explore with no results, an anime page, My List, Blog, About, Contact, Privacy, Login and 404).
- **1280px desktop:** Home, Blog, My List and the 404 have no sideways scroll and no broken images.
- **The right image on each page:**
  - Home loads `hero-desktop` and the waving chibi.
  - Blog has the reading chibi.
  - The 404 has the sleeping chibi.
  - A completed show in My List shows the cheering chibi.
  - Phones load `hero-mobile`.
- I visually checked the Home hero at 1280px and 375px, the 404 page, and Explore's background.

## Needs your attention

1. **Look at the hero and the logo yourself.** The layout and crops are my choices: the Captain at about 28% across on desktop, and the phone crop centred on him. If you'd like him bigger, or the text further right, it's a quick change.
2. **The new logo has no lettering.** Your logo image is a portrait only, so "Anime World Fun" is set in the site's Bangers font next to the badge. If you have a version with the name built in, send it and I'll swap it in.
3. **AI watermarks:** your `hero.png` had a small AI-generator sparkle ✦ in the bottom-right corner. I patched over it with nearby sea in the web versions. `mascot/master-character-sheet.jpg` has one too, but it isn't used on the site.
4. **Katana cursor:** in every chibi pose the katana touches the Captain, so it couldn't be cut out cleanly. The cursor is a hand-drawn SVG in the same colours instead. Try it with a mouse.
5. **The 17 MB of source art in `mascot/`** is now committed to git, so it will be in the GitHub repo when you push. If you'd rather keep the originals private, tell me before pushing and I'll move them out of git.
6. **Not pushed:** tell me when you want this on GitHub.

## Leftover anime-related content I found (kept on purpose)

- **AniList posters, covers and banners** everywhere anime are listed (Explore, anime pages, Home rows, My List, Blog topics, About). These stay by design, next to their titles and credited.
- **Anime titles as text:** the footer ticker, Explore and blog topic names, and the search placeholder ("Search One Piece, Frieren…"). Names aren't artwork.
- **The 🍖 in "Made with 🍖 by a fan"** is a standard emoji, not character art.
- **Other original art:** the compass (generic, original style), the sakura photo (CC BY 2.0, credited) and the 3D sky (sakura and lanterns drawn in code).
- **Old images in git history:** the removed collages are still in old commits. That only matters if you want them gone from history too, which needs a history rewrite and a force push. I wouldn't bother.

No copyrighted character art remains on any page.

---

# Part 1 re-verification (code and files check)

| # | Item | Result |
|---|---|---|
| 1 | Captain logo in navbar | ✅ `Logo.tsx` uses `captain/logo-*` |
| 2 | Favicon | ✅ `src/app/icon.png` (Captain) |
| 3 | Desktop hero: Captain left, text right | ✅ `object-[28%_center]`, text block `md:justify-end` |
| 4 | Mobile hero: Captain on top, text below | ✅ `hero-mobile` source, text `-mt-28` below |
| 5 | Sakura animation | ⚠️ `SkyScene` (canvas petals) is mounted on Home; not run in a browser this pass, please glance at it |
| 6 | No copyrighted background chibis | ✅ `bg-dark.*` deleted, CSS night sky only |
| 7 | Dragon Ball decorations gone | ✅ no matches in src or public |
| 8 | Captain cursor replaced hat cursor | ✅ `CaptainCursor.tsx` (katana); no `cursor-hat` references |
| 9 | Chibis placed | ✅ waving (Home), reading (Blog), cheering (My List, anime page "Completed!"), sleeping (404, empty My List, Explore no results) |
| 10 | "Hi!" text removed | ✅ removed from the image, no "Hi!" in code |
| 11 | Footer credit | ✅ "Data and images from AniList" |
| 12 | Broken images or links | ✅ every `/images/...` path in `src` exists |
| 13 | Posters next to titles | ✅ `remotePatterns` for `s4.anilist.co` intact, components unchanged |

**Leftover names:** only the text "Naruto" and "One Piece" in the footer ticker and search placeholder (titles, not art). Fine to keep.

**⚠️ Not actually pushed:** the repo is 7 commits ahead of `origin/main`. Nothing from the mascot swap is on GitHub yet.

No ❌ items, so nothing needed fixing.
