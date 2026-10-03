import * as THREE from 'three';
import { Kit } from './kit';
import { M } from './building';

const grp = (...c: THREE.Object3D[]) => { const g = new THREE.Group(); g.add(...c); return g; };
const built = (k: Kit) => k.build().group;

/* ---------------------------------------------------------------- excavator (faces +x) */
export interface Excavator { root: THREE.Group; turret: THREE.Group; boom: THREE.Group; stick: THREE.Group; bucket: THREE.Group }
export function buildExcavator(): Excavator {
  const k = new Kit();
  for (const z of [-1.15, 1.15]) {
    k.rbox('rubber', -2.2, 0, z - 0.42, 2.2, 0.95, z + 0.42, 0.3);
    k.cyl('steel', 1.75, 0.48, z, 0.34, 0.86, undefined, 'z');
    k.cyl('steel', -1.75, 0.48, z, 0.34, 0.86, undefined, 'z');
    k.box('steel', -1.7, 0.95, z - 0.38, 1.7, 1.0, z + 0.38);
  }
  k.box('paintG', -1.7, 0.6, -0.85, 1.7, 1.1, 0.85);
  const turret = new THREE.Group();
  const u = new Kit();
  u.rbox('paintY', -1.7, 1.05, -1.3, 1.3, 2.0, 1.3, 0.14);
  u.rbox('paintG', -2.3, 1.1, -1.2, -1.65, 2.05, 1.2, 0.12);
  u.rbox('paintY', -1.65, 2.0, 0.15, -0.3, 2.55, 1.25, 0.12);
  u.box('frame', 0.1, 2.0, -1.3, 1.35, 2.08, -0.1);
  u.box('glass', 0.18, 2.1, -1.26, 1.3, 3.15, -0.14);
  for (const [x, z] of [[0.12, -1.28], [1.3, -1.28], [0.12, -0.16], [1.3, -0.16]] as const) u.box('frame', x - 0.04, 2.05, z - 0.04, x + 0.04, 3.2, z + 0.04);
  u.box('frame', 0.05, 3.15, -1.35, 1.4, 3.25, -0.05);
  u.cyl('steel', -1.1, 2.55, 0.8, 0.07, 0.9);
  u.box('steel', 1.3, 1.3, -0.4, 1.9, 1.7, 0.7);
  turret.add(built(u));
  const boom = new THREE.Group(); boom.position.set(1.2, 1.5, 0.35);
  const b = new Kit(); b.box('paintY', 0, -0.3, -0.3, 2.6, 0.3, 0.3); b.tilt('paintY', 2.2, 0.15, -0.3, 4.8, 0.75, 0.3, 0, 0.0); b.box('steel', 0.4, -0.5, -0.12, 2.3, -0.38, -0.05);
  boom.add(built(b));
  const stick = new THREE.Group(); stick.position.set(4.7, 0.4, 0);
  const s = new Kit(); s.box('paintY', 0, -0.2, -0.2, 3.0, 0.2, 0.2); s.box('steel', 0.3, 0.25, -0.1, 2.0, 0.34, -0.03);
  stick.add(built(s));
  const bucket = new THREE.Group(); bucket.position.set(3.0, 0, 0);
  const c = new Kit(); c.rbox('steel', -0.15, -0.95, -0.6, 0.95, 0.05, 0.6, 0.08, 0x6d7076);
  for (let i = 0; i < 5; i++) c.box('steel', 0.85, -0.95, -0.55 + i * 0.27, 1.12, -0.82, -0.45 + i * 0.27);
  bucket.add(built(c));
  stick.add(bucket); boom.add(stick); turret.add(boom);
  const root = grp(built(k), turret);
  root.scale.setScalar(M);
  return { root, turret, boom, stick, bucket };
}

