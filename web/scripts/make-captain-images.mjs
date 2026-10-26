// Builds the web images of the Captain from the source art in ../mascot.
// Run from web/: node scripts/make-captain-images.mjs
// Output: public/images/captain/*.webp (+ .png fallbacks) and src/app/icon.png
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "../mascot";
const OUT = "public/images/captain";
mkdirSync(OUT, { recursive: true });

// WebP for every browser that has it, plus a fallback: palette PNG for art with
// transparency, JPEG for the painted hero (a PNG of it would be ~4 MB)
const both = async (img, name, webpQ = 82, fallback = "png") => {
  await img.clone().webp({ quality: webpQ, alphaQuality: 90 }).toFile(`${OUT}/${name}.webp`);
  if (fallback === "jpg") await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  else await img.clone().png({ compressionLevel: 9, palette: true, quality: 88 }).toFile(`${OUT}/${name}.png`);
};

/* ── logo: circular badge + favicon ───────────────────────────── */
{
  const S = 2048;
  const circle = Buffer.from(`<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2 - 8}" fill="#fff"/></svg>`);
  const round = await sharp(`${SRC}/logo.png`).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer();
  await both(sharp(round).resize(256, 256), "logo-256");
  await both(sharp(round).resize(512, 512), "logo-512");
  // favicon: head and hat, close up
  const head = await sharp(`${SRC}/logo.png`).extract({ left: 560, top: 60, width: 1100, height: 1100 }).resize(512, 512).png().toBuffer();
  const c512 = Buffer.from(`<svg width="512" height="512"><circle cx="256" cy="256" r="250" fill="#fff"/></svg>`);
  const ring = Buffer.from(`<svg width="512" height="512"><circle cx="256" cy="256" r="244" fill="none" stroke="#f2c94c" stroke-width="12"/></svg>`);
  await sharp(head).composite([{ input: c512, blend: "dest-in" }, { input: ring }]).png({ compressionLevel: 9, palette: true }).toFile("src/app/icon.png");
}

