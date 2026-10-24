import { paintCanopyArt } from "./paintCanopy";
import type { Wind } from "./wind";

// The cherry blossom canopy hanging along the top of the page, brought to life
// by the shared wind.
//
// The art is /public/images/sakura-canopy.webp (transparent, ~2400px wide) —
// currently a real photo, "Sakura branch" by Raita Futo (CC BY 2.0, Wikimedia
// Commons), with its sky removed; the credit is in the site footer. If the file
// is missing, the canopy painted in code (paintCanopy.ts) is used instead.
//  • a wide image (≥ 2.5 : 1) spans the whole top of the screen
//  • a narrower one hangs into both top corners, its RIGHT edge (where the photo's
//    thick limb is) against the screen edge, mirrored for the left corner
//
// It's drawn as thin horizontal strips that each shift sideways with the wind:
// barely at the top where it's attached, more toward the hanging blossom, with
// gusts rippling down through it. It lifts away and fades as you scroll, and
// falling petals start from the pink parts of the art itself.

export const CANOPY_URL = "/images/sakura-canopy.webp";

const STRIPS = 40;

type Source = { image: CanvasImageSource; width: number; height: number };
type Placement = { x: number; y: number; w: number; h: number; mirror: boolean; phase: number };

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
        // as wide as asked, but never hanging lower than ~40% of the screen
        let pw = w * frac;
        let ph = pw * aspect;
        if (ph > h * 0.4) {
          ph = h * 0.4;
          pw = ph / aspect;
        }
        return { pw, ph };
      };
      if (src.width / src.height >= 2.5 || !file) {
        const { pw, ph } = file ? fit(1.02) : { pw: src.width, ph: src.height };
        places = [{ x: (w - pw) / 2, y: 0, w: pw, h: ph, mirror: false, phase: 0 }];
      } else {
        const narrow = w < 768;
        // one in each top corner, kept small so the middle of the banner stays clear,
        // and tucked a little under the navbar so it seems to come from above
        const L = fit(narrow ? 0.55 : 0.36);
        const R = fit(narrow ? 0.5 : 0.33);
        places = [
          { x: 0, y: -L.ph * 0.12, w: L.pw, h: L.ph, mirror: true, phase: 0 },
          { x: w - R.pw, y: -R.ph * 0.18, w: R.pw, h: R.ph, mirror: false, phase: 1.9 },
        ];
      }
    },

    draw(g: CanvasRenderingContext2D, t: number) {
      lift = Math.min(1, window.scrollY / (h * 0.65)); // gone after ~⅔ of a screen
      if (lift >= 1 || !src) return;
      const s = wind.strength;
      const fade = 1 - ease();

      g.save();
      g.globalAlpha = fade;
      g.imageSmoothingQuality = "high";
      for (const p of places) {
        const y0 = top + p.y - ease() * p.h * 0.85;
        const px = p.w / 900; // sway is designed for a ~900px-wide painting
        g.save();
        if (p.mirror) {
          g.translate(p.x + p.w, 0);
          g.scale(-1, 1);
        } else {
          g.translate(p.x, 0);
        }
        if (places.length === 1) {
          // full-width art hanging from the top: horizontal strips, the lower
          // (hanging) ones swaying sideways more, gusts rippling down through it
          for (let i = 0; i < STRIPS; i++) {
            const v = (i + 0.5) / STRIPS;
            const reach = Math.pow(v, 1.35);
            const sway =
              s * 14 +
              Math.sin(t * 1.25 - i * 0.2 + p.phase) * (2.5 + 8 * s) +
              Math.sin(t * 6.5 - i * 0.65 + p.phase * 2) * 1.4 * s;
            const sy = (i * src.height) / STRIPS;
            const sh = src.height / STRIPS + 1; // 1px overlap hides seams between strips
            g.drawImage(src.image, 0, sy, src.width, sh, sway * reach * px, y0 + (i * p.h) / STRIPS, p.w, p.h / STRIPS + 1);
          }
        } else {
          // a branch held at the screen edge (the image's right side, in local
          // coordinates): vertical strips that bob more the farther they are from
          // the trunk, like a real branch in the wind — still at the edge, lively
          // at the tip, with each gust travelling out along it
          for (let i = 0; i < STRIPS; i++) {
            const u = 1 - (i + 0.5) / STRIPS; // 0 at the trunk edge → 1 at the tip
            const reach = Math.pow(u, 1.6);
            const bob =
              s * 10 + // gusts press the branch down a little
              Math.sin(t * 1.3 - u * 2.2 + p.phase) * (2 + 7 * s) +
              Math.sin(t * 6 - u * 5 + p.phase * 2) * 1.2 * s;
            const sx = (i * src.width) / STRIPS;
            const sw = src.width / STRIPS + 1; // 1px overlap hides seams between strips
            g.drawImage(src.image, sx, 0, sw, src.height, (i * p.w) / STRIPS, y0 + bob * reach * px, p.w / STRIPS + 1, p.h);
          }
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
      return { x: p.x + u * p.w, y: top + p.y - ease() * p.h * 0.85 + b.v * p.h };
    },
  };
}
