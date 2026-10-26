# Checklist report: 26 October 2026

Audit started at 09:41 and finished well inside the 55 minutes. Each section has its own commit:

| Commit | What |
|---|---|
| `b2dab77` | Starting point (empty commit) |
| `6d2d704` | Section A fixes |
| `7c999da` | Section C cleanup |

After the changes, the type check, lint and production build all pass.

**Status key:**
- **Done:** I changed something to meet the item.
- **Already OK:** it was already in place, and I checked it.
- **Needs Me:** it needs your accounts or a decision from you.

## A. Launch must-haves

| Item | Status | Notes |
|---|---|---|
| Custom 404 page | Already OK | The "Lost at sea" page returns a real 404 and is hidden from search engines. |
| Unique title and meta description on every page | **Done** | Every page already had its own title and description. One fix: the Privacy description still said "one browser preference"; it now mentions My List as well. Login, 404 and Studio reuse the default description, which is fine because they're hidden from search engines. |
| Preview image (Open Graph) | **Done** | New 1200×630 share image `public/images/og.jpg` (110 KB, replacing a 1 MB PNG), with alt text. Anime pages and blog posts use their own artwork. ⚠️ Needs Me: set `NEXT_PUBLIC_SITE_URL` on the host, or preview links will point to localhost (see below). |
| Alt text on every image | Already OK | Checked 181 images across 10 pages: none is missing alt. Decorative images use `alt=""` on purpose. |
| Internal links between pages | Already OK | Navbar, footer, cross-links from anime pages and blog posts. |
| sitemap.xml and robots.txt | Already OK | The sitemap lists every main page plus blog posts. robots.txt blocks `/login` and `/studio`. |
| Thank-you page after form submission | Already OK (no page needed) | The site has no form that sends data to us. The Contact bottle shows an in-page "Bottle cast!" confirmation and hands the message to GitHub. Login goes to the Studio. My List imports show a success or error message. A separate thank-you page would have nothing to thank for. |
| Privacy policy page | Already OK | It's accurate to the code, including My List storage and imports. |
| FAQ section | **Done** | Added an FAQ to the About page (`/about#faq`) with 6 honest questions and answers, plus Google's FAQ data. There's also an FAQ link in the footer. |
| Testimonials: remove fake ones | Already OK | There are no testimonials anywhere. |

## B. Fixes

| Item | Status | Notes |
|---|---|---|
| No horizontal scrolling; works on mobile | Already OK | All 10 main pages fit a 375px screen with no sideways scroll. This was fixed and verified in earlier rounds. |
| Mobile menu works | Already OK | It opens, locks page scrolling, closes with Escape, and moves keyboard focus into and out of the menu. |
| Favicon present | Already OK | `src/app/icon.png` is on every page. |
| No broken links, buttons or footer links | Already OK | Recrawled 68 internal links (including 20 anime pages): 0 broken. The external links in the pages work. Buttons and forms were tested last night. |
| Success and error messages on forms | Already OK | Login shows a wrong-password message. My List imports and backups show success or error. The Contact bottle shows its confirmation. |
| No placeholder text or unused navigation | Already OK (one note) | The Home page's three blog cards say "Coming soon" because no posts are published yet. They're honest, but they'll go stale: once you publish posts, those cards should show them (Needs Me: publish posts). |
| Logo clickable; phone and email clickable | Already OK | The logo links home. There's no phone number or public email on the site, on purpose. Contact goes through GitHub. |
| Copyright year is current | Already OK | The footer shows © 2026 and updates automatically. |
| Images compressed; pages load fast | **Done** | The site background is now `bg-dark.webp` (46 KB instead of a 958 KB PNG). The share image is 110 KB instead of 1 MB. Other images go through Next.js's image optimiser, which resizes them and serves modern formats. Pages respond in 0.1 s or less locally. One note: Explore's HTML is heavy (about 650 KB, mostly page data for 30 cards); it's fine for now. |

## C. Code cleanup

| Item | Status | Notes |
|---|---|---|
| Clean folder structure; logic separated from UI | Already OK | Data and logic live in `src/lib` (AniList, My List, blog, markdown), content in `content/blog` and `src/data`, and UI in `src/components/<area>`. |
| Remove duplicate and dead code; consistent naming | **Done** | Removed the unused `ComingSoon.tsx`, which no page used after the redesign; it's still in git history. A scan found no other unused files. (`skyScene3d.ts` looks unused but is loaded lazily on Home.) |
| Proper error handling; config kept out of code | Already OK | Failed AniList requests fall back without being cached. Imports return friendly errors. Secrets and the site address live in `.env.local` (`.env.example` lists them), not in the code. |

## What I changed

- `src/components/info/Faq.tsx` (new) and `src/app/about/page.tsx`: the FAQ section, with FAQ data for Google.
- `src/components/Footer.tsx`: FAQ link in the footer.
- `public/images/og.jpg` (new) and `src/app/layout.tsx`: the 1200×630 share image.
- `public/images/bg-dark.webp` (new) and `src/components/SiteBackground.tsx`: the compressed background. The old PNG is kept, unused.
- `src/app/privacy/page.tsx`: the updated meta description.
- `src/components/ComingSoon.tsx`: removed (dead code).

## Needs Me

- **Set `NEXT_PUBLIC_SITE_URL`** to your real domain on your host, e.g. `https://www.yoursite.com`. Until then, share previews, the sitemap and robots.txt point to localhost.
- **HTTPS** and pointing your domain at the host. This happens when you deploy.
- **Cloudflare** spam and bot protection.
- **Google Analytics:** this also needs a privacy policy update and probably a cookie banner, because the policy currently promises no tracking.
- **Google Search Console:** verify the site and submit `/sitemap.xml`.
- **Publish your first blog posts** (Studio → Write a blog), so the Home page "Coming soon" blog cards can show real posts.
- **Fill in sub/dub data** (Studio → Anime data), so "Where to watch" shows checked languages instead of "Not confirmed yet".