/* ---------------------------------------------------------------- tipper truck (faces +x) */
export interface Dumper { root: THREE.Group; bed: THREE.Group; load: THREE.Object3D }
function wheels(k: Kit, xs: number[], zOff = 1.05, r = 0.58) {
  for (const x of xs) for (const z of [-zOff, zOff]) {
    k.cyl('rubber', x, r, z, r, 0.46, undefined, 'z');
    k.cyl('steel', x, r, z + Math.sign(z) * 0.24, 0.26, 0.06, undefined, 'z');
  }
}
export function buildDumper(): Dumper {
  const k = new Kit();
  k.box('paintG', -3.6, 0.6, -0.85, 3.3, 0.95, 0.85);
  wheels(k, [2.3, -2.4, -3.6]);
  k.rbox('paintW', 1.7, 0.95, -1.25, 3.5, 2.95, 1.25, 0.15);
  k.box('glass', 3.48, 1.8, -1.05, 3.54, 2.75, 1.05);
  k.box('glass', 2.0, 1.9, -1.28, 3.4, 2.75, -1.24); k.box('glass', 2.0, 1.9, 1.24, 3.4, 2.75, 1.28);
  k.box('frame', 3.45, 1.0, -1.1, 3.62, 1.5, 1.1);
  k.sph('lamp', 3.55, 1.2, -0.85, 0.12, 0.1, 0.1); k.sph('lamp', 3.55, 1.2, 0.85, 0.12, 0.1, 0.1);
  k.box('paintG', 1.6, 2.95, -1.3, 3.6, 3.05, 1.3);
  k.cyl('steel', 1.75, 2.95, 1.35, 0.07, 1.0);
  const bed = new THREE.Group(); bed.position.set(-3.7, 1.0, 0);
  const b = new Kit();
  b.box('paintG', 0, 0, -1.3, 5.4, 0.14, 1.3);
  b.box('paintW', 0, 0.14, -1.3, 5.4, 1.45, -1.2); b.box('paintW', 0, 0.14, 1.2, 5.4, 1.45, 1.3);
  b.box('paintW', 5.2, 0.14, -1.3, 5.4, 2.1, 1.3); b.box('paintW', -0.05, 0.14, -1.3, 0.05, 1.45, 1.3);
  for (let x = 0.6; x < 5.2; x += 1.2) { b.box('steel', x, 0.14, -1.33, x + 0.08, 1.45, -1.3); b.box('steel', x, 0.14, 1.3, x + 0.08, 1.45, 1.33); }
  const bedMesh = built(b);
  const l = new Kit();
  l.box('soil', 0.15, 0.14, -1.15, 5.15, 0.95, 1.15, 0x6a5e50);
  l.sph('soil', 1.6, 0.95, 0, 1.4, 0.55, 0.95, 0x70645a); l.sph('soil', 3.5, 0.95, 0.1, 1.5, 0.6, 1.0, 0x6a5e50);
  const load = built(l);
  bed.add(bedMesh, load);
  const root = grp(built(k), bed);
  root.scale.setScalar(M);
  return { root, bed, load };
}

/* ---------------------------------------------------------------- concrete mixer (faces +x) */
export interface Mixer { root: THREE.Group; drum: THREE.Group }
export function buildMixer(): Mixer {
  const k = new Kit();
  k.box('paintG', -3.8, 0.6, -0.85, 3.4, 0.95, 0.85);
  wheels(k, [2.4, -2.2, -3.4]);
  k.rbox('paintW', 1.9, 0.95, -1.25, 3.6, 2.95, 1.25, 0.15);
  k.box('glass', 3.58, 1.8, -1.05, 3.64, 2.75, 1.05); k.box('glass', 2.1, 1.9, -1.28, 3.5, 2.75, -1.24); k.box('glass', 2.1, 1.9, 1.24, 3.5, 2.75, 1.28);
  k.box('frame', 3.55, 1.0, -1.1, 3.72, 1.5, 1.1);
  k.sph('lamp', 3.65, 1.2, -0.85, 0.12, 0.1, 0.1); k.sph('lamp', 3.65, 1.2, 0.85, 0.12, 0.1, 0.1);
  k.box('paintG', -3.2, 0.95, -0.7, 1.7, 1.45, 0.7);
  k.tilt('steel', -4.9, 1.2, -0.25, -3.6, 1.35, 0.25, 0, -0.55);
  const tilt = new THREE.Group(); tilt.position.set(-0.8, 2.15, 0); tilt.rotation.z = 0.2;
  const drum = new THREE.Group();
  const d = new Kit();
  d.cyl('paintW', 0, 0, 0, 1.3, 5.6, undefined, 'x', 0.5, 28);
  d.cyl('steel', 2.6, 0, 0, 0.5, 0.3, undefined, 'x', 0.35, 20);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; d.box('paintG', -2.4, Math.sin(a) * 1.28 - 0.05, Math.cos(a) * 1.28 - 0.05, 2.0, Math.sin(a) * 1.28 + 0.05, Math.cos(a) * 1.28 + 0.05); }
  d.cyl('paintY', -1.4, 0, 0, 1.33, 0.4, undefined, 'x');
  drum.add(built(d));
  tilt.add(drum);
  const root = grp(built(k), tilt);
  root.scale.setScalar(M);
  return { root, drum };
}

