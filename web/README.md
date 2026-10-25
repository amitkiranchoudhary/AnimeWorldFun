# Anime World Fun — website

Next.js 16 app for Anime World Fun: find anime, see where to watch it and in which
language, track what you've watched, and read the owner's blogs.

## Run it locally

```bash
npm install
node scripts/set-owner-password.mjs "your password" you@example.com   # first time only
npm run dev
```

Open http://localhost:3000. The owner logs in at `/login` and lands on `/studio`.

## The owner account

There is exactly **one** account: the site owner. There is no sign-up page.
Its email, password hash and session secret live in `.env.local` (never committed).
Change the password any time with:

```bash
node scripts/set-owner-password.mjs "new password"
```

This also rotates `SESSION_SECRET`, which logs out any open sessions.

## Publishing a blog post

Posts are Markdown files in [`content/blog/`](content/blog/README.md). Sign in and
open **Studio → Write a blog** to write with a live preview, sync your voice
recording, and download the files; then commit and push. Details are in
[content/blog/README.md](content/blog/README.md).

## Sub/dub data

Which subtitle and dub languages each platform offers lives in
`src/data/availability.json`. Edit it with **Studio → Anime data** (download the
new file and replace the old one) — only add what you've checked yourself.

## My List

Visitors' lists are saved in their own browser (`localStorage`, key `awf-my-list`) —
there are no visitor accounts. They can import from a public AniList list or a
MyAnimeList export, and download or restore a backup.

## Deploying (Vercel)

1. Import the GitHub repo in Vercel and set **Root Directory** to `web`.
2. Add the environment variables from `.env.example` (copy the values from your
   `.env.local`, and set `NEXT_PUBLIC_SITE_URL` to your real domain, e.g. `https://www.yoursite.com`).
3. Deploy, then add your `.com` domain under **Settings → Domains**.

## Checks

```bash
npm run lint
npm run build
```
