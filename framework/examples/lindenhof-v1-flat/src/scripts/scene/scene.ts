import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { C, setGhost, type Built } from './kit';
import { buildFloor, buildRoof, buildPlinth, buildNeighbour, makeSignTexture, H, W } from './building';

gsap.registerPlugin(ScrollTrigger);

/* ---------- animated state (everything the scroll drives) ---------- */
const S = {
  d1: 0,
  d2: 0,
  d3: 0,
  d4: 0, // drop-in progress of floors 1..3 and roof
  E: 0, // explode amount
  hi: 0, // highlighted floor (continuous)
  az: 40,
  el: 32,
  view: 12,
  ty: 2.4, // camera
  grow: 0,
  sx: 0.17, // settlement growth, horizontal scene shift (fraction of width)
  r: 28,
  g: 63,
  b: 216, // background colour
};
const BG = {
  blue: [28, 63, 216],
  yellow: [244, 184, 26],
  red: [196, 48, 15],
  green: [26, 107, 80],
  chalk: [236, 238, 239],
} as const;
const FLOORS = 5; // 4 storeys + roof
const LIFT = 2.8;
const DROPH = 18;
// Scroll anchors (in viewport heights): hero 0, then one per chapter. Must match the CSS section heights.
const A = { hero: 0, c1: 1.7, c2: 2.7, c3: 3.7, c4: 4.7, c5: 5.7 };

const stage = document.querySelector<HTMLElement>('.stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const tags = Array.from(document.querySelectorAll<HTMLElement>('.floor-tag'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function setBg() {
  stage.style.setProperty('--bg', `rgb(${S.r | 0} ${S.g | 0} ${S.b | 0})`);
}

/* ---------- timeline ---------- */
function buildTimeline(scrollTrigger?: ScrollTrigger.Vars) {
  const tl = gsap.timeline({
    paused: !scrollTrigger,
    defaults: { ease: 'power2.inOut' },
    scrollTrigger,
    onUpdate: () => (dirty = true),
  });
  const to = (props: gsap.TweenVars, at: number, dur: number, ease?: string) =>
    tl.to(S, { ...props, duration: dur, ease: ease ?? 'power2.inOut' }, at);
  const bg = (c: readonly number[], at: number, dur = 0.3) => to({ r: c[0], g: c[1], b: c[2] }, at, dur, 'none');

  // hero: floors drop onto the plot one by one, then the house is whole
  to({ d1: 1 }, 0.1, 0.55, 'power3.out');
  to({ d2: 1 }, 0.28, 0.55, 'power3.out');
  to({ d3: 1 }, 0.46, 0.55, 'power3.out');
  to({ d4: 1 }, 0.64, 0.55, 'power3.out');
  to({ az: 46, el: 30 }, 0.2, 1.0);
  // -> chapter 1: yellow, explode, EG highlighted
  bg(BG.yellow, 1.05, 0.4);
  to({ E: 1, el: 46, az: 40, view: 11.2, ty: 0.5 }, 1.1, 0.6);
  // -> chapter 2: red, 1. OG
  bg(BG.red, 2.05, 0.3);
  to({ hi: 1, ty: 1.65, az: 52 }, 2.0, 0.4);
  // -> chapter 3: green, 2. OG
  bg(BG.green, 3.05, 0.3);
  to({ hi: 2, ty: 2.8, az: 36 }, 3.0, 0.4);
  // -> chapter 4: chalk, DG
  bg(BG.chalk, 4.05, 0.3);
  to({ hi: 3, ty: 3.95, az: 48 }, 4.0, 0.4);
  // -> chapter 5: blue, reassemble and pull back into the settlement
  bg(BG.blue, 5.0, 0.35);
  to({ E: 0, ty: 1.2 }, 5.0, 0.4);
  to({ view: 40, el: 34, az: 38 }, 5.05, 0.65);
  to({ grow: 1 }, 5.15, 0.55, 'power2.out');
  to({ sx: 0.3 }, 5.05, 0.65);
  tl.set({}, {}, A.c5); // pin total duration to the last anchor
  return tl;
}

/* ---------- three.js scene ---------- */
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch {
  document.documentElement.classList.add('no-webgl');
  throw new Error('no webgl');
}
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 200);