/* ---------------------------------------------------------------- tower crane */
export interface Crane { root: THREE.Group; slew: THREE.Group; trolley: THREE.Group; cable: THREE.Mesh; hook: THREE.Group; load: THREE.Object3D; jibLen: number; mastH: number }
export function buildCrane(): Crane {
  const k = new Kit();
  const mastH = 19, sec = 1.5, bay = 2.4;
  k.box('concrete', -3, 0, -3, 3, 1.1, 3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box('paintY', sx * sec / 2 - 0.08, 1.1, sz * sec / 2 - 0.08, sx * sec / 2 + 0.08, mastH, sz * sec / 2 + 0.08);
  for (let y = 1.1; y < mastH - 0.5; y += bay) {
    k.box('paintY', -sec / 2, y, -sec / 2 - 0.03, sec / 2, y + 0.08, -sec / 2 + 0.03); k.box('paintY', -sec / 2, y, sec / 2 - 0.03, sec / 2, y + 0.08, sec / 2 + 0.03);
    k.box('paintY', -sec / 2 - 0.03, y, -sec / 2, -sec / 2 + 0.03, y + 0.08, sec / 2); k.box('paintY', sec / 2 - 0.03, y, -sec / 2, sec / 2 + 0.03, y + 0.08, sec / 2);
    const rot = Math.atan2(bay, sec), len = Math.hypot(bay, sec);
    const flip = Math.floor(y / bay) % 2 ? 1 : -1;
    const ang = flip * (Math.PI / 2 - rot);
    k.tilt('paintY', -0.03, y + bay / 2 - len / 2, sec / 2, 0.03, y + bay / 2 + len / 2, sec / 2 + 0.03, 0, ang);
    k.tilt('paintY', -0.03, y + bay / 2 - len / 2, -sec / 2 - 0.03, 0.03, y + bay / 2 + len / 2, -sec / 2, 0, -ang);
    k.tilt('paintY', sec / 2, y + bay / 2 - len / 2, -0.03, sec / 2 + 0.03, y + bay / 2 + len / 2, 0.03, ang, 0);
    k.tilt('paintY', -sec / 2 - 0.03, y + bay / 2 - len / 2, -0.03, -sec / 2, y + bay / 2 + len / 2, 0.03, -ang, 0);
  }
  const slew = new THREE.Group(); slew.position.y = mastH;
  const s = new Kit();
  s.box('paintG', -1.2, 0, -1.2, 1.2, 0.5, 1.2);
  s.rbox('paintW', -0.6, 0.5, 0.2, 1.4, 2.3, 1.5, 0.1); s.box('glass', -0.5, 0.8, 1.45, 1.3, 2.1, 1.52);
  const jibLen = 18;
  s.box('paintY', -0.1, 0.5, -0.35, jibLen, 0.65, -0.22); s.box('paintY', -0.1, 0.5, 0.22, jibLen, 0.65, 0.35);
  s.box('paintY', 0, 1.65, -0.06, jibLen - 2, 1.78, 0.06);
  for (let x = 0; x < jibLen - 2; x += 1.6) { s.tilt('paintY', x, 0.55, -0.04, x + 0.07, 1.75, 0.04, 0, -0.5 * (Math.floor(x / 1.6) % 2 ? 1 : -1)); s.box('paintY', x, 0.55, -0.3, x + 0.05, 0.62, 0.3); }
  s.box('paintY', -8.5, 0.5, -0.35, -0.1, 0.65, -0.22); s.box('paintY', -8.5, 0.5, 0.22, -0.1, 0.65, 0.35);
  for (let x = -8.2; x < -0.4; x += 1.4) s.box('paintY', x, 0.5, -0.3, x + 0.05, 1.25, -0.25);
  s.box('concrete', -8.0, 0.65, -0.8, -5.2, 1.7, 0.8); s.box('concrete', -5.2, 0.65, -0.8, -3.0, 1.7, 0.8, 0xa7a6a2);
  s.tilt('paintY', -0.5, 2.0, -0.08, 0.5, 6.6, 0.08, 0, 0.0);
  s.box('paintY', -0.12, 0.5, -0.12, 0.12, 6.4, 0.12);
  s.box('steel', -0.02, 6.2, -0.02, jibLen * 0.7, 6.24, 0.02); s.box('steel', -9, 3.5, -0.02, -0.0, 3.54, 0.02);
  slew.add(built(s));
  const trolley = new THREE.Group(); trolley.position.set(8, 0.4, 0);
  const t = new Kit(); t.box('paintG', -0.4, 0, -0.5, 0.4, 0.3, 0.5); t.box('steel', -0.3, -0.05, -0.4, 0.3, 0, 0.4);
  trolley.add(built(t));
  const cableK = new Kit(); cableK.box('steel', -0.015, -1, -0.015, 0.015, 0, 0.015);
  const cable = built(cableK).children[0] as THREE.Mesh;
  const hook = new THREE.Group();
  const h = new Kit(); h.box('paintY', -0.3, -0.5, -0.2, 0.3, 0, 0.2); h.box('steel', -0.04, -0.9, -0.04, 0.04, -0.5, 0.04);
  hook.add(built(h));
  const lk = new Kit();
  lk.box('timber', -0.9, -1.55, -0.6, 0.9, -1.4, 0.6);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) lk.box('concrete', -0.85 + j * 0.43, -1.4 + i * 0.28 - 0.0, -0.55, -0.85 + j * 0.43 + 0.4, -1.4 + i * 0.28 + 0.26, 0.55, 0xb2aaa0);
  const load = built(lk);
  hook.add(load);
  const trollGroup = grp(cable, hook);
  trolley.add(trollGroup);
  slew.add(trolley);
  const root = grp(built(k), slew);
  root.scale.setScalar(M);
  return { root, slew, trolley, cable, hook, load, jibLen, mastH };
}