/* ── hero: desktop + mobile crop, with the AI sparkle watermark patched ── */
{
  const W = 2752, H = 1536;
  // the generator's sparkle sits in the bottom-right corner; cover it with sea from just left of it
  const wm = { left: 2500, top: 1310, width: 240, height: 226 };
  const patch = await sharp(`${SRC}/hero.png`).extract({ ...wm, left: wm.left - 260 }).png().toBuffer();
  const feather = Buffer.from(`<svg width="${wm.width}" height="${wm.height}"><defs><radialGradient id="g"><stop offset="60%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  const soft = await sharp(patch).composite([{ input: feather, blend: "dest-in" }]).png().toBuffer();
  const clean = await sharp(`${SRC}/hero.png`).removeAlpha().composite([{ input: soft, left: wm.left, top: wm.top }]).png().toBuffer();
  await both(sharp(clean).resize(1920), "hero-desktop", 80, "jpg");
  // portrait crop for phones, centred on the Captain (about 43% across)
  const cw = Math.round(H * 0.8);
  const left = Math.max(0, Math.min(W - cw, Math.round(W * 0.43 - cw / 2)));
  await both(sharp(clean).extract({ left, top: 0, width: cw, height: H }).resize(900), "hero-mobile", 80, "jpg");
  // link preview image (1200x630)
  await sharp(clean).resize(1200, 630, { fit: "cover", position: "left" }).jpeg({ quality: 82, mozjpeg: true }).toFile("public/images/og.jpg");
}

/* ── chibi poses: remove the white background, split into four ── */
{
  const { data, info } = await sharp(`${SRC}/chibi-poses.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const N = W * H;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  // "light" = near-white or the pale lilac ground shadow
  const light = (i) => {
    const [r, g, b] = px(i);
    return Math.min(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
  };
  // flood fill the background from every border pixel
  const bg = new Uint8Array(N);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !light(i)) continue;
    bg[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < N - W) stack.push(i + W);
  }
  // the pale lilac ground shadow under each pose (touching the background) turns
  // into a soft dark shadow, so it doesn't glow on the dark site
  const shadow = new Uint8Array(N);
  const pale = (i) => {
    const [r, g, b] = px(i);
    return Math.min(r, g, b) > 165 && Math.max(r, g, b) - Math.min(r, g, b) < 55;
  };
  for (let i = 0; i < N; i++) {
    if (!bg[i]) continue;
    const x = i % W;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < N && !bg[j] && pale(j)) stack.push(j);
  }
  while (stack.length) {
    const i = stack.pop();
    if (shadow[i] || bg[i] || !pale(i)) continue;
    shadow[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < N - W) stack.push(i + W);
  }
  // alpha: background clear; the 2px ring next to it fades by darkness, so edges stay smooth
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const [r, g, b] = px(i);
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    let a = bg[i] ? 0 : 255;
    if (!bg[i]) {
      const x = i % W;
      const near = (x > 1 && bg[i - 2]) || (x < W - 2 && bg[i + 2]) || (i >= 2 * W && bg[i - 2 * W]) || (i < N - 2 * W && bg[i + 2 * W]) ||
        (x > 0 && bg[i - 1]) || (x < W - 1 && bg[i + 1]) || (i >= W && bg[i - W]) || (i < N - W && bg[i + W]);
      if (near) a = Math.max(0, Math.min(255, Math.round((255 - Math.min(r, g, b)) * 2.2)));
    }
    if (shadow[i]) {
      // darker lilac = denser shadow
      rgba[i * 4] = 18;
      rgba[i * 4 + 1] = 10;
      rgba[i * 4 + 2] = 30;
      a = Math.max(0, Math.min(110, Math.round((255 - Math.min(r, g, b)) * 1.6)));
    }
    rgba[i * 4 + 3] = a;
  }
  // label the separate shapes, so the "Hi!" can be dropped and the katana cut out
  const label = new Int32Array(N);
  const comps = [];
  for (let s = 0; s < N; s++) {
    if (label[s] || rgba[s * 4 + 3] < 40 || shadow[s]) continue;
    const id = comps.length + 1;
    const c = { id, n: 0, x0: W, y0: H, x1: 0, y1: 0 };
    const st = [s];
    label[s] = id;
    while (st.length) {
      const i = st.pop();
      c.n++;
      const x = i % W, y = (i / W) | 0;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
        if (j >= 0 && j < N && !label[j] && rgba[j * 4 + 3] >= 40 && !shadow[j]) {
          label[j] = id;
          st.push(j);
        }
      }
    }
    comps.push(c);
  }
  const quads = { waving: [0, 0], reading: [1, 0], cheering: [0, 1], sleeping: [1, 1] };
  const hw = W / 2, hh = H / 2;
  const inQuad = (c, [qx, qy]) => {
    const cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
    return cx >= qx * hw && cx < (qx + 1) * hw && cy >= qy * hh && cy < (qy + 1) * hh;
  };
  const report = {};
  for (const [name, q] of Object.entries(quads)) {
    const mine = comps.filter((c) => inQuad(c, q) && c.n > 30);
    const main = mine.reduce((a, b) => (b.n > a.n ? b : a));
    // waving: keep only the Captain himself (drops the "Hi!" and the sparkle)
    const keep = new Set(name === "waving" ? [main.id] : mine.map((c) => c.id));
    report[name] = { shapes: mine.length, kept: keep.size };
    const buf = Buffer.alloc(N * 4);
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0; i < N; i++) {
      // keep faint edge pixels that belong to a kept shape's box
      const l = label[i];
      const x = i % W, y = (i / W) | 0;
      const ok = l ? keep.has(l) : shadow[i] && x >= main.x0 - 80 && x <= main.x1 + 80 && y >= main.y0 && y <= main.y1 + 60;
      if (!ok) continue;
      buf.set(rgba.subarray(i * 4, i * 4 + 4), i * 4);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    const pad = 12;
    const box = { left: Math.max(0, x0 - pad), top: Math.max(0, y0 - pad) };
    box.width = Math.min(W, x1 + pad) - box.left;
    box.height = Math.min(H, y1 + pad) - box.top;
    const img = sharp(buf, { raw: { width: W, height: H, channels: 4 } }).extract(box).resize(640, 640, { fit: "inside" });
    await both(img, `chibi-${name}`);
  }
  console.log(JSON.stringify(report));
}
