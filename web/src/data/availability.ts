import data from "./availability.json";

// Sub/dub details per platform, checked by hand.
//
// AniList tells us WHICH platforms carry an anime, but not which subtitle or
// dub languages each one offers (or in which country). Verified entries live in
// availability.json and show up in the "Where to watch" hover cards; anything
// not listed shows "not confirmed yet" instead of a guess.
//
// The easy way to edit it: Studio → Anime data, then download the new
// availability.json and replace this folder's copy. By hand, the shape is:
//   { "21": { "Crunchyroll": { "region": "India", "sub": ["English", "Hindi"], "dub": ["English"], "checked": "2026-10" } } }
// Key: AniList anime id (the number in /anime/<id>). Platform: its name exactly as
// AniList spells it. Leave out sub or dub when unknown; [] means "not available".

export type PlatformLanguages = {
  region?: string;
  sub?: string[];
  dub?: string[];
  /** When this was last verified, e.g. "2026-10" */
  checked?: string;
};

export type Availability = Record<string, Record<string, PlatformLanguages>>;

export const AVAILABILITY: Availability = data as Availability;