/* ---------------------------------------------------------------- scaffolding + site props */
export function buildScaffold(): THREE.Group {
  const k = new Kit();
  const seg = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 2.2));
    const dx = (bx - ax) / n, dz = (bz - az) / n;
    for (let i = 0; i <= n; i++) k.box('scaffold', ax + dx * i - 0.05, 0, az + dz * i - 0.05, ax + dx * i + 0.05, 2.9, az + dz * i + 0.05);
    for (const y of [0.0, 1.45]) for (const o of [0.5, 1.0]) {
      const yy = y + o + 0.28;
      if (Math.abs(dx) > Math.abs(dz)) k.box('scaffold', Math.min(ax, bx), yy, az - 0.02, Math.max(ax, bx), yy + 0.05, az + 0.02);
      else k.box('scaffold', ax - 0.02, yy, Math.min(az, bz), ax + 0.02, yy + 0.05, Math.max(az, bz));
    }
    if (Math.abs(dx) > Math.abs(dz)) k.box('glass', Math.min(ax, bx), 0.3, az - 0.015, Math.max(ax, bx), 2.8, az + 0.015, 0x20242a);
    else k.box('glass', ax - 0.015, 0.3, Math.min(az, bz), ax + 0.015, 2.8, Math.max(az, bz), 0x20242a);
    if (Math.abs(dx) > Math.abs(dz)) k.box('timber', Math.min(ax, bx), 0.28, az - 0.35, Math.max(ax, bx), 0.32, az + 0.35, 0x8a7a66);
    else k.box('timber', ax - 0.35, 0.28, Math.min(az, bz), ax + 0.35, 0.32, Math.max(az, bz), 0x8a7a66);
    for (let i = 0; i < n; i += 2) {
      const L = Math.hypot(2.2, 2.5), th = Math.atan2(2.2, 2.5), sgn = i % 4 ? -1 : 1;
      const cx = ax + dx * i + dx, cz = az + dz * i + dz, cy = 1.55;
      if (Math.abs(dx) > Math.abs(dz)) k.tilt('scaffold', cx - 0.025, cy - L / 2, az - 0.025, cx + 0.025, cy + L / 2, az + 0.025, 0, sgn * th);
      else k.tilt('scaffold', ax - 0.025, cy - L / 2, cz - 0.025, ax + 0.025, cy + L / 2, cz + 0.025, sgn * th, 0);
    }
  };
  seg(-8.7, 4.9, -8.7, -4.9); seg(-8.7, -4.9, 8.7, -4.9); seg(8.7, -4.9, 8.7, 6.2);
  seg(8.7, 6.2, -4.5, 6.2); seg(-4.5, 6.2, -4.5, 7.3); seg(-4.5, 7.3, -8.7, 7.3); seg(-8.7, 7.3, -8.7, 4.9);
  const g = built(k);
  const root = grp(g);
  root.scale.setScalar(M);
  return root;
}

