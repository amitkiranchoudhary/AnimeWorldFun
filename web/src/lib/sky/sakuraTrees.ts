import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { outlineGeometry, rng } from "./toon";

// Two cherry blossom trees standing at the left and right edges of the screen,
// far behind the page. Cel-shaded and ink-outlined like the Nimbus. Their
// canopies are where the falling sakura petals come from (see canopyPoint).

const BARK = "#4a2a1c";
const BLOSSOMS = ["#f7a6c4", "#f9bcd4", "#fbcfe0", "#f58fb5"];

function lumpySphere(r: number, x: number, y: number, z: number, seed: number) {
  const g = new THREE.SphereGeometry(r, 20, 14);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 8 + seed) * Math.cos(v.y * 7 - seed) * Math.sin(v.z * 6 + seed * 0.5);
    v.multiplyScalar(1 + n * 0.12);
    p.setXYZ(i, v.x + x, v.y + y, v.z + z);
  }
  g.computeVertexNormals();
  return g;
}

/** One tree in local space: trunk base at (0,0), leaning toward +x (the screen centre). */
function buildTree(ramp: THREE.Texture, seed: number) {
  const rand = rng(seed);
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(d: T) => (owned.push(d), d);
  const tree = new THREE.Group();
  const ink = own(new THREE.MeshBasicMaterial({ color: "#2a0f1c", side: THREE.BackSide }));

  /* trunk and branches: tubes along gently curving lines */
  const limbs: THREE.BufferGeometry[] = [];
  const limb = (pts: [number, number, number][], r: number) =>
    limbs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, r, 8));
  limb([[0, 0, 0], [0.25, 1.6, 0], [0.15, 3.2, 0], [0.6, 4.6, 0]], 0.32);
  limb([[0.2, 2.6, 0], [0.8, 3.4, 0.1], [1.35, 3.95, 0.2]], 0.16);
  limb([[0.3, 3.6, 0], [-0.4, 4.4, -0.1], [-0.6, 5.0, -0.1]], 0.13);
  limb([[0.55, 4.3, 0], [1.1, 4.85, 0], [1.6, 5.0, 0.1]], 0.12);
  limb([[0.5, 4.5, 0], [0.7, 5.3, 0.1], [0.4, 5.9, 0]], 0.1);
  const woodGeo = own(mergeGeometries(limbs));
  limbs.forEach((l) => l.dispose());
  tree.add(new THREE.Mesh(woodGeo, own(new THREE.MeshToonMaterial({ color: BARK, gradientMap: ramp }))));
  tree.add(new THREE.Mesh(own(outlineGeometry(woodGeo, 0.04)), ink));

  /* canopy: clusters of blossom in a few pinks, each colour merged into one mesh */
  const byColor: THREE.BufferGeometry[][] = BLOSSOMS.map(() => []);
  const canopy: THREE.Vector3[] = [];
  for (let i = 0; i < 30; i++) {
    // an irregular dome over the branch tips
    const a = rand() * Math.PI;
    const rx = 1.2 + rand() * 0.45;
    const x = 0.65 + Math.cos(a) * rx + rand() * 0.3;
    const y = 4.85 + Math.sin(a) * 1.05 + (rand() - 0.5) * 0.5;
    const z = (rand() - 0.5) * 1.2;
    const r = 0.4 + rand() * 0.38;
    byColor[i % BLOSSOMS.length].push(lumpySphere(r, x, y, z, seed + i));
    canopy.push(new THREE.Vector3(x, y, z));
  }
  byColor.forEach((geos, i) => {
    const g = own(mergeGeometries(geos));
    geos.forEach((x) => x.dispose());
    tree.add(new THREE.Mesh(g, own(new THREE.MeshToonMaterial({ color: BLOSSOMS[i], gradientMap: ramp }))));
    tree.add(new THREE.Mesh(own(outlineGeometry(g, 0.035)), ink));
  });

  // tiny five-petal flowers dotted over the front of the canopy, for blossom texture
  const flowerShape = new THREE.Shape();
  for (let k = 0; k < 5; k++) {
    const a0 = (k / 5) * Math.PI * 2;
    const a1 = a0 + Math.PI / 5;
    const r = 1;
    if (k === 0) flowerShape.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
    flowerShape.quadraticCurveTo(Math.cos(a0 + Math.PI / 10) * r * 1.35, Math.sin(a0 + Math.PI / 10) * r * 1.35, Math.cos(a1) * r * 0.45, Math.sin(a1) * r * 0.45);
    flowerShape.lineTo(Math.cos(a0 + (Math.PI * 2) / 5) * r, Math.sin(a0 + (Math.PI * 2) / 5) * r);
  }
  const flowerGeo = own(new THREE.ShapeGeometry(flowerShape, 3));
  const flowers = new THREE.InstancedMesh(flowerGeo, own(new THREE.MeshBasicMaterial({ color: "#ffffff" })), 140);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const tints = ["#ffffff", "#ffe4ee", "#ffd0e0", "#fff6f9"];
  for (let i = 0; i < flowers.count; i++) {
    const c = canopy[Math.floor(rand() * canopy.length)];
    const pos = new THREE.Vector3(c.x + (rand() - 0.5) * 0.9, c.y + (rand() - 0.5) * 0.8, c.z + 0.75);
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rand() * Math.PI);
    const s = 0.05 + rand() * 0.05;
    m.compose(pos, q, new THREE.Vector3(s, s, s));
    flowers.setMatrixAt(i, m);
    flowers.setColorAt(i, new THREE.Color(tints[i % tints.length]));
  }
  tree.add(flowers);

  return { tree, canopy, dispose: () => owned.forEach((d) => d.dispose()) };
}

export function buildSakuraTrees(ramp: THREE.Texture) {
  const left = buildTree(ramp, 71);
  const right = buildTree(ramp, 97);
  const group = new THREE.Group();
  group.add(left.tree, right.tree);
  const Z = -7;

  let size = 1;
  return {
    group,
    /** trees stand at the bottom corners: tall, but each only fills its own corner */
    layout(halfW: number, halfH: number, narrow: boolean) {
      const depth = (10 - Z) / 10;
      const h = halfH * depth;
      const w = halfW * depth;
      // the canopy reaches ~2.9 units in from the trunk: keep that under ~22% of the width
      const byHeight = (h * 2 * (narrow ? 0.6 : 0.85)) / 6.2;
      const byWidth = (w * 2 * (narrow ? 0.3 : 0.22)) / 2.6;
      size = Math.min(byHeight, byWidth);
      for (const [t, side] of [[left.tree, -1], [right.tree, 1]] as const) {
        t.position.set(side * (w + 0.35 * size), -h - 0.2, Z);
        t.scale.set(-side * size, size, size);
      }
    },
    update(t: number) {
      // a slow breeze through the branches
      left.tree.rotation.z = Math.sin(t * 0.5) * 0.012;
      right.tree.rotation.z = -Math.sin(t * 0.5 + 1) * 0.012;
    },
    /** a random point inside one of the canopies, in world space, for spawning petals */
    canopyPoint(out: THREE.Vector3, rand: () => number) {
      const T = rand() < 0.5 ? left : right;
      const c = T.canopy[Math.floor(rand() * T.canopy.length)];
      out.copy(c).add(new THREE.Vector3((rand() - 0.5) * 0.8, (rand() - 0.5) * 0.6, 0));
      T.tree.updateMatrixWorld();
      return out.applyMatrix4(T.tree.matrixWorld);
    },
    dispose: () => {
      left.dispose();
      right.dispose();
    },
  };
}
