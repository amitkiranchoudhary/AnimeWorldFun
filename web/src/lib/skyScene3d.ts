import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Background 3D layer for the Home page, drawn cel-shaded so it reads as anime:
//  • Goku's Flying Nimbus travels between sections as you scroll
//  • sakura petals drift down through the open spaces
//  • sky lanterns float up along the sides
// The canvas sits behind the page content, so posters and tiles cover it and it
// only shows in the gaps. Loaded on demand by <SkyScene />.

/* ── Shared look ──────────────────────────────────────────── */

function toonRamp() {
  // three hard light steps = flat anime shading
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 245, 245, 245, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function glowTexture(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, "rgba(255,140,60,0.35)");
  grad.addColorStop(1, "rgba(255,120,40,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Deterministic randomness so the scene looks the same each visit
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/* ── Flying Nimbus ────────────────────────────────────────── */

function buildNimbus(ramp: THREE.Texture) {
  const rand = rng(11);
  const puffs: THREE.BufferGeometry[] = [];
  const puff = (x: number, y: number, z: number, r: number) => {
    const g = new THREE.SphereGeometry(r, 24, 16);
    // lumpy surface: displacement depends only on position, so seams don't crack
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 9 + v.y * 4) * Math.cos(v.z * 7 - v.y * 3);
      v.multiplyScalar(1 + n * 0.06);
      pos.setXYZ(i, v.x + x, v.y + y, v.z + z);
    }
    g.computeVertexNormals();
    puffs.push(g);
  };

  // flat underside: a row of wide, squashed puffs (head at +x)
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    puff(-0.9 + t * 1.8, -0.05, (rand() - 0.5) * 0.3, 0.42 + Math.sin(t * Math.PI) * 0.12);
  }
  // big round lobes on top, each clearly its own bump
  const lobes: [number, number, number][] = [[-0.75, 0.32, 0.36], [-0.25, 0.48, 0.46], [0.3, 0.45, 0.44], [0.78, 0.3, 0.36]];
  lobes.forEach(([x, y, r]) => puff(x, y, (rand() - 0.5) * 0.2, r));
  // a rounded nose
  puff(1.2, 0.08, 0, 0.36);
  // the long tail: shrinking puffs sweeping back, then curling up into a hook
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const a = t * Math.PI * 1.25;
    puff(-1.25 - t * 1.15 + Math.sin(a) * 0.1, Math.sin(a) * 0.5 + t * t * 0.35, 0, 0.33 * (1 - t * 0.78));
  }

  const geo = mergeGeometries(puffs);
  puffs.forEach((p) => p.dispose());

  // ink outline = the same shape pushed out along its normals, drawn inside-out
  const hull = geo.clone();
  const hp = hull.attributes.position;
  const hn = hull.attributes.normal;
  for (let i = 0; i < hp.count; i++) {
    hp.setXYZ(i, hp.getX(i) + hn.getX(i) * 0.045, hp.getY(i) + hn.getY(i) * 0.045, hp.getZ(i) + hn.getZ(i) * 0.045);
  }

  const body = new THREE.MeshToonMaterial({ color: "#ffc93c", gradientMap: ramp });
  const ink = new THREE.MeshBasicMaterial({ color: "#3a2206", side: THREE.BackSide });

  const nimbus = new THREE.Group();
  nimbus.add(new THREE.Mesh(geo, body));
  nimbus.add(new THREE.Mesh(hull, ink));

  return { nimbus, dispose: () => [geo, hull, body, ink].forEach((d) => d.dispose()) };
}

