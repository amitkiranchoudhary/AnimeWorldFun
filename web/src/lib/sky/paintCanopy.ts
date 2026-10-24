// Paints an anime-style cherry blossom canopy along the top of the screen, the
// way a background painter would (think Makoto Shinkai skies): soft masses of
// blossom built up in layers — lilac-pink shadow underneath, mid pinks, then
// pale highlights where the light hits from above — covered in thousands of
// tiny florets for texture, with dark plum branches showing through, crisp
// little blossoms and buds along the edges.
//
// The canopy is heaviest in the two top corners and only a light garland
// across the middle, so the logo stays clear. It's painted once per screen
// size into an offscreen canvas, then animated by paintedCanopy.ts.

type Pt = { x: number; y: number };
type Clump = Pt & { r: number };

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const SHADOW = ["#b2588d", "#a14f86", "#bf6a9a", "#9a4f88"];
const MID = ["#ef9fc2", "#f4b0cd", "#ea92b8", "#f7bdd5"];
const LIGHT = ["#ffdbe9", "#ffe9f2", "#fcc8dd", "#fff3f8"];
const FLORET = ["#ffe3ee", "#fcd0e0", "#f8c0d6", "#ffeaf2"];

/** "#rrggbb" + alpha → "rgba(...)" */
function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** A soft paint dab: solid in the middle, feathered to nothing at the edge. */
function dab(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, rgba(color, alpha));
  grad.addColorStop(0.55, rgba(color, alpha * 0.85));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function floret(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, rot: number) {
  g.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.38, a, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#d65a8a";
  g.beginPath();
  g.arc(x, y, Math.max(0.5, r * 0.22), 0, Math.PI * 2);
  g.fill();
}

/** A smooth, tapered branch: one filled outline, with a faint light along its top. */
function branch(g: CanvasRenderingContext2D, pts: Pt[], w0: number, w1: number, color: string, rim: string) {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const hw = (w0 + (w1 - w0) * Math.pow(i / (pts.length - 1), 1.2)) / 2;
    left.push({ x: pts[i].x + nx * hw, y: pts[i].y + ny * hw });
    right.push({ x: pts[i].x - nx * hw, y: pts[i].y - ny * hw });
  }
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(left[0].x, left[0].y);
  for (const p of left) g.lineTo(p.x, p.y);
  for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i].x, right[i].y);
  g.closePath();
  g.fill();
  // light catching the upper edge
  g.strokeStyle = rim;
  g.lineWidth = Math.max(0.6, w0 * 0.08);
  g.beginPath();
  const upper = left[0].y < right[0].y ? left : right;
  g.moveTo(upper[0].x, upper[0].y);
  for (const p of upper) g.lineTo(p.x, p.y);
  g.stroke();
}

function curve(a: Pt, c: Pt, b: Pt, rand: () => number, steps = 22, wander = 3): Pt[] {
  const out: Pt[] = [];
  let off = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    off = off * 0.7 + (rand() - 0.5) * wander;
    out.push({
      x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
      y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y + off,
    });
  }
  return out;
}

export type CanopyArt = { canvas: HTMLCanvasElement; width: number; height: number };

