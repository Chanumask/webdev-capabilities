import * as THREE from 'three';

/* Procedural canvas textures: no image files, so nothing to license or download. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  return c;
}
function tex(c: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function speckle(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  n: number,
  lo: number,
  hi: number,
  a: number,
  size: number,
  r: () => number,
) {
  for (let i = 0; i < n; i++) {
    const v = Math.floor(lo + r() * (hi - lo));
    g.fillStyle = `rgba(${v},${v},${v},${a})`;
    const s = 1 + r() * size;
    g.fillRect(r() * w, r() * h, s, s);
  }
}
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

export type MatName =
  | 'plaster'
  | 'plasterDark'
  | 'timber'
  | 'floor'
  | 'frame'
  | 'glass'
  | 'concrete'
  | 'roof'
  | 'membrane'
  | 'fabric'
  | 'brass'
  | 'lamp'
  | 'leaf'
  | 'grass'
  | 'asphalt'
  | 'steel'
  | 'porcelain'
  | 'wood'
  | 'soil'
  | 'paintY'
  | 'paintW'
  | 'paintG'
  | 'rubber'
  | 'scaffold'
  | 'sedum';

interface Spec {
  color: number;
  rough: number;
  metal?: number;
  tile: number;
  map?: string;
  bump?: string;
  bumpScale?: number;
  opacity?: number;
  emissive?: number;
  emissiveIntensity?: number;
  env?: number;
}

const SPEC: Record<MatName, Spec> = {
  plaster: { color: 0xe6e3dd, rough: 0.92, tile: 3, bump: 'plaster', bumpScale: 0.6 },
  plasterDark: { color: 0x474a50, rough: 0.9, tile: 3, bump: 'plaster', bumpScale: 0.6 },
  timber: { color: 0xffffff, rough: 0.72, tile: 1.8, map: 'timber', bump: 'timber', bumpScale: 0.8 },
  floor: { color: 0xffffff, rough: 0.55, tile: 2.4, map: 'floor', bump: 'floor', bumpScale: 0.3 },
  frame: { color: 0x22252a, rough: 0.4, metal: 0.7, tile: 1 },
  glass: { color: 0xa9bccb, rough: 0.04, tile: 1, opacity: 0.28, env: 1.6 },
  concrete: { color: 0xb9b8b4, rough: 0.96, tile: 3, map: 'concrete', bump: 'concrete', bumpScale: 0.9 },
  roof: { color: 0xffffff, rough: 0.85, tile: 1.4, map: 'tile', bump: 'tile', bumpScale: 1.2 },
  membrane: { color: 0x34373c, rough: 0.95, tile: 2, bump: 'plaster', bumpScale: 0.5 },
  fabric: { color: 0xffffff, rough: 1, tile: 1.2, bump: 'plaster', bumpScale: 0.4 },
  brass: { color: 0xb8955a, rough: 0.32, metal: 0.95, tile: 1 },
  lamp: { color: 0xffe2b0, rough: 0.5, tile: 1, emissive: 0xffd08a, emissiveIntensity: 2.2 },
  leaf: { color: 0xffffff, rough: 0.9, tile: 2, bump: 'plaster', bumpScale: 0.3 },
  grass: { color: 0xffffff, rough: 1, tile: 2.5, map: 'grass', bump: 'plaster', bumpScale: 0.5 },
  asphalt: { color: 0xffffff, rough: 0.95, tile: 3, map: 'asphalt', bump: 'asphalt', bumpScale: 0.8 },
  steel: { color: 0x9aa0a6, rough: 0.35, metal: 0.85, tile: 1 },
  porcelain: { color: 0xf4f4f2, rough: 0.2, tile: 1 },
  wood: { color: 0xffffff, rough: 0.6, tile: 1.1, map: 'timber', bump: 'timber', bumpScale: 0.5 },
  soil: { color: 0xffffff, rough: 1, tile: 2.2, map: 'soil', bump: 'soil', bumpScale: 1 },
  paintY: { color: 0xc9a24a, rough: 0.55, metal: 0.15, tile: 1 }, // muted construction amber
  paintW: { color: 0xe3e5e7, rough: 0.5, metal: 0.1, tile: 1 },
  paintG: { color: 0x3c4046, rough: 0.6, metal: 0.2, tile: 1 },
  rubber: { color: 0x17181a, rough: 0.95, tile: 1 },
  scaffold: { color: 0x8d9298, rough: 0.5, metal: 0.7, tile: 1 },
  sedum: { color: 0x66745a, rough: 1, tile: 1.5, bump: 'plaster', bumpScale: 0.6 },
};
export const TILE = Object.fromEntries(Object.entries(SPEC).map(([k, v]) => [k, v.tile])) as Record<MatName, number>;

let cache: Record<string, THREE.Texture> | null = null;
function textures() {
  if (cache) return cache;
  const r = rng(11);
  const t: Record<string, THREE.Texture> = {};
  t.plaster = tex(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = '#808080';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 9000, 60, 200, 0.18, 2.4, r);
    }),
    false,
  );
  t.concrete = tex(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = '#c9c8c4';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 7000, 120, 235, 0.22, 2.6, r);
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 1;
      g.strokeRect(0.5, 0.5, w - 1, h - 1);
    }),
    true,
  );
  t.asphalt = tex(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = '#2b2e32';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 6000, 40, 150, 0.35, 2, r);
    }),
    true,
  );
  t.soil = tex(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = '#5c5246';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 7000, 40, 140, 0.4, 3.5, r);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = `rgba(${90 + r() * 40},${80 + r() * 30},${68},0.35)`;
        g.beginPath();
        g.ellipse(r() * w, r() * h, 3 + r() * 9, 2 + r() * 5, r() * 3, 0, 7);
        g.fill();
      }
    }),
    true,
  );
  t.grass = tex(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = '#55723f';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5000; i++) {
        const v = r();
        g.strokeStyle = `rgba(${55 + v * 60},${100 + v * 70},${40 + v * 30},0.55)`;
        g.beginPath();
        const x = r() * w,
          y = r() * h;
        g.moveTo(x, y);
        g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 5);
        g.stroke();
      }
    }),
    true,
  );
  t.floor = tex(
    canvas(512, 512, (g, w, h) => {
      const tones = ['#b8966c', '#c2a07a', '#ae8c62', '#bd9b72', '#b39168'];
      const rows = 8,
        ph = h / rows;
      for (let y = 0; y < rows; y++) {
        let x = -r() * 200;
        while (x < w) {
          const len = 160 + r() * 160;
          g.fillStyle = tones[Math.floor(r() * tones.length)];
          g.fillRect(x, y * ph, len, ph);
          g.strokeStyle = 'rgba(40,25,10,0.18)';
          g.strokeRect(x + 0.5, y * ph + 0.5, len, ph);
          for (let i = 0; i < 9; i++) {
            g.strokeStyle = `rgba(60,38,16,${0.04 + r() * 0.07})`;
            g.beginPath();
            const yy = y * ph + r() * ph;
            g.moveTo(x, yy);
            g.lineTo(x + len, yy + (r() - 0.5) * 4);
            g.stroke();
          }
          x += len;
        }
      }
    }),
    true,
  );
  t.timber = tex(
    canvas(512, 512, (g, w, h) => {
      const tones = ['#8b6b4a', '#7f6143', '#957556', '#876847'];
      const n = 20,
        bw = w / n;
      for (let i = 0; i < n; i++) {
        g.fillStyle = tones[Math.floor(r() * tones.length)];
        g.fillRect(i * bw, 0, bw, h);
        for (let k = 0; k < 24; k++) {
          g.strokeStyle = `rgba(40,25,12,${0.05 + r() * 0.1})`;
          g.beginPath();
          const x = i * bw + r() * bw;
          g.moveTo(x, 0);
          g.lineTo(x + (r() - 0.5) * 3, h);
          g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,0.38)';
        g.fillRect(i * bw, 0, 2, h);
      }
    }),
    true,
  );
  t.tile = tex(
    canvas(512, 512, (g, w, h) => {
      const rows = 14,
        th = h / rows,
        tw = 38;
      g.fillStyle = '#3a3e44';
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = -1; x < w / tw + 1; x++) {
          const ox = (y % 2) * tw * 0.5,
            v = 78 + r() * 26;
          g.fillStyle = `rgb(${v},${v + 3},${v + 8})`;
          g.fillRect(x * tw + ox + 1, y * th + 1, tw - 2, th - 1);
          g.fillStyle = 'rgba(0,0,0,0.35)';
          g.fillRect(x * tw + ox + 1, y * th + th - 4, tw - 2, 3);
        }
      }
    }),
    true,
  );
  cache = t;
  return t;
}

export function material(name: MatName, share = true): THREE.MeshStandardMaterial {
  const s = SPEC[name];
  const T = textures();
  const m = new THREE.MeshStandardMaterial({
    color: s.color,
    roughness: s.rough,
    metalness: s.metal ?? 0,
    vertexColors: true,
    map: s.map ? T[s.map] : null,
    bumpMap: s.bump ? T[s.bump] : null,
    bumpScale: s.bumpScale ?? 1,
    emissive: s.emissive ?? 0x000000,
    emissiveIntensity: s.emissiveIntensity ?? 1,
    envMapIntensity: s.env ?? 0.6,
  });
  if (name === 'glass') {
    m.transparent = true;
    m.opacity = s.opacity!;
    m.depthWrite = false;
  }
  m.name = name;
  void share;
  void shade;
  return m;
}
export const baseOpacity = (n: MatName) => SPEC[n].opacity ?? 1;
