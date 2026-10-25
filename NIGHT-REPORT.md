# Night report: 26 October 2026

I worked from about **01:08 to 01:50** (local time), well before the 4:45 deadline. Everything is committed **on your computer only**: nothing was pushed to GitHub. `main` is now 7 commits ahead of GitHub. When you're happy, push with:

```bash
git push origin main
```

(`v2-rebuild` still points at the last pushed version. Run `git branch -f v2-rebuild main` first if you want it updated too.)

## Commits tonight

| Commit | What |
|---|---|
| `e052616` | Starting point (empty commit, so you can always come back here) |
| `a9d4f60` | **My List tracker** (Phase 3) |
| `5b41792` | **Blog posts with voice read-along** (Phase 4) |
| `b23bf9e` | **Studio → Anime data** sub/dub editor (Phase 2) |
| `afb96c7` | Fixes from the full recheck |
| `ae2e097` | Fix: long links in blog posts wrap on phones |

To undo all of tonight's work: `git reset --hard e052616`. Be careful: this throws away all of tonight's changes.

---

## 1. What I finished (the remaining roadmap)

These were the phases on the Studio's "voyage chart" that were still locked.

### Phase 3: My List (real tracker, no accounts)
- Every anime page has **＋ Add to My List** and **▶ I'm watching it**. Once a show is added, the page shows a small log for it: shelf, episode count with **+1**, and a link to the list.
- **My List page:**
  - Five shelves: Watching, Plan to watch, Completed, On hold and Dropped.
  - Search and sort within a shelf.
  - A progress ring and a **+1** button on each show. Logging the last episode stamps the show Completed.
  - A 1–10 rating and a note for each show.
  - Remove, with an "are you sure?" step.
  - Long shelves load 24 shows at a time.
- **Import:** from a public **AniList** username, or a **MyAnimeList export** (`.xml` or `.xml.gz`). The import only reads those lists; it changes nothing on AniList or MyAnimeList.
- **Backup:** download your list as a file, and restore it on another device.
- The list is saved **in the visitor's own browser** (storage key `awf-my-list`). There are still no visitor accounts, so you remain the only account.
- I updated the privacy policy, the About cards and the My List page text to describe this accurately.

### Phase 4: Blog posts with read-along
- **Each post is a file:** a Markdown file in `web/content/blog/`. There's a how-to (`README.md`) and a `_template.md` in that folder. Posts go live when you commit and push. Files starting with `_`, and posts marked `draft: true`, are never published.
- **Post pages** (`/blog/your-post`):
  - The anime's artwork as the cover, plus the date, read time and tags.
  - A sticky **Listen** player:
    - **With your recording:** words light up in time with your voice.
    - **Without one:** the reader's browser reads the post aloud.
    - Speed buttons, start again, click any word to jump there, and it scrolls along with the reading.
  - Spoilers you write as `||like this||` stay blurred until tapped.
- **The blog page** lists your posts automatically once you've published any. Posts are also added to the sitemap for Google.
- **Studio → Write a blog** (only you can open it):
  - Type or paste your post, with a live preview. Your draft saves automatically in your browser.
  - **Download post (.md)** gives you the file to publish.
  - **Your voice:** load your recording and press *Sync*. As it plays, tap **Space** (or the big button) at the start of each sentence. The words in between are timed for you. Then **Download timings (.json)**.
  - Put the `.md` in `web/content/blog/`, and the recording plus the `.json` in `web/public/audio/`. Then commit and push. The full steps are in `web/content/blog/README.md`.

### Phase 2 (the leftover piece): sub/dub data
- **Studio → Anime data** (only you can open it):
  - Type an anime's number or paste its link. The tool shows the streaming platforms AniList lists for it.
  - For each platform, tick the subtitle and dub languages you've checked yourself (Hindi, Tamil, Telugu and others are built in). Leave a platform as "Not checked" or mark a language "Not available". The region defaults to India.
  - **Download availability.json**, replace `web/src/data/availability.json` with it, then commit and push.
- Anything you haven't checked still shows **"Not confirmed yet"** on the site. I didn't enter any language data myself, because it has to be verified by hand.

---

## 2. What I fixed during the recheck

I checked every page, link, button and form, plus phone width (375px):

