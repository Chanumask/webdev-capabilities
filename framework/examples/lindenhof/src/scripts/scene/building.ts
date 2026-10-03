import * as THREE from 'three';
import { Kit, type Built } from './kit';

/* Everything here is authored in METRES and baked with scale M, so 1 world unit ~ 2.3 m. */
export const M = 0.43;
export const FH = 2.9; // storey pitch
export const W_M = 16,
  D_M = 8.4;
export const W = W_M * M,
  D = D_M * M,
  H = FH * M; // in world units
const X0 = -8,
  X1 = 8,
  Z0 = -4.2,
  Z1 = 4.2,
  S = 0.28,
  WT = 0.3,
  PH = 1.25;
const XC = 1.35; // mirror axis for interiors
const FAB = [0x8a8f86, 0x3b4452, 0xb59a82, 0x6e5a4c, 0x9aa2a8, 0x6f7b72];
const BOOKS = [0x7b8794, 0xa58f77, 0x4f5b66, 0xc2b8a8, 0x6d7d6f];

export interface Floor {
  group: THREE.Group;
  core: Built;
  fin: Built;
}
interface Op {
  c: number;
  w: number;
  sill: number;
  head: number;
  door?: boolean;
}

/** Wall run along `axis` with window openings; structure goes to `core`, window units to `fin`. */
function run(
  core: Kit,
  fin: Kit,
  axis: 'x' | 'z',
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  ops: Op[],
  out: 1 | -1,
) {
  const B = (
    k: Kit,
    m: Parameters<Kit['box']>[0],
    p0: number,
    y0: number,
    q0: number,
    p1: number,
    y1: number,
    q1: number,
    col?: number,
  ) => (axis === 'x' ? k.box(m, p0, y0, q0, p1, y1, q1, col) : k.box(m, q0, y0, p0, q1, y1, p1, col));
  let cur = a0;
  const bm = (b0 + b1) / 2;
  for (const o of ops) {
    const l = o.c - o.w / 2,
      r = o.c + o.w / 2,
      ya = S + o.sill,
      yb = S + o.head;
    if (l > cur) B(core, 'plaster', cur, S, b0, l, FH, b1);
    if (o.sill > 0) B(core, 'plaster', l, S, b0, r, ya, b1);
    B(core, 'plaster', l, yb, b0, r, FH, b1);
    cur = r;
    // window unit
    const t = 0.07,
      d = 0.05;
    B(fin, 'frame', l, ya, bm - d, l + t, yb, bm + d);
    B(fin, 'frame', r - t, ya, bm - d, r, yb, bm + d);
    B(fin, 'frame', l, yb - t, bm - d, r, yb, bm + d);
    if (!o.door) B(fin, 'frame', l, ya, bm - d, r, ya + t, bm + d);
    if (o.w > 1.7) B(fin, 'frame', o.c - 0.03, ya, bm - d, o.c + 0.03, yb, bm + d);
    B(
      fin,
      'frame',
      l,
      o.door ? ya + 0.9 : ya + (yb - ya) * 0.62,
      bm - 0.03,
      r,
      (o.door ? ya + 0.9 : ya + (yb - ya) * 0.62) + 0.035,
      bm + 0.03,
    );
    B(fin, 'glass', l + t, ya + (o.door ? 0 : t), bm - 0.012, r - t, yb - t, bm + 0.012);
    if (o.door) B(fin, 'brass', o.c - 0.1, ya + 1.0, bm + 0.05 * out, o.c - 0.06, ya + 1.25, bm + 0.09 * out);
    else if (out > 0) B(fin, 'concrete', l - 0.07, ya - 0.06, b1, r + 0.07, ya, b1 + 0.14);
    else B(fin, 'concrete', l - 0.07, ya - 0.06, b0 - 0.14, r + 0.07, ya, b0);
  }
  if (a1 > cur) B(core, 'plaster', cur, S, b0, a1, FH, b1);
}