scene.add(new THREE.AmbientLight(0xffffff, 1.35));
const sun = new THREE.DirectionalLight(0xffffff, 2.3);
sun.position.set(9, 15, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -34;
sc.right = 34;
sc.top = 34;
sc.bottom = -34;
sc.near = 1;
sc.far = 80;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
sun.shadow.radius = 3;
scene.add(sun);

// ground: shadow catcher + faint plot grid
const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShadowMaterial({ opacity: 0.28 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(120, 60, C.ink, C.ink);
(grid.material as THREE.LineBasicMaterial).transparent = true;
(grid.material as THREE.LineBasicMaterial).opacity = 0.1;
grid.position.y = 0.004;
scene.add(grid);

const plinth = buildPlinth();
scene.add(plinth.group);

const floors: Built[] = [];
const holder = new THREE.Group();
scene.add(holder);
for (let i = 0; i < 4; i++) {
  const b = buildFloor(i);
  floors.push(b);
  holder.add(b.group);
}
let roof = buildRoof();
floors.push(roof);
holder.add(roof.group);
// real sign texture once the font is ready
document.fonts.load('600 150px "Jost Variable"').finally(() => {
  holder.remove(roof.group);
  roof = buildRoof(makeSignTexture('Lindenhof'));
  floors[4] = roof;
  holder.add(roof.group);
  dirty = true;
});

/* settlement */
const neighbours: { b: Built; delay: number }[] = [];
const settlement = new THREE.Group();
scene.add(settlement);
{
  const cols = [C.red, C.yellow, C.green, C.blue];
  const spec: [number, number, number, number, number][] = [
    // x, z, w, d, floors
    [-15, -1, 6, 3.4, 4],
    [14, -1, 6.4, 3.4, 5],
    [-14, -10, 6.5, 3.2, 3],
    [-5, -11, 6, 3.4, 5],
    [5, -10, 7, 3.2, 4],
    [15, -11, 6, 3.2, 3],
    [-13, 12, 6.4, 3.4, 4],
    [-3, 11.5, 6, 3.2, 3],
    [8, 12, 7, 3.4, 5],
    [18, 11, 6, 3.2, 4],
    [-24, -4, 6, 3.2, 3],
    [26, -4, 6, 3.4, 4],
    [-23, 8, 6, 3.2, 5],
    [27, 7, 6, 3.2, 3],
  ];
  spec.forEach(([x, z, w, d, n], i) => {
    const b = buildNeighbour(w, d, n, cols[(i * 3 + (i > 6 ? 1 : 0)) % cols.length], (i * 5 + 1) % 4);
    b.group.position.set(x, 0, z);
    b.group.scale.y = 0.001;
    settlement.add(b.group);
    neighbours.push({ b, delay: Math.hypot(x, z) / 34 });
  });
  // road + centre line
  const road = new THREE.Mesh(new THREE.BoxGeometry(90, 0.06, 2.6), new THREE.MeshLambertMaterial({ color: 0x1b2244 }));
  road.position.set(0, 0.03, 6.4);
  road.receiveShadow = true;
  settlement.add(road);
  const dash = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.4, 0.07, 0.12),
    new THREE.MeshBasicMaterial({ color: C.chalk }),
    30,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 30; i++) dash.setMatrixAt(i, m4.makeTranslation(-43 + i * 3, 0.05, 6.4));
  settlement.add(dash);
  // trees
  const tree = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.9, 0),
    new THREE.MeshLambertMaterial({ flatShading: true }),
    26,
  );
  tree.castShadow = true;
  const palette = [C.green, 0x2a8a63, 0x1f7a5a];
  let n = 0;
  for (let x = -38; x <= 38 && n < 26; x += 3.6) {
    if (Math.abs(x) < 6) continue;
    const s = 1.2 + (Math.abs(x * 7) % 5) / 8;
    m4.compose(
      new THREE.Vector3(x, 1.0 * s, 8.4 + (n % 2) * 0.6),
      new THREE.Quaternion(),
      new THREE.Vector3(s, s * 1.3, s),
    );
    tree.setMatrixAt(n, m4);
    tree.setColorAt(n, new THREE.Color(palette[n % palette.length]));
    n++;
  }
  tree.count = n;
  settlement.add(tree);
  settlement.visible = false;
}

/* ---------- apply state ---------- */
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
let dirty = true;
let vw = 0,
  vh = 0,
  mobile = false;
const target = new THREE.Vector3();
const v3 = new THREE.Vector3();
const FLOOR_NAMES = ['Erdgeschoss', '1. Obergeschoss', '2. Obergeschoss', 'Dachgeschoss'];

