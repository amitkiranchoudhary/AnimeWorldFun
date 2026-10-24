import * as THREE from "three";

// Shared cel-shading helpers for the sky layer.

/** Three hard light steps = flat anime shading. */
export function toonRamp() {
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 245, 245, 245, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Deterministic randomness so the scene looks the same each visit. */
export function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** The same shape pushed out along its normals: drawn inside-out it becomes an ink outline. */
export function outlineGeometry(geo: THREE.BufferGeometry, thickness: number) {
  const hull = geo.clone();
  const p = hull.attributes.position;
  const n = hull.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * thickness, p.getY(i) + n.getY(i) * thickness, p.getZ(i) + n.getZ(i) * thickness);
  }
  return hull;
}

/**
 * Builds cel-shaded, ink-outlined parts and remembers everything it created,
 * so a whole character can be disposed in one call.
 */
export class ToonKit {
  private owned: { dispose(): void }[] = [];
  private mats = new Map<string, THREE.Material>();
  readonly ink: THREE.MeshBasicMaterial;

  constructor(private ramp: THREE.Texture, inkColor = "#1a1206") {
    this.ink = this.own(new THREE.MeshBasicMaterial({ color: inkColor, side: THREE.BackSide }));
  }

  own<T extends { dispose(): void }>(thing: T): T {
    this.owned.push(thing);
    return thing;
  }

  material(color: string) {
    let m = this.mats.get(color);
    if (!m) {
      m = this.own(new THREE.MeshToonMaterial({ color, gradientMap: this.ramp }));
      this.mats.set(color, m);
    }
    return m;
  }

  /** A part with its outline; `outline` = 0 skips the ink (for tiny details). */
  part(geo: THREE.BufferGeometry, color: string, outline = 0.02) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(this.own(geo), this.material(color)));
    if (outline > 0) g.add(new THREE.Mesh(this.own(outlineGeometry(geo, outline)), this.ink));
    return g;
  }

  dispose() {
    this.owned.forEach((d) => d.dispose());
    this.owned = [];
  }
}