export function buildFloor(idx: number): Floor {
  const core = new Kit(),
    fin = new Kit();
  const mirror = idx % 2 === 1;
  const mx = (x: number) => (mirror ? 2 * XC - x : x);
  type MN = Parameters<Kit['box']>[0];
  const ib = (m: MN, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c?: number) =>
    fin.box(m, mx(x0), y0, z0, mx(x1), y1, z1, c);
  const ir = (m: MN, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r: number, c?: number) =>
    fin.rbox(m, mx(x0), y0, z0, mx(x1), y1, z1, r, c);
  const ic = (m: MN, cx: number, y0: number, cz: number, r: number, h: number, c?: number) =>
    fin.cyl(m, mx(cx), y0, cz, r, h, c);
  const fab = FAB[(idx * 2) % FAB.length],
    fab2 = FAB[(idx * 2 + 1) % FAB.length],
    fab3 = FAB[(idx * 2 + 3) % FAB.length];

  /* ---- structure ---- */
  core.box('concrete', X0 - 0.2, 0, Z0 - 0.2, X1 + 0.2, S, Z1 + 0.2);
  run(
    core,
    fin,
    'x',
    X0,
    X1,
    Z1 - WT,
    Z1,
    [
      { c: -3.0, w: 2.0, sill: 0.85, head: 2.15 },
      { c: -0.2, w: 2.0, sill: 0.85, head: 2.15 },
      { c: 2.6, w: 2.0, sill: 0.85, head: 2.15 },
      { c: 6.0, w: 2.4, sill: 0, head: 2.2, door: true },
    ],
    1,
  );
  run(
    core,
    fin,
    'x',
    X0,
    X1,
    Z0,
    Z0 + WT,
    [
      { c: -3.2, w: 1.6, sill: 1.0, head: 2.1 },
      { c: 0.2, w: 1.6, sill: 1.0, head: 2.1 },
      { c: 3.6, w: 1.6, sill: 1.0, head: 2.1 },
      { c: 6.6, w: 1.6, sill: 1.0, head: 2.1 },
    ],
    -1,
  );
  run(core, fin, 'z', Z0 + WT, Z1 - WT, X1 - WT, X1, [{ c: 0, w: 2.0, sill: 0.85, head: 2.15 }], 1);
  run(core, fin, 'z', Z0 + WT, Z1 - WT, X0, X0 + WT, [], -1);

  // balcony (front right)
  core.box('concrete', 4.5, 0, Z1, 7.95, S, 5.8);
  fin.box('floor', 4.55, S, Z1, 7.9, S + 0.03, 5.75);
  fin.box('glass', 4.5, S, 5.78, 7.95, S + 1.05, 5.82);
  fin.box('glass', 4.5, S, Z1, 4.54, S + 1.05, 5.82);
  fin.box('frame', 4.48, S + 1.05, 5.76, 7.97, S + 1.1, 5.84);
  fin.box('frame', 4.48, S, 5.76, 4.54, S + 1.05, 5.84);
  for (let z = Z1 + 0.1; z < 5.7; z += 0.16) fin.box('timber', 7.88, S, z, 7.96, S + 1.9, z + 0.07);
  fin.cyl('steel', 6.0, S + 0.03, 5.0, 0.05, 0.7);
  fin.cyl('steel', 6.0, S + 0.7, 5.0, 0.38, 0.03);
  fin.rbox('fabric', 5.3, S + 0.03, 4.75, 5.7, S + 0.45, 5.15, 0.05, fab3);
  fin.rbox('fabric', 6.3, S + 0.03, 4.75, 6.7, S + 0.45, 5.15, 0.05, fab3);
  fin.cyl('concrete', 7.35, S + 0.03, 4.7, 0.2, 0.4);
  fin.sph('leaf', 7.35, S + 0.75, 4.7, 0.34, 0.38, 0.34, 0x58704a);

  // stair tower (front left)
  core.box('plasterDark', X0, 0, Z1 - WT, -5.2, FH, 6.6);
  fin.box('timber', X0, 0.1, 6.6, -7.35, FH - 0.12, 6.67);
  fin.box('timber', -5.85, 0.1, 6.6, -5.2, FH - 0.12, 6.67);
  if (idx === 0) {
    fin.box('timber', -6.95, S, 6.6, -6.05, 2.3, 6.74);
    fin.box('brass', -6.2, 1.1, 6.74, -6.16, 1.45, 6.8);
    fin.box('glass', -7.3, 2.32, 6.6, -5.9, 2.5, 6.64);
    fin.box('frame', -7.32, 2.3, 6.58, -5.88, 2.34, 6.66);
    fin.box('concrete', -8.3, 2.55, 6.6, -4.9, 2.7, 8.1); // canopy
    fin.box('brass', -5.6, 1.4, 6.67, -5.3, 1.68, 6.71);
    fin.sph('lamp', -6.5, 2.5, 7.2, 0.1, 0.06, 0.1);
    core.box('concrete', -7.6, 0, 6.6, -5.4, 0.14, 7.9);
    core.box('concrete', -7.6, 0.14, 6.6, -5.4, S, 7.2);
  } else {
    fin.box('glass', -7.2, 0.5, 6.6, -6.0, FH - 0.4, 6.64);
    for (const x of [-6.9, -6.6, -6.3]) fin.box('frame', x - 0.02, 0.5, 6.58, x + 0.02, FH - 0.4, 6.66);
    fin.box('frame', -7.22, 0.48, 6.58, -5.98, 0.54, 6.66);
    fin.box('frame', -7.22, FH - 0.44, 6.58, -5.98, FH - 0.38, 6.66);
  }
  fin.box('glass', -5.22, 1.1, 5.0, -5.18, 2.2, 6.0);

  /* ---- interior ---- */
  core.box('plaster', -5.0, S, -3.9, -4.88, S + PH, 1.0);
  core.box('plaster', -5.0, S, 1.9, -4.88, S + PH, 3.9);
  for (const [a, b] of [
    [-4.88, -4.5],
    [-1.6, 0.1],
    [0.95, 4.1],
    [4.95, 7.7],
  ] as const)
    core.box('plaster', a, S, -0.65, b, S + PH, -0.53);
  core.box('plaster', 1.35, S, -3.9, 1.47, S + PH, 3.9);
  core.box('plaster', -1.2, S, -3.9, -1.08, S + PH, -0.65);
  fin.box('floor', -4.88, S, -3.9, 7.7, S + 0.02, 3.9);
  fin.box('concrete', -1.08, S, -3.9, 1.35, S + 0.035, -0.65, 0xcfcfcb);

  // living room (unit A front)
  ib('fabric', -4.5, S + 0.02, 0.5, -0.7, S + 0.035, 3.4, fab2);
  ir('fabric', -4.4, S + 0.02, -0.45, -2.0, S + 0.42, 0.45, 0.08, fab);
  ir('fabric', -4.4, S + 0.02, -0.5, -2.0, S + 0.88, -0.2, 0.08, fab);
  ir('fabric', -4.45, S + 0.02, -0.45, -4.2, S + 0.62, 0.45, 0.06, fab);
  ir('fabric', -2.2, S + 0.02, -0.45, -1.95, S + 0.62, 0.45, 0.06, fab);
  ir('fabric', -4.0, S + 0.42, -0.2, -3.5, S + 0.7, 0.2, 0.08, fab2);
  ir('fabric', -2.9, S + 0.42, -0.2, -2.4, S + 0.7, 0.2, 0.08, fab3);
  ib('wood', -3.9, S + 0.38, 1.0, -2.6, S + 0.43, 1.7);
  for (const [x, z] of [
    [-3.85, 1.05],
    [-2.65, 1.05],
    [-3.85, 1.65],
    [-2.65, 1.65],
  ] as const)
    ib('frame', x, S, z, x + 0.05, S + 0.38, z + 0.05);
  ib('wood', -4.86, S, 1.9, -4.4, S + 0.5, 3.7);
  ib('frame', -4.86, S + 0.75, 2.3, -4.8, S + 1.25, 3.3);
  ib('wood', -1.9, S + 0.72, 2.2, 0.0, S + 0.77, 3.4);
  for (const [x, z] of [
    [-1.88, 2.22],
    [-0.07, 2.22],
    [-1.88, 3.33],
    [-0.07, 3.33],
  ] as const)
    ib('frame', x, S, z, x + 0.05, S + 0.72, z + 0.05);
  for (const [x, z] of [
    [-1.4, 1.85],
    [-0.5, 1.85],
    [-1.4, 3.7],
    [-0.5, 3.7],
  ] as const)
    ir('fabric', x - 0.22, S, z - 0.2, x + 0.22, S + 0.46, z + 0.2, 0.05, fab);
  ic('concrete', 0.95, S, 3.3, 0.18, 0.34);
  fin.sph('leaf', mx(0.95), S + 0.75, 3.3, 0.38, 0.5, 0.38, 0x4f6b44);
  ic('brass', -4.5, S, 0.2, 0.02, 1.4);
  fin.sph('lamp', mx(-4.5), S + 1.5, 0.2, 0.17, 0.13, 0.17);

  // kitchen (unit A back-left)
  ib('wood', -4.1, S, -3.85, -1.3, S + 0.88, -3.25);
  ib('plasterDark', -4.15, S + 0.88, -3.9, -1.25, S + 0.93, -3.2);
  ib('frame', -3.4, S + 0.93, -3.7, -2.7, S + 0.945, -3.3);
  ir('steel', -4.85, S, -3.85, -4.15, S + 1.25, -3.2, 0.03);
  ib('wood', -3.9, S, -2.3, -2.2, S + 0.88, -1.5);
  ib('plasterDark', -3.95, S + 0.88, -2.35, -2.15, S + 0.93, -1.45);
  ic('wood', -3.6, S, -1.15, 0.15, 0.6);
  ic('wood', -2.7, S, -1.15, 0.15, 0.6);
  ib('wood', -4.1, S + 1.2, -3.88, -1.3, S + 1.25, -3.6, 0xd9d6cf);

  // bath (unit A back-right)
  ir('porcelain', -1.0, S + 0.035, -3.85, 0.75, S + 0.55, -3.1, 0.1);
  ib('wood', 0.95, S + 0.035, -2.9, 1.3, S + 0.85, -1.6);
  ir('porcelain', 0.9, S + 0.85, -2.6, 1.3, S + 0.94, -1.9, 0.05);
  ir('porcelain', -1.0, S + 0.035, -1.55, -0.55, S + 0.42, -0.95, 0.08);
  ir('porcelain', -1.0, S + 0.42, -1.55, -0.55, S + 0.78, -1.4, 0.05);

  // bedroom (unit B front)
  ib('fabric', 3.0, S + 0.02, -0.4, 6.1, S + 0.035, 2.8, fab3);
  ir('wood', 3.0, S + 0.035, -0.45, 5.0, S + 0.35, 1.75, 0.04);
  ir('fabric', 3.05, S + 0.35, -0.4, 4.95, S + 0.6, 1.7, 0.1, 0xe9e6e0);
  ir('fabric', 3.05, S + 0.45, 0.65, 4.95, S + 0.66, 1.72, 0.06, fab2);
  ir('fabric', 3.2, S + 0.6, -0.3, 3.9, S + 0.78, 0.2, 0.08, 0xf1efea);
  ir('fabric', 4.1, S + 0.6, -0.3, 4.8, S + 0.78, 0.2, 0.08, 0xf1efea);
  ib('wood', 2.95, S + 0.35, -0.5, 5.05, S + 0.98, -0.42);
  ib('wood', 2.45, S + 0.035, -0.5, 2.9, S + 0.46, 0.0);
  ib('wood', 5.1, S + 0.035, -0.5, 5.55, S + 0.46, 0.0);
  ic('brass', 2.68, S + 0.46, -0.25, 0.025, 0.22);
  fin.sph('lamp', mx(2.68), S + 0.78, -0.25, 0.1);
  ic('brass', 5.33, S + 0.46, -0.25, 0.025, 0.22);
  fin.sph('lamp', mx(5.33), S + 0.78, -0.25, 0.1);
  ib('wood', 6.4, S + 0.035, -0.5, 7.6, S + 1.9, 0.15);
  ir('fabric', 6.0, S + 0.035, 3.0, 6.9, S + 0.45, 3.75, 0.12, fab);
  ir('fabric', 6.0, S + 0.3, 3.5, 6.9, S + 0.85, 3.8, 0.1, fab);
  ic('concrete', 2.2, S + 0.035, 3.4, 0.16, 0.3);
  fin.sph('leaf', mx(2.2), S + 0.7, 3.4, 0.34, 0.46, 0.34, 0x5a7550);

  // home office (unit B back)
  ib('wood', 5.0, S + 0.72, -3.85, 6.9, S + 0.76, -3.15);
  for (const [x, z] of [
    [5.0, -3.83],
    [6.85, -3.83],
    [5.0, -3.2],
    [6.85, -3.2],
  ] as const)
    ib('frame', x, S, z, x + 0.05, S + 0.72, z + 0.05);
  ib('frame', 5.6, S + 0.76, -3.75, 6.3, S + 1.2, -3.7);
  ic('frame', 5.95, S + 0.76, -3.6, 0.1, 0.03);
  ic('frame', 5.95, S, -2.65, 0.04, 0.45);
  ir('fabric', 5.65, S + 0.45, -2.95, 6.25, S + 0.55, -2.35, 0.06, fab);
  ib('wood', 1.55, S + 0.035, -3.85, 1.95, S + 1.9, -1.4);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 7; j++)
      ib(
        'fabric',
        1.6,
        S + 0.2 + i * 0.4,
        -3.8 + j * 0.3 + (i % 2) * 0.03,
        1.9,
        S + 0.2 + i * 0.4 + 0.22 + (j % 3) * 0.04,
        -3.8 + j * 0.3 + 0.2,
        BOOKS[(i * 3 + j) % BOOKS.length],
      );
  ib('fabric', 3.0, S + 0.02, -3.0, 4.8, S + 0.035, -1.2, fab2);

  const group = new THREE.Group();
  const c = core.build(),
    f = fin.build({ transparent: true });
  group.add(c.group, f.group);
  group.scale.setScalar(M);
  return { group, core: c, fin: f };
}