/* Little cloud puffs left behind when the Nimbus moves fast */
function buildTrail(ramp: THREE.Texture, count: number) {
  const geo = new THREE.SphereGeometry(0.22, 12, 8);
  const mat = new THREE.MeshToonMaterial({ color: "#ffe28a", gradientMap: ramp, transparent: true, opacity: 0.85 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const life = new Float32Array(count); // 0 = dead
  const pos = Array.from({ length: count }, () => new THREE.Vector3());
  let next = 0;
  const m = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < count; i++) mesh.setMatrixAt(i, hidden);

  return {
    mesh,
    emit(at: THREE.Vector3) {
      pos[next].copy(at);
      life[next] = 1;
      next = (next + 1) % count;
    },
    update(dt: number, scale: number) {
      for (let i = 0; i < count; i++) {
        if (life[i] <= 0) continue;
        life[i] = Math.max(0, life[i] - dt * 1.6);
        pos[i].y += dt * 0.15;
        const s = life[i] * scale;
        m.makeScale(s, s, s).setPosition(pos[i]);
        mesh.setMatrixAt(i, life[i] > 0 ? m : hidden);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose: () => [geo, mat].forEach((d) => d.dispose()),
  };
}

/* ── Sakura petals ────────────────────────────────────────── */

function petalGeometry() {
  // a petal with the little notch at the tip
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.25, 0.4, 0.3, 0.12, 0.5);
  s.lineTo(0, 0.38);
  s.lineTo(-0.12, 0.5);
  s.bezierCurveTo(-0.4, 0.3, -0.42, -0.25, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, 8);
  // slight cup so it catches light as it tumbles
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getX(i) * p.getX(i) * 0.6);
  g.computeVertexNormals();
  return g;
}

type Petal = { x: number; y: number; z: number; vy: number; sway: number; phase: number; spin: THREE.Vector3; size: number };

function buildPetals(count: number, ramp: THREE.Texture) {
  const rand = rng(29);
  const geo = petalGeometry();
  const mat = new THREE.MeshToonMaterial({ color: "#ffffff", gradientMap: ramp, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const tints = ["#ffc4d6", "#ffb3c8", "#ffd6e2", "#ff9fbc", "#fff0f5"];
  const petals: Petal[] = [];
  for (let i = 0; i < count; i++) {
    mesh.setColorAt(i, new THREE.Color(tints[i % tints.length]));
    petals.push({
      x: rand() * 2 - 1,
      y: rand() * 2 - 1,
      z: -3 + rand() * 4,
      vy: 0.05 + rand() * 0.07,
      sway: 0.05 + rand() * 0.12,
      phase: rand() * Math.PI * 2,
      spin: new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).multiplyScalar(1.6),
      size: 0.09 + rand() * 0.08,
    });
  }

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();

  return {
    mesh,
    /** wind: scroll speed pushes petals around */
    update(t: number, dt: number, halfW: number, halfH: number, wind: number) {
      for (let i = 0; i < count; i++) {
        const p = petals[i];
        p.y -= (p.vy + Math.abs(wind) * 0.02) * dt;
        p.x += (Math.sin(t * 0.6 + p.phase) * p.sway * 0.12 + wind * 0.01) * dt;
        if (p.y < -1.15) { p.y = 1.15; p.x = Math.random() * 2 - 1; }
        if (p.y > 1.2) p.y = -1.15;
        if (p.x < -1.15) p.x = 1.15;
        if (p.x > 1.15) p.x = -1.15;
        // further petals cover more world space, so scale by depth to fill the screen
        const depth = (10 - p.z) / 10;
        e.set(t * p.spin.x + p.phase, t * p.spin.y, t * p.spin.z);
        q.setFromEuler(e);
        v.set(p.x * halfW * depth, p.y * halfH * depth, p.z);
        sc.setScalar(p.size * (halfH / 3.15));
        m.compose(v, q, sc);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose: () => [geo, mat].forEach((d) => d.dispose()),
  };
}

/* ── Sky lanterns (sides only) ────────────────────────────── */

function buildLanterns(count: number) {
  const rand = rng(53);
  const paper = new THREE.LatheGeometry(
    [[0.16, -0.36], [0.27, -0.3], [0.32, -0.05], [0.3, 0.2], [0.22, 0.36], [0.12, 0.4]].map(([x, y]) => new THREE.Vector2(x, y)),
    20,
  );
  const paperMat = new THREE.MeshBasicMaterial({ color: "#ffb24d" });
  const rimMat = new THREE.MeshBasicMaterial({ color: "#7a2e0e" });
  const rim = new THREE.TorusGeometry(0.165, 0.025, 6, 20);
  const glowTex = glowTexture("rgba(255,214,120,0.95)");
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });

  const group = new THREE.Group();
  const lanterns = Array.from({ length: count }, (_, i) => {
    const l = new THREE.Group();
    l.add(new THREE.Mesh(paper, paperMat));
    const r = new THREE.Mesh(rim, rimMat);
    r.rotation.x = Math.PI / 2;
    r.position.y = -0.36;
    l.add(r);
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(1.9);
    l.add(glow);
    group.add(l);
    return {
      obj: l,
      side: i % 2 === 0 ? -1 : 1,
      edge: 0.82 + rand() * 0.14, // stay near the screen edges
      y: rand() * 2 - 1,
      z: -2.5 - rand() * 3,
      speed: 0.03 + rand() * 0.03,
      phase: rand() * Math.PI * 2,
      size: 0.6 + rand() * 0.5,
    };
  });

  return {
    group,
    update(t: number, dt: number, halfW: number, halfH: number, scrollDrift: number) {
      for (const L of lanterns) {
        L.y += L.speed * dt;
        if (L.y > 1.25) L.y = -1.25;
        const depth = (10 - L.z) / 10;
        // a touch of parallax: lanterns slide gently against the scroll
        const y = ((((L.y - scrollDrift * 0.35) % 2.5) + 3.75) % 2.5) - 1.25;
        L.obj.position.set(L.side * L.edge * halfW * depth + Math.sin(t * 0.5 + L.phase) * 0.12, y * halfH * depth, L.z);
        L.obj.rotation.z = Math.sin(t * 0.8 + L.phase) * 0.08;
        L.obj.scale.setScalar(L.size * (halfH / 3.15));
        // flicker
        (L.obj.children[2] as THREE.Sprite).material.opacity = 0.75 + Math.sin(t * 7 + L.phase * 3) * 0.08;
      }
    },
    dispose: () => [paper, paperMat, rimMat, rim, glowTex, glowMat].forEach((d) => d.dispose()),
  };
}

/* ── Where the Nimbus goes ────────────────────────────────────
   Pages mark open areas with [data-sky-stop]. The Nimbus rests at the stop
   nearest the middle of the screen and flies (behind the content) to the
   next one as you scroll. Pages without stops fall back to PATH, where
   p = scroll progress (0 top … 1 bottom) and x/y = fraction of half the screen. */

function createStopFinder() {
  let stops: HTMLElement[] = [];
  let current: HTMLElement | null = null;
  let age = Infinity;

  return () => {
    if (age++ > 60) {
      stops = Array.from(document.querySelectorAll<HTMLElement>("[data-sky-stop]"));
      age = 0;
    }
    const h = window.innerHeight;
    const mid = h * 0.5;
    let best: HTMLElement | null = null;
    let bestDist = Infinity;
    let currentDist = Infinity;
    for (const el of stops) {
      const r = el.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      if (cy < -h * 0.1 || cy > h * 1.1) continue;
      const d = Math.abs(cy - mid);
      if (el === current) currentDist = d;
      if (d < bestDist) { bestDist = d; best = el; }
    }
    // stick with the current stop unless another is clearly closer (no jitter)
    if (current && currentDist !== Infinity && currentDist - bestDist < h * 0.12) best = current;
    current = best;
    if (!best) return null;
    const r = best.getBoundingClientRect();
    return {
      x: ((r.left + r.width / 2) / window.innerWidth) * 2 - 1,
      y: -(((r.top + r.height / 2) / h) * 2 - 1),
    };
  };
}

const PATH = [
  { p: 0.0, x: 0.6, y: -0.42 },
  { p: 0.14, x: -0.7, y: 0.05 },
  { p: 0.32, x: 0.72, y: -0.2 },
  { p: 0.52, x: -0.74, y: 0.15 },
  { p: 0.74, x: 0.72, y: -0.1 },
  { p: 1.0, x: 0.45, y: 0.3 },
];
const smooth = (t: number) => t * t * (3 - 2 * t);
function pathAt(p: number) {
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    if (p <= b.p || i === PATH.length - 2) {
      const t = smooth(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return PATH[0];
}

/* ── Scene ────────────────────────────────────────────────── */

export function startSkyScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight("#ffffff", 0.55));
  const sun = new THREE.DirectionalLight("#fff3d6", 2.6);
  sun.position.set(2, 7, 4);
  scene.add(sun);

  const ramp = toonRamp();
  const phone = window.innerWidth < 768;
  const { nimbus, dispose: disposeNimbus } = buildNimbus(ramp);
  const holder = new THREE.Group();
  holder.add(nimbus);
  scene.add(holder);
  const trail = buildTrail(ramp, 24);
  scene.add(trail.mesh);
  const petals = buildPetals(phone ? 26 : 60, ramp);
  scene.add(petals.mesh);
  const lanterns = buildLanterns(phone ? 4 : 8);
  scene.add(lanterns.group);

  let halfW = 1;
  let halfH = 1;
  let baseScale = 1;
  let edgeBias = 1;
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = halfH * camera.aspect;
    const narrow = camera.aspect < 0.8;
    // Nimbus about a fifth of the screen wide (a quarter on phones)
    baseScale = THREE.MathUtils.clamp((halfW * 2 * (narrow ? 0.3 : 0.25)) / 4.4, 0.18, 0.85);
    edgeBias = narrow ? 1.15 : 1;
  };
  resize();

  let scrollP = 0;
  let lastScrollY = window.scrollY;
  let wind = 0; // scroll speed, decays over time
  const mouse = { x: 0, y: 0 };
  const cur = { x: 0, y: 0, yaw: 0, bank: 0, lean: 0 };
  let first = true;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? window.scrollY / max : 0;
    wind += (window.scrollY - lastScrollY) * 0.02;
    wind = THREE.MathUtils.clamp(wind, -6, 6);
    lastScrollY = window.scrollY;
  };
  const onMouse = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  onScroll();
  wind = 0;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMouse, { passive: true });

  const start = performance.now();
  let last = start;
  let frame = 0;
  let trailTimer = 0;
  const worldPos = new THREE.Vector3();
  const findStop = createStopFinder();

  const tick = (now = performance.now()) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden) return;
    const t = (now - start) / 1000;
    const k = first ? 1 : 1 - Math.exp(-dt * 2.6);
    first = false;
    wind *= Math.exp(-dt * 2.5);

    // Nimbus: glide to the open spot, face the way it's flying, bank into turns
    const stop = findStop();
    const path = pathAt(scrollP);
    const target = stop ?? { x: path.x * edgeBias, y: path.y };
    const tx = THREE.MathUtils.clamp(target.x, -0.85, 0.85);
    const vx = (tx - cur.x) * k;
    cur.x += vx;
    cur.y += (target.y - cur.y) * k;
    const speed = vx / Math.max(dt, 1e-3);
    if (Math.abs(speed) > 0.05) cur.yaw += ((speed > 0 ? 0 : Math.PI) - cur.yaw) * (1 - Math.exp(-dt * 3));
    cur.bank += (THREE.MathUtils.clamp(-speed * 0.25, -0.35, 0.35) - cur.bank) * (1 - Math.exp(-dt * 4));
    cur.lean += (mouse.x * 0.15 - cur.lean) * (1 - Math.exp(-dt * 3));

    holder.position.set(cur.x * halfW, cur.y * halfH + Math.sin(t * 1.2) * 0.12, 0);
    holder.scale.setScalar(baseScale);
    nimbus.rotation.set(0.18 + mouse.y * 0.08, cur.yaw + cur.lean, cur.bank + Math.sin(t * 0.9) * 0.04);

    // puffs fall out of the tail while it's moving
    trailTimer -= dt;
    if (Math.abs(speed) > 0.25 && trailTimer <= 0) {
      trailTimer = 0.07;
      nimbus.localToWorld(worldPos.set(-2.1, 0.4, 0));
      trail.emit(worldPos);
    }
    trail.update(dt, baseScale * 1.6);

    petals.update(t, dt, halfW, halfH, wind);
    lanterns.update(t, dt, halfW, halfH, scrollP * 2);
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMouse);
    disposeNimbus();
    trail.dispose();
    petals.dispose();
    lanterns.dispose();
    ramp.dispose();
    renderer.dispose();
  };
}
