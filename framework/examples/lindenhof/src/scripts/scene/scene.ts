import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { fade } from './kit';
import { buildFloor, buildRoof, buildPlinth, buildNeighbour, makeSignTexture, H, M } from './building';
import { buildExcavator, buildDumper, buildMixer, buildCrane, buildScaffold, buildSiteProps } from './vehicles';
import { buildLandscape, buildStreet } from './props';

gsap.registerPlugin(ScrollTrigger);

/* ---------- state driven by scroll (everything the scene shows) ---------- */
const S = {
  p: 0, // scroll position in viewport heights, drives continuous motion (drum, crane, digging)
  lawn: 1,
  dirt: 0,
  pit: 0,
  found: 1,
  fl0: 1,
  fl1: 1,
  fl2: 1,
  fl3: 1,
  roof: 1, // structure growth
  fn0: 1,
  fn1: 1,
  fn2: 1,
  fn3: 1,
  fnr: 1, // finishing (windows, facade, interior)
  scaf: 0,
  crane: 0,
  cph: 0,
  exc: 0,
  excPh: 0,
  dump: 0,
  tip: 0,
  mix: 0,
  az: 22,
  el: 16,
  view: 14.5,
  ty: 2.7,
  sx: 0.2,
  grow: 0,
  r: 12,
  g: 15,
  b: 19,
};
const BG = { night: [12, 15, 19], slate: [18, 21, 26], graphite: [22, 24, 28], moss: [15, 20, 18] } as const;
// Scroll anchors (viewport heights): hero 0, one per chapter. Must match the CSS section heights.
const A = { hero: 0, c1: 1.7, c2: 2.7, c3: 3.7, c4: 4.7, c5: 5.7 };