export function buildRoof(signTex?: THREE.Texture): Floor {
  const core = new Kit(),
    fin = new Kit();
  core.box('concrete', X0 - 0.2, 0, Z0 - 0.2, X1 + 0.2, S, Z1 + 0.2);
  const ph = 0.55,
    pt = 0.25;
  core.box('plaster', X0 - 0.1, S, Z1 - pt, X1 + 0.1, S + ph, Z1 + 0.1);
  core.box('plaster', X0 - 0.1, S, Z0 - 0.1, X1 + 0.1, S + ph, Z0 + pt);
  core.box('plaster', X0 - 0.1, S, Z0, X0 + pt - 0.1, S + ph, Z1);
  core.box('plaster', X1 - pt + 0.1, S, Z0, X1 + 0.1, S + ph, Z1);
  core.box('plasterDark', X0, 0, Z1 - WT, -5.2, 1.15, 6.6);
  fin.box('concrete', X0 - 0.2, 1.15, Z1 - WT - 0.2, -5.0, 1.3, 6.8);
  fin.box('frame', X0 - 0.12, S + ph, Z1 - pt - 0.02, X1 + 0.12, S + ph + 0.05, Z1 + 0.12);
  fin.box('frame', X0 - 0.12, S + ph, Z0 - 0.12, X1 + 0.12, S + ph + 0.05, Z0 + pt + 0.02);
  fin.box('frame', X0 - 0.12, S + ph, Z0, X0 + pt, S + ph + 0.05, Z1);
  fin.box('frame', X1 - pt, S + ph, Z0, X1 + 0.12, S + ph + 0.05, Z1);
  fin.box('timber', X0, 0.1, 6.6, -7.35, 1.05, 6.67);
  fin.box('timber', -5.85, 0.1, 6.6, -5.2, 1.05, 6.67);
  fin.box('glass', -7.2, 0.3, 6.6, -6.0, 0.95, 6.64);
  fin.box('sedum', -4.6, S, -3.4, 1.4, S + 0.08, 2.2);
  for (let i = 0; i < 4; i++)
    fin.tilt('frame', 2.2 + i * 1.35, S + 0.35, -3.0, 3.35 + i * 1.35, S + 0.4, -1.2, -0.3, 0, 0x1d2b44);
  fin.box('concrete', 2.2, S, -3.1, 7.4, S + 0.18, -1.1, 0xa9a8a4);
  fin.cyl('steel', -2.2, S, 3.0, 0.12, 0.7);
  fin.cyl('steel', 0.2, S, 3.2, 0.1, 0.5);
  fin.box('plasterDark', 6.3, S, 0.2, 7.4, S + 0.9, 1.3);
  fin.box('glass', -1.2, S, -0.2, 0.2, S + 0.2, 1.1);
  // sign mast
  fin.box('frame', 0.4, S, 3.0, 0.5, S + 1.9, 3.1);
  fin.box('frame', 4.1, S, 3.0, 4.2, S + 1.9, 3.1);
  fin.box('plasterDark', 0.3, S + 1.1, 3.0, 4.3, S + 1.9, 3.12);
  const c = core.build(),
    f = fin.build({ transparent: true });
  if (signTex) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 0.72),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, metalness: 0.2 }),
    );
    sign.position.set(2.3, S + 1.5, 3.125);
    f.group.add(sign);
  }
  const group = new THREE.Group();
  group.add(c.group, f.group);
  group.scale.setScalar(M);
  return { group, core: c, fin: f };
}

