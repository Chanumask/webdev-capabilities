import * as THREE from 'three';
import { Kit, C, type Built } from './kit';

export const W = 7.2; // length (x)
export const D = 3.6; // depth (z)
export const H = 1.15; // floor pitch
const T = 0.14; // slab
const WT = 0.14; // wall
const x0 = -W / 2,
  x1 = W / 2,
  z0 = -D / 2,
  z1 = D / 2;
const SILL = 0.4,
  HEAD = 0.3;
const FURNITURE = [C.red, C.yellow, C.blue, C.green, C.ink];

// Stair tower footprint (front-left, protrudes toward the camera-facing +z side)
const TX0 = x0 + 0.25,
  TX1 = x0 + 1.8,
  TZ1 = z1 + 0.9;

/** One storey: slab (accent material), ribbon-window walls, stair tower, rooms with furniture. */
export function buildFloor(idx: number): Built {
  const k = new Kit();
  const yb = T,
    yt = H;
  const mirror = idx % 2 === 1;
  const mx = (a: number, b: number): [number, number] => (mirror ? [-b + (x0 + x1), -a + (x0 + x1)] : [a, b]);
  const f = (i: number) => FURNITURE[(i + idx) % FURNITURE.length];

  // slab: takes the highlight colour
  k.box('accent', x0 - 0.15, 0, z0 - 0.15, x1 + 0.15, T, z1 + 0.15);

  // long walls with ribbon window band
  for (const [za, zb, zg] of [
    [z1 - WT, z1, z1 - WT / 2],
    [z0, z0 + WT, z0 + WT / 2],
  ] as const) {
    k.box('body', x0, yb, za, x1, yb + SILL, zb);
    k.box('body', x0, yt - HEAD, za, x1, yt, zb);
    for (let px = x0 + 1.2; px < x1 - 0.5; px += 1.2) k.box('body', px - 0.06, yb + SILL, za, px + 0.06, yt - HEAD, zb);
    k.box('glass', x0 + WT, yb + SILL, zg - 0.02, x1 - WT, yt - HEAD, zg + 0.02, C.glass, false);
  }
  // end walls (solid) with a window pane proud of the face
  k.box('body', x0, yb, z0 + WT, x0 + WT, yt, z1 - WT);
  k.box('body', x1 - WT, yb, z0 + WT, x1, yt, z1 - WT);
  k.box('glass', x1, yb + 0.35, -0.5, x1 + 0.03, yb + 0.8, 0.5, C.glass);
  k.box('glass', x0 - 0.03, yb + 0.35, -0.5, x0, yb + 0.8, 0.5, C.glass);

  // interior (cut-plan walls at 0.8 so rooms read from above)
  const ph = yb + 0.78;
  const pw = 0.07;
  const zm = z0 + 1.62;
  const xm = mirror ? 0.5 : 0.9;
  const core = x0 + 1.9;
  k.box('body', core, yb, z0 + WT, core + pw, ph, z1 - WT); // stair core wall
  k.box('body', core, yb, zm, x1 - WT, ph, zm + pw); // corridor/kitchen wall
  k.box('body', xm, yb, z0 + WT, xm + pw, ph, zm); // unit divider (back)
  k.box('body', xm, yb, zm + pw, xm + pw, ph, z1 - WT); // unit divider (front)
  k.box('body', xm - 1.2, yb, z0 + WT, xm - 1.2 + pw, ph, zm); // bath wall

  // furniture
  const fy = yb;
  // unit A (between core and xm)
  k.box('body', core + 0.25, fy, z1 - 1.25, core + 1.65, fy + 0.36, z1 - 0.55, f(0)); // sofa
  k.box('body', core + 0.35, fy, z1 - 0.55 - 0.18, core + 1.55, fy + 0.5, z1 - 0.55, f(0)); // sofa back
  k.box('body', core + 2.0, fy, z1 - 1.1, core + 2.7, fy + 0.3, z1 - 0.5, f(1)); // table
  k.box('body', core + 0.2, fy, z0 + WT, core + 1.7, fy + 0.46, z0 + WT + 0.5, C.chalkDark); // kitchen counter
  k.box('body', core + 0.2, fy + 0.46, z0 + WT, core + 1.7, fy + 0.5, z0 + WT + 0.5, C.ink); // counter top
  k.box('body', xm - 1.15, fy, z0 + WT + 0.1, xm - 0.15, fy + 0.34, z0 + WT + 0.7, C.chalk); // bath tub
  // unit B (xm .. x1)
  k.box('body', xm + 0.3, fy, z1 - 1.75, xm + 1.3, fy + 0.32, z1 - 0.35, f(2)); // bed
  k.box('body', xm + 0.3, fy, z1 - 1.75, xm + 1.3, fy + 0.5, z1 - 1.62, f(2));
  k.box('body', xm + 1.6, fy, z1 - 0.7, xm + 2.5, fy + 0.7, z1 - 0.3, f(3)); // wardrobe
  k.box('body', xm + 1.0, fy, z0 + WT + 0.2, xm + 2.6, fy + 0.34, z0 + WT + 0.85, f(4)); // desk/table
  k.box('body', x1 - 1.1, fy, z0 + WT + 1.0, x1 - WT - 0.1, fy + 0.4, z0 + WT + 1.35, f(1)); // shelf

  // balcony, front, right
  const bx0 = Math.max(xm + 0.5, 1.2),
    bx1 = x1 - 0.25;
  k.box('body', bx0, 0, z1, bx1, 0.1, z1 + 0.65);
  k.box('body', bx0, 0.1, z1 + 0.6, bx1, 0.5, z1 + 0.65);
  k.box('body', bx0, 0.1, z1, bx0 + 0.05, 0.5, z1 + 0.65);
  k.box('body', bx1 - 0.05, 0.1, z1, bx1, 0.5, z1 + 0.65);

  // stair tower
  k.box('body', TX0, 0, z1 - WT, TX1, H, TZ1);
  k.box('glass', TX0 + 0.35, T + 0.12, TZ1 - 0.01, TX1 - 0.35, H - 0.1, TZ1 + 0.03, C.glass);
  k.box('glass', TX1, T + 0.2, z1 + 0.2, TX1 + 0.03, H - 0.2, z1 + 0.65, C.glass);
  if (idx === 0) {
    // entrance: door + canopy
    k.box('body', TX0 + 0.3, 0, TZ1, TX0 + 1.25, 0.85, TZ1 + 0.04, C.yellow);
    k.box('body', TX0 - 0.1, 0.95, TZ1, TX1 + 0.1, 1.02, TZ1 + 0.55, C.ink);
  }
  return k.build();
}

