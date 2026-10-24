// Sakura petals drifting in FRONT of the page (over and between the tiles),
// drawn on a lightweight 2D canvas. New petals fall from the cherry trees
// (`source` gives a spot in a canopy, in screen pixels), then ride a gentle
// swirling wind inward, so they wander and loop instead of only falling, and
// get pushed along when you scroll.

type Petal = {
  x: number;
  y: number;
  size: number;
  rot: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  phase: number;
  speed: number;
  dir: number;
  tint: string;
};

const TINTS = ["#ffc4d6", "#ffb3c8", "#ffd9e4", "#ff9fbd", "#fff0f5"];

function drawPetal(g: CanvasRenderingContext2D, size: number, tint: string) {
  // petal with the little notch at its tip
  g.beginPath();
  g.moveTo(0, size);
  g.bezierCurveTo(size * 0.85, size * 0.5, size * 0.8, -size * 0.6, size * 0.22, -size);
  g.lineTo(0, -size * 0.72);
  g.lineTo(-size * 0.22, -size);
  g.bezierCurveTo(-size * 0.8, -size * 0.6, -size * 0.85, size * 0.5, 0, size);
  const grad = g.createLinearGradient(0, size, 0, -size);
  grad.addColorStop(0, "#fff5f8");
  grad.addColorStop(1, tint);
  g.fillStyle = grad;
  g.fill();
  // a faint centre vein
  g.strokeStyle = "rgba(214, 92, 128, 0.35)";
  g.lineWidth = Math.max(0.6, size * 0.06);
  g.beginPath();
  g.moveTo(0, size * 0.8);
  g.lineTo(0, -size * 0.55);
  g.stroke();
}

export function startFrontPetals(canvas: HTMLCanvasElement, count: number, source?: () => { x: number; y: number }) {
  const g = canvas.getContext("2d");
  if (!g) return { update() {}, resize() {}, dispose() {} };

  let w = 0;
  let h = 0;
  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  };
  resize();

  const spawn = (p: Partial<Petal> = {}): Petal => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 5 + Math.random() * 7,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2.2,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 1.5 + Math.random() * 2.5,
    phase: Math.random() * 100,
    speed: 0.6 + Math.random() * 0.8,
    dir: Math.random() < 0.5 ? 1 : -1,
    tint: TINTS[Math.floor(Math.random() * TINTS.length)],
    ...p,
  });
  // fall from a tree: start in a canopy and drift toward the middle of the screen
  const fromTree = () => {
    const at = source?.();
    if (!at) return spawn({ y: -20, x: Math.random() * w });
    return spawn({ x: at.x, y: at.y, dir: at.x < w / 2 ? 1 : -1 });
  };
  const petals = Array.from({ length: count }, () => spawn());

  return {
    resize,
    /** wind = recent scroll speed (positive while scrolling down) */
    update(t: number, dt: number, wind: number) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      for (const p of petals) {
        // a slow swirling wind field: petals drift sideways, curl and loop
        const swirlX = Math.sin(p.y * 0.006 + t * 0.4 + p.phase) * 38 + Math.cos(t * 0.17 + p.phase) * 18;
        const swirlY = Math.cos(p.x * 0.005 + t * 0.3 + p.phase) * 16;
        p.x += (swirlX + 22 * p.dir) * p.speed * dt;
        p.y += (28 + swirlY - wind * 6) * p.speed * dt;
        p.rot += p.spin * dt;
        p.flip += p.flipSpeed * dt;

        // once a petal leaves the screen, a new one falls from a tree
        // (wide side margins: canopies reach a little past the screen edges)
        const m = 20;
        if (p.y > h + m || p.y < -m * 6 || p.x > w + 120 || p.x < -120) Object.assign(p, fromTree());

        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        // squash horizontally as it tumbles, so it looks like it's turning in 3D
        g.scale(Math.max(0.15, Math.abs(Math.cos(p.flip))), 1);
        g.globalAlpha = 0.9;
        drawPetal(g, p.size, p.tint);
        g.restore();
      }
    },
    dispose() {
      g.clearRect(0, 0, w, h);
    },
  };
}
