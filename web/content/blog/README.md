# Blog posts

Each post is one Markdown file in this folder. It goes live when the file is
committed and the site is rebuilt (on Vercel that happens on every push).

- File name = the post's address: `one-piece-watch-order.md` → `/blog/one-piece-watch-order`
  (lowercase letters, numbers and dashes only).
- Files starting with `_` (like `_template.md`) and this README are never published.
- Add `draft: true` to keep a post off the site while you work on it.

## The easy way: the Studio

Sign in, open **Studio → Write a blog**. Type or paste your post, watch the live
preview, then:

1. **Download post (.md)** and put the file in this folder.
2. Optional, for the read-along with your own voice: load your recording in the
   Voice section, tap once at the start of each sentence while it plays, then
   **Download timings (.json)**. Put the recording and the `.json` in `web/public/audio/`
   with the same name as the post (e.g. `one-piece-watch-order.mp3` and
   `one-piece-watch-order.json`).
3. Commit and push.

Without a recording, readers can still press **Listen** and their browser reads
the post aloud, lighting up each word.

## Front matter

```
---
title: The One Piece watch order, without the filler
date: 2026-11-02
summary: One or two sentences shown on the blog page and in search results.
tags: One Piece, watch order, guide
anime: 21
audio: /audio/one-piece-watch-order.mp3
timings: /audio/one-piece-watch-order.json
---
```

Only `title` and `date` are required. `anime` is the number in an anime page's
address on this site (`/anime/21` → `21`); its artwork becomes the post's cover.

## Writing

- `## Heading` and `### Smaller heading`
- Blank line between paragraphs
- `- item` lists, `1. item` numbered lists, `> quote`
- `**bold**`, `*italic*`, `[link text](https://…)` or `[link](/anime/21)`
- `||spoiler||` is blurred until the reader taps it
- `---` on its own line for a divider