/** Paints the canopy for a screen `w` × `h` (CSS px). */
export function paintCanopyArt(w: number, h: number, dpr: number): CanopyArt {
  const rand = rng(1234);
  const narrow = w < 768;
  // phones get a shallower canopy so it never reaches the hero text
  const H = Math.round(Math.min(h * (narrow ? 0.2 : 0.38), w * (narrow ? 0.46 : 0.3)));
  const W = w;
  const U = H / 300; // design unit: the canopy is ~300 units tall

  const make = () => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(W * dpr);
    c.height = Math.ceil(H * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    return { c, g };
  };

  /* ── where the blossom masses go ── */
  const clumps: Clump[] = [];
  const reachL = W * (narrow ? 0.56 : 0.44);
  const reachR = W * (narrow ? 0.44 : 0.38);
  const mass = (side: -1 | 1, reach: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = (i + rand() * 0.8) / n;
      const x = side < 0 ? t * reach : W - t * reach;
      // thick and high in the corner, sagging lower midway, thinning out at the tip
      const sag = Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85) * (1 - t * 0.3);
      const y = (20 + sag * 150 + (rand() - 0.5) * 50) * U;
      const r = (90 - t * 62) * U * (0.75 + rand() * 0.5);
      clumps.push({ x, y, r });
      // hanging clumps under the main mass
      if (t > 0.15 && rand() < 0.55) clumps.push({ x: x + (rand() - 0.5) * 40 * U, y: y + r * (0.9 + rand() * 0.5), r: r * (0.45 + rand() * 0.25) });
    }
    // fill the very corner so it reads as the tree coming in from off-screen
    clumps.push({ x: side < 0 ? 0 : W, y: 0, r: 120 * U });
  };
  mass(-1, reachL, narrow ? 12 : 26);
  mass(1, reachR, narrow ? 9 : 21);
  // a light garland across the top middle, joining the two sides
  if (!narrow) {
    for (let i = 0; i < 16; i++) {
      const x = reachL * 0.8 + (W - reachR * 0.8 - reachL * 0.8) * (i / 15);
      clumps.push({ x, y: (6 + rand() * 26) * U, r: (16 + rand() * 18) * U });
    }
  }
  // keep every mass (and its soft edge) inside the painting, so nothing is cut off flat
  for (const c of clumps) c.y = Math.min(c.y, H - c.r * 1.1 - 6 * U);
  clumps.sort((a, b) => a.y - b.y); // paint higher (farther) clumps first

  /* ── branches behind the blossom ── */
  const art = make();
  const g = art.g;
  const limbs: { pts: Pt[]; w0: number; w1: number }[] = [];
  const limb = (a: Pt, c: Pt, b: Pt, w0: number, w1: number) => limbs.push({ pts: curve(a, c, b, rand, 26, 2.5 * U), w0, w1 });
  // left tree
  limb({ x: -30 * U, y: 30 * U }, { x: reachL * 0.45, y: 60 * U }, { x: reachL * 0.98, y: 190 * U }, 30 * U, 4 * U);
  limb({ x: reachL * 0.25, y: 50 * U }, { x: reachL * 0.4, y: 130 * U }, { x: reachL * 0.55, y: 215 * U }, 12 * U, 2.5 * U);
  limb({ x: reachL * 0.5, y: 85 * U }, { x: reachL * 0.65, y: 40 * U }, { x: reachL * 0.85, y: 30 * U }, 9 * U, 2 * U);
  // right tree
  limb({ x: W + 30 * U, y: 20 * U }, { x: W - reachR * 0.45, y: 50 * U }, { x: W - reachR * 0.95, y: 170 * U }, 26 * U, 4 * U);
  limb({ x: W - reachR * 0.3, y: 40 * U }, { x: W - reachR * 0.45, y: 120 * U }, { x: W - reachR * 0.62, y: 200 * U }, 10 * U, 2.5 * U);
  for (const l of limbs) branch(g, l.pts, l.w0, l.w1, "#2c1626", "rgba(170,110,140,0.35)");

  /* ── 1–4. each clump painted on its own, back to front ──
     Shading every bunch separately — dark lilac underneath, pinks above, pale
     where the light hits — means each one overlaps the one behind it with a
     visible edge, instead of everything melting into one flat pink cloud. */
  for (const c of clumps) {
    // body: a dense, scalloped base in shadow tones, heavier toward the bottom
    for (let k = 0; k < 10; k++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * c.r * 0.62;
      dab(g, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.75 + c.r * 0.12, c.r * (0.42 + rand() * 0.18), SHADOW[k % SHADOW.length], 1);
    }
    // mid pinks over the upper two-thirds
    for (let k = 0; k < 12; k++) {
      const a = Math.PI * (0.95 + rand() * 1.1); // mostly the upper half
      const d = Math.sqrt(rand()) * c.r * 0.6;
      dab(g, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.8 - c.r * 0.08, c.r * (0.24 + rand() * 0.16), MID[k % MID.length], 0.92);
    }
    // pale highlights where the light falls (from the upper left)
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (1.1 + rand() * 0.5);
      const d = (0.3 + rand() * 0.35) * c.r;
      dab(g, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.8, c.r * (0.1 + rand() * 0.1), LIGHT[k % LIGHT.length], 0.8);
    }
    // tiny florets for blossom texture, mostly on the lit upper side
    const n = Math.round(14 + c.r * 0.35);
    for (let k = 0; k < n; k++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * c.r * 0.9;
      const x = c.x + Math.cos(a) * d;
      const y = c.y + Math.sin(a) * d * 0.8;
      const lit = y < c.y;
      if (!lit && rand() < 0.6) continue;
      floret(g, x, y, (1.6 + rand() * 2) * Math.max(0.8, U), lit ? FLORET[k % FLORET.length] : "#c97aa3", rand() * 6);
    }
  }

  /* ── 5. crisp blossoms, buds and twigs along the lower edges ── */
  for (const c of clumps) {
    const n = Math.round(2 + c.r / (14 * U));
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (0.15 + rand() * 0.7); // the lower half of the clump
      const x = c.x + Math.cos(a) * c.r * (0.8 + rand() * 0.3);
      const y = c.y + Math.sin(a) * c.r * (0.7 + rand() * 0.35);
      g.strokeStyle = "rgba(60,28,44,0.85)";
      g.lineWidth = Math.max(0.6, 0.9 * U);
      g.beginPath();
      g.moveTo(x, y - 8 * U);
      g.quadraticCurveTo(x + 3 * U, y - 3 * U, x, y);
      g.stroke();
      if (rand() < 0.2) {
        g.fillStyle = "#d9578a";
        g.beginPath();
        g.ellipse(x, y + 2 * U, 2.6 * U, 3.6 * U, 0, 0, Math.PI * 2);
        g.fill();
      } else {
        floret(g, x, y + 2 * U, (4 + rand() * 3) * U, LIGHT[k % LIGHT.length], rand() * 6);
      }
    }
  }

  return { canvas: art.c, width: W, height: H };
}
