import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const C = {
  blue: 0x1c3fd8,
  yellow: 0xf4b81a,
  red: 0xc4300f,
  green: 0x1a6b50,
  chalk: 0xeceeef,
  chalkDark: 0xc9ced2,
  ink: 0x0d1224,
  glass: 0x9ab2cc,
};

type Kind = 'body' | 'accent' | 'glass';

/** Collects axis-aligned boxes and bakes them into ONE mesh per material class (few draw calls). */
export class Kit {
  private body: THREE.BufferGeometry[] = [];
  private accent: THREE.BufferGeometry[] = [];
  private glass: THREE.BufferGeometry[] = [];
  private edges: THREE.BufferGeometry[] = [];

  box(
    kind: Kind,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    color: number = C.chalk,
    edge = true,
  ) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    if (edge) this.edges.push(new THREE.EdgesGeometry(g));
    if (kind === 'body') {
      const col = new THREE.Color(color);
      const n = g.attributes.position.count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) col.toArray(arr, i * 3);
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
    this[kind].push(g);
  }

  build(): Built {
    const group = new THREE.Group();
    const mats: Built['mats'] = {};
    const meshes: THREE.Mesh[] = [];
    const lines: THREE.LineSegments[] = [];

    const mk = (geos: THREE.BufferGeometry[], mat: THREE.Material, shadow = true) => {
      if (!geos.length) return null;
      const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
      m.castShadow = shadow;
      m.receiveShadow = shadow;
      group.add(m);
      meshes.push(m);
      return m;
    };
    const offset = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
    mats.body = new THREE.MeshLambertMaterial({ vertexColors: true, ...offset });
    mats.accent = new THREE.MeshLambertMaterial({ color: C.chalkDark, ...offset });
    mats.glass = new THREE.MeshLambertMaterial({
      color: C.glass,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      emissive: 0x2a3a52,
    });
    mk(this.body, mats.body);
    mk(this.accent, mats.accent);
    mk(this.glass, mats.glass, false);
    if (this.edges.length) {
      mats.edge = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.92 });
      const l = new THREE.LineSegments(mergeGeometries(this.edges, false), mats.edge);
      group.add(l);
      lines.push(l);
    }
    return { group, mats, meshes, lines };
  }
}

export interface Built {
  group: THREE.Group;
  mats: Partial<
    Record<
      'body' | 'accent' | 'glass' | 'edge',
      THREE.Material & { opacity: number; transparent: boolean; color?: THREE.Color }
    >
  >;
  meshes: THREE.Mesh[];
  lines: THREE.LineSegments[];
}

/** Fade a built group toward a ghost (drafting-line) state. g=0 solid, g=1 ghost. */
export function setGhost(b: Built, g: number) {
  const solid = 1 - g * 0.9;
  const body = b.mats.body!;
  const accent = b.mats.accent!;
  const glass = b.mats.glass!;
  for (const m of [body, accent]) {
    const t = g > 0.001;
    if (m.transparent !== t) {
      m.transparent = t;
      m.needsUpdate = true;
    }
    m.opacity = solid;
    m.depthWrite = g < 0.5;
  }
  glass.opacity = 0.38 * (1 - g);
  const edge = b.mats.edge!;
  edge.opacity = 0.92 - g * 0.74;
  for (const m of b.meshes) m.castShadow = g < 0.5;
}
