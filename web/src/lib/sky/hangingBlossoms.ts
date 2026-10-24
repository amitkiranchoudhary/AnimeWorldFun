// Cherry blossom branches hanging into the top of the page from both corners,
// drawn on the front 2D canvas so they frame the hero banner. They sway in a
// light breeze and lift away and fade as you scroll down, so they never sit
// over the posters and tiles. Falling petals start from their blossoms.

type Pt = { x: number; y: number };
type Cluster = Pt & { r: number };

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const PINKS = ["#ffd3e2", "#ffc0d6", "#ffb1cc", "#ffe4ee", "#f9a3c2"];

/** One five-petal flower, petals soft pink with a pale heart and a dark-pink eye. */
function drawFlower(g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, tint: string) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i / 5) * Math.PI * 2);
    const grad = g.createLinearGradient(0, 0, 0, -r);
    grad.addColorStop(0, "#fff7fa");
    grad.addColorStop(1, tint);
    g.fillStyle = grad;
    g.beginPath();
    // petal with the little notch at its tip
    g.moveTo(0, 0);
    g.bezierCurveTo(r * 0.55, -r * 0.3, r * 0.5, -r * 0.95, r * 0.14, -r);
    g.lineTo(0, -r * 0.84);
    g.lineTo(-r * 0.14, -r);
    g.bezierCurveTo(-r * 0.5, -r * 0.95, -r * 0.55, -r * 0.3, 0, 0);
    g.fill();
    g.strokeStyle = "rgba(196, 70, 112, 0.28)";
    g.lineWidth = Math.max(0.5, r * 0.05);
    g.stroke();
    g.restore();
  }
  g.fillStyle = "#d24a7c";
  g.beginPath();
  g.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  g.fill();
  // stamens
  g.fillStyle = "#ffe08a";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    g.beginPath();
    g.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, Math.max(0.6, r * 0.06), 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/** A tapered, slightly gnarled branch along a quadratic curve. */
function drawLimb(g: CanvasRenderingContext2D, a: Pt, c: Pt, b: Pt, w0: number, w1: number) {
  const steps = 18;
  const at = (t: number) => ({
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
  });
  g.lineCap = "round";
  for (const [color, scale, dy] of [["#24130c", 1, 0], ["#5a3626", 0.45, -0.18]] as const) {
    for (let i = 0; i < steps; i++) {
      const p0 = at(i / steps);
      const p1 = at((i + 1) / steps);
      const w = w0 + (w1 - w0) * (i / steps);
      g.strokeStyle = color;
      g.lineWidth = w * scale;
      g.beginPath();
      g.moveTo(p0.x, p0.y + w * dy);
      g.lineTo(p1.x, p1.y + w * dy);
      g.stroke();
    }
  }
  return at;
}

/**
 * Paints one corner's branches into its own canvas.
 * Coordinates are in CSS pixels of the visible screen; `side` -1 = left, 1 = right.
 */
