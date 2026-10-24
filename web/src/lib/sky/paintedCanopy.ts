import { paintCanopyArt } from "./paintCanopy";
import type { Wind } from "./wind";

// The cherry blossom canopy hanging along the top of the page, brought to life
// by the shared wind.
//
// The art is either a painting you drop in at /public/images/sakura-canopy.png
// (transparent PNG, ~2000px+ wide; its top edge is where it hangs from) or, by
// default, the canopy painted in code for this screen size (paintCanopy.ts).
//  • a wide painting (≥ 2.5 : 1) spans the whole top of the screen
//  • a narrower one hangs into both corners (mirrored on the right)
//
// It's drawn as thin horizontal strips that each shift sideways with the wind:
// barely at the top where it's attached, more toward the hanging blossom, with
// gusts rippling down through it. A soft dark fade behind it separates it from
// the busy banner. It lifts away and fades as you scroll, and falling petals
// start from the pink parts of the art itself.

export const CANOPY_URL = "/images/sakura-canopy.png";

const STRIPS = 40;

type Source = { image: CanvasImageSource; width: number; height: number };
type Placement = { x: number; w: number; h: number; mirror: boolean; phase: number };

export function loadCanopyImage(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = CANOPY_URL;
  });
}

/** Pink, solid pixels of the art (0…1 coordinates), for spawning petals. */
function findBlossom(src: Source) {
  const sw = 96;
  const sh = Math.max(1, Math.round((sw * src.height) / src.width));
  const c = document.createElement("canvas");
  c.width = sw;
  c.height = sh;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(src.image, 0, 0, sw, sh);
  const d = g.getImageData(0, 0, sw, sh).data;
  const out: { u: number; v: number }[] = [];
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      if (d[i + 3] > 180 && d[i] > 170 && d[i + 2] > 120 && d[i] > d[i + 1] + 15) out.push({ u: (x + 0.5) / sw, v: (y + 0.5) / sh });
    }
  }
  return out.length ? out : [{ u: 0.2, v: 0.4 }];
}

/** `file` = the dropped-in painting, or null to paint the canopy in code. */
export function createPaintedCanopy(file: HTMLImageElement | null, wind: Wind) {
  let src: Source | null = null;
  let blossomUV: { u: number; v: number }[] = [];
  let w = 0;
  let h = 0;
  let top = 0;
  let lift = 0;
  let places: Placement[] = [];

  const ease = () => lift * lift * (3 - 2 * lift);

  return {
    resize(width: number, height: number, dpr: number) {
      w = width;
      h = height;
      top = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      if (file) {
        if (!src) src = { image: file, width: file.naturalWidth, height: file.naturalHeight };
      } else {
        const art = paintCanopyArt(w, h, Math.min(dpr, 2));
        src = { image: art.canvas, width: art.width, height: art.height };
      }
      blossomUV = findBlossom(src);

      const aspect = src.height / src.width;
      const fit = (frac: number) => {
        // as wide as asked, but never hanging lower than about half the screen
        let pw = w * frac;
        let ph = pw * aspect;
        if (ph > h * 0.55) {
          ph = h * 0.55;
          pw = ph / aspect;
        }
        return { pw, ph };
      };
      if (src.width / src.height >= 2.5 || !file) {
        const { pw, ph } = file ? fit(1.02) : { pw: src.width, ph: src.height };
        places = [{ x: (w - pw) / 2, w: pw, h: ph, mirror: false, phase: 0 }];
      } else {
        const narrow = w < 768;
        const L = fit(narrow ? 0.62 : 0.5);
        const R = fit(narrow ? 0.52 : 0.42);
        places = [
          { x: 0, w: L.pw, h: L.ph, mirror: false, phase: 0 },
          { x: w - R.pw, w: R.pw, h: R.ph, mirror: true, phase: 1.9 },
        ];
      }
    },

    draw(g: CanvasRenderingContext2D, t: number) {
      lift = Math.min(1, window.scrollY / (h * 0.65)); // gone after ~⅔ of a screen
      if (lift >= 1 || !src) return;
      const s = wind.strength;
      const fade = 1 - ease();

      // a soft dark fade behind the canopy, so it reads cleanly over the busy banner
      const deepest = Math.max(...places.map((p) => p.h));
      const shade = g.createLinearGradient(0, top, 0, top + deepest * 1.15);
      shade.addColorStop(0, `rgba(14, 6, 20, ${0.55 * fade})`);
      shade.addColorStop(0.6, `rgba(14, 6, 20, ${0.22 * fade})`);
      shade.addColorStop(1, "rgba(14, 6, 20, 0)");
      g.fillStyle = shade;
      g.fillRect(0, top, w, deepest * 1.15);

      g.save();
      g.globalAlpha = fade;
      g.imageSmoothingQuality = "high";
      for (const p of places) {
        const y0 = top - ease() * p.h * 0.85;
        const px = p.w / 900; // sway is designed for a ~900px-wide painting
        g.save();
        if (p.mirror) {
          g.translate(p.x + p.w, 0);
          g.scale(-1, 1);
        } else {
          g.translate(p.x, 0);
        }
        for (let i = 0; i < STRIPS; i++) {
          const v = (i + 0.5) / STRIPS;
          const reach = Math.pow(v, 1.35); // hanging parts move more than the top
          // a wave travelling down the strips: gust push + slow rock + quick flutter
          const sway =
            s * 14 +
            Math.sin(t * 1.25 - i * 0.2 + p.phase) * (2.5 + 8 * s) +
            Math.sin(t * 6.5 - i * 0.65 + p.phase * 2) * 1.4 * s;
          let dx = sway * reach * px;
          if (p.mirror) dx = -dx; // the wind blows toward screen-right for both
          const sy = (i * src.height) / STRIPS;
          const sh = src.height / STRIPS + 1; // 1px overlap hides seams between strips
          const dy = y0 + (i * p.h) / STRIPS;
          g.drawImage(src.image, 0, sy, src.width, sh, dx, dy, p.w, p.h / STRIPS + 1);
        }
        g.restore();
      }
      g.restore();
    },

    /** a random spot on the blossom (CSS px), or null once scrolled away */
    spot(rand: () => number): { x: number; y: number } | null {
      if (lift > 0.6 || !places.length) return null;
      const p = places[Math.floor(rand() * places.length)];
      const b = blossomUV[Math.floor(rand() * blossomUV.length)];
      const u = p.mirror ? 1 - b.u : b.u;
      return { x: p.x + u * p.w, y: top - ease() * p.h * 0.85 + b.v * p.h };
    },
  };
}
