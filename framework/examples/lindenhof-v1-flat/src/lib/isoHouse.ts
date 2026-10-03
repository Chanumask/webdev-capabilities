// Procedural axonometric house illustrations (inline SVG), same drawing language as the 3D scene.
// Authored, not photographic: chalk volumes, ink outlines, ribbon windows, one accent panel.
import type { Accent } from '../content/site';

const INK = '#0d1224';
const CHALK = '#eceeef';
const CHALK_L = '#f7f8f8';
const CHALK_R = '#c9ced2';
const GLASS = '#8fa6bf';
const ACCENTS: Record<Accent, string> = { red: '#c4300f', yellow: '#f4b81a', green: '#1a6b50', blue: '#1c3fd8' };

const C30 = Math.cos(Math.PI / 6);
const S30 = 0.5;
const u = 14; // px per world unit

type P = [number, number];
const proj = (x: number, y: number, z: number): P => [(x - z) * C30 * u, (x + z) * S30 * u - y * u];
const poly = (pts: P[], fill: string, sw = 1.4) =>
  `<polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;

// Box with its 3 visible faces. Right face is +x side? Camera looks from +x,+z: visible faces are top, +x, +z.
function box(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  top: string,
  left: string,
  right: string,
) {
  const top4: P[] = [proj(x, y + h, z), proj(x + w, y + h, z), proj(x + w, y + h, z + d), proj(x, y + h, z + d)];
  const zFace: P[] = [proj(x, y, z + d), proj(x + w, y, z + d), proj(x + w, y + h, z + d), proj(x, y + h, z + d)]; // +z (left on screen)
  const xFace: P[] = [proj(x + w, y, z), proj(x + w, y, z + d), proj(x + w, y + h, z + d), proj(x + w, y + h, z)]; // +x (right on screen)
  return poly(zFace, left) + poly(xFace, right) + poly(top4, top);
}

// Ribbon window on the +z face (left on screen) or +x face.
function ribbonZ(x: number, y: number, z: number, w: number, h: number) {
  return poly([proj(x, y, z), proj(x + w, y, z), proj(x + w, y + h, z), proj(x, y + h, z)], GLASS, 1);
}
function ribbonX(x: number, y: number, z: number, d: number, h: number) {
  return poly([proj(x, y, z), proj(x, y, z + d), proj(x, y + h, z + d), proj(x, y + h, z)], GLASS, 1);
}

export function isoHouse(floors: number, accent: Accent, kind: 'Wohnung' | 'Haus') {
  const fh = 1.0;
  const W = kind === 'Haus' ? 4.6 : 6.2;
  const D = kind === 'Haus' ? 3.4 : 3.2;
  const H = floors * fh;
  const a = ACCENTS[accent];
  let s = '';
  // plinth
  s += box(-0.4, -0.12, -0.4, W + 0.8, 0.12, D + 0.8, CHALK_R, CHALK_R, '#b3b9be');
  // main volume
  s += box(0, 0, 0, W, H, D, CHALK_L, CHALK, CHALK_R);
  // ribbon windows per floor on the two visible faces
  for (let i = 0; i < floors; i++) {
    const y = i * fh + 0.38;
    s += ribbonZ(0.25, y, D, W - 0.5, 0.36);
    s += ribbonX(W, y, 0.3, D - 0.6, 0.36);
  }
  // stair tower (accent) on the +z face, left
  const tx = 0.35;
  s += box(tx, 0, D, 1.1, H + 0.55, 0.6, a, a, shade(a));
  s += poly(
    [
      proj(tx + 0.3, 0.25, D + 0.6),
      proj(tx + 0.8, 0.25, D + 0.6),
      proj(tx + 0.8, H + 0.1, D + 0.6),
      proj(tx + 0.3, H + 0.1, D + 0.6),
    ],
    GLASS,
    1,
  );
  // roof parapet
  s += box(-0.08, H, -0.08, W + 0.16, 0.18, D + 0.16, CHALK_L, CHALK_R, '#b3b9be');
  return s;
}

function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = 0.78;
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function isoHouseSvg(floors: number, accent: Accent, kind: 'Wohnung' | 'Haus', label: string) {
  const W = 6.2,
    D = 3.6,
    H = floors + 0.8;
  const xs = [proj(-0.5, 0, D + 0.4)[0], proj(W + 0.5, 0, -0.5)[0]];
  const minY = proj(0, H, 0)[1] - 6;
  const maxY = proj(W + 0.5, -0.2, D + 0.4)[1] + 6;
  const vx = xs[0] - 8,
    vw = xs[1] - xs[0] + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(0)} ${minY.toFixed(0)} ${vw.toFixed(0)} ${(maxY - minY).toFixed(0)}" role="img" aria-label="${label}">${isoHouse(floors, accent, kind)}</svg>`;
}

export const accentHex = ACCENTS;
