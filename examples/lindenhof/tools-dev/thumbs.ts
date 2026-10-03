// Dev tool: renders stills of the 3D kit (listing thumbnails, section images) on the same graphite ground.
// Open /thumbs in the dev server, then screenshot each <img id> to public/thumbs/*.jpg.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildNeighbour, buildFloor, buildRoof, buildPlinth, makeSignTexture, M, H } from './scene/building';
import { buildLandscape, buildStreet } from './scene/props';

const BG = 0x15181d;
const W = 720, Hh = 480;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(BG, 1);

function stage(content: (s: THREE.Scene) => { w: number; h: number }, id: string, az: number, el: number, size: [number, number] = [W, Hh]) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;
  scene.add(new THREE.HemisphereLight(0xa8bdd6, 0x2a2c31, 0.55));
  const sun = new THREE.DirectionalLight(0xffe4c0, 3.3);
  sun.position.set(15, 19, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 70 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const g = document.createElement('canvas'); g.width = g.height = 256;
  const c = g.getContext('2d')!;
  const gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, '#fff'); gr.addColorStop(1, '#000');
  c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x252a31, roughness: 1, alphaMap: new THREE.CanvasTexture(g), transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.03; ground.receiveShadow = true;
  scene.add(ground);
  const { w, h } = content(scene);
  const cam = new THREE.PerspectiveCamera(22, size[0] / size[1], 1, 300);
  const view = Math.max(h * 1.75, (w * 0.82) / (size[0] / size[1]));
  const dist = view / (2 * Math.tan(THREE.MathUtils.degToRad(11)));
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  const t = new THREE.Vector3(0, h * 0.46, 0);
  cam.position.set(t.x + dist * Math.cos(e) * Math.sin(a), t.y + dist * Math.sin(e), t.z + dist * Math.cos(e) * Math.cos(a));
  cam.lookAt(t);
  renderer.setSize(size[0], size[1], false);
  renderer.render(scene, cam);
  renderer.render(scene, cam);
  const img = document.getElementById(id) as HTMLImageElement;
  img.src = renderer.domElement.toDataURL('image/png');
  img.width = size[0]; img.height = size[1];
}

function lawn(s: THREE.Scene, w: number, d: number) {
  const g = buildLandscape();
  void g;
  const t = new THREE.Mesh(new THREE.BoxGeometry((w + 7) * M, 0.05, (d + 8) * M), new THREE.MeshStandardMaterial({ color: 0x4d5f43, roughness: 1 }));
  t.position.set(0, 0.0, 1.2 * M); t.receiveShadow = true;
  s.add(t);
}

const specs: [string, number, number, number, number, number, number][] = [
  // id, variant, floors, w(m), d(m), az, el
  ['t0', 0, 4, 15, 8.4, 30, 16],
  ['t1', 1, 2, 13, 9, -32, 15],
  ['t2', 2, 5, 14, 8.4, 28, 16],
  ['t3', 3, 3, 14, 8.4, -30, 16],
  ['t4', 0, 5, 16, 8.4, -28, 15],
  ['t5', 1, 2, 11, 8.4, 32, 16],
  ['t6', 3, 4, 15, 8.4, 26, 17],
  ['t7', 2, 4, 14, 8.4, -26, 15],
];

for (const [id, v, f, w, d, az, el] of specs) {
  stage((s) => {
    const b = buildNeighbour(w, d, f, v);
    b.group.position.y = 0;
    s.add(b.group);
    lawn(s, w, d);
    return { w: w * M, h: (f * 2.9 + (v === 1 ? 3.2 : 1)) * M };
  }, id, az, el);
}

function mainBuilding(s: THREE.Scene, sign: THREE.Texture) {
  s.add(buildPlinth().group);
  for (let i = 0; i < 4; i++) { const f = buildFloor(i); f.group.position.y = i * H; s.add(f.group); }
  const r = buildRoof(sign); r.group.position.y = 4 * H; s.add(r.group);
  const l = buildLandscape(); s.add(l.group);
  return { w: 17 * M, h: 12.6 * M };
}
document.fonts.load('300 150px "Hanken Grotesk Variable"').finally(() => {
  const sign = makeSignTexture('Lindenhof');
  stage((s) => mainBuilding(s, sign), 'main-a', 26, 15, [1200, 800]);
  stage((s) => mainBuilding(s, sign), 'main-b', -38, 16, [1200, 800]);
  document.body.dataset.done = '1';
});
void buildStreet;