const stage = document.querySelector<HTMLElement>('.stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- timeline ---------- */
function buildTimeline(scrollTrigger?: ScrollTrigger.Vars) {
  const tl = gsap.timeline({
    paused: !scrollTrigger,
    defaults: { ease: 'power2.inOut' },
    scrollTrigger,
    onUpdate: () => (dirty = true),
  });
  const to = (props: gsap.TweenVars, at: number, dur: number, ease = 'power2.inOut') =>
    tl.to(S, { ...props, duration: dur, ease }, at);
  const bg = (c: readonly number[], at: number, dur = 0.4) => to({ r: c[0], g: c[1], b: c[2] }, at, dur, 'none');
  to({ p: A.c5 }, 0, A.c5, 'none');

  // the finished house, then the film runs backwards: finishing, roof and floors come off top-down
  to({ fnr: 0 }, 0.45, 0.3);
  to({ roof: 0 }, 0.55, 0.3);
  to({ fn3: 0 }, 0.65, 0.25);
  to({ fl3: 0 }, 0.7, 0.3);
  to({ fn2: 0 }, 0.8, 0.25);
  to({ fl2: 0 }, 0.85, 0.3);
  to({ fn1: 0 }, 0.95, 0.25);
  to({ fl1: 0 }, 1.0, 0.3);
  to({ fn0: 0 }, 1.1, 0.25);
  to({ fl0: 0 }, 1.15, 0.3);
  to({ found: 0 }, 1.25, 0.3);
  to({ lawn: 0 }, 0.5, 0.6);
  to({ dirt: 1 }, 0.8, 0.5);
  to({ az: 19, el: 30, view: 14.8, ty: 0.9 }, 0.5, 1.0);
  bg(BG.slate, 1.0, 0.5);

  // Baugrube: excavator digs, tipper takes the soil
  to({ exc: 1 }, 1.15, 0.35);
  to({ dump: 1 }, 1.3, 0.35);
  to({ pit: 1 }, 1.4, 0.7);
  to({ excPh: 6 }, 1.45, 1.0, 'none');
  to({ tip: 1 }, 1.95, 0.3);
  to({ tip: 0 }, 2.3, 0.25);
  to({ dump: 0 }, 2.3, 0.4);

  // Fundament: mixer pours, slab appears
  to({ mix: 1 }, 2.05, 0.35);
  to({ found: 1 }, 2.25, 0.35);
  to({ pit: 0.55 }, 2.25, 0.3);
  to({ exc: 0 }, 2.45, 0.35);
  to({ mix: 0 }, 2.6, 0.4);

  // Rohbau: tower crane, floors rise, scaffold goes up
  to({ crane: 1 }, 2.35, 0.4);
  to({ cph: 1 }, 2.4, 1.4, 'none');
  to({ scaf: 1 }, 2.55, 0.3);
  to({ fl0: 1 }, 2.55, 0.3);
  to({ fl1: 1 }, 2.75, 0.3);
  to({ fl2: 1 }, 2.95, 0.3);
  to({ fl3: 1 }, 3.15, 0.3);
  to({ roof: 1 }, 3.4, 0.3);
  to({ az: 21, el: 24, view: 15.6, ty: 3.2 }, 2.2, 1.0);
  bg(BG.graphite, 2.4, 0.5);

  // Ausbau: facade, windows, interior; scaffold and crane leave
  to({ fn0: 1 }, 3.5, 0.3);
  to({ fn1: 1 }, 3.65, 0.3);
  to({ fn2: 1 }, 3.8, 0.3);
  to({ fn3: 1 }, 3.95, 0.3);
  to({ fnr: 1 }, 4.1, 0.3);
  to({ az: 23, el: 21, view: 14.6, ty: 2.8 }, 3.4, 1.0);
  to({ scaf: 0 }, 4.15, 0.3);
  to({ crane: 0 }, 4.2, 0.35);
  to({ dirt: 0 }, 4.3, 0.4);
  to({ lawn: 1 }, 4.3, 0.4);
  to({ pit: 0 }, 4.2, 0.4);
  bg(BG.moss, 4.0, 0.6);
  to({ az: 22, el: 16, view: 14.5, ty: 2.7 }, 4.35, 0.6);

  // Viertel: pull back
  bg(BG.night, 5.0, 0.5);
  to({ view: 46, el: 30, az: 28, ty: 1.2 }, 5.0, 0.7);
  to({ grow: 1 }, 5.1, 0.6, 'power2.out');
  to({ sx: 0.3 }, 5.05, 0.65);
  tl.set({}, {}, A.c5);
  return tl;
}

/* ---------- three.js ---------- */
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch {
  document.documentElement.classList.add('no-webgl');
  throw new Error('no webgl');
}
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.32;
const FOV = 22;
const cam = new THREE.PerspectiveCamera(FOV, 1, 1, 600);

scene.add(new THREE.HemisphereLight(0xa8bdd6, 0x2a2c31, 0.55));
const sun = new THREE.DirectionalLight(0xffe4c0, 3.3);
sun.position.set(15, 19, 11);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -30;
sc.right = 30;
sc.top = 30;
sc.bottom = -30;
sc.near = 1;
sc.far = 90;
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.04;
scene.add(sun);

// ground: dark plate that fades out into the page colour
{
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, '#fff');
  grd.addColorStop(0.6, '#fff');
  grd.addColorStop(1, '#000');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const a = new THREE.CanvasTexture(c);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 520),
    new THREE.MeshStandardMaterial({
      color: 0x23282e,
      roughness: 1,
      alphaMap: a,
      transparent: true,
      depthWrite: false,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.03;
  ground.receiveShadow = true;
  scene.add(ground);
}

const plinth = buildPlinth();
const floors = [0, 1, 2, 3].map(buildFloor);
let roof = buildRoof();
const holder = new THREE.Group();
scene.add(plinth.group, holder);
floors.forEach((f, i) => {
  f.group.position.y = i * H;
  holder.add(f.group);
});
roof.group.position.y = 4 * H;
holder.add(roof.group);
document.fonts.load('300 150px "Hanken Grotesk Variable"').finally(() => {
  holder.remove(roof.group);
  roof = buildRoof(makeSignTexture('Lindenhof'));
  roof.group.position.y = 4 * H;
  holder.add(roof.group);
  dirty = true;
});

const scaffolds = [0, 1, 2, 3].map((i) => {
  const g = buildScaffold();
  g.position.y = i * H;
  scene.add(g);
  return g;
});
const site = buildSiteProps();
scene.add(site);
const landscape = buildLandscape();
scene.add(landscape.group);
const street = buildStreet();
scene.add(street.group);

const exc = buildExcavator();
exc.root.rotation.y = Math.PI / 2;
scene.add(exc.root);
const dump = buildDumper();
dump.root.rotation.y = -Math.PI / 2;
scene.add(dump.root);
const mixer = buildMixer();
mixer.root.rotation.y = -Math.PI / 2;
scene.add(mixer.root);
const crane = buildCrane();
crane.root.position.set(4.7, 0, -2.9);
scene.add(crane.root);
for (const o of [exc.root, dump.root, mixer.root, crane.root])
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

// the Siedlung
const neighbours: { g: THREE.Group; delay: number }[] = [];
const settlement = new THREE.Group();
scene.add(settlement);
{
  const spec: [number, number, number, number, number][] = [
    // x, z (units), width, depth (units), floors
    [-15, -1, 6.4, 3.6, 4],
    [14.5, -1, 6.4, 3.4, 5],
    [-14, -10, 6.6, 3.4, 3],
    [-5, -11, 6.2, 3.6, 5],
    [5, -10, 7, 3.4, 4],
    [15, -11, 6.2, 3.4, 2],
    [-13, 12.5, 6.6, 3.6, 4],
    [-3, 12, 6.2, 3.4, 2],
    [8, 12.5, 7, 3.6, 5],
    [18, 12, 6.2, 3.4, 3],
    [-24, -5, 6.2, 3.4, 2],
    [26, -5, 6.4, 3.6, 4],
    [-24, 9, 6.2, 3.4, 5],
    [27, 8, 6.2, 3.4, 3],
  ];
  spec.forEach(([x, z, w, d, n], i) => {
    const b = buildNeighbour(w / M, d / M, n, (i * 5 + 1) % 4);
    b.group.position.set(x, 0, z);
    b.group.scale.y = 0.001;
    settlement.add(b.group);
    neighbours.push({ g: b.group, delay: Math.hypot(x, z) / 34 });
  });
  settlement.visible = false;
}

/* ---------- apply state ---------- */
let shadowWide = false;
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
let dirty = true;
let vw = 0,
  vh = 0,
  mobile = false;
const target = new THREE.Vector3();
const RAW = new THREE.Color(0x8e8c87),
  RAW_DARK = new THREE.Color(0x85847f),
  PLASTER = new THREE.Color(0xe6e3dd),
  DARK = new THREE.Color(0x474a50);
const sm = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function fadeObj(o: THREE.Object3D, v: number) {
  o.visible = v > 0.002;
  if (!o.visible) return;
  o.traverse((c) => {
    const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (!m || !('opacity' in m)) return;
    if (m.userData.base === undefined) {
      m.userData.base = m.opacity;
      m.transparent = true;
      m.needsUpdate = true;
    }
    m.opacity = m.userData.base * v;
  });
}

function apply() {
  // structure + finishing
  const fl = [S.fl0, S.fl1, S.fl2, S.fl3],
    fn = [S.fn0, S.fn1, S.fn2, S.fn3];
  floors.forEach((f, i) => {
    f.group.visible = fl[i] > 0.002;
    f.group.scale.set(M, M * Math.max(fl[i], 0.001), M);
    fade(f.fin, fn[i]);
    f.core.mats.get('plaster')?.color.copy(RAW).lerp(PLASTER, fn[i]);
    f.core.mats.get('plasterDark')?.color.copy(RAW_DARK).lerp(DARK, fn[i]);
    const s = scaffolds[i];
    s.visible = fl[i] > 0.002 && S.scaf > 0.002;
    s.scale.set(M, M * Math.max(fl[i], 0.001), M);
    fadeObj(s, S.scaf);
    s.visible = s.visible && fl[i] > 0.002;
  });
  roof.group.visible = S.roof > 0.002;
  roof.group.scale.set(M, M * Math.max(S.roof, 0.001), M);
  fade(roof.fin, S.fnr);
  roof.core.mats.get('plaster')?.color.copy(RAW).lerp(PLASTER, S.fnr);
  roof.core.mats.get('plasterDark')?.color.copy(RAW_DARK).lerp(DARK, S.fnr);
  plinth.group.position.y = (S.found - 1) * 0.5 * M;
  plinth.group.visible = S.found > 0.002;
  fadeObj(site, S.dirt);
  fade(landscape, S.lawn);
  landscape.group.scale.set(M, M * (0.2 + 0.8 * S.lawn), M);

  // vehicles drive in from the street, work, drive out again
  const drive = (o: THREE.Object3D, v: number, x: number, zEnd: number) => {
    o.visible = v > 0.002;
    o.position.set(x, 0, THREE.MathUtils.lerp(16, zEnd, sm(0, 1, v)));
  };
  drive(exc.root, S.exc, 0.4, 4.4);
  drive(dump.root, S.dump, -2.3, 3.5);
  drive(mixer.root, S.mix, 2.4, 3.7);
  const ph = S.excPh * Math.PI * 2;
  exc.turret.rotation.y = 0.75 * Math.sin(ph - 1.3) * (S.excPh > 0 ? 1 : 0) + 0.2;
  exc.boom.rotation.z = 0.5 + 0.3 * Math.sin(ph);
  exc.stick.rotation.z = -1.1 + 0.55 * Math.sin(ph + 1.2);
  exc.bucket.rotation.z = -0.7 + 0.7 * Math.sin(ph + 2.4);
  dump.bed.rotation.z = S.tip * 0.62;
  dump.load.visible = S.tip < 0.55;
  mixer.drum.rotation.x = S.p * 9;
  crane.root.scale.set(M, M * Math.max(S.crane, 0.001), M);
  crane.root.visible = S.crane > 0.002;
  const cp = S.cph * Math.PI * 2;
  crane.slew.rotation.y = 0.6 + 0.85 * Math.sin(cp * 2.2);
  crane.trolley.position.x = 11 + 6.5 * Math.sin(cp * 3.1);
  const len = 7 + 5 * (0.5 + 0.5 * Math.sin(cp * 4.6));
  crane.cable.scale.y = len;
  crane.hook.position.y = -len;
  crane.load.visible = Math.sin(cp * 4.6 + 0.8) > -0.2 && S.crane > 0.5;

  settlement.visible = S.grow > 0.001;
  neighbours.forEach(({ g, delay }) => {
    const k = Math.min(Math.max(S.grow * 1.5 - delay * 0.5, 0), 1);
    g.scale.y = Math.max(1 - Math.pow(1 - k, 3), 0.001) * M;
  });

  // camera: slim-FOV perspective, distance set from the wanted visible height
  const calm = S.fl3 * S.fn3 * (1 - Math.min(S.grow, 1)) * (S.crane < 0.01 ? 1 : 0);
  const viewH = mobile ? S.view * (1.45 + 0.35 * calm) : S.view;
  const dist = viewH / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
  const az = THREE.MathUtils.degToRad(S.az + pointer.sx * 3);
  const el = THREE.MathUtils.degToRad(S.el + pointer.sy * 1.5);
  target.set(0, S.ty, 0.8);
  cam.position.set(
    target.x + dist * Math.cos(el) * Math.sin(az),
    target.y + dist * Math.sin(el),
    target.z + dist * Math.cos(el) * Math.cos(az),
  );
  cam.lookAt(target);
  cam.aspect = vw / vh;
  const ox = mobile ? 0 : -vw * S.sx;
  const oy = mobile ? vh * (0.2 + 0.08 * calm) : 0;
  cam.setViewOffset(vw, vh, ox, oy, vw, vh);
  cam.updateProjectionMatrix();

  const wide = S.grow > 0.05;
  if (wide !== shadowWide) {
    shadowWide = wide;
    const e = wide ? 64 : 30;
    sc.left = -e;
    sc.right = e;
    sc.top = e;
    sc.bottom = -e;
    sc.updateProjectionMatrix();
  }
  stage.style.setProperty('--bg', `rgb(${S.r | 0} ${S.g | 0} ${S.b | 0})`);
}

function resize() {
  vw = innerWidth;
  vh = innerHeight;
  mobile = vw < 1000 || vw < vh;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  const sz = mobile ? 1024 : 2048;
  if (sun.shadow.mapSize.x !== sz) {
    sun.shadow.mapSize.set(sz, sz);
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
  }
  renderer.setSize(vw, vh, false);
  dirty = true;
}
addEventListener('resize', () => {
  resize();
  ScrollTrigger.refresh();
});
resize();
if (!reduce)
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });

let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '10% 0px' }).observe(stage);

function frame() {
  if (Math.abs(pointer.x - pointer.sx) > 0.0005 || Math.abs(pointer.y - pointer.sy) > 0.0005) {
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;
    dirty = true;
  }
  if (dirty && visible) {
    apply();
    renderer.render(scene, cam);
    dirty = false;
  }
}

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1 });
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  buildTimeline({
    trigger: stage,
    start: 'top top',
    end: () => `+=${A.c5 * innerHeight}`,
    scrub: 0.7,
    invalidateOnRefresh: true,
  });
  gsap.ticker.add(frame);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.split('?')[0];
      const el = id.length > 1 ? document.querySelector(id) : null;
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
        history.replaceState(null, '', a.getAttribute('href'));
      }
    }),
  );
} else {
  // Reduced motion: no scroll-linked animation. Each chapter snaps the scene to one pose.
  const tl = buildTimeline();
  const pose = (t: number) => {
    tl.time(t, false);
    dirty = true;
    frame();
  };
  const chapters = Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
  const times = [0.2, 1.9, 3.05, 4.0, 4.75, A.c5];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) pose(times[chapters.indexOf(e.target as HTMLElement)] ?? 0);
    },
    { threshold: 0.3 },
  );
  chapters.forEach((c) => io.observe(c));
  pose(0.2);
  gsap.ticker.add(frame);
}
