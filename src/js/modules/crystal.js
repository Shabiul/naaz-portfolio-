import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Mesh,
  InstancedMesh,
  Object3D,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  EdgesGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  Points,
  PointsMaterial,
  AmbientLight,
  DirectionalLight,
  PointLight,
  PMREMGenerator,
  Color,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  MathUtils,
  Shape,
  ExtrudeGeometry,
  Vector2,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { prefersReducedMotion, isLowPower, isCoarsePointer, lerp } from '../core/env.js';

/**
 * Services-page 3D — glass crystals in the spirit of igloo.inc.
 *
 *   <canvas data-module="crystal" data-mode="core" data-lazy>   hero
 *   <canvas data-module="crystal" data-mode="field" data-lazy>  CTA band
 *
 * core   the Naaz logo's N in 3D (traced from logo-mark.png), inside a
 *        wireframe shell, with the twenty services as glass shards on two
 *        tilted orbits, and drifting dust. Leans toward the cursor; turns and dollies as the hero scrolls.
 * field  glass shards drifting upward behind the closing call to action.
 *
 * Used only on services.html. When WebGL is unavailable or the device is
 * low-powered, the module bails and the CSS fallback stays (the orbit in the
 * hero, the aurora in the CTA). Under reduced motion it renders one still
 * frame. Rendering pauses whenever the canvas is off screen or the tab hidden.
 */

const STEEL = new Color('#5e79a8');
const ICE = new Color('#e8eefb');
const ESPRESSO = new Color('#815e4c');

export default function crystal(canvas) {
  if (isLowPower) return;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the CSS fallback stays visible
  }

  const mode = canvas.dataset.mode === 'field' ? 'field' : 'core';
  const host = canvas.closest('[data-crystal-host]') ?? canvas.parentElement;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.25 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, mode === 'core' ? 7 : 9);

  scene.add(new AmbientLight(0xffffff, 0.25));
  const key = new DirectionalLight(STEEL, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new PointLight(ESPRESSO, 18, 20);
  rim.position.set(-4, -2, 2);
  scene.add(rim);

  const world = mode === 'core' ? buildCore(scene) : buildField(scene);

  // --- sizing -----------------------------------------------------------------
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // --- input ------------------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isCoarsePointer) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
      },
      { passive: true },
    );
  }

  // How far the host has scrolled past: 0 when its top is at the top of the
  // viewport, 1 when it has fully left. Drives the core's turn and dolly.
  const scrollProgress = () => {
    const r = host.getBoundingClientRect();
    return MathUtils.clamp(-r.top / Math.max(1, r.height), 0, 1);
  };

  // The CSS fallback stays until the first frame has actually been drawn, so
  // a slow start never shows an empty stage.
  const reveal = () => host.classList.add('has-3d');

  if (prefersReducedMotion) {
    world.update(0, 0, pointer, 0);
    renderer.render(scene, camera);
    reveal();
    return;
  }

  // --- loop: runs only while the canvas is on screen and the tab visible ------
  let running = false;
  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    pointer.x = lerp(pointer.x, pointer.tx, 0.05);
    pointer.y = lerp(pointer.y, pointer.ty, 0.05);
    world.update(elapsed, dt, pointer, scrollProgress(), camera);
    renderer.render(scene, camera);
    if (!host.classList.contains('has-3d')) reveal();
    raf = requestAnimationFrame(frame);
  }
  const start = () => {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  let onScreen = false;
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    onScreen ? start() : stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : onScreen && start()));
}

/* ---------------------------------------------------------------------------
   Materials
   ------------------------------------------------------------------------ */

/** Clear, faceted glass — transmission + iridescence for the icy edge colour. */
const glass = (opts = {}) =>
  new MeshPhysicalMaterial({
    color: ICE,
    metalness: 0,
    roughness: 0.1,
    transmission: 1,
    thickness: 2.4,
    ior: 1.5,
    iridescence: 0.85,
    envMapIntensity: 1.6,
    specularIntensity: 1,
    iridescenceIOR: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    attenuationColor: STEEL,
    attenuationDistance: 2.4,
    flatShading: true,
    ...opts,
  });

