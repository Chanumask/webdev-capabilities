import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { material, TILE, baseOpacity, type MatName } from './materials';

export interface Built {
  group: THREE.Group;
  mats: Map<MatName, THREE.MeshStandardMaterial>;
  meshes: THREE.Mesh[];
}

const shared = new Map<MatName, THREE.MeshStandardMaterial>();
const sharedMat = (n: MatName) => {
  let m = shared.get(n);
  if (!m) shared.set(n, (m = material(n)));
  return m;
};

/**
 * Collects primitives (authored in metres) and bakes them into ONE mesh per material.
 * UVs are projected from world position so textures keep a constant real-world scale.
 */
export class Kit {
  private parts = new Map<MatName, THREE.BufferGeometry[]>();

  private add(name: MatName, geo: THREE.BufferGeometry, color = 0xffffff) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const pos = g.attributes.position,
      nor = g.attributes.normal;
    const uv = new Float32Array(pos.count * 2),
      col = new Float32Array(pos.count * 3);
    const c = new THREE.Color(color),
      tile = TILE[name];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      const ax = Math.abs(nor.getX(i)),
        ay = Math.abs(nor.getY(i)),
        az = Math.abs(nor.getZ(i));
      let u: number, v: number;
      if (ay >= ax && ay >= az) {
        u = x;
        v = z;
      } else if (ax >= az) {
        u = z;
        v = y;
      } else {
        u = x;
        v = y;
      }
      uv[i * 2] = u / tile;
      uv[i * 2 + 1] = v / tile;
      c.toArray(col, i * 3);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    for (const k of Object.keys(g.attributes))
      if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k);
    (this.parts.get(name) ?? this.parts.set(name, []).get(name)!).push(g);
  }

  box(n: MatName, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color?: number) {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.add(n, g, color);
  }
  rbox(n: MatName, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r: number, color?: number) {
    const w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0),
      d = Math.abs(z1 - z0);
    const g = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.05, h / 2.05, d / 2.05));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.add(n, g, color);
  }
  /** Tilted slab: rotation about X (rx) then Z (rz), centred in the given box. */
  tilt(
    n: MatName,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    rx: number,
    rz = 0,
    color?: number,
  ) {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    g.rotateX(rx);
    g.rotateZ(rz);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.add(n, g, color);
  }
  cyl(
    n: MatName,
    cx: number,
    y0: number,
    cz: number,
    r: number,
    h: number,
    color?: number,
    axis: 'y' | 'x' | 'z' = 'y',
    rTop = r,
    seg = 14,
  ) {
    const g = new THREE.CylinderGeometry(rTop, r, h, seg);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    g.translate(cx, axis === 'y' ? y0 + h / 2 : y0, cz);
    this.add(n, g, color);
  }
  sph(n: MatName, cx: number, cy: number, cz: number, rx: number, ry = rx, rz = rx, color?: number, detail = 2) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(rx, ry, rz);
    g.translate(cx, cy, cz);
    this.add(n, g, color);
  }
  /** Gable roof prism. Ridge runs along `ridge` axis. */
  gable(
    n: MatName,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    z1: number,
    rise: number,
    ridge: 'x' | 'z' = 'x',
    ov = 0.35,
    color?: number,
  ) {
    x0 -= ov;
    z0 -= ov;
    x1 += ov;
    z1 += ov;
    const mx = (x0 + x1) / 2,
      mz = (z0 + z1) / 2,
      yr = y0 + rise;
    const P: Record<string, [number, number, number]> = {
      A: [x0, y0, z0],
      B: [x1, y0, z0],
      C: [x1, y0, z1],
      D: [x0, y0, z1],
    };
    let tris: [number, number, number][][];
    if (ridge === 'x') {
      const R1: [number, number, number] = [x0, yr, mz],
        R2: [number, number, number] = [x1, yr, mz];
      tris = [
        [P.D, P.C, R2],
        [P.D, R2, R1],
        [P.B, P.A, R1],
        [P.B, R1, R2],
        [P.A, P.D, R1],
        [P.C, P.B, R2],
      ];
    } else {
      const R1: [number, number, number] = [mx, yr, z0],
        R2: [number, number, number] = [mx, yr, z1];
      tris = [
        [P.C, P.B, R1],
        [P.C, R1, R2],
        [P.A, P.D, R2],
        [P.A, R2, R1],
        [P.B, P.A, R1],
        [P.D, P.C, R2],
      ];
    }
    const centre = new THREE.Vector3(mx, y0 + rise / 3, mz);
    const v: number[] = [];
    for (const t of tris) {
      const a = new THREE.Vector3(...t[0]),
        b = new THREE.Vector3(...t[1]),
        c = new THREE.Vector3(...t[2]);
      const nrm = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
      const cen = new THREE.Vector3()
        .add(a)
        .add(b)
        .add(c)
        .multiplyScalar(1 / 3);
      if (nrm.dot(cen.sub(centre)) < 0) v.push(...a.toArray(), ...c.toArray(), ...b.toArray());
      else v.push(...a.toArray(), ...b.toArray(), ...c.toArray());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    this.add(n, g, color);
  }

  build(opts: { scale?: number; share?: boolean; transparent?: boolean } = {}): Built {
    const group = new THREE.Group();
    const mats = new Map<MatName, THREE.MeshStandardMaterial>();
    const meshes: THREE.Mesh[] = [];
    for (const [name, geos] of this.parts) {
      const mat = opts.share ? sharedMat(name) : material(name);
      if (opts.transparent) mat.transparent = true;
      mats.set(name, mat);
      const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
      const glass = name === 'glass';
      m.castShadow = !glass;
      m.receiveShadow = !glass;
      if (glass) m.renderOrder = 2;
      group.add(m);
      meshes.push(m);
    }
    if (opts.scale) group.scale.setScalar(opts.scale);
    return { group, mats, meshes };
  }
}

/** Cross-fade a built group. o=1 solid, o=0 gone (hidden). */
export function fade(b: Built, o: number) {
  const v = o > 0.002;
  b.group.visible = v;
  if (!v) return;
  for (const [name, m] of b.mats) {
    m.opacity = baseOpacity(name) * o;
    m.depthWrite = o > 0.6 && name !== 'glass';
  }
  for (const m of b.meshes) m.castShadow = o > 0.6 && (m.material as THREE.Material).name !== 'glass';
}
