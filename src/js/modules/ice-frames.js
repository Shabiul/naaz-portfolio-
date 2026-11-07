import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  InstancedMesh,
  Object3D,
  OctahedronGeometry,
  IcosahedronGeometry,
  TetrahedronGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  BufferAttribute,
  Points,
  PointsMaterial,
  LineSegments,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  HemisphereLight,
  DirectionalLight,
  PMREMGenerator,
  Fog,
  Color,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { isCoarsePointer } from '../core/env.js';

/**
 * The 3D side of the "Build" descent on the Services page: an ice shaft you
 * fall down, and a frame of ice shards around every service card.
 *
 *   frames   one per card — instanced octahedra in the brand's steel blues,
 *            packed along its edge. The
 *            HTML card sits on top, so its text is always crisp; the ice is
 *            only the border.
 *   walls    big ice crystals lining both sides of the shaft.
 *   streaks  thin vertical lines and dust that drift upward past you — the
 *            sense of falling, even while the scroll rests.
 *
 * services-motion.js owns the camera: update({ camY, world, cardW,
 * opacities }) sets this camera to the same height, tilt and field of view
 * it projects the HTML cards with, so frame and card always line up.
 *
 * Returns null if WebGL is unavailable, so the CSS fallback frame stays.
 */

const SHARDS_PER_FRAME = 120;
/** Card-border ice in the brand's steel blues (Steel Blue #5E79A8 and its scale). */
const FRAME_BLUES = ['#a8bad6', '#8298bf', '#5e79a8', '#4a6390'].map((c) => new Color(c));
const MIST = new Color('#e3e8ef');

