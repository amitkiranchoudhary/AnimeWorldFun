// Word timings for a recorded read-along: one start time (seconds) per word.
// The Studio builds them from sentence taps; without any, they're estimated
// by spreading the words over the recording, longer words and pauses at
// punctuation taking more time.

const weight = (w: string) => {
  let x = 1 + w.replace(/[^\p{L}\p{N}']/gu, "").length * 0.18;
  if (/[.!?]["”’)]?$/.test(w)) x += 1.6;
  else if (/[,;:—]$/.test(w)) x += 0.7;
  return x;
};

export const isSentenceEnd = (w: string) => /[.!?]["”’)]?$/.test(w);

/** Index of the first word of each sentence. */
export function sentenceStarts(words: string[]): number[] {
  const out = words.length ? [0] : [];
  words.forEach((w, i) => {
    if (isSentenceEnd(w) && i + 1 < words.length) out.push(i + 1);
  });
  return out;
}

/** Spread words[from..to) over [t0, t1) by weight. */
function spread(words: string[], from: number, to: number, t0: number, t1: number, out: number[]) {
  let total = 0;
  for (let i = from; i < to; i++) total += weight(words[i]);
  let t = t0;
  for (let i = from; i < to; i++) {
    out[i] = Math.round(t * 100) / 100;
    t += ((t1 - t0) * weight(words[i])) / (total || 1);
  }
}

/**
 * Start times for every word. `anchors` maps a word index to the moment it
 * starts (from the Studio's taps); words in between are spread by weight.
 */
export function estimateTimings(words: string[], duration: number, anchors: Map<number, number> = new Map()): number[] {
  const out = new Array<number>(words.length).fill(0);
  if (!words.length) return out;
  const lead = Math.min(0.3, duration * 0.02); // most recordings start with a breath
  const points = [...anchors.entries()].filter(([i, t]) => i > 0 && i < words.length && t >= 0 && t <= duration).sort((a, b) => a[0] - b[0]);
  const stops: [number, number][] = [[0, anchors.get(0) ?? lead], ...points, [words.length, duration]];
  for (let k = 0; k < stops.length - 1; k++) {
    const [i0, t0] = stops[k];
    const [i1, t1] = stops[k + 1];
    if (i1 > i0) spread(words, i0, i1, t0, Math.max(t0, t1), out);
  }
  return out;
}

/** The word being spoken at time t (binary search over start times). */
export function wordAt(times: number[], t: number): number {
  let lo = 0;
  let hi = times.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