/** Reflective ice for the many small shards (no transmission pass per shard). */
const ice = () =>
  new MeshPhysicalMaterial({
    color: ICE,
    metalness: 0.15,
    roughness: 0.12,
    clearcoat: 1,
    iridescence: 0.4,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  });

function dust(count, spread, size, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return new Points(
    geometry,
    new PointsMaterial({ color: ICE, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true }),
  );
}

/* ---------------------------------------------------------------------------
   The Naaz N — the logo's mark in 3D
   ------------------------------------------------------------------------ */

/**
 * The N's two folded ribbons, traced from public/img/logo-mark.png (858×1040,
 * pixel coordinates, y down). Each ribbon is split along its fold line so the
 * two tones of the logo survive: navy for the left bar and lower diagonal,
 * steel blue for the top diagonal and right bar.
 */
export const N_PARTS = [
  { tone: 'navy', points: [[255, 28], [34, 194], [34, 937], [208, 804], [208, 279], [244, 254], [252, 195]] },
  { tone: 'steel', points: [[255, 28], [252, 195], [244, 254], [611, 554], [611, 338]] },
  { tone: 'steel', points: [[829, 103], [687, 210], [685, 744], [652, 762], [650, 800], [829, 816]] },
  { tone: 'navy', points: [[652, 762], [297, 446], [297, 648], [643, 975], [829, 816], [650, 800]] },
];
export const N_BOX = { cx: (34 + 829) / 2, cy: (28 + 975) / 2, h: 975 - 28 };

