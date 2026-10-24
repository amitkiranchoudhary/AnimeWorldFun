import * as THREE from "three";
import { startFrontPetals } from "./sky/frontPetals";
import { buildLanterns } from "./sky/lanterns";
import { rng, toonRamp } from "./sky/toon";
import { createWind } from "./sky/wind";

// Background layer for the Home page:
//  • sakura petals drifting far behind the page content (this 3D canvas)
//  • box-shaped paper lanterns rising far back along the sides
//  • a light front layer (2D canvas): cherry blossom branches hanging into the
//    top corners, which shed petals and lift away as you scroll, plus petals
//    fluttering over the tiles
// All of it moves with one shared wind. The 3D canvas sits behind the page
// content, so posters and tiles cover it. Loaded on demand by <SkyScene />.

/* ── Sakura petals (behind the page) ──────────────────────── */

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

type Petal = {
  x: number;
  y: number;
  z: number;
  vx: number;
  speed: number;
  phase: number;
  swing: number; // flutter frequency (rad/s)
  sway: number; // flutter width (screen fraction)
  tumble: number; // how fast it turns over
  size: number;
};
/** where a new petal appears, as a fraction of the screen (-1…1) */
type PetalSource = (out: { x: number; y: number }) => void;

function buildPetals(count: number, ramp: THREE.Texture) {
  const rand = rng(29);
  const geo = petalGeometry();
  const mat = new THREE.MeshToonMaterial({ color: "#ffffff", gradientMap: ramp, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const tints = ["#ffd9e5", "#ffcadb", "#ffe6ee", "#f9bcd0", "#fff4f7"];
  const petals: Petal[] = [];
  for (let i = 0; i < count; i++) {
    mesh.setColorAt(i, new THREE.Color(tints[i % tints.length]));
    petals.push({
      x: rand() * 2 - 1,
      y: rand() * 2 - 1,
      z: -3 + rand() * 4,
      vx: 0,
      speed: 0.6 + rand() * 0.7,
      phase: rand() * 100,
      swing: 3 + rand() * 3,
      sway: 0.025 + rand() * 0.035,
      tumble: rand() < 0.25 ? 4 + rand() * 4 : 0.6 + rand() * 1.4,
      size: 0.08 + rand() * 0.07,
    });
  }

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();

  return {
    mesh,
    /**
     * Falling-leaf motion: each petal rocks side to side like a pendulum,
     * dropping fastest mid-swing and gliding (almost hanging) at each end,
     * tilting into the swing and turning over as it goes. The wind carries it.
     */
    update(t: number, dt: number, halfW: number, halfH: number, wind: number, air: number, gust: number, source: PetalSource) {
      const drag = 1 - Math.exp(-dt * 2.5);
      for (let i = 0; i < count; i++) {
        const p = petals[i];
        const a = t * p.swing + p.phase;
        const swingV = Math.cos(a) * p.sway * p.swing; // pendulum side-to-side speed
        p.vx += (air * 0.05 + gust * 0.3 - p.vx) * drag; // carried by the wind, with drag
        p.x += (p.vx + swingV) * p.speed * dt;
        const fall = 0.075 * (0.3 + 1.2 * Math.cos(a) ** 2) - gust * 0.015 - wind * 0.02;
        p.y -= fall * p.speed * dt;
        if (p.y < -1.15 || p.y > 1.3 || p.x < -1.2 || p.x > 1.2) {
          source(p);
          p.vx = 0;
        }
        // further petals cover more world space, so scale by depth to fill the screen
        const depth = (10 - p.z) / 10;
        e.set(t * p.tumble + p.phase, Math.sin(a) * 0.5, -Math.sin(a) * 0.7 + p.phase);
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

/* ── Scene ────────────────────────────────────────────────── */

export function startSkyScene(canvas: HTMLCanvasElement, frontCanvas?: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight("#ffffff", 0.75));
  const sun = new THREE.DirectionalLight("#fff3d6", 2.2);
  sun.position.set(2, 7, 4);
  scene.add(sun);

  const ramp = toonRamp();
  const phone = window.innerWidth < 768;
  const petals = buildPetals(phone ? 26 : 60, ramp);
  scene.add(petals.mesh);
  const lanterns = buildLanterns(phone ? 4 : 8);
  scene.add(lanterns.group);
  const air = createWind();
  const front = frontCanvas ? startFrontPetals(frontCanvas, phone ? 12 : 28, air) : null;

  // back petals are born at a blossom on the hanging branches, or along the
  // top edge once the branches have scrolled away
  const petalRand = rng(83);
  const petalSource = (out: { x: number; y: number }) => {
    const at = front?.blossomSpot(petalRand);
    if (at) {
      out.x = (at.x / window.innerWidth) * 2 - 1;
      out.y = 1 - (at.y / window.innerHeight) * 2;
    } else {
      out.x = petalRand() * 2.2 - 1.2;
      out.y = 1.12;
    }
  };

  let halfW = 1;
  let halfH = 1;
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = halfH * camera.aspect;
    front?.resize();
  };
  resize();

  let scrollP = 0;
  let lastScrollY = window.scrollY;
  let scroll = 0; // scroll speed, decays over time
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? window.scrollY / max : 0;
    scroll += (window.scrollY - lastScrollY) * 0.02;
    scroll = THREE.MathUtils.clamp(scroll, -6, 6);
    lastScrollY = window.scrollY;
  };
  onScroll();
  scroll = 0;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);

  const start = performance.now();
  let last = start;
  let frame = 0;

  const tick = (now = performance.now()) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden) return;
    const t = (now - start) / 1000;
    scroll *= Math.exp(-dt * 2.5);
    air.update(t, dt, scroll);

    petals.update(t, dt, halfW, halfH, scroll, air.strength, air.gust, petalSource);
    lanterns.update(t, dt, halfW, halfH, scrollP * 2);
    renderer.render(scene, camera);
    front?.update(t, dt, scroll);
  };
  tick();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    petals.dispose();
    lanterns.dispose();
    front?.dispose();
    ramp.dispose();
    renderer.dispose();
  };
}
