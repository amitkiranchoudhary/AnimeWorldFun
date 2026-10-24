import * as THREE from "three";
import { rng } from "./toon";

// Box-shaped paper lanterns rising far back along the screen edges.
// Each one: glowing paper panels in a dark wooden frame, a wider roof cap
// with sharp upturned points at its corners, and a tassel hanging below.
// The paper is a small shader: warm and bright low down where the flame is,
// shaded darker toward the top and on the side faces, with a lattice pattern.

const paperVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const paperFragment = /* glsl */ `
  uniform vec3 uGlow;     // paper colour near the flame
  uniform vec3 uShade;    // paper colour away from the flame
  uniform float uFlicker;
  uniform float uDim;     // far-away lanterns are dimmer
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }

  void main() {
    float lit = pow(1.0 - smoothstep(0.0, 1.0, vUv.y), 1.4);
    vec3 col = mix(uShade * 0.5, uGlow, lit) * (0.85 + 0.15 * uFlicker);
    col += uGlow * 0.3 * exp(-pow((vUv.y - 0.25) * 3.5, 2.0));

    // faces turned away from us are in shadow
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    col *= mix(0.45, 1.0, facing);

    // wooden lattice: two vertical and three horizontal bars per panel
    vec2 cell = abs(fract(vUv * vec2(3.0, 4.0)) - 0.5) * 2.0;
    float bar = max(smoothstep(0.9, 0.97, cell.x), smoothstep(0.9, 0.97, cell.y));
    col = mix(col, vec3(0.16, 0.07, 0.03), bar * 0.85);

    col *= 0.94 + 0.06 * hash(floor(vUv * vec2(70.0, 90.0)));
    gl_FragColor = vec4(col * uDim, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function softDot(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const PALETTES = [
  { glow: "#ffbf5e", shade: "#9a2f06" }, // amber
  { glow: "#ff9a5c", shade: "#8f1414" }, // red-orange
  { glow: "#ffd27a", shade: "#a85a05" }, // honey
  { glow: "#ffad8a", shade: "#8e2340" }, // peach-rose
];

export function buildLanterns(count: number) {
  const rand = rng(53);

  /* shared shapes (a lantern is about 0.5 wide × 0.8 tall) */
  const W = 0.5;
  const H = 0.62;
  const paperGeo = new THREE.BoxGeometry(W, H, W);
  const wood = new THREE.MeshBasicMaterial({ color: "#2a140a" });
  const postGeo = new THREE.BoxGeometry(0.045, H + 0.04, 0.045); // corner frame posts
  const capGeo = new THREE.BoxGeometry(W + 0.16, 0.07, W + 0.16); // roof / base plates
  const tipGeo = new THREE.ConeGeometry(0.035, 0.2, 4); // sharp corner points
  const tasselGeo = new THREE.ConeGeometry(0.05, 0.22, 4);
  const tasselMat = new THREE.MeshBasicMaterial({ color: "#a3121e" });
  const knobGeo = new THREE.BoxGeometry(0.1, 0.08, 0.1);

  const haloTex = softDot([[0, "rgba(255,190,110,0.5)"], [0.4, "rgba(255,140,60,0.15)"], [1, "rgba(255,110,40,0)"]]);
  const emberTex = softDot([[0, "rgba(255,230,160,1)"], [1, "rgba(255,140,40,0)"]]);
  const spriteMat = (map: THREE.Texture) =>
    new THREE.SpriteMaterial({ map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const haloMat = spriteMat(haloTex);
  const emberMat = spriteMat(emberTex);

  // per-lantern copies so each can flicker and fade on its own
  const perLantern: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(m: T) => (perLantern.push(m), m);
  const group = new THREE.Group();

  const lanterns = Array.from({ length: count }, (_, i) => {
    const pal = PALETTES[i % PALETTES.length];
    const z = -6 - rand() * 4; // well behind everything else
    const dim = THREE.MathUtils.mapLinear(z, -6, -10, 0.95, 0.7);
    const paper = own(
      new THREE.ShaderMaterial({
        vertexShader: paperVertex,
        fragmentShader: paperFragment,
        uniforms: {
          uGlow: { value: new THREE.Color(pal.glow) },
          uShade: { value: new THREE.Color(pal.shade) },
          uFlicker: { value: 1 },
          uDim: { value: dim },
        },
      }),
    );

    const l = new THREE.Group();
    l.add(new THREE.Mesh(paperGeo, paper));
    for (const [x, zz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const post = new THREE.Mesh(postGeo, wood);
      post.position.set((x * W) / 2, 0, (zz * W) / 2);
      l.add(post);
      // upturned sharp points at each roof corner
      const tip = new THREE.Mesh(tipGeo, wood);
      tip.position.set(x * (W / 2 + 0.1), H / 2 + 0.1, zz * (W / 2 + 0.1));
      tip.rotation.set(zz * 0.6, 0, -x * 0.6);
      l.add(tip);
    }
    const roof = new THREE.Mesh(capGeo, wood);
    roof.position.y = H / 2 + 0.035;
    l.add(roof);
    const base = new THREE.Mesh(capGeo, wood);
    base.position.y = -H / 2 - 0.035;
    base.scale.set(0.85, 1, 0.85);
    l.add(base);
    const knob = new THREE.Mesh(knobGeo, wood);
    knob.position.y = H / 2 + 0.11;
    l.add(knob);
    const tassel = new THREE.Mesh(tasselGeo, tasselMat);
    tassel.rotation.x = Math.PI; // point down
    tassel.position.y = -H / 2 - 0.19;
    l.add(tassel);

    const halo = new THREE.Sprite(own(haloMat.clone()));
    halo.scale.setScalar(2.2);
    l.add(halo);
    const embers = Array.from({ length: 2 }, () => {
      const e = new THREE.Sprite(own(emberMat.clone()));
      e.scale.setScalar(0.05);
      l.add(e);
      return { e, phase: rand() * 10 };
    });
    group.add(l);

    return {
      obj: l,
      paper,
      halo,
      embers,
      dim,
      side: i % 2 === 0 ? -1 : 1,
      edge: 0.78 + rand() * 0.16, // stay near the screen edges
      y: rand() * 2.5 - 1.25,
      z,
      speed: 0.02 + rand() * 0.025,
      phase: rand() * Math.PI * 2,
      size: 0.45 + rand() * 0.35,
      turn: (rand() - 0.5) * 0.3,
    };
  });

  return {
    group,
    update(t: number, dt: number, halfW: number, halfH: number, scrollDrift: number) {
      for (const L of lanterns) {
        L.y += L.speed * dt;
        if (L.y > 1.25) L.y = -1.25;
        const depth = (10 - L.z) / 10;
        // far away, so they slide only slightly against the scroll
        const y = ((((L.y - scrollDrift * 0.2) % 2.5) + 3.75) % 2.5) - 1.25;
        L.obj.position.set(L.side * L.edge * halfW * depth + Math.sin(t * 0.4 + L.phase) * 0.15, y * halfH * depth, L.z);
        L.obj.rotation.set(0, 0.6 + L.turn + Math.sin(t * 0.25 + L.phase) * 0.25, Math.sin(t * 0.6 + L.phase) * 0.05);
        L.obj.scale.setScalar(L.size * (halfH / 3.15) * depth * 0.9);

        const flicker = 0.75 + 0.25 * Math.sin(t * 9 + L.phase * 5) * Math.sin(t * 5.3 + L.phase);
        L.paper.uniforms.uFlicker.value = flicker;
        L.halo.material.opacity = (0.55 + flicker * 0.25) * L.dim;
        for (const E of L.embers) {
          const life = (t * 0.3 + E.phase) % 1;
          E.e.position.set(Math.sin(E.phase * 7 + t) * 0.12, -0.5 - life * 0.5, 0.05);
          E.e.material.opacity = (1 - life) * L.dim;
        }
      }
    },
    dispose: () =>
      [paperGeo, wood, postGeo, capGeo, tipGeo, tasselGeo, tasselMat, knobGeo, haloTex, emberTex, haloMat, emberMat, ...perLantern].forEach(
        (d) => d.dispose(),
      ),
  };
}
