import type { Wind } from "./wind";

// Hand-painted cherry blossom artwork hanging into the top of the page,
// brought to life by the shared wind.
//
// Put the artwork at /public/images/sakura-canopy.png (a PNG with a
// transparent background, ~2000px+ wide). Its TOP edge is where it hangs from.
//  • a wide painting (≥ 2.5 : 1) spans the whole top of the screen
//  • a narrower one hangs into both corners (mirrored on the right)
//
// The painting is drawn as thin horizontal strips. Each strip shifts sideways
// a little with the wind: barely at the top where it's attached, more and more
// toward the hanging blossom below, and a gust ripples down through it like a
// wave. It lifts away and fades as you scroll, and falling petals start from
// the pink parts of the painting itself.

export const CANOPY_URL = "/images/sakura-canopy.png";

const STRIPS = 36;

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

export function createPaintedCanopy(img: HTMLImageElement, wind: Wind) {
  const wide = img.naturalWidth / img.naturalHeight >= 2.5;
  let w = 0;
  let h = 0;
  let top = 0;
  let lift = 0;
  let places: Placement[] = [];
  // pink, solid pixels of the painting (0…1 coordinates), for spawning petals
  let blossomUV: { u: number; v: number }[] = [];

  // find the blossom in the painting once, on a small copy
  {
    const sw = 96;
    const sh = Math.max(1, Math.round((sw * img.naturalHeight) / img.naturalWidth));
    const c = document.createElement("canvas");
    c.width = sw;
    c.height = sh;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, sw, sh);
    const d = g.getImageData(0, 0, sw, sh).data;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4;
        const [r, gr, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
        if (a > 180 && r > 170 && b > 120 && r > gr + 15) blossomUV.push({ u: (x + 0.5) / sw, v: (y + 0.5) / sh });
      }
    }
    if (!blossomUV.length) blossomUV = [{ u: 0.5, v: 0.6 }];
  }

  const ease = () => lift * lift * (3 - 2 * lift);

  return {
    resize(width: number, height: number) {
      w = width;
      h = height;
      top = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const aspect = img.naturalHeight / img.naturalWidth;
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
      if (wide) {
        const { pw, ph } = fit(1.02);
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
      if (lift >= 1) return;
      const s = wind.strength;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      g.save();
      g.globalAlpha = 1 - ease();
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
          // hanging parts move more than the top where it's attached
          const reach = Math.pow(v, 1.35);
          // wave travelling down the strips: gust push + slow rock + quick flutter
          const sway =
            s * 16 +
            Math.sin(t * 1.25 - i * 0.22 + p.phase) * (3 + 9 * s) +
            Math.sin(t * 6.5 - i * 0.7 + p.phase * 2) * 1.6 * s;
          let dx = sway * reach * px;
          if (p.mirror) dx = -dx; // the wind blows toward screen-right for both corners
          const sy = (i * ih) / STRIPS;
          const sh = ih / STRIPS + 1; // 1px overlap hides seams between strips
          const dy = y0 + (i * p.h) / STRIPS;
          g.drawImage(img, 0, sy, iw, sh, dx, dy, p.w, p.h / STRIPS + 1);
        }
        g.restore();
      }
      g.restore();
    },

    /** a random spot on the painted blossom (CSS px), or null once scrolled away */
    spot(rand: () => number): { x: number; y: number } | null {
      if (lift > 0.6 || !places.length) return null;
      const p = places[Math.floor(rand() * places.length)];
      const b = blossomUV[Math.floor(rand() * blossomUV.length)];
      const u = p.mirror ? 1 - b.u : b.u;
      return { x: p.x + u * p.w, y: top - ease() * p.h * 0.85 + b.v * p.h };
    },
  };
}