- **Trailer bug:** AniList's YouTube ID for *Attack on Titan* has a hidden tab character at the end, which broke the trailer link (`…LHtdKWJdif4%09`). Trailer IDs are now trimmed and checked.
- **Home page heading:** the home page had no `<h1>` heading (the name is only in the banner picture). I added one for Google and screen readers; it isn't visible on the page.
- **Cursor toggle:** the straw-hat cursor button now tells screen readers whether it's on or off.
- **Blog posts on phones:** long links and words were cut off at the right edge. They now wrap.
- Found and fixed while testing the new features, before committing them:
  - The writer's downloaded file had no line break after its header block, so the site couldn't read it.
  - The writer's default date was in UTC, which is still yesterday after midnight in India.
  - An empty AniList list now gives a clear message instead of "0 shows imported".
  - In the Anime data tool, a region you typed by hand could disappear.

**What passed:**
- Type check, lint and the production build.
- All 68 internal links, followed from every page (including 20 anime pages), return 200, except `/nope`, the deliberate test for the "Lost at sea" 404 page.
- The external links in the pages work: GitHub, AniList, Wikimedia, Google and the Creative Commons license. Crunchyroll blocks automated checks, but it opens fine in a browser.
- Every page fits a 375px phone screen with no sideways scrolling.
- No console errors on any page.
- Buttons and forms:
  - Navbar, the phone menu (opens, locks scrolling, Escape closes, focus handled) and the cursor toggle.
  - Explore: 7 filter and search combinations, the empty state, filters that keep your place on the page, and paging.
  - Anime page: trailer button, Sub & dub panels and poster carousel.
  - Contact: the bottle form builds the right GitHub link.
  - Login: a wrong password shows the error. I used a made-up login, not yours.
  - My List: add, +1, AniList import, MyAnimeList import, backup and restore.
  - Blog: playback with a recording and with the browser's voice, click-to-jump, pause.
  - Studio writer: download and tap-to-sync.

I cleaned up all test files and test data afterwards. No test posts are left on the site.

---

## 3. Left undone, or worth a check from you

- **Not tested while signed in:** the Anime data tool's lookup needs your owner login, and I didn't use your password. The page is protected and its download works, so please try it once: Studio → Anime data → type `21`.
- **Real voice recording:** I tested sync with a 12-second test tone, not a real voice. Try a short recording of your own in Studio → Write a blog.
- **Sound:** the browser panel was hidden overnight, so I could check that words light up but not hear the browser's voice speaking.
- **MyAnimeList `.gz` files:** I tested `.xml` imports. The built-in unzip for `.xml.gz` should work in modern browsers but isn't tested.
- **Site stats** (the last "Later" item) isn't built. It needs analytics, and the privacy policy promises "no tracking", so that's your call.
- **Not started**, from the original wishlist and never scheduled: a country selector (the site is India-first), comments and likes, and the supporter tier.
- **No blog posts are published,** on purpose. Your drafts are below.
- **Sub/dub data is empty** until you check platforms and fill it in.
- **Push to GitHub:** not done, since you only asked for commits. Use the command at the top.

A note so it doesn't worry you: while the app's browser panel is hidden, some page sections stay on their loading skeleton. That's the browser pausing animation frames in a hidden window, not a site bug; it doesn't happen when the page is visible.

---

## 4. Blog drafts

The 5 drafts are **not** on the website. They're on your Desktop:

**`C:\Users\PC\Desktop\blog-drafts\`**

1. `01-one-piece-watch-order.md`: The One Piece watch order for busy fans (what to skip)
2. `02-sub-or-dub.md`: Sub or dub? The honest guide, including Indian-language dubs
3. `03-first-anime-for-beginners.md`: Your first anime: 5 safe picks for total beginners
4. `04-anime-food-at-home.md`: Anime food you can actually make at home
5. `05-why-anime-openings-hit.md`: Why anime openings are impossible to skip

Each file has title ideas, the main idea in 2–3 lines, and a short mini script of key points in simple language, plus a recording tip.

Two things to double-check before recording:
- Draft 1: the exact filler episode numbers. Check them against a fan wiki.
- Draft 5: describe the opening songs rather than quoting their lyrics, for copyright reasons.

---

## How to try it in the morning

```bash
cd web
npm run dev
```

Then open http://localhost:3000 and try these:
- `/my-list`
- any anime page → **Add to My List**
- `/login` → Studio → **Write a blog** and **Anime data**
