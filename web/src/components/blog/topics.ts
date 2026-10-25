// The kinds of posts the Captain's Log will publish (Phase 4). Shown as
// "coming soon" posters in the curved gallery on /blog.

export type Topic = {
  id: string;
  tag: string;
  title: string;
  blurb: string;
  /** a big decorative kanji for the poster */
  glyph: string;
  accent: string;
};

export const TOPICS: Topic[] = [
  {
    id: "watch-order",
    tag: "Watch-order guides",
    title: "Every franchise, in the right order",
    blurb: "Prequels, movies, OVAs and side stories untangled, with filler flagged so you know what to skip.",
    glyph: "順",
    accent: "#f2c94c",
  },
  {
    id: "seasonal",
    tag: "Seasonal picks",
    title: "What's worth it this season",
    blurb: "A short, honest shortlist every season, plus where to stream each one, sub or dub.",
    glyph: "季",
    accent: "#ff8fc4",
  },
  {
    id: "reviews",
    tag: "Reviews",
    title: "Spoiler-free verdicts",
    blurb: "Is it worth your weekend? Reviews that tell you everything except the twist.",
    glyph: "評",
    accent: "#cfe8ff",
  },
  {
    id: "hot-takes",
    tag: "Hot takes",
    title: "Shouted from the crow's nest",
    blurb: "Unpopular opinions, defended with passion and a suspicious number of screenshots.",
    glyph: "熱",
    accent: "#e63946",
  },
  {
    id: "beginners",
    tag: "Beginner guides",
    title: "Your first ten anime",
    blurb: "New to anime? Start here: gentle picks, no homework, and zero gatekeeping.",
    glyph: "初",
    accent: "#f6e7c8",
  },
  {
    id: "sub-dub",
    tag: "Sub or dub",
    title: "The honest dub guide",
    blurb: "Which shows shine in Hindi or English dub, and which ones you should keep subbed.",
    glyph: "声",
    accent: "#9ad0ff",
  },
  {
    id: "hidden-gems",
    tag: "Hidden gems",
    title: "Treasure below deck",
    blurb: "Short, overlooked series that deserve a crew of their own. X marks the spot.",
    glyph: "宝",
    accent: "#ffc23d",
  },
];