export function buildSiteProps(): THREE.Group {
  const k = new Kit();
  // dirt ground
  k.box('soil', -13, -0.02, -9, 13, 0.06, 12);
  // excavation + spoil
  k.box('soil', -9.2, 0.06, -5.6, 9.2, 0.075, 7.6, 0x2e2822);
  for (const [x, z, r] of [[-11, -2, 2.4], [-10.2, 1.4, 1.9], [11.2, -3.4, 2.2]] as const) k.sph('soil', x, 0.1, z, r, r * 0.55, r * 0.9, 0x6b5f52);
  // hoarding fence
  const post = (x: number, z: number) => k.box('steel', x - 0.04, 0, z - 0.04, x + 0.04, 2.0, z + 0.04);
  const panel = (ax: number, az: number, bx: number, bz: number) => {
    const horiz = Math.abs(bx - ax) > Math.abs(bz - az);
    const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), z0 = Math.min(az, bz), z1 = Math.max(az, bz);
    if (horiz) { k.box('steel', x0, 0.1, az - 0.02, x1, 0.14, az + 0.02); k.box('steel', x0, 1.0, az - 0.02, x1, 1.04, az + 0.02); k.box('steel', x0, 1.94, az - 0.02, x1, 1.98, az + 0.02); k.box('plasterDark', x0, 0.14, az - 0.025, x1, 0.6, az + 0.025); for (let x = x0 + 0.2; x < x1; x += 0.22) k.box('steel', x, 0.6, az - 0.01, x + 0.012, 1.96, az + 0.01); }
    else { k.box('steel', ax - 0.02, 0.1, z0, ax + 0.02, 0.14, z1); k.box('steel', ax - 0.02, 1.0, z0, ax + 0.02, 1.04, z1); k.box('steel', ax - 0.02, 1.94, z0, ax + 0.02, 1.98, z1); k.box('plasterDark', ax - 0.025, 0.14, z0, ax + 0.025, 0.6, z1); for (let z = z0 + 0.2; z < z1; z += 0.22) k.box('steel', ax - 0.01, 0.6, z, ax + 0.01, 1.96, z + 0.012); }
  };
  const FX0 = -12.5, FX1 = 12.5, FZ0 = -8.5, FZ1 = 11.5;
  for (let x = FX0; x <= FX1; x += 2.5) { post(x, FZ0); if (!(x > -3 && x < 3)) post(x, FZ1); }
  for (let z = FZ0; z <= FZ1; z += 2.5) { post(FX0, z); post(FX1, z); }
  panel(FX0, FZ0, FX1, FZ0); panel(FX0, FZ0, FX0, FZ1); panel(FX1, FZ0, FX1, FZ1);
  panel(FX0, FZ1, -3, FZ1); panel(3, FZ1, FX1, FZ1);
  // site cabins
  for (const [x, z, c] of [[-10.6, -6.8, 0xdfe1e3], [-7.4, -6.8, 0xd5d8da]] as const) {
    k.box('paintW', x - 1.6, 0.35, z - 1.2, x + 1.6, 2.75, z + 1.2, c);
    k.box('paintG', x - 1.62, 0.3, z - 1.22, x + 1.62, 0.4, z + 1.22);
    k.box('frame', x - 1.2, 1.2, z + 1.2, x - 0.4, 2.2, z + 1.25); k.box('glass', x - 1.15, 1.25, z + 1.24, x - 0.45, 2.15, z + 1.27);
    k.box('frame', x + 0.4, 0.4, z + 1.2, x + 1.0, 2.2, z + 1.26);
    k.box('paintG', x - 1.7, 2.75, z - 1.3, x + 1.7, 2.85, z + 1.3);
  }
  // materials: sand, gravel, pallets, formwork stacks
  k.sph('soil', 10.2, 0.1, 6.5, 1.9, 1.1, 1.5, 0xb3a27d); k.sph('soil', 8.2, 0.1, 8.4, 1.5, 0.8, 1.2, 0x8a8a86);
  for (let i = 0; i < 3; i++) { k.box('timber', 5.6 + i * 1.8, 0.06, -7.6, 7.2 + i * 1.8, 0.22, -6.4); for (let j = 0; j < 4; j++) k.box('concrete', 5.7 + i * 1.8, 0.22 + j * 0.3, -7.5, 7.1 + i * 1.8, 0.5 + j * 0.3, -6.5, 0xb4aca2); }
  for (let i = 0; i < 5; i++) k.box('timber', 2.4, 0.1 + i * 0.12, -8 + 0.0, 5.2, 0.22 + i * 0.12, -7.1 - i * 0.0);
  for (const [x, z] of [[-11.5, 3], [-11.5, 5.4]] as const) { k.cyl('plasterDark', x, 0, z, 0.55, 1.1, 0x55595e); }
  const g = built(k);
  const root = grp(g);
  root.scale.setScalar(M);
  return root;
}