function apply() {
  // floors
  const heights: number[] = [];
  for (let i = 0; i < FLOORS; i++) {
    const drop = i === 0 ? 1 : [0, S.d1, S.d2, S.d3, S.d4][i];
    const rel = Math.min(Math.max(i - S.hi, 0), 1);
    const lift = S.E * (LIFT * rel + 0.9 * Math.max(i - S.hi - 1, 0));
    const y = i * H + lift + (1 - drop) * DROPH;
    heights[i] = y;
    floors[i].group.position.y = y;
    floors[i].group.visible = drop > 0.001;
    setGhost(floors[i], S.E * rel);
    const hw = Math.max(1 - Math.abs(i - S.hi), 0) * S.E;
    const slab = floors[i].mats.accent as THREE.MeshLambertMaterial;
    slab.color.setHex(C.chalkDark).lerp(new THREE.Color(C.ink), hw);
  }
  settlement.visible = S.grow > 0.001;
  neighbours.forEach(({ b, delay }) => {
    const k = Math.min(Math.max((S.grow * 1.5 - delay * 0.5) / 1, 0), 1);
    const e = 1 - Math.pow(1 - k, 3);
    b.group.scale.y = Math.max(e, 0.001);
  });

  // camera
  const az = THREE.MathUtils.degToRad(S.az + pointer.sx * 3);
  const el = THREE.MathUtils.degToRad(S.el + pointer.sy * 1.5);
  target.set(0, S.ty, 0);
  const dist = 80;
  cam.position.set(
    target.x + dist * Math.cos(el) * Math.sin(az),
    target.y + dist * Math.sin(el),
    target.z + dist * Math.cos(el) * Math.cos(az),
  );
  cam.lookAt(target);
  const aspect = vw / vh;
  const calm = (1 - S.E) * (1 - Math.min(S.grow, 1)); // hero state: house sits small above the copy on phones
  const viewH = mobile ? S.view * (1.55 + 0.4 * calm) : S.view;
  cam.left = (-viewH * aspect) / 2;
  cam.right = (viewH * aspect) / 2;
  cam.top = viewH / 2;
  cam.bottom = -viewH / 2;
  // push the house to the right (desktop) / up (mobile) so copy and scene never overlap
  const ox = mobile ? 0 : -vw * S.sx;
  const oy = mobile ? vh * (0.2 + 0.08 * calm) : 0;
  cam.setViewOffset(vw, vh, ox, oy, vw, vh);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();

  // floor tags (projected anchor points)
  tags.forEach((t, i) => {
    const w = Math.max(1 - Math.abs(i - S.hi), 0) * S.E;
    v3.set(W / 2 + 0.9, heights[i] + 0.55, 1.2).project(cam);
    let px = (v3.x * 0.5 + 0.5) * vw;
    if (mobile) px = Math.min(px, vw - (t.offsetWidth || 150) - 12);
    const py = (-v3.y * 0.5 + 0.5) * vh;
    t.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    t.style.opacity = w > 0.55 ? String((w - 0.55) / 0.45) : '0';
    t.setAttribute('aria-hidden', 'true');
  });
  setBg();
}

function resize() {
  vw = innerWidth;
  vh = innerHeight;
  mobile = vw < 1000 || vw < vh;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(vw, vh, false);
  dirty = true;
}
addEventListener('resize', () => {
  resize();
  ScrollTrigger.refresh();
});
resize();

if (!reduce) {
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });
}

/* ---------- drive ---------- */
let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '10% 0px' }).observe(stage);

function frame() {
  const nsx = pointer.x,
    nsy = pointer.y;
  if (Math.abs(nsx - pointer.sx) > 0.0005 || Math.abs(nsy - pointer.sy) > 0.0005) {
    pointer.sx += (nsx - pointer.sx) * 0.06;
    pointer.sy += (nsy - pointer.sy) * 0.06;
    dirty = true;
  }
  if (dirty && visible) {
    apply();
    renderer.render(scene, cam);
    dirty = false;
  }
}

const vhPx = () => innerHeight;
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  buildTimeline({
    trigger: stage,
    start: 'top top',
    end: () => `+=${A.c5 * vhPx()}`,
    scrub: 0.7,
    invalidateOnRefresh: true,
    onUpdate: () => (dirty = true),
  });
  gsap.ticker.add(frame);
  // in-page links go through Lenis so they respect the smooth scroll
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.split('?')[0];
      const el = id.length > 1 ? document.querySelector(id) : null;
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
        history.replaceState(null, '', a.getAttribute('href'));
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }),
  );
} else {
  // Reduced motion: no scroll-linked animation. Each chapter snaps the scene to its end pose.
  const tl = buildTimeline();
  const pose = (t: number) => {
    tl.time(t, false);
    dirty = true;
    frame();
  };
  const chapters = Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
  const times = [0.9, A.c1, A.c2, A.c3, A.c4, A.c5];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) pose(times[chapters.indexOf(e.target as HTMLElement)] ?? 0);
    },
    { threshold: 0.55 },
  );
  chapters.forEach((c) => io.observe(c));
  pose(0.9);
  gsap.ticker.add(frame);
}
