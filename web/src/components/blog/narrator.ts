// The read-along engine behind the /blog preview, kept outside React.
// It reads a list of words aloud with the browser's speechSynthesis and calls
// onWord(i) as each word is spoken, using the voice's word-boundary events.
// Voices that never report boundaries get a timed highlight instead (synced
// per sentence), and without speech at all it simply lights words on a timer.

export type NarratorMode = "voice" | "voice-timed" | "timed";

type Callbacks = {
  onWord: (i: number) => void;
  onDone: () => void;
  onMode: (mode: NarratorMode) => void;
};

export const canSpeak = () =>
  typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

/** How long a word stays lit on the timer at 1× (about 170 words a minute, with pauses at punctuation). */
function wordMs(word: string) {
  let ms = 190 + word.replace(/[^\w']/g, "").length * 34;
  if (/[.!?]["”’)]?$/.test(word)) ms += 380;
  else if (/[,;:—]$/.test(word)) ms += 180;
  return ms;
}

const VOICE_KEY = "awf-voice";
const MALE = /\b(guy|davis|ryan|brian|christopher|eric|roger|steffan|andrew|david|mark|george|james|male)\b/i;
const FEMALE = /\b(aria|jenny|sonia|libby|michelle|ana|emma|zira|samantha|susan|hazel|female|karen|moira|tessa|victoria|serena)\b/i;
const isMale = (v: SpeechSynthesisVoice) => MALE.test(v.name) && !/female/i.test(v.name);

export const englishVoices = () =>
  canSpeak() ? window.speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang)) : [];

/** The calm female voice we prefer: Natural/Neural, Google UK Female, Google US, Zira/Samantha, any female English, then the default. */
export function bestVoice(): SpeechSynthesisVoice | null {
  const en = englishVoices();
  const calm = (v: SpeechSynthesisVoice) => /natural|neural/i.test(v.name) && !isMale(v);
  return (
    en.find((v) => calm(v) && FEMALE.test(v.name)) ??
    en.find(calm) ??
    en.find((v) => /google uk english female/i.test(v.name)) ??
    en.find((v) => /google us english/i.test(v.name)) ??
    en.find((v) => /zira|samantha/i.test(v.name)) ??
    en.find((v) => FEMALE.test(v.name) && !isMale(v)) ??
    en.find((v) => v.default) ??
    en[0] ??
    null
  );
}

export const savedVoiceName = () => {
  try {
    return localStorage.getItem(VOICE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const saveVoiceName = (name: string) => {
  try {
    if (name) localStorage.setItem(VOICE_KEY, name);
    else localStorage.removeItem(VOICE_KEY);
  } catch {}
};

/** The visitor's saved choice if that voice still exists here, otherwise the best default. */
export function pickVoice(): SpeechSynthesisVoice | null {
  const saved = savedVoiceName();
  return (saved && englishVoices().find((v) => v.name === saved)) || bestVoice();
}

/** Resolves once the voice list is ready (Chrome fills it in late; Android can be slower still). */
export function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve([]);
    const synth = window.speechSynthesis;
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      resolve(synth.getVoices());
    };
    if (synth.getVoices().length) return resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", done);
    window.setTimeout(done, 1500); // some browsers never fire the event
  });
}

const CALM_RATE = 0.9; // our 1× is a touch slower than the browser's default

export function createNarrator(words: string[], cb: Callbacks) {
  const offsets: number[] = [];
  let acc = 0;
  for (const w of words) {
    offsets.push(acc);
    acc += w.length + 1;
  }
  const last = words.length - 1;
  const sentenceEnd = (from: number) => {
    for (let j = from; j < last; j++) if (/[.!?]["”’)]?$/.test(words[j])) return j;
    return last;
  };

  const synth = canSpeak() ? window.speechSynthesis : null;
  let session = 0; // bumped on every stop, so stale callbacks do nothing
  let timer = 0;
  let current = -1;
  let rate = 1;
  let noBoundaries = false; // learned once: this voice never sends word events
  let speechFailed = false; // learned once: speech never started or errored, so stay silent
  let live: SpeechSynthesisUtterance | null = null; // also keeps Chrome from garbage-collecting it

  const light = (i: number) => {
    current = i;
    cb.onWord(i);
  };

  /** Light words from..to on a timer, then call onEnd (if given). */
  function tick(id: number, from: number, to: number, onEnd?: () => void) {
    const step = (i: number) => {
      if (id !== session) return;
      light(i);
      timer = window.setTimeout(() => {
        if (id !== session) return;
        if (i < to) step(i + 1);
        else onEnd?.();
      }, wordMs(words[i]) / rate);
    };
    step(from);
  }

  const finish = (id: number) => () => {
    if (id !== session) return;
    session++;
    live = null;
    cb.onDone();
  };

  /** Fall back to the silent timer from the current word to the end. */
  function silent(id: number) {
    speechFailed = true; // later plays skip the 2.5 s start guard and go straight to the timer
    live = null;
    synth?.cancel();
    cb.onMode("timed");
    tick(id, Math.max(0, current), last, finish(id));
  }

  /** Speak one sentence (short utterances dodge Chrome's ~15 s cut-off), then the next. */
  function speak(id: number, from: number) {
    if (!synth) return silent(id);
    const end = sentenceEnd(from);
    const u = new SpeechSynthesisUtterance(words.slice(from, end + 1).join(" "));
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-US";
    u.rate = rate * CALM_RATE;
    u.pitch = 1;
    live = u;
    const mine = () => id === session && live === u;

    let heard = false;
    let watchdog = 0;
    // if speech never starts (no voices installed, blocked), go silent
    const startGuard = window.setTimeout(() => {
      if (mine()) silent(id);
    }, 2500);

    u.onstart = () => {
      window.clearTimeout(startGuard);
      if (!mine()) return;
      light(from);
      if (noBoundaries) return tick(id, from, end);
      // no word event soon after starting: this voice keeps its timing to itself
      watchdog = window.setTimeout(() => {
        if (!mine() || heard) return;
        noBoundaries = true;
        cb.onMode("voice-timed");
        tick(id, Math.max(from, current), end);
      }, 650);
    };
    u.onboundary = (e) => {
      if (!mine() || (e.name && e.name !== "word")) return;
      heard = true;
      const at = offsets[from] + e.charIndex;
      let i = from;
      while (i < end && offsets[i + 1] <= at) i++;
      if (i !== current) light(i);
    };
    u.onend = () => {
      window.clearTimeout(startGuard);
      window.clearTimeout(watchdog);
      if (!mine()) return;
      window.clearTimeout(timer);
      if (end < last) speak(id, end + 1);
      else finish(id)();
    };
    u.onerror = (e) => {
      window.clearTimeout(startGuard);
      window.clearTimeout(watchdog);
      if (!mine() || e.error === "interrupted" || e.error === "canceled") return;
      silent(id);
    };
    synth.resume(); // in case the page left it paused
    synth.speak(u);
  }

  function stop() {
    session++;
    window.clearTimeout(timer);
    const wasSpeaking = !!live || !!synth?.speaking || !!synth?.pending;
    live = null;
    if (wasSpeaking) synth?.cancel();
    return wasSpeaking;
  }

  /** Start reading at word `from`, aloud when `voice` is true and the browser can. */
  function play(from: number, opts: { rate: number; voice: boolean }) {
    const cancelled = stop();
    const id = session;
    rate = opts.rate;
    current = from;
    if (opts.voice && synth && !speechFailed) {
      cb.onMode(noBoundaries ? "voice-timed" : "voice");
      light(from);
      // Chrome can drop an utterance queued in the same tick as cancel()
      if (cancelled) timer = window.setTimeout(() => id === session && speak(id, from), 90);
      else speak(id, from);
    } else {
      cb.onMode("timed");
      tick(id, from, last, finish(id));
    }
  }

  return { play, stop };
}

export type Narrator = ReturnType<typeof createNarrator>;
