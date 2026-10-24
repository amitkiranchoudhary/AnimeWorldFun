import { createPaintedCanopy, loadCanopyImage } from "./paintedCanopy";
import type { Wind } from "./wind";

// The front 2D layer, over the page content: a painted cherry blossom canopy
// along the top of the page (paintedCanopy.ts), and sakura petals falling over
// and between the tiles.
//
// Petals fall the way real ones do (a falling-leaf motion): each rocks side to
// side like a pendulum, dropping fastest mid-swing and almost hanging at each
// end, tilting into the swing and turning over to show its slightly pinker
// underside; a few spin quickly the whole way down. The shared wind carries
// them, gusts tear bursts of fresh petals off the blossoms, and nearer petals
// are bigger, faster and sharper than far ones.

type Petal = {
  x: number;
  y: number;
  vx: number; // drift velocity carried by the wind (px/s)
  z: number; // depth: 0.55 far … 1.35 near
  size: number;
  phase: number;
  swing: number; // pendulum frequency (rad/s)
  sway: number; // pendulum width (px)
  fall: number; // base fall speed (px/s)
  rot: number;
  flip: number;
  spinner: boolean; // tumbles end over end instead of rocking
  tint: number;
};

/* Pre-rendered petal faces: a few tints × (top side, underside) */
const TINTS = [
  { top: ["#fff6f9", "#ffd3e1", "#f6a9c4"], under: ["#ffe6ee", "#f7b6cc", "#e88aad"] },
  { top: ["#ffffff", "#ffe2ec", "#f9bfd2"], under: ["#fdeef3", "#f5c3d3", "#ec9cb8"] },
  { top: ["#fff3f6", "#ffcadb", "#f19cbb"], under: ["#ffe1ea", "#f3a9c2", "#e07aa1"] },
];
const SPRITE = 64; // px per sprite (before devicePixelRatio)

function paintPetal(stops: string[], dpr: number) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE * dpr;
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(SPRITE / 2, SPRITE / 2);
  const s = SPRITE * 0.42;
  // a broad petal with the notch at its tip; pale at the tip, deeper pink at the base
  g.beginPath();
  g.moveTo(0, s);
  g.bezierCurveTo(s * 0.9, s * 0.55, s * 0.82, -s * 0.62, s * 0.24, -s);
  g.quadraticCurveTo(0, -s * 0.78, -s * 0.24, -s);
  g.bezierCurveTo(-s * 0.82, -s * 0.62, -s * 0.9, s * 0.55, 0, s);
  const grad = g.createLinearGradient(0, -s, 0, s);
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(0.55, stops[1]);
  grad.addColorStop(1, stops[2]);
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = "rgba(200, 90, 130, 0.3)";
  g.lineWidth = 0.8;
  g.stroke();
  // fine veins fanning out from the base
  g.strokeStyle = "rgba(210, 100, 140, 0.22)";
  g.lineWidth = 0.6;
  for (const k of [-0.45, -0.2, 0, 0.2, 0.45]) {
    g.beginPath();
    g.moveTo(0, s * 0.9);
    g.quadraticCurveTo(k * s * 0.6, 0, k * s * 0.9, -s * 0.75);
    g.stroke();
  }
  return c;
}

export function startFrontPetals(canvas: HTMLCanvasElement, count: number, wind: Wind) {
  const g = canvas.getContext("2d");
  if (!g) return { update() {}, resize() {}, dispose() {}, blossomSpot: () => null };
  // the canopy painted in code, swapped for a dropped-in painting if there is one
  let blossoms = createPaintedCanopy(null, wind);
  let disposed = false;
  loadCanopyImage().then((img) => {
    if (!img || disposed) return;
    const art = createPaintedCanopy(img, wind);
    art.resize(w, h, dpr);
    blossoms = art;
  });

  let w = 0;
  let h = 0;
  let dpr = 1;
  let faces: { top: HTMLCanvasElement; under: HTMLCanvasElement }[] = [];
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    faces = TINTS.map((t) => ({ top: paintPetal(t.top, dpr), under: paintPetal(t.under, dpr) }));
    blossoms.resize(w, h, dpr);
  };
  resize();

  const spawn = (p: Partial<Petal> = {}): Petal => {
    const z = 0.55 + Math.random() * 0.8;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      z,
      size: (7 + Math.random() * 4) * z,
      phase: Math.random() * 100,
      swing: 2.4 + Math.random() * 1.8,
      sway: (16 + Math.random() * 28) * z,
      fall: (34 + Math.random() * 26) * z,
      rot: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,
      spinner: Math.random() < 0.2,
      tint: Math.floor(Math.random() * TINTS.length),
      ...p,
    };
  };
  // fall from a blossom (or from the top edge once the branches are gone)
  const fromTree = () => {
    const at = blossoms.spot(Math.random);
    return at ? spawn({ x: at.x, y: at.y }) : spawn({ y: -20, x: Math.random() * (w + 200) - 200 });
  };
  const petals = Array.from({ length: count }, () => spawn());

  return {
    resize,
    /** scroll = recent scroll speed (positive while scrolling down) */
    update(t: number, dt: number, scroll: number) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      blossoms.draw(g, t);

      const drag = 1 - Math.exp(-dt * 2.2);
      for (const p of petals) {
        const a = t * p.swing + p.phase;
        // carried by the wind (light petals react quickly), plus the pendulum rock
        p.vx += ((wind.strength * 26 + wind.gust * 170) * p.z - p.vx) * drag;
        p.x += (p.vx + Math.cos(a) * p.sway * p.swing * 0.5) * dt;
        // fastest at the bottom of each swing, nearly hanging at its ends
        const lift = wind.gust * 18 * p.z + scroll * 8;
        p.y += (p.fall * (0.28 + 1.25 * Math.cos(a) ** 2) - lift) * dt;

        // tilt into the swing; rock the face toward and away from us, or tumble
        const tilt = Math.sin(a) * 0.9;
        p.flip += (p.spinner ? 9 + wind.gust * 6 : 0.4 + wind.gust * 3) * dt;
        const face = p.spinner ? Math.cos(p.flip) : Math.cos(p.flip * 0.5 + Math.sin(a) * 0.9);
        p.rot += (wind.gust * 1.5 + 0.15) * dt;

        // once a petal leaves the screen, a new one falls; a strong gust tears extra ones loose
        const m = 24;
        if (p.y > h + m || p.y < -m * 8 || p.x > w + 160 || p.x < -220) Object.assign(p, fromTree());
        else if (wind.gust > 0.45 && Math.random() < dt * wind.gust * 1.2) Object.assign(p, fromTree());

        const img = face >= 0 ? faces[p.tint].top : faces[p.tint].under;
        const s = p.size / (SPRITE * 0.42);
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot + tilt);
        // foreshortening as it turns: squash across, and a little along
        g.scale(Math.max(0.12, Math.abs(face)) * s, (0.85 + 0.15 * Math.abs(Math.cos(a))) * s);
        g.globalAlpha = 0.62 + 0.33 * Math.min(1, (p.z - 0.55) / 0.8); // far petals are hazier
        g.drawImage(img, -SPRITE / 2, -SPRITE / 2, SPRITE, SPRITE);
        g.restore();
      }
    },
    /** a blossom spot on screen (CSS px) for other petal layers, or null when scrolled away */
    blossomSpot: (rand: () => number) => blossoms.spot(rand),
    dispose() {
      disposed = true;
      g.clearRect(0, 0, w, h);
    },
  };
}
