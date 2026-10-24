import * as THREE from "three";

// A 3D straw hat that floats over the page, travels between sections as you
// scroll (flipping on the way) and leans toward the mouse.
// Loaded on demand by <FloatingHat />, so Three.js never blocks the page.

/* ── Scroll path ──────────────────────────────────────────────
   p    = scroll progress through the page (0 = top, 1 = bottom)
   x    = horizontal position as a fraction of half the screen width (-1 left … 1 right)
   y    = vertical position as a fraction of half the screen height
   flip = how many full forward flips happen on the way to this point */
const PATH = [
  { p: 0.0, x: 0.62, y: 0.12, flip: 0 },
  { p: 0.12, x: -0.66, y: 0.34, flip: 1 },
  { p: 0.3, x: 0.7, y: 0.4, flip: 1 },
  { p: 0.5, x: -0.72, y: -0.1, flip: 1 },
  { p: 0.72, x: 0.7, y: 0.3, flip: 1 },
  { p: 1.0, x: 0.55, y: -0.25, flip: 1 },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

function pathAt(p: number) {
  let flips = 0;
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    if (p <= b.p || i === PATH.length - 2) {
      const t = smooth(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, flip: flips + b.flip * t };
    }
    flips += b.flip;
  }
  return { x: PATH[0].x, y: PATH[0].y, flip: 0 };
}

/* ── Straw texture (concentric woven rings) ─────────────────── */
function strawTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  // seeded random so the weave looks the same every visit
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  g.fillStyle = "#9c6a22";
  g.fillRect(0, 0, size, size);
  // rows of straw braid: horizontal bands in the texture become rings around the hat
  for (let y = 0; y < size; y += 6) {
    const shade = 175 + rand() * 45;
    g.fillStyle = `rgb(${shade + 25}, ${shade - 30}, ${shade * 0.32})`;
    g.fillRect(0, y, size, 4);
    // tiny diagonal stitches give the braided look
    g.strokeStyle = `rgba(120, 82, 25, ${0.25 + rand() * 0.25})`;
    g.lineWidth = 1;
    for (let x = rand() * 10; x < size; x += 8 + rand() * 4) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 4, y + 4);
      g.stroke();
    }
  }
  // a few darker frays and highlights
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = rand() > 0.5 ? "rgba(255, 240, 190, 0.35)" : "rgba(110, 70, 20, 0.3)";
    g.beginPath();
    const x = rand() * size;
    const y = rand() * size;
    g.moveTo(x, y);
    g.lineTo(x + 6 + rand() * 18, y + (rand() - 0.5) * 2);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.anisotropy = 8;
  return tex;
}

/* ── The hat ──────────────────────────────────────────────── */
function buildHat() {
  const tex = strawTexture();
  const straw = new THREE.MeshStandardMaterial({
    map: tex,
    bumpMap: tex,
    bumpScale: 2.5,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const ribbon = new THREE.MeshStandardMaterial({ color: "#c8102e", roughness: 0.55 });

  const hat = new THREE.Group();

  // Brim: a gently drooping ring, top surface then underside (lathe profile = radius, height)
  const brim = new THREE.LatheGeometry(
    [
      [0.9, 0.02], [1.15, 0.0], [1.4, -0.05], [1.6, -0.13], [1.68, -0.2],
      [1.65, -0.23], [1.56, -0.18], [1.36, -0.1], [1.12, -0.06], [0.9, -0.04],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    128,
  );
  hat.add(new THREE.Mesh(brim, straw));

  // Crown: a rounded dome sitting on the brim
  const crown = new THREE.LatheGeometry(
    [
      [0.92, -0.02], [0.94, 0.12], [0.95, 0.32], [0.92, 0.55], [0.84, 0.76],
      [0.7, 0.92], [0.5, 1.03], [0.26, 1.09], [0.0, 1.11],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    96,
  );
  hat.add(new THREE.Mesh(crown, straw));

  // Red band around the base of the crown
  const band = new THREE.CylinderGeometry(0.955, 0.965, 0.26, 96, 1, true);
  const bandMesh = new THREE.Mesh(band, ribbon);
  bandMesh.position.y = 0.15;
  hat.add(bandMesh);

  // A handful of loose straws poking out of the brim edge
  const strawStrand = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 4);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3 * Math.sin(i * 3.1);
    const s = new THREE.Mesh(strawStrand, straw);
    s.position.set(Math.cos(a) * 1.72, -0.2, Math.sin(a) * 1.72);
    s.rotation.set(Math.PI / 2 + 0.3, 0, -a + Math.PI / 2);
    hat.add(s);
  }

  return { hat, dispose: () => [brim, crown, band, strawStrand, straw, ribbon, tex].forEach((d) => d.dispose()) };
}

/* ── Scene ────────────────────────────────────────────────── */
export function startFloatingHat(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight("#ffe2b0", "#120a24", 0.7));
  const key = new THREE.DirectionalLight("#fff4e0", 3.2);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rimRed = new THREE.PointLight("#e63946", 25, 20);
  rimRed.position.set(-4, -1.5, 2);
  scene.add(rimRed);
  const rimBlue = new THREE.PointLight("#4cc9f0", 18, 20);
  rimBlue.position.set(4, 3, -2);
  scene.add(rimBlue);

  const { hat, dispose: disposeHat } = buildHat();
  const holder = new THREE.Group(); // position + scroll flip
  holder.add(hat); // hat itself: idle spin + mouse lean
  scene.add(holder);

  let halfW = 1;
  let halfH = 1;
  let baseScale = 1;
  let edgeBias = 1; // phones keep the hat closer to the screen edges
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = halfH * camera.aspect;
    // hat about 20% of the screen width (26% on phones), never huge or tiny
    const narrow = camera.aspect < 0.8;
    baseScale = THREE.MathUtils.clamp((halfW * 2 * (narrow ? 0.26 : 0.2)) / 3.4, 0.2, 0.95);
    edgeBias = narrow ? 1.2 : 1;
  };
  resize();

  // Inputs, smoothed every frame
  let scrollP = 0;
  const mouse = { x: 0, y: 0 };
  const cur = { x: 0, y: 0, flip: 0, leanX: 0, leanZ: 0 };
  let first = true;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? window.scrollY / max : 0;
  };
  const onMouse = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMouse, { passive: true });

  const start = performance.now();
  let last = start;
  let frame = 0;
  const tick = (now = performance.now()) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden) return;
    const t = (now - start) / 1000;
    const target = pathAt(scrollP);
    const k = first ? 1 : 1 - Math.exp(-dt * 3.5); // ease toward the target
    first = false;

    cur.x += (target.x - cur.x) * k;
    cur.y += (target.y - cur.y) * k;
    cur.flip += (target.flip - cur.flip) * k;
    cur.leanX += (mouse.y * 0.35 - cur.leanX) * k;
    cur.leanZ += (-mouse.x * 0.35 - cur.leanZ) * k;

    const x = THREE.MathUtils.clamp(cur.x * edgeBias, -0.82, 0.82);
    holder.position.set(x * halfW, cur.y * halfH + Math.sin(t * 1.3) * 0.12, 0);
    holder.scale.setScalar(baseScale);
    // tipped toward the viewer so you see the crown, plus the scroll flips
    holder.rotation.set(0.42 + cur.flip * Math.PI * 2, 0, 0.12 * Math.sin(t * 0.7));

    hat.rotation.set(cur.leanX, t * 0.55, cur.leanZ);
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMouse);
    disposeHat();
    renderer.dispose();
  };
}
