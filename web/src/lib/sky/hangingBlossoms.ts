import type { Wind } from "./wind";

// Cherry blossom branches hanging into the top of the page from both corners,
// drawn on the front 2D canvas so they frame the hero banner.
//
// Each corner is painted once (on resize) into:
//  • a "wood" image of the main limbs — rounded bark with cherry-style
//    horizontal lenticel stripes, cracks, knots and natural kinks
//  • many small "spray" images: a twig with bunches of flowers on their own
//    stalks (pedicels). Every frame each spray swings from the point where it
//    joins the limb, driven by the shared wind, so gusts ripple through the
//    branch instead of moving it as one stiff picture.
// The branches lift away and fade as you scroll down. Petals fall from them.

type Pt = { x: number; y: number };

type Spray = {
  img: HTMLCanvasElement;
  w: number;
  h: number;
  /** where the spray joins its limb, in the corner's local px */
  attach: Pt;
  /** that same join point inside the spray image */
  pivot: Pt;
  /** how freely it swings (longer twigs swing more) */
  looseness: number;
  phase: number;
  /** flower centres relative to the attach point, for spawning petals */
  flowers: Pt[];
};

type Corner = {
  /** the in-focus limbs */
  wood: HTMLCanvasElement;
  /** a blurred, dimmed branch (with its blossom) behind, for depth */
  back: HTMLCanvasElement;
  /** both images extend this far past the corner (local px) */
  pad: Pt;
  W: number;
  H: number;
  height: number;
  sprays: Spray[];
};

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/* ── Flowers ─────────────────────────────────────────────── */

// front flowers are bright; flowers at the back of a bunch sit in shade
const FRONT = { base: "#ef8fb2", mid: "#ffd3e1", edge: "#fff8fb", line: "rgba(214,110,150,0.35)" };
const BACK = { base: "#cc6f93", mid: "#efb3c8", edge: "#f8dfe8", line: "rgba(170,80,115,0.35)" };

/**
 * A cherry flower: five broad, notched petals, deeper pink at the heart and
 * almost white at the rim, with a ring of fine stamens. `tilt` < 1 squashes
 * it so it looks turned away, like real flowers facing every direction.
 */
