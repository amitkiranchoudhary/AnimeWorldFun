"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "./blog.module.css";

// Movie-subtitle captions under the hero title, changing like lines of
// dialogue. Decorative: the same words are in the page as plain text.
// With "reduce motion" the first line simply stays.
const LINES = [
  { text: "Every word in this log will be read aloud to you." },
  { text: "[ waves against the hull · a lantern creaks ]", cue: true },
  { text: "Watch orders. Seasonal picks. Hot takes." },
  { text: "Press play, and each word lights up as it's spoken." },
  { text: "[ ink still drying ]", cue: true },
];

export default function HeroSubtitles() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % LINES.length), 3800);
    return () => window.clearInterval(id);
  }, []);

  const line = LINES[i];
  return (
    <div className={s.subs} aria-hidden>
      {/* the key re-mounts the caption so each line fades in fresh */}
      <span key={i} className={`${s.sub} ${line.cue ? s.subCue : ""}`}>
        {line.text}
      </span>
    </div>
  );
}