function paintCorner(w: number, h: number, side: -1 | 1, seed: number, dpr: number) {
  const rand = rng(seed);
  // how far in the branches reach: about 45% of the width on the left, 38% on the right
  const reach = w * (side < 0 ? 0.46 : 0.38);
  const height = Math.min(h * 0.42, reach * 0.75);
  const c = document.createElement("canvas");
  c.width = Math.ceil(reach * 1.15 * dpr);
  c.height = Math.ceil(height * 1.3 * dpr);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  // paint as if it were the left corner, mirror the right one
  if (side > 0) {
    g.translate(reach * 1.15, 0);
    g.scale(-1, 1);
  }

  const S = reach / 600; // design units → pixels
  const clusters: Cluster[] = [];
  const twigs: [Pt, Pt, Pt, number, number][] = [];

  // main limb: enters from beyond the corner, sweeps in and droops at the end
  const a = { x: -30 * S, y: 10 * S };
  const cc = { x: 280 * S, y: 40 * S };
  const b = { x: 600 * S, y: 175 * S };
  const along = drawLimb(g, a, cc, b, 34 * S, 6 * S);

  // a second, higher limb for depth
  const a2 = { x: -20 * S, y: -10 * S };
  const c2 = { x: 200 * S, y: -12 * S };
  const b2 = { x: 420 * S, y: 40 * S };
  const along2 = drawLimb(g, a2, c2, b2, 20 * S, 4 * S);

  // twigs hanging off both limbs, ending in blossom clusters
  const sprout = (from: (t: number) => Pt, t: number, len: number) => {
    const p = from(t);
    const droop = 0.6 + rand() * 0.9;
    const dir = (rand() - 0.3) * 0.9;
    const end = { x: p.x + Math.cos(droop) * len * (0.4 + dir), y: p.y + Math.sin(droop) * len };
    const mid = { x: (p.x + end.x) / 2 + (rand() - 0.5) * 20 * S, y: (p.y + end.y) / 2 - 8 * S };
    twigs.push([p, mid, end, 9 * S * (1 - t * 0.5), 2.5 * S]);
    clusters.push({ ...end, r: (24 + rand() * 16) * S });
    if (rand() < 0.6) clusters.push({ x: (p.x + end.x * 2) / 3, y: (p.y + end.y * 2) / 3, r: (14 + rand() * 10) * S });
  };
  for (let i = 0; i < 9; i++) sprout(along, 0.18 + i * 0.09 + rand() * 0.04, (60 + rand() * 90) * S);
  for (let i = 0; i < 5; i++) sprout(along2, 0.25 + i * 0.15 + rand() * 0.05, (40 + rand() * 60) * S);
  twigs.forEach(([p, m, e, w0, w1]) => drawLimb(g, p, m, e, w0, w1));

  // a few clusters hanging just under the limbs (below, so the dark wood stays visible)
  for (let i = 0; i < 8; i++) {
    const p = along(0.2 + (i / 8) * 0.78);
    clusters.push({ x: p.x + (rand() - 0.5) * 24 * S, y: p.y + (22 + rand() * 18) * S, r: (14 + rand() * 12) * S });
  }
  for (let i = 0; i < 4; i++) {
    const p = along2(0.3 + (i / 4) * 0.65);
    clusters.push({ x: p.x + (rand() - 0.5) * 16 * S, y: p.y + (16 + rand() * 12) * S, r: (12 + rand() * 8) * S });
  }

  // each cluster = a soft shadowed puff of many small flowers
  for (const cl of clusters) {
    g.fillStyle = "rgba(170, 60, 100, 0.12)";
    g.beginPath();
    g.ellipse(cl.x + cl.r * 0.1, cl.y + cl.r * 0.2, cl.r * 0.9, cl.r * 0.75, 0, 0, Math.PI * 2);
    g.fill();
    // airy: a handful of flowers spread out, not a solid ball
    const n = Math.round(3 + cl.r / (5.5 * S));
    for (let k = 0; k < n; k++) {
      const ang = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * cl.r;
      const fr = (6 + rand() * 6) * S;
      drawFlower(g, cl.x + Math.cos(ang) * d, cl.y + Math.sin(ang) * d * 0.85, fr, rand() * Math.PI, PINKS[Math.floor(rand() * PINKS.length)]);
    }
    // a couple of deep-pink buds
    for (let k = 0; k < 2; k++) {
      g.fillStyle = "#ec6f9c";
      g.beginPath();
      g.arc(cl.x + (rand() - 0.5) * cl.r * 1.6, cl.y + (rand() - 0.3) * cl.r * 1.4, 3 * S, 0, Math.PI * 2);
      g.fill();
    }
  }

  // the main limbs pass in front of some flowers, like in a real tree
  g.globalAlpha = 0.92;
  drawLimb(g, { x: a.x + 60 * S, y: a.y + 6 * S }, cc, b, 24 * S, 4 * S);
  drawLimb(g, a2, c2, b2, 14 * S, 3 * S);
  g.globalAlpha = 1;
  // and a few sprigs of blossom sitting on top of the wood
  for (let i = 0; i < 6; i++) {
    const p = along(0.3 + i * 0.12);
    for (let k = 0; k < 3; k++) {
      drawFlower(g, p.x + (rand() - 0.5) * 22 * S, p.y + (rand() - 0.6) * 12 * S, (7 + rand() * 4) * S, rand() * Math.PI, PINKS[Math.floor(rand() * PINKS.length)]);
    }
  }

  // blossom spots in screen x (the right corner is drawn mirrored against the right edge)
  const spots = clusters.map((cl) => ({ x: side < 0 ? cl.x : w - cl.x, y: cl.y }));
  return { canvas: c, width: reach * 1.15, height: height * 1.3, spots };
}

export function createHangingBlossoms() {
  let left: ReturnType<typeof paintCorner> | null = null;
  let right: ReturnType<typeof paintCorner> | null = null;
  let w = 0;
  let h = 0;
  let lift = 0; // 0 = fully hanging, 1 = scrolled away
  let top = 0; // the branches hang from just under the navbar

  return {
    resize(width: number, height: number, dpr: number) {
      w = width;
      h = height;
      top = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      left = paintCorner(w, h, -1, 41, dpr);
      right = paintCorner(w, h, 1, 67, dpr);
    },
    /** 0…1: how far the branches have been scrolled away */
    get lift() {
      return lift;
    },
    draw(g: CanvasRenderingContext2D, t: number) {
      // gone once you've scrolled about two-thirds of a screen
      lift = Math.min(1, window.scrollY / (h * 0.65));
      if (lift >= 1 || !left || !right) return;
      const ease = lift * lift * (3 - 2 * lift);
      g.save();
      g.globalAlpha = 1 - ease;
      for (const [corner, side, phase] of [[left, -1, 0], [right, 1, 1.7]] as const) {
        g.save();
        const x = side < 0 ? 0 : w - corner.width;
        // pivot at the corner it hangs from, swaying gently
        const px = side < 0 ? 0 : w;
        g.translate(px, top - ease * corner.height * 0.9);
        g.rotate(side * -(Math.sin(t * 0.6 + phase) * 0.012 + ease * 0.08));
        g.translate(-px, 0);
        g.drawImage(corner.canvas, x, 0, corner.width, corner.height);
        g.restore();
      }
      g.restore();
    },
    /** a random blossom spot on screen (CSS px), or null once the branches are gone */
    spot(rand: () => number): { x: number; y: number } | null {
      if (!left || !right || lift > 0.6) return null;
      const corner = rand() < 0.55 ? left : right;
      const s = corner.spots[Math.floor(rand() * corner.spots.length)];
      return { x: s.x, y: top + s.y - lift * corner.height * 0.9 };
    },
  };
}