/** An extruded, bevelled N, `height` world units tall, centred on the origin. */
export function buildN(height) {
  const k = height / N_BOX.h;
  const depth = height * 0.12;
  const materials = {
    navy: new MeshPhysicalMaterial({ color: new Color('#1d3a66'), metalness: 0.35, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    steel: new MeshPhysicalMaterial({ color: new Color('#6683b4'), metalness: 0.35, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  };
  const group = new Group();
  for (const part of N_PARTS) {
    const shape = new Shape(part.points.map(([x, y]) => new Vector2((x - N_BOX.cx) * k, -(y - N_BOX.cy) * k)));
    const geometry = new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: depth * 0.18,
      bevelSize: height * 0.008,
      bevelSegments: 2,
    });
    geometry.translate(0, 0, -depth / 2);
    group.add(new Mesh(geometry, materials[part.tone]));
  }
  return group;
}

/* ---------------------------------------------------------------------------
   Hero: the core — the N, in a wireframe shell, orbited by twenty shards
   ------------------------------------------------------------------------ */
function buildCore(scene) {
  const rig = new Group();
  scene.add(rig);

  // The logo's N, floating at the centre.
  const crystal = buildN(2.5);
  rig.add(crystal);

  // A soft steel glow behind it.
  const heartLight = new PointLight(STEEL, 14, 7);
  heartLight.position.set(0, 0.2, -1.2);
  rig.add(heartLight);

  // A technical wireframe shell, slightly larger, counter-rotating.
  const shell = new LineSegments(
    new EdgesGeometry(new IcosahedronGeometry(1.85, 1)),
    new LineBasicMaterial({ color: STEEL, transparent: true, opacity: 0.28 }),
  );
  rig.add(shell);

  // Twenty shards — one per service — on two tilted orbits.
  const orbits = [new Group(), new Group()];
  orbits[0].rotation.set(0.5, 0, 0.25);
  orbits[1].rotation.set(-0.35, 0, -0.5);
  orbits.forEach((o) => rig.add(o));
  const shardMat = ice();
  const shards = [];
  for (let i = 0; i < 20; i++) {
    const ring = i < 8 ? 0 : 1;
    const countOnRing = ring === 0 ? 8 : 12;
    const index = ring === 0 ? i : i - 8;
    const radius = ring === 0 ? 2.35 : 3.05;
    const angle = (index / countOnRing) * Math.PI * 2;
    const geometry = i % 3 === 0 ? new TetrahedronGeometry(0.16, 0) : new OctahedronGeometry(0.14, 0);
    const shard = new Mesh(geometry, shardMat);
    shard.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.35, Math.sin(angle) * radius);
    shard.userData.spin = 0.4 + Math.random() * 0.8;
    orbits[ring].add(shard);
    shards.push(shard);
  }

  const motes = dust(420, 12, 0.025, 0.55);
  scene.add(motes);

  return {
    update(t, dt, pointer, scroll, camera) {
      // A slow sway rather than a full spin, so the N always reads as an N;
      // it turns further and tips back as the hero scrolls away.
      crystal.rotation.y = Math.sin(t * 0.45) * 0.55 + scroll * 0.9;
      crystal.rotation.x = Math.sin(t * 0.3) * 0.08 + scroll * 0.3;
      crystal.position.y = Math.sin(t * 0.8) * 0.08;
      shell.rotation.y = -t * 0.08;
      shell.rotation.z = t * 0.05;
      orbits[0].rotation.y = t * 0.22;
      orbits[1].rotation.y = -t * 0.15;
      shards.forEach((s) => {
        s.rotation.x += dt * s.userData.spin;
        s.rotation.y += dt * s.userData.spin * 0.7;
      });
      motes.rotation.y = t * 0.02;
      // Lean toward the cursor.
      rig.rotation.y = lerp(rig.rotation.y, pointer.x * 0.35, 0.08);
      rig.rotation.x = lerp(rig.rotation.x, pointer.y * 0.25, 0.08);
      // Dolly in and lift as the hero scrolls away.
      if (camera) {
        camera.position.z = 7 - scroll * 2.2;
        camera.position.y = scroll * 0.8;
        camera.lookAt(0, 0, 0);
      }
    },
  };
}

/* ---------------------------------------------------------------------------
   CTA band: a field of drifting shards
   ------------------------------------------------------------------------ */
function buildField(scene) {
  const COUNT = 46;
  const mesh = new InstancedMesh(new OctahedronGeometry(0.22, 0), ice(), COUNT);
  scene.add(mesh);
  const dummy = new Object3D();
  // Shards keep to the sides (|x| ≥ 3) so the centred headline and buttons
  // always sit on clear space.
  const items = Array.from({ length: COUNT }, () => ({
    x: (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 5),
    y: (Math.random() - 0.5) * 9,
    z: (Math.random() - 0.5) * 6 - 1,
    s: 0.4 + Math.random() * 1.4,
    speed: 0.15 + Math.random() * 0.35,
    spin: (Math.random() - 0.5) * 1.6,
  }));

  const big = new Mesh(new IcosahedronGeometry(1.1, 0), glass({ thickness: 1 }));
  big.position.set(4.2, -0.6, -1.5);
  scene.add(big);

  const motes = dust(260, 16, 0.03, 0.4);
  scene.add(motes);

  return {
    update(t, dt, pointer, scroll, camera) {
      // Spread the field to the screen's shape: on a tall phone the sides
      // are much closer, so the same layout would put every shard off-screen.
      const spread = camera ? MathUtils.clamp(camera.aspect / 1.78, 0.42, 1) : 1;
      big.position.x = 4.2 * spread;
      items.forEach((it, i) => {
        it.y += it.speed * dt;
        if (it.y > 5) it.y = -5; // wrap to the bottom
        dummy.position.set(it.x * spread + pointer.x * 0.3 * it.s, it.y, it.z);
        dummy.rotation.set(t * it.spin, t * it.spin * 0.6, 0);
        dummy.scale.setScalar(it.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      big.rotation.y = t * 0.2;
      big.rotation.x = t * 0.12;
      motes.rotation.y = -t * 0.015;
    },
  };
}