export function makeSignTexture(text: string) {
  const c = document.createElement('canvas');
  c.width = 1560;
  c.height = 288;
  const g = c.getContext('2d')!;
  g.fillStyle = '#2a2d32';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#c4a46c';
  g.font = '300 150px "Hanken Grotesk Variable", "Hanken Grotesk", sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  (g as unknown as { letterSpacing: string }).letterSpacing = '38px';
  g.fillText(text.toUpperCase(), c.width / 2 + 19, c.height / 2 + 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Concrete plinth under the ground floor. */
export function buildPlinth(): Built {
  const k = new Kit();
  k.box('concrete', X0 - 0.9, -0.5, Z0 - 0.9, X1 + 0.9, 0, 8.4);
  const b = k.build({ scale: M });
  return b;
}

/** Siedlung neighbours: shared materials, no layers. Dimensions in metres. */
export function buildNeighbour(w: number, d: number, floors: number, variant: number): Built {
  const k = new Kit();
  const h = floors * FH,
    hw = w / 2,
    hd = d / 2;
  const win = (cx: number, y0: number, z: number, ww: number, wh: number, out: 1 | -1, axis: 'x' | 'z' = 'x') => {
    const B = (
      m: Parameters<Kit['box']>[0],
      a0: number,
      yy0: number,
      b0: number,
      a1: number,
      yy1: number,
      b1: number,
    ) => (axis === 'x' ? k.box(m, a0, yy0, b0, a1, yy1, b1) : k.box(m, b0, yy0, a0, b1, yy1, a1));
    const o = out;
    B('frame', cx - ww / 2 - 0.06, y0 - 0.06, z, cx + ww / 2 + 0.06, y0 + wh + 0.06, z + 0.1 * o);
    B('glass', cx - ww / 2, y0, z + 0.1 * o, cx + ww / 2, y0 + wh, z + 0.115 * o);
    B('frame', cx - 0.02, y0, z, cx + 0.02, y0 + wh, z + 0.13 * o);
    B('concrete', cx - ww / 2 - 0.1, y0 - 0.12, z, cx + ww / 2 + 0.1, y0 - 0.06, z + 0.2 * o);
  };
  const facades = (xs: number[], fl: number, y0: number, ww: number, wh: number) => {
    for (let f = 0; f < fl; f++)
      for (const x of xs) {
        win(x, y0 + f * FH + 0.9, hd, ww, wh, 1);
        win(x, y0 + f * FH + 1.0, -hd, ww * 0.8, wh * 0.85, -1);
      }
  };
  const cols = (n: number, margin: number) =>
    Array.from({ length: n }, (_, i) => -hw + margin + ((w - 2 * margin) / (n - 1 || 1)) * i);

  if (variant === 1) {
    // gabled house
    const fl = Math.min(floors, 2),
      hh = fl * FH;
    k.box('plaster', -hw, 0, -hd, hw, hh, hd);
    k.gable('roof', -hw, hh, -hd, hw, hd, 3.2, 'x', 0.5);
    k.box('plasterDark', hw - 2.6, hh, -0.8, hw - 1.8, hh + 3.2, 0.1);
    for (let f = 0; f < fl; f++)
      for (const x of [-hw + 2.2, 0.2, hw - 2.4]) {
        win(x, f * FH + 0.9, hd, 1.5, 1.4, 1);
        win(x, f * FH + 1, -hd, 1.3, 1.2, -1);
      }
    k.box('timber', -hw + 0.9, 0, hd, -hw + 2.0, 2.3, hd + 0.1);
    k.box('concrete', -hw + 0.6, 0, hd, -hw + 2.3, 0.18, hd + 1.4);
    k.box('frame', -hw + 0.6, 2.5, hd, -hw + 2.3, 2.58, hd + 1.4);
    k.box('timber', hw, 0.1, -hd + 1, hw + 0.08, hh - 0.3, hd - 1);
    k.box('timber', hw - 1.2, hh + 0.1, hd - 0.2, hw - 0.1, hh + 2.0, hd + 0.05);
  } else if (variant === 2) {
    // stepped, penthouse + balconies
    k.box('plaster', -hw, 0, -hd, hw, h, hd);
    facades(cols(Math.max(3, Math.round(w / 3.4)), 1.8), floors, 0, 1.7, 1.4);
    k.box('plasterDark', -hw + 2.0, h, -hd + 1.2, hw - 1.6, h + 2.7, hd - 1.4);
    k.box('glass', -hw + 2.4, h + 0.4, hd - 1.42, hw - 2.0, h + 2.3, hd - 1.38);
    k.box('concrete', -hw + 1.6, h + 2.7, -hd + 0.8, hw - 1.2, h + 2.9, hd - 0.6);
    for (let f = 1; f < floors; f++) {
      k.box('concrete', 0, f * FH - 0.14, hd, hw - 0.4, f * FH + 0.1, hd + 1.4);
      k.box('glass', 0, f * FH + 0.1, hd + 1.36, hw - 0.4, f * FH + 1.1, hd + 1.4);
    }
    k.box('timber', -hw, 0, hd - 0.05, -hw + 2.2, h, hd + 0.08);
  } else if (variant === 3) {
    // timber-clad townhouse
    k.box('plaster', -hw, 0, -hd, hw, h, hd);
    k.box('timber', -hw - 0.04, 0, hd - 0.1, hw + 0.04, FH, hd + 0.08);
    facades(cols(Math.max(3, Math.round(w / 3.4)), 1.8), floors, 0, 1.7, 1.4);
    k.box('concrete', -hw - 0.1, h, -hd - 0.1, hw + 0.1, h + 0.18, hd + 0.1);
    k.box('membrane', -hw + 0.3, h + 0.18, -hd + 0.3, hw - 0.3, h + 0.22, hd - 0.3, 0x5a5d62);
    k.box('plasterDark', -hw + 0.5, h, -hd + 0.5, -hw + 3.4, h + 1.0, hd - 0.5);
    for (let i = 0; i < 3; i++)
      k.tilt('frame', 1.2 + i * 1.5, h + 0.55, -1.6, 2.5 + i * 1.5, h + 0.6, 0.6, -0.3, 0, 0x1d2b44);
  } else {
    // modern flat
    k.box('plaster', -hw, 0, -hd, hw, h, hd);
    facades(cols(Math.max(3, Math.round(w / 3.2)), 1.6), floors, 0, 1.9, 1.5);
    for (let f = 1; f < floors; f++)
      k.box('concrete', -hw - 0.1, f * FH - 0.18, -hd - 0.1, hw + 0.1, f * FH + 0.1, hd + 0.1);
    k.box('concrete', -hw - 0.1, h, -hd - 0.1, hw + 0.1, h + 0.16, hd + 0.1);
    k.box('membrane', -hw + 0.3, h + 0.16, -hd + 0.3, hw - 0.3, h + 0.2, hd - 0.3, 0x5a5d62);
    k.box('plasterDark', -hw, 0, hd - 0.05, -hw + 2.8, h + 1.0, hd + 1.4);
    k.box('timber', hw, 0.1, -hd + 1.0, hw + 0.08, h - 0.3, hd - 1.0);
    k.box('sedum', -hw + 3.2, h, -hd + 0.5, hw - 0.5, h + 0.1, hd - 0.5);
  }
  return k.build({ scale: M, share: true });
}