/** Roof slab + parapet + stair-tower cap + rooftop sign mast + vents. */
export function buildRoof(signTexture?: THREE.Texture): Built {
  const k = new Kit();
  k.box('accent', x0 - 0.15, 0, z0 - 0.15, x1 + 0.15, T, z1 + 0.15);
  const ph = 0.32,
    pt = 0.12;
  k.box('body', x0 - 0.1, T, z1 - pt, x1 + 0.1, T + ph, z1 + 0.05);
  k.box('body', x0 - 0.1, T, z0 - 0.05, x1 + 0.1, T + ph, z0 + pt);
  k.box('body', x0 - 0.1, T, z0, x0 + pt - 0.1, T + ph, z1);
  k.box('body', x1 - pt + 0.1, T, z0, x1 + 0.1, T + ph, z1);
  // tower cap
  k.box('body', TX0, 0, z1 - WT, TX1, T + 0.55, TZ1);
  k.box('body', TX0 - 0.1, T + 0.55, z1 - WT - 0.1, TX1 + 0.1, T + 0.68, TZ1 + 0.1, C.ink);
  k.box('glass', TX0 + 0.35, T + 0.1, TZ1 - 0.01, TX1 - 0.35, T + 0.45, TZ1 + 0.03, C.glass);
  // vents, skylights
  k.box('body', 0.4, T, -1.0, 1.0, T + 0.5, -0.5, C.blue);
  k.box('body', 1.8, T, -1.2, 2.2, T + 0.35, -0.8, C.chalkDark);
  k.box('glass', -1.0, T, -0.6, 0.0, T + 0.12, 0.3, C.glass);
  // sign mast: ink board on two posts, standing on the roof front
  k.box('body', -0.9, T, z1 - 0.5, -0.8, T + 1.2, z1 - 0.4, C.ink);
  k.box('body', 2.9, T, z1 - 0.5, 3.0, T + 1.2, z1 - 0.4, C.ink);
  k.box('body', -0.95, T + 0.7, z1 - 0.52, 3.05, T + 1.28, z1 - 0.38, C.ink);
  const b = k.build();
  if (signTexture) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 0.52),
      new THREE.MeshBasicMaterial({ map: signTexture, transparent: true }),
    );
    sign.position.set(1.05, T + 0.99, z1 - 0.375);
    b.group.add(sign);
  }
  return b;
}

