// Sub/dub details per platform, checked by hand.
//
// AniList tells us WHICH platforms carry an anime, but not which subtitle or
// dub languages each one offers (or in which country). Add verified entries
// here and they show up in the "Where to watch" hover cards. Anything not
// listed shows "not confirmed yet" instead of a guess.
//
// Key: AniList anime id (the number in /anime/<id>).
// Platform key: the platform name exactly as AniList spells it (e.g. "Crunchyroll", "Netflix").
//
// Example (replace with real, checked data):
//   21: {
//     Crunchyroll: { region: "India", sub: ["English", "Hindi"], dub: ["English", "Hindi"], checked: "2026-10" },
//   },

export type PlatformLanguages = {
  region?: string;
  sub?: string[];
  dub?: string[];
  /** When this was last verified, e.g. "2026-10" */
  checked?: string;
};

export const AVAILABILITY: Record<number, Record<string, PlatformLanguages>> = {};
