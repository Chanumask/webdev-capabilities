import { Kit, type Built } from './kit';
import { M } from './building';

function tree(k: Kit, x: number, z: number, s = 1, tone = 0) {
  const greens = [
    [0x5f7658, 0x53684c, 0x6c8263, 0x4a5d45, 0x73896a],
    [0x687d60, 0x5a7052, 0x788d6a, 0x4f6447, 0x6f8564],
    [0x566b50, 0x4a5e45, 0x647a5a, 0x5c7253, 0x71866a],
  ][tone % 3];
  let seed = Math.floor(Math.abs(x * 13 + z * 7)) + 3;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // tapering trunk with two leaning branches
  k.cyl('wood', x, 0, z, 0.22 * s, 3.4 * s, 0x4f4036, 'y', 0.12 * s, 10);
  for (const [dx, dz, lean] of [
    [0.45, 0.1, 0.5],
    [-0.4, -0.25, -0.5],
  ] as const) {
    k.tilt(
      'wood',
      x + dx * s - 0.06 * s,
      3.1 * s,
      z + dz * s - 0.06 * s,
      x + dx * s + 0.06 * s,
      4.7 * s,
      z + dz * s + 0.06 * s,
      0,
      lean,
      0x4f4036,
    );
  }
  // canopy: many small clusters, denser at the top, irregular outline
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2,
      t = rnd();
    const rr = Math.sqrt(t) * 1.65 * s * (1 - 0.35 * t),
      y = (3.9 + rnd() * 3.1) * s;
    const r = (0.45 + rnd() * 0.5) * s * (1.1 - 0.35 * (y / (7 * s)));
    k.sph('leaf', x + Math.cos(a) * rr, y, z + Math.sin(a) * rr, r, r * 0.82, r, greens[Math.floor(rnd() * 5)], 1);
  }
}
function lamp(k: Kit, x: number, z: number, h = 6) {
  k.cyl('frame', x, 0, z, 0.1, h);
  k.box('frame', x - 0.05, h - 0.1, z - 0.05, x + 1.4, h, z + 0.05);
  k.rbox('steel', x + 1.1, h - 0.28, z - 0.2, x + 1.7, h - 0.1, z + 0.2, 0.06);
  k.box('lamp', x + 1.15, h - 0.3, z - 0.15, x + 1.65, h - 0.28, z + 0.15);
}
function car(k: Kit, x: number, z: number, body: number, len = 4.4) {
  const hl = len / 2;
  k.rbox('paintW', x - hl, 0.32, z - 0.88, x + hl, 0.88, z + 0.88, 0.18, body);
  k.rbox('paintW', x - hl * 0.78, 0.84, z - 0.8, x + hl * 0.5, 1.42, z + 0.8, 0.22, body);
  k.tilt('glass', x + hl * 0.46, 0.86, z - 0.74, x + hl * 0.62, 1.4, z + 0.74, 0, -0.9, 0x20262e);
  k.box('glass', x - hl * 0.7, 0.98, z - 0.81, x + hl * 0.4, 1.34, z + 0.81, 0x20262e);
  k.box('frame', x - hl * 0.7, 0.9, z - 0.82, x + hl * 0.4, 0.97, z + 0.82);
  for (const wx of [x - hl * 0.62, x + hl * 0.62])
    for (const sz of [-0.88, 0.88]) {
      k.cyl('frame', wx, 0.4, z + sz * 1.0, 0.42, 0.06, undefined, 'z', 0.42, 12);
      k.cyl('rubber', wx, 0.36, z + sz, 0.36, 0.26, undefined, 'z');
      k.cyl('steel', wx, 0.36, z + sz + Math.sign(sz) * 0.14, 0.18, 0.04, undefined, 'z');
    }
  k.sph('lamp', x + hl - 0.04, 0.62, z - 0.62, 0.1, 0.07, 0.16);
  k.sph('lamp', x + hl - 0.04, 0.62, z + 0.62, 0.1, 0.07, 0.16);
  k.box('brass', x - hl - 0.02, 0.58, z - 0.7, x - hl + 0.04, 0.7, z + 0.7, 0x7a2a22);
}

/** Lawn, path, hedges, planting and trees around the finished house (fades in at the end). */
export function buildLandscape(): Built {
  const k = new Kit();
  k.box('grass', -13, 0, -9, 13, 0.05, 11.8, 0x8c9c7c);
  k.box('concrete', -7.8, 0.05, 8.1, -5.2, 0.1, 11.8, 0xaeada8);
  k.box('concrete', -7.8, 0.05, 6.6, -5.2, 0.1, 8.1, 0xaeada8);
  k.box('concrete', 3.6, 0.05, 6.2, 8.4, 0.09, 8.2, 0xaeada8);
  for (const [x0, x1] of [
    [-13, -9.6],
    [-3.4, 3.2],
    [9.6, 13],
  ] as const)
    k.rbox('leaf', x0, 0, 11.2, x1, 0.95, 11.8, 0.2, 0x4f6249);
  for (const x of [-4.4, -3.0, -1.6, -0.2, 1.2, 2.6]) k.sph('leaf', x, 0.5, 7.4, 0.55, 0.5, 0.55, 0x5a6f50);
  for (const x of [9, 10.4]) k.sph('leaf', x, 0.5, 7.6, 0.5, 0.45, 0.5, 0x687d5c);
  for (const [x, z] of [
    [-4.6, 8.6],
    [-8.8, 8.4],
  ] as const) {
    k.cyl('frame', x, 0.05, z, 0.04, 0.6);
    k.box('lamp', x - 0.12, 0.66, z - 0.12, x + 0.12, 0.72, z + 0.12);
  }
  tree(k, 12.2, -3.5, 1.05, 0);
  tree(k, -12.0, -4.5, 1.1, 1);
  tree(k, 4.0, -7.8, 0.95, 2);
  tree(k, -4.5, -8.0, 0.9, 0);
  return k.build({ scale: M });
}

/** Street, pavements, trees, lamps and parked cars for the pull-back view. Shared materials. */
export function buildStreet(): Built {
  const k = new Kit();
  k.box('concrete', -110, 0, 12.2, 110, 0.14, 13.8, 0xa7a6a2);
  k.box('asphalt', -110, 0, 13.8, 110, 0.1, 19.8);
  k.box('concrete', -110, 0, 19.8, 110, 0.14, 21.4, 0xa7a6a2);
  for (let x = -108; x < 108; x += 6) k.box('paintW', x, 0.1, 16.7, x + 3, 0.11, 16.9);
  for (let x = -100; x < 105; x += 11) {
    const tx = x + (Math.abs(x) % 5);
    if (Math.abs(tx) > 17) tree(k, tx, 12.9, 0.9, Math.abs(Math.round(x / 11)) % 3);
  }
  for (let x = -96; x < 105; x += 22) lamp(k, x, 12.8);
  const cols = [0xd8d9db, 0x6a7078, 0x8d9299, 0x4d6a8c, 0xb7b9bc];
  [-50, -28, -9, 31, 52, 70].forEach((x, i) => car(k, x, 15.1, cols[i % cols.length]));
  [-60, -18, 16, 44].forEach((x, i) => car(k, x, 18.6, cols[(i + 2) % cols.length]));
  return k.build({ scale: M, share: true });
}