export function makeSignTexture(text: string) {
  const c = document.createElement('canvas');
  c.width = 1560;
  c.height = 208;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0d1224';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#eceeef';
  g.font = '600 150px "Jost Variable", Jost, sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  (g as any).letterSpacing = '30px';
  g.fillText(text.toUpperCase(), c.width / 2 + 15, c.height / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Plinth/foundation under the ground floor. */
export function buildPlinth(): Built {
  const k = new Kit();
  k.box('body', x0 - 0.7, -0.14, z0 - 0.6, x1 + 0.7, 0, TZ1 + 0.9, C.chalkDark);
  return k.build();
}

/** Low-detail neighbour house for the settlement pull-back (~12 boxes). */
export function buildNeighbour(w: number, d: number, floors: number, accent: number, variant = 0): Built {
  const k = new Kit();
  const h = floors * 1.0;
  const WIN = 0x6f89a8;
  k.box('body', -w / 2, 0, -d / 2, w / 2, h, d / 2, C.chalk);
  for (let i = 0; i < floors; i++) {
    const y = i * 1.0 + 0.34;
    k.box('body', -w / 2 + 1.7, y, d / 2, w / 2 - 0.25, y + 0.36, d / 2 + 0.04, WIN);
    k.box('body', w / 2, y, -d / 2 + 0.25, w / 2 + 0.04, y + 0.36, d / 2 - 0.25, WIN);
    k.box('body', -w / 2 - 0.05, i * 1.0, -d / 2 - 0.05, w / 2 + 0.1, i * 1.0 + 0.1, d / 2 + 0.1, C.chalkDark);
  }
  // stair tower in the house colour with a glass strip
  const tx = variant === 1 || variant === 3 ? w / 2 - 1.5 : -w / 2 + 0.2; // tower left or right
  k.box('body', tx, 0, d / 2, tx + 1.3, h + (variant === 2 ? 0.2 : 0.55), d / 2 + 0.8, accent);
  k.box('body', tx + 0.35, 0.3, d / 2 + 0.8, tx + 0.95, h + 0.1, d / 2 + 0.83, 0xdfe7ef);
  if (variant === 2) {
    // set-back penthouse in the accent colour, balcony slabs on the front
    k.box('body', -w / 2 + 1.8, h + 0.2, -d / 2 + 0.4, w / 2 - 1.2, h + 1.0, d / 2 - 0.6, accent);
    for (let i = 1; i < floors; i++)
      k.box('body', -w / 2 + 2, i * 1.0 - 0.06, d / 2, w / 2 - 0.5, i * 1.0 + 0.04, d / 2 + 0.55, C.chalkDark);
  }
  if (variant === 3) {
    // stepped roof volume and a water tank
    k.box('body', -w / 2 + 0.4, h + 0.2, -d / 2 + 0.4, 0.4, h + 0.75, 0.2, C.chalk);
    k.box('body', w / 2 - 2.6, h + 0.2, -0.4, w / 2 - 1.8, h + 1.1, 0.4, C.chalkDark);
  }
  k.box('body', -w / 2 - 0.08, h, -d / 2 - 0.08, w / 2 + 0.08, h + 0.2, d / 2 + 0.08, C.chalk);
  return k.build();
}

export const tower = { x0: TX0, x1: TX1, z1: TZ1 };