function drawFlower(g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, tilt: number, back: boolean, rand: () => number) {
  const pal = back ? BACK : FRONT;
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(1, tilt);
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i / 5) * Math.PI * 2 + (rand() - 0.5) * 0.18);
    const pr = r * (0.92 + rand() * 0.14);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, pr);
    grad.addColorStop(0, pal.base);
    grad.addColorStop(0.35, pal.mid);
    grad.addColorStop(1, pal.edge);
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(pr * 0.62, -pr * 0.22, pr * 0.66, -pr * 0.92, pr * 0.16, -pr);
    g.quadraticCurveTo(0, -pr * 0.86, -pr * 0.16, -pr);
    g.bezierCurveTo(-pr * 0.66, -pr * 0.92, -pr * 0.62, -pr * 0.22, 0, 0);
    g.fill();
    g.strokeStyle = pal.line;
    g.lineWidth = Math.max(0.4, r * 0.04);
    g.stroke();
    g.restore();
  }
  // heart and stamens
  g.fillStyle = back ? "#a8325f" : "#c93b6c";
  g.beginPath();
  g.arc(0, 0, r * 0.17, 0, Math.PI * 2);
  g.fill();
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.3;
    const len = r * (0.38 + rand() * 0.14);
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len;
    g.strokeStyle = back ? "rgba(160,50,90,0.7)" : "rgba(205,60,105,0.75)";
    g.lineWidth = Math.max(0.35, r * 0.035);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(ex, ey);
    g.stroke();
    g.fillStyle = back ? "#d8b25a" : "#f3cf62";
    g.beginPath();
    g.arc(ex, ey, Math.max(0.5, r * 0.055), 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function drawBud(g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = "#e2608f";
  g.beginPath();
  g.ellipse(0, -r * 0.4, r * 0.5, r * 0.8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#7a3b2a"; // calyx
  g.beginPath();
  g.ellipse(0, r * 0.25, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/* ── Wood ────────────────────────────────────────────────── */

type Limb = { pts: Pt[]; widths: number[] };

/** A curve with natural kinks, sampled into points with tapering widths. */
function makeLimb(a: Pt, c: Pt, b: Pt, w0: number, w1: number, kink: number, rand: () => number, steps = 28): Limb {
  const pts: Pt[] = [];
  const widths: number[] = [];
  let wobble = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x;
    const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y;
    // a random walk across the curve gives gnarled, uneven wood
    wobble = wobble * 0.75 + (rand() - 0.5) * kink;
    pts.push({ x, y: y + wobble });
    widths.push(w0 + (w1 - w0) * Math.pow(t, 1.35)); // stays thick, then thins toward the tip
  }
  return { pts, widths };
}

function limbAt(l: Limb, t: number): Pt & { w: number; nx: number; ny: number } {
  const f = Math.min(l.pts.length - 2, Math.max(0, t * (l.pts.length - 1)));
  const i = Math.floor(f);
  const k = f - i;
  const p = l.pts[i];
  const q = l.pts[i + 1];
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + dx * k, y: p.y + dy * k, w: l.widths[i] + (l.widths[i + 1] - l.widths[i]) * k, nx: -dy / len, ny: dx / len };
}

/** Rounded bark: dark shadow side, warm body, light along the top, then texture. */
function drawBark(g: CanvasRenderingContext2D, l: Limb, rand: () => number) {
  const n = l.pts.length - 1;
  g.lineCap = "round";
  g.lineJoin = "round";
  const pass = (color: string, scale: number, lift: number) => {
    g.strokeStyle = color;
    for (let i = 0; i < n; i++) {
      const p = l.pts[i];
      const q = l.pts[i + 1];
      const w = l.widths[i];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (-dy / len) * w * lift;
      const oy = (dx / len) * w * lift;
      g.lineWidth = Math.max(0.6, w * scale);
      g.beginPath();
      g.moveTo(p.x + ox, p.y + oy);
      g.lineTo(q.x + ox, q.y + oy);
      g.stroke();
    }
  };
  // tuned lighter than real bark so it still reads against the dark page
  pass("#2e1c14", 1, 0); // silhouette / shadow side
  pass("#5a3b2b", 0.74, -0.1); // body
  pass("#8a624b", 0.42, -0.22); // light falling on the top
  pass("rgba(230,190,160,0.55)", 0.12, -0.34); // rim highlight

  // cherry bark: pale horizontal lenticel stripes across the limb, and dark cracks along it
  for (let i = 0; i < n * 2.2; i++) {
    const s = limbAt(l, rand());
    if (s.w < 3) continue;
    const tx = s.ny; // unit vector along the limb
    const ty = -s.nx;
    const across = s.w * (0.25 + rand() * 0.25);
    const off = (rand() - 0.5) * s.w * 0.5;
    g.lineWidth = Math.max(0.6, s.w * 0.06);
    g.strokeStyle = "rgba(170,135,115,0.4)";
    g.beginPath();
    g.moveTo(s.x + s.nx * (off - across), s.y + s.ny * (off - across));
    g.lineTo(s.x + s.nx * (off + across) + tx * 0.5, s.y + s.ny * (off + across) + ty * 0.5);
    g.stroke();
    if (rand() < 0.5) {
      g.strokeStyle = "rgba(10,5,2,0.5)";
      g.lineWidth = Math.max(0.5, s.w * 0.04);
      const len = s.w * (0.5 + rand());
      g.beginPath();
      g.moveTo(s.x + s.nx * off * 0.6, s.y + s.ny * off * 0.6);
      g.lineTo(s.x + s.nx * off * 0.6 + tx * len, s.y + s.ny * off * 0.6 + ty * len);
      g.stroke();
    }
  }
}

function drawKnot(g: CanvasRenderingContext2D, p: Pt, r: number) {
  g.fillStyle = "#2e1c14";
  g.beginPath();
  g.ellipse(p.x, p.y, r, r * 0.7, 0.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(120,85,65,0.5)";
  g.lineWidth = Math.max(0.6, r * 0.25);
  g.beginPath();
  g.ellipse(p.x, p.y, r * 0.6, r * 0.4, 0.4, 0, Math.PI * 2);
  g.stroke();
}

/* ── Sprays: twig + bunches of flowers ───────────────────── */

function paintSpray(attach: Pt, length: number, droop: number, S: number, dpr: number, rand: () => number, onWood = false): Spray {
  // the twig, in coordinates relative to the attach point
  const end = onWood ? { x: (rand() - 0.5) * 18 * S, y: -6 * S } : { x: Math.cos(droop) * length * 0.55, y: Math.sin(droop) * length };
  const mid = { x: end.x * 0.5 + (rand() - 0.5) * 14 * S, y: end.y * 0.45 };
  const twig = onWood ? null : makeLimb({ x: 0, y: 0 }, mid, end, 6 * S, 1.6 * S, 1.6 * S, rand, 10);

  // bunches (umbels): 3–5 flowers, each on its own stalk from one node
  const nodes: Pt[] = twig ? [limbAt(twig, 0.55), limbAt(twig, 0.8), end] : [end];
  type F = { x: number; y: number; r: number; rot: number; tilt: number; back: boolean; node: Pt; bud: boolean };
  const flowers: F[] = [];
  for (const node of nodes) {
    const count = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < count; k++) {
      const a = Math.PI * (0.15 + rand() * 0.7) + (rand() < 0.3 ? Math.PI : 0); // mostly hanging down
      const stalk = (10 + rand() * 14) * S;
      flowers.push({
        x: node.x + Math.cos(a) * stalk,
        y: node.y + Math.sin(a) * stalk * (onWood ? 0.6 : 1),
        r: (8.5 + rand() * 4.5) * S,
        rot: rand() * Math.PI * 2,
        tilt: 0.5 + rand() * 0.5,
        back: rand() < 0.4,
        node,
        bud: rand() < 0.12,
      });
    }
  }

  // size the image to fit everything; the pivot is the attach point
  const pad = 16 * S;
  let minX = Math.min(0, end.x);
  let minY = Math.min(0, end.y);
  let maxX = Math.max(0, end.x);
  let maxY = Math.max(0, end.y);
  for (const f of flowers) {
    minX = Math.min(minX, f.x - f.r);
    maxX = Math.max(maxX, f.x + f.r);
    minY = Math.min(minY, f.y - f.r);
    maxY = Math.max(maxY, f.y + f.r);
  }
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const w = maxX - minX;
  const h = maxY - minY;
  const img = document.createElement("canvas");
  img.width = Math.ceil(w * dpr);
  img.height = Math.ceil(h * dpr);
  const g = img.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(-minX, -minY);

  if (twig) drawBark(g, twig, rand);
  // stalks first, then the flowers at the back of each bunch, then the front ones
  g.strokeStyle = "#7a4636";
  g.lineCap = "round";
  g.lineWidth = Math.max(0.6, 1.1 * S);
  for (const f of flowers) {
    g.beginPath();
    g.moveTo(f.node.x, f.node.y);
    g.quadraticCurveTo((f.node.x + f.x) / 2 + 3 * S, (f.node.y + f.y) / 2 - 2 * S, f.x, f.y);
    g.stroke();
  }
  for (const back of [true, false]) {
    for (const f of flowers) {
      if (f.back !== back) continue;
      if (f.bud) drawBud(g, f.x, f.y, f.r * 0.6, rand() * 0.6 - 0.3);
      else drawFlower(g, f.x, f.y, f.r, f.rot, f.tilt, f.back, rand);
    }
  }

  return {
    img,
    w,
    h,
    attach,
    pivot: { x: -minX, y: -minY },
    looseness: onWood ? 0.25 : 0.6 + (length / (150 * S)) * 0.6,
    phase: rand() * Math.PI * 2,
    flowers: flowers.filter((f) => !f.bud).map((f) => ({ x: f.x, y: f.y })),
  };
}

/* ── A whole corner ──────────────────────────────────────── */

/**
 * Grows one corner's tree like a real one: a thick limb forks into branches,
 * those fork into thinner shoots, and the finest twigs end in blossom. Behind
 * it, a second smaller branch is painted slightly blurred and dimmed, like the
 * out-of-focus background in a photo, for depth.
 * Painted as the LEFT corner; the right one is a different seed, drawn mirrored.
 */
function paintCorner(w: number, h: number, side: -1 | 1, seed: number, dpr: number): Corner {
  const rand = rng(seed);
  const reach = w * (side < 0 ? 0.46 : 0.38);
  const height = Math.min(h * 0.42, reach * 0.75);
  const S = reach / 600; // design units → px

  // drawing area (local px), with room for wood that starts beyond the corner
  const pad = { x: 70 * S, y: 50 * S };
  const W = reach * 1.2 + pad.x;
  const H = height * 1.45 + pad.y;
  const canvasFor = () => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(W * dpr);
    c.height = Math.ceil(H * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.translate(pad.x, pad.y);
    return { c, g };
  };

  /* grow the branch structure */
  type Grown = { l: Limb; depth: number };
  const grow = (out: Grown[], from: Pt, angle: number, length: number, width: number, depth: number, maxDepth: number, maxY: number) => {
    // branches arc gently and sag a little under their own weight
    const bend = (rand() - 0.5) * 0.45 + 0.12 * (1 + depth * 0.4);
    const ctrl = { x: from.x + Math.cos(angle - bend * 0.3) * length * 0.5, y: from.y + Math.sin(angle - bend * 0.3) * length * 0.5 };
    const tip = { x: from.x + Math.cos(angle + bend) * length, y: from.y + Math.sin(angle + bend) * length };
    tip.y = Math.min(tip.y, maxY - rand() * 30 * S);
    tip.x = Math.min(tip.x, reach * 1.15);
    const l = makeLimb(from, ctrl, tip, width, Math.max(1.4 * S, width * 0.35), Math.max(0.6 * S, width * 0.09), rand, Math.max(8, Math.round(length / (14 * S))));
    out.push({ l, depth });
    if (depth >= maxDepth || width < 5 * S) return;
    const kids = depth === 0 ? 4 : 2 + Math.floor(rand() * 2);
    for (let k = 0; k < kids; k++) {
      const t = 0.25 + (0.7 * (k + 0.3 + rand() * 0.5)) / kids;
      const p = limbAt(l, t);
      const along = Math.atan2(-p.nx, p.ny); // direction of the parent at this point
      let a = along + (rand() < 0.55 ? 1 : -1) * (0.35 + rand() * 0.6);
      a = Math.max(-0.75, Math.min(1.35, a)); // never straight up, rarely straight down
      grow(out, p, a, length * (0.42 + rand() * 0.25) * (1 - t * 0.25), p.w * (0.5 + rand() * 0.15), depth + 1, maxDepth, maxY);
    }
  };

  /* blossom for a grown tree */
  const blossom = (limbs: Grown[], sprays: Spray[], density: number) => {
    for (const { l, depth } of limbs) {
      if (depth === 0) continue;
      const len = Math.hypot(l.pts[l.pts.length - 1].x - l.pts[0].x, l.pts[l.pts.length - 1].y - l.pts[0].y);
      // like a real cherry, most flowers sit in clusters right along the wood…
      const sitters = Math.round((len / (48 * S)) * density * (depth >= 2 ? 1 : 0.6));
      // …with a few short bunches dangling from the finer twigs
      const hangers = Math.round((len / (130 * S)) * density * (depth >= 2 ? 1 : 0.3));
      for (let i = 0; i < hangers; i++) {
        const p = limbAt(l, 0.4 + 0.6 * ((i + rand() * 0.7) / Math.max(1, hangers)));
        const length = (18 + rand() * 38) * S;
        sprays.push(paintSpray({ x: p.x, y: p.y + p.w * 0.4 }, length, 0.8 + rand() * 0.8, S, dpr, rand));
      }
      for (let i = 0; i < sitters; i++) {
        const p = limbAt(l, 0.3 + 0.7 * rand());
        sprays.push(paintSpray({ x: p.x, y: p.y - p.w * 0.25 }, 0, 0, S, dpr, rand, true));
      }
    }
  };

  /* the soft, out-of-focus branch behind */
  const backLimbs: Grown[] = [];
  grow(backLimbs, { x: 60 * S, y: -40 * S }, 0.45, 330 * S, 22 * S, 0, 3, height * 0.85);
  const backSprays: Spray[] = [];
  blossom(backLimbs, backSprays, 0.8);
  const sharpBack = canvasFor();
  backLimbs.sort((a, b) => b.depth - a.depth).forEach(({ l }) => drawBark(sharpBack.g, l, rand));
  for (const sp of backSprays) sharpBack.g.drawImage(sp.img, sp.attach.x - sp.pivot.x, sp.attach.y - sp.pivot.y, sp.w, sp.h);
  const back = document.createElement("canvas");
  back.width = sharpBack.c.width;
  back.height = sharpBack.c.height;
  const bg = back.getContext("2d")!;
  bg.filter = `blur(${(2.2 * S * dpr).toFixed(1)}px) brightness(0.78) saturate(0.8)`;
  bg.drawImage(sharpBack.c, 0, 0);

  /* the main tree, in focus */
  const limbs: Grown[] = [];
  grow(limbs, { x: -50 * S, y: 10 * S }, 0.08, 640 * S, 58 * S, 0, 4, height * 0.78);
  const sprays: Spray[] = [];
  blossom(limbs, sprays, 1);
  const wood = canvasFor();
  // thin first, so every limb covers the base of the shoots growing out of it
  limbs.sort((a, b) => b.depth - a.depth).forEach(({ l }) => drawBark(wood.g, l, rand));
  limbs.filter((g) => g.depth === 1).forEach(({ l }) => drawKnot(wood.g, l.pts[0], l.widths[0] * 0.45));

  return { wood: wood.c, back, pad, W, H, height, sprays };
}

/* ── Animation ───────────────────────────────────────────── */

export function createHangingBlossoms(wind: Wind) {
  let left: Corner | null = null;
  let right: Corner | null = null;
  let w = 0;
  let h = 0;
  let lift = 0; // 0 = fully hanging, 1 = scrolled away
  let top = 0; // the branches hang from just under the navbar

  const ease = () => lift * lift * (3 - 2 * lift);
  const cornerY = (c: Corner) => top - ease() * c.height * 0.9;

  return {
    resize(width: number, height: number, dpr: number) {
      w = width;
      h = height;
      top = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      left = paintCorner(w, h, -1, 41, dpr);
      right = paintCorner(w, h, 1, 67, dpr);
    },
    draw(g: CanvasRenderingContext2D, t: number) {
      lift = Math.min(1, window.scrollY / (h * 0.65)); // gone after ~⅔ of a screen
      if (lift >= 1 || !left || !right) return;
      const s = wind.strength;
      g.save();
      g.globalAlpha = 1 - ease();
      for (const [c, side, phase] of [[left, -1, 0], [right, 1, 1.7]] as const) {
        g.save();
        // mirror the right corner against the right edge
        g.translate(side < 0 ? 0 : w, cornerY(c));
        if (side > 0) g.scale(-1, 1);
        // the whole limb gives a little under the wind (its tip dips), and tips up as it lifts away
        const bend = (0.006 + 0.018 * s) * (0.7 + 0.3 * Math.sin(t * 0.8 + phase));
        g.rotate(bend - ease() * 0.08);
        // the far branch sways a touch more slowly, then the near limbs on top
        g.save();
        g.rotate(Math.sin(t * 0.55 + phase) * 0.008 * (0.5 + s));
        g.drawImage(c.back, -c.pad.x, -c.pad.y, c.W, c.H);
        g.restore();
        g.drawImage(c.wood, -c.pad.x, -c.pad.y, c.W, c.H);

        for (const sp of c.sprays) {
          // swing from the joint: pushed downwind by the gust, rocking back and forth,
          // with a quick flutter on top. The wind blows toward screen-right; the right
          // corner is mirrored, so its swing is flipped.
          const push = s * 0.16 * sp.looseness;
          const rock = Math.sin(t * (1.1 + sp.looseness) + sp.phase) * (0.035 + s * 0.08) * sp.looseness;
          const flutter = Math.sin(t * 9 + sp.phase * 3) * 0.02 * s * sp.looseness;
          const swing = push + rock + flutter;
          g.save();
          g.translate(sp.attach.x, sp.attach.y);
          g.rotate(side < 0 ? -swing : swing);
          g.drawImage(sp.img, -sp.pivot.x, -sp.pivot.y, sp.w, sp.h);
          g.restore();
        }
        g.restore();
      }
      g.restore();
    },
    /** a random flower on screen (CSS px), or null once the branches are gone */
    spot(rand: () => number): { x: number; y: number } | null {
      if (!left || !right || lift > 0.6) return null;
      const c = rand() < 0.55 ? left : right;
      const sp = c.sprays[Math.floor(rand() * c.sprays.length)];
      const f = sp.flowers[Math.floor(rand() * sp.flowers.length)] ?? { x: 0, y: 0 };
      const lx = sp.attach.x + f.x;
      return { x: c === left ? lx : w - lx, y: cornerY(c) + sp.attach.y + f.y };
    },
  };
}