/** Small seeded RNG, so shapes are stable across rebuilds. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createIceFrames(stage, items, { FOV, PITCH, SPACING }) {
  const canvas = stage.querySelector('[data-ice-canvas]');
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.25 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  // Fog in the page's mist colour: distant ice dissolves into the background.
  scene.fog = new Fog(MIST, 9, 40);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  scene.add(new HemisphereLight(0xffffff, new Color('#5e79a8'), 1.25));
  const sun = new DirectionalLight(0xffffff, 2.6);
  sun.position.set(-5, 7, 6);
  scene.add(sun);
  const fill = new DirectionalLight(new Color('#a8bad6'), 0.8);
  fill.position.set(6, -4, 3);
  scene.add(fill);

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.rotation.x = PITCH;

  const iceMaterial = (color = '#dde5f0') =>
    new MeshPhysicalMaterial({
      color: new Color(color),
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.5,
      envMapIntensity: 0.85,
      flatShading: true,
      transparent: true,
    });

  const dummy = new Object3D();
  const depth = (items.length - 1) * SPACING; // how far the shaft goes down
  const shaftTop = 12;
  const shaftBottom = -depth - 16;

  // --- frames: one per card ----------------------------------------------------
  const shardGeo = new OctahedronGeometry(1, 0);
  const frames = items.map((_, i) => {
    const group = new Group();
    const material = iceMaterial('#ffffff');
    material.roughness = 0.18;
    material.iridescence = 0.6;
    material.envMapIntensity = 1;
    const mesh = new InstancedMesh(shardGeo, material, SHARDS_PER_FRAME);
    group.add(mesh);
    group.rotation.x = PITCH; // face the camera, which looks down the shaft
    scene.add(group);
    return { group, material, mesh, seed: 1000 + i * 97, aspect: 0 };
  });

  /** Shards along a rectangle of width 1 and height `aspect`, pushed outward. */
  function buildFrame(frame, aspect) {
    const rand = rng(frame.seed);
    const w = 1;
    const h = aspect;
    const perimeter = 2 * (w + h);
    for (let k = 0; k < SHARDS_PER_FRAME; k++) {
      let u = ((k + rand() * 0.8) / SHARDS_PER_FRAME) * perimeter;
      let x;
      let y;
      let nx;
      let ny;
      let angle;
      if (u < w) { x = -w / 2 + u; y = h / 2; nx = 0; ny = 1; angle = 0; }
      else if ((u -= w) < h) { x = w / 2; y = h / 2 - u; nx = 1; ny = 0; angle = Math.PI / 2; }
      else if ((u -= h) < w) { x = w / 2 - u; y = -h / 2; nx = 0; ny = -1; angle = 0; }
      else { u -= w; x = -w / 2; y = -h / 2 + u; nx = -1; ny = 0; angle = Math.PI / 2; }
      const nearCorner = Math.abs(Math.abs(x) - w / 2) + Math.abs(Math.abs(y) - h / 2) < 0.08;
      const out = 0.012 + rand() * (nearCorner ? 0.09 : 0.06);
      dummy.position.set(x + nx * out, y + ny * out, (rand() - 0.5) * 0.06);
      dummy.rotation.set((rand() - 0.5) * 1.2, (rand() - 0.5) * 1.2, angle + (rand() - 0.5) * 0.9);
      const big = nearCorner ? 1.5 : 1;
      dummy.scale.set((0.03 + rand() * 0.06) * big, (0.016 + rand() * 0.03) * big, 0.015 + rand() * 0.03);
      dummy.updateMatrix();
      frame.mesh.setMatrixAt(k, dummy.matrix);
      const tone = nearCorner ? 2 + Math.floor(rand() * 2) : Math.floor(rand() * 3);
      frame.mesh.setColorAt(k, FRAME_BLUES[tone]);
    }
    frame.mesh.instanceMatrix.needsUpdate = true;
    if (frame.mesh.instanceColor) frame.mesh.instanceColor.needsUpdate = true;
    frame.aspect = aspect;
  }

  // --- walls: ice crystals lining both sides of the shaft ------------------------
  const wallRand = rng(42);
  const WALL_COUNT = 150;
  const walls = new InstancedMesh(new IcosahedronGeometry(1, 0), iceMaterial('#cfd9e8'), WALL_COUNT);
  const wallData = Array.from({ length: WALL_COUNT }, (_, i) => ({
    side: i % 2 === 0 ? -1 : 1,
    out: 5.5 + wallRand() * 6,
    y: shaftTop - wallRand() * (shaftTop - shaftBottom),
    z: -5 - wallRand() * 18,
    s: 0.5 + wallRand() * 2.2,
    rx: wallRand() * 6,
    ry: wallRand() * 6,
    sy: 0.9 + wallRand() * 1.8, // stretched vertically, like icicles
  }));
  scene.add(walls);
  let wallSpread = 1;
  function placeWalls() {
    wallData.forEach((d, i) => {
      dummy.position.set(d.side * d.out * wallSpread, d.y, d.z);
      dummy.rotation.set(d.rx, d.ry, 0);
      dummy.scale.set(d.s, d.s * d.sy, d.s);
      dummy.updateMatrix();
      walls.setMatrixAt(i, dummy.matrix);
    });
    walls.instanceMatrix.needsUpdate = true;
  }

  // --- small shards scattered down the shaft -----------------------------------
  const shardRand = rng(7);
  const SHARD_COUNT = 70;
  const shards = new InstancedMesh(new TetrahedronGeometry(1, 0), iceMaterial(), SHARD_COUNT);
  const shardData = Array.from({ length: SHARD_COUNT }, () => ({
    x: (shardRand() - 0.5) * 16,
    y: shaftTop - shardRand() * (shaftTop - shaftBottom),
    z: -3 - shardRand() * 14,
    s: 0.05 + shardRand() * 0.14,
    spin: (shardRand() - 0.5) * 1.4,
  }));
  scene.add(shards);

  // --- streaks and dust: drift upward past the camera, wrapping around it --------
  const STREAKS = 260;
  const streakPos = new Float32Array(STREAKS * 6);
  const streakData = Array.from({ length: STREAKS }, () => ({
    x: (shardRand() - 0.5) * 18,
    y: (shardRand() - 0.5) * 34,
    z: -3 - shardRand() * 18,
    len: 0.35 + shardRand() * 1.3,
    v: 0.6 + shardRand() * 1.6,
  }));
  const streakGeo = new BufferGeometry();
  // BufferAttribute wraps the array (no copy), so the drift written each frame shows.
  streakGeo.setAttribute('position', new BufferAttribute(streakPos, 3));
  const streaks = new LineSegments(streakGeo, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  scene.add(streaks);

  const DUST = 700;
  const dustPos = new Float32Array(DUST * 3);
  const dustData = Array.from({ length: DUST }, () => ({
    x: (shardRand() - 0.5) * 22,
    y: (shardRand() - 0.5) * 34,
    z: -2 - shardRand() * 20,
    v: 0.2 + shardRand() * 0.6,
  }));
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
  const dust = new Points(dustGeo, new PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.9, depthWrite: false }));
  scene.add(dust);

  // --- sizing -----------------------------------------------------------------------
  function resize() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    // Narrow screens bring the walls in, or they would sit off-screen.
    wallSpread = Math.min(1, Math.max(0.32, camera.aspect / 1.6));
    placeWalls();
    items.forEach((el, i) => {
      const aspect = el.offsetHeight / Math.max(1, el.offsetWidth);
      if (Math.abs(aspect - frames[i].aspect) > 0.001) buildFrame(frames[i], aspect);
    });
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  // --- camera and frames follow the HTML layout --------------------------------------
  let state = null;
  function apply() {
    if (!state) return;
    camera.position.set(0, state.camY, 0);
    state.world.forEach((p, i) => {
      const f = frames[i];
      const o = state.opacities[i];
      f.group.visible = o > 0.01;
      f.group.position.set(p.x, p.y, p.z);
      f.group.scale.setScalar(state.cardW);
      f.material.opacity = o;
    });
  }

  // --- render loop (only while the stage is on screen) ---------------------------
  let raf = 0;
  let running = false;
  let last = performance.now();
  let time = 0;
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    const camY = state?.camY ?? 0;
    // Everything drifts up; whatever leaves the top re-enters at the bottom.
    const wrap = (y) => (y > camY + 14 ? y - 34 : y < camY - 20 ? y + 34 : y);
    streakData.forEach((d, i) => {
      d.y = wrap(d.y + d.v * dt);
      streakPos.set([d.x, d.y, d.z, d.x, d.y - d.len, d.z], i * 6);
    });
    streakGeo.attributes.position.needsUpdate = true;
    dustData.forEach((d, i) => {
      d.y = wrap(d.y + d.v * dt);
      dustPos.set([d.x, d.y, d.z], i * 3);
    });
    dustGeo.attributes.position.needsUpdate = true;
    shardData.forEach((d, i) => {
      dummy.position.set(d.x * wallSpread, d.y, d.z);
      dummy.rotation.set(time * d.spin, time * d.spin * 0.7, time * 0.2);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    });
    shards.instanceMatrix.needsUpdate = true;
    apply();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  const start = () => {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  let onScreen = false;
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    onScreen ? start() : stop();
  });
  io.observe(stage);
  const onVisibility = () => (document.hidden ? stop() : onScreen && start());
  document.addEventListener('visibilitychange', onVisibility);

  return {
    update(next) {
      state = next;
    },
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
    },
  };
}
