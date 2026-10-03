/**
 * Scroll-driven 3D scene skeleton (copy into src/scripts/scene/scene.ts and adapt).
 * Proven in examples/lindenhof. Replace the WORLD section with the site's own objects.
 *
 * Requirements: npm i three gsap lenis
 * HTML needs: <section class="stage"> with <div class="stage-sticky"><canvas id="scene"></canvas></div>
 *             and .chapters > .chapter sections (see README.md for the CSS).
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
// import { Kit, fade } from './kit';   // geometry baker (metres in, one mesh per material out)

gsap.registerPlugin(ScrollTrigger);

/* ---------- 1. STATE: the only thing the scroll animates ---------- */
const S = {
  p: 0, // scroll position in viewport heights (drives continuous motion)
  az: 30, el: 16, view: 14, ty: 2.5, sx: 0.2, // camera: azimuth, elevation (deg), visible height, target y, horizontal shift
  r: 12, g: 15, b: 19, // background colour
  // add your own: build progress per part, vehicle positions, door open, ...
};

/* Scroll anchors in viewport heights: hero = 0, then one per chapter. MUST match the CSS section heights
   (hero 170svh, others 100svh). The scrub range is A.last * viewport height. */
const A = { hero: 0, c1: 1.7, c2: 2.7, c3: 3.7, c4: 4.7, c5: 5.7 };

const stage = document.querySelector<HTMLElement>('.stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let dirty = true;

/* ---------- 2. TIMELINE: positions are in viewport heights ---------- */
function buildTimeline(scrollTrigger?: ScrollTrigger.Vars) {
  // NOTE: render from the TIMELINE's onUpdate. With scrub smoothing, ScrollTrigger.onUpdate does not fire for the last frames.
  const tl = gsap.timeline({ paused: !scrollTrigger, defaults: { ease: 'power2.inOut' }, scrollTrigger, onUpdate: () => (dirty = true) });
  const to = (props: gsap.TweenVars, at: number, dur: number, ease = 'power2.inOut') => tl.to(S, { ...props, duration: dur, ease }, at);
  to({ p: A.c5 }, 0, A.c5, 'none');
  // Example chapter transitions: keep each change inside its own window, away from the anchors where text is centred.
  to({ az: 24, el: 28, view: 16, ty: 1 }, 0.5, 1);
  to({ r: 18, g: 21, b: 26 }, 1, 0.5, 'none');
  tl.set({}, {}, A.c5); // pin the total duration to the last anchor
  return tl;
}

/* ---------- 3. RENDERER ---------- */
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch {
  document.documentElement.classList.add('no-webgl'); // CSS shows chapters on flat fills
  throw new Error('no webgl');
}
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; // reflections on glass and metal
scene.environmentIntensity = 0.32;
const FOV = 22; // slim field of view = architectural look
const cam = new THREE.PerspectiveCamera(FOV, 1, 1, 600);
scene.add(new THREE.HemisphereLight(0xa8bdd6, 0x2a2c31, 0.55));
const sun = new THREE.DirectionalLight(0xffe4c0, 3.3);
sun.position.set(15, 19, 11);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); // use 1024 on phones
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.04;
scene.add(sun);

/* ---------- 4. WORLD: replace ---------- */
// Ground plate that fades into the page colour (radial alpha map), receives shadows.
{
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, '#fff'); grd.addColorStop(0.6, '#fff'); grd.addColorStop(1, '#000');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 520),
    new THREE.MeshStandardMaterial({ color: 0x23282e, roughness: 1, alphaMap: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}
// const k = new Kit(); k.box('plaster', ...); scene.add(k.build({ scale: 0.43 }).group);

/* ---------- 5. APPLY: state -> scene (no allocation in here) ---------- */
let vw = 0, vh = 0, mobile = false;
const target = new THREE.Vector3();
function apply() {
  const viewH = mobile ? S.view * 1.6 : S.view;
  const dist = viewH / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
  const az = THREE.MathUtils.degToRad(S.az), el = THREE.MathUtils.degToRad(S.el);
  target.set(0, S.ty, 0);
  cam.position.set(dist * Math.cos(el) * Math.sin(az), S.ty + dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
  cam.lookAt(target);
  cam.aspect = vw / vh;
  // push the subject sideways (desktop) or up (phone) so copy and scene never overlap
  cam.setViewOffset(vw, vh, mobile ? 0 : -vw * S.sx, mobile ? vh * 0.22 : 0, vw, vh);
  cam.updateProjectionMatrix();
  stage.style.setProperty('--bg', `rgb(${S.r | 0} ${S.g | 0} ${S.b | 0})`);
}
function resize() {
  vw = innerWidth; vh = innerHeight; mobile = vw < 1000 || vw < vh;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(vw, vh, false);
  dirty = true;
}
addEventListener('resize', () => { resize(); ScrollTrigger.refresh(); });
resize();

let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '10% 0px' }).observe(stage);
function frame() {
  if (dirty && visible) { apply(); renderer.render(scene, cam); dirty = false; }
}

/* ---------- 6. DRIVE ---------- */
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1 });
  (window as unknown as { __lenis: Lenis }).__lenis = lenis; // so other scripts can scroll through Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  buildTimeline({ trigger: stage, start: 'top top', end: () => `+=${A.c5 * innerHeight}`, scrub: 0.7, invalidateOnRefresh: true });
  gsap.ticker.add(frame);
  // in-page links go through Lenis
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const el = a.getAttribute('href')!.length > 1 ? document.querySelector(a.getAttribute('href')!) : null;
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 }); }
    }),
  );
} else {
  // Reduced motion: no scroll-linked animation. Each chapter snaps the scene to one pose.
  const tl = buildTimeline();
  const pose = (t: number) => { tl.time(t, false); dirty = true; frame(); };
  const chapters = Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
  const times = [0.2, A.c1, A.c2, A.c3, A.c4, A.c5];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) pose(times[chapters.indexOf(e.target as HTMLElement)] ?? 0);
  }, { threshold: 0.3 }); // low threshold: the tall hero section never reaches a high ratio
  chapters.forEach((c) => io.observe(c));
  pose(0.2);
  gsap.ticker.add(frame);
}
