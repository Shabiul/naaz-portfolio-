import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  ShaderMaterial,
  MeshStandardMaterial,
  Points,
  BufferGeometry,
  BufferAttribute,
  HemisphereLight,
  DirectionalLight,
  Fog,
  Color,
  AdditiveBlending,
  DoubleSide,
} from 'three';
import { buildN } from './crystal.js';
import { prefersReducedMotion, isLowPower, isCoarsePointer, lerp } from '../core/env.js';

/**
 * Version 2 — the valley.
 *
 *   <section data-beam-host> … <canvas data-module="v2Beam" data-lazy> …
 *
 * A pale sand valley between dunes, strewn with dark stones; a column of
 * light falls from the sky to the horizon and stray stones drift down
 * through it. The Naaz N stands on the valley floor, small, where the light
 * meets the ground; glints twinkle in the sand at your feet. The hero's
 * particle cloud (v2-particles.js) hangs in the light on a canvas above.
 *
 * Inside the pinned stage (v2-home.js writes stage.v2p, 0 → 1) the camera
 * sinks from the sky toward the valley floor and the light fades in.
 *
 * Skipped on low-powered devices or without WebGL — the CSS backdrop stays.
 */

const HAZE = new Color('#ffffff'); // must match the sky gradient at the horizon (v2-home.css)
const FOV = 40;

// Small value noise + fBm for the terrain (CPU, once).
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  return noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;
}
const smooth = (a, b, t) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

/** Height of the valley at (x, z): flat floor in the middle, dunes rising either side. */
function height(x, z) {
  const side = smooth(3.5, 16, Math.abs(x)) * smooth(6, -10, z);
  const hills = side * (2.4 + 2.6 * fbm(x * 0.05 + 7, z * 0.05)) * (x > 0 ? 1.7 : 1);
  const dunes = (fbm(x * 0.13, z * 0.13) - 0.5) * 0.7;
  const near = smooth(-25, 6, z);
  const ripples = Math.sin((x * 0.35 + z) * 2.6 + fbm(x * 0.1, z * 0.1) * 6) * 0.07 * near;
  return hills + dunes + ripples;
}

export default function v2Beam(canvas) {
  if (isLowPower) return;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.25 : 1.75));
  const host = canvas.closest('[data-beam-host]') ?? canvas.parentElement;
  // Scroll progress of the pinned stage (v2-home.js); 1 when the valley stands alone.
  const stage = canvas.closest('[data-v2-stage]') ?? {};

  const scene = new Scene();
  scene.fog = new Fog(HAZE, 14, 95);
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 200);
  const eye = { x: 0, y: 1.7, z: 14 };
  const look = { x: 0, y: 3.2, z: -1 };

  scene.add(new HemisphereLight(new Color('#ffffff'), new Color('#b4c2dc'), 1.7));
  const back = new DirectionalLight(0xffffff, 1.4);
  back.position.set(-4, 9, -12);
  scene.add(back);
  const front = new DirectionalLight(0xffffff, 1.1);
  front.position.set(6, 7, 10);
  scene.add(front);

  // The valley floor and dunes.
  const ground = new PlaneGeometry(170, 130, 340, 260);
  ground.rotateX(-Math.PI / 2);
  ground.translate(0, 0, -45);
  const gp = ground.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, height(gp.getX(i), gp.getZ(i)));
  ground.computeVertexNormals();
  scene.add(new Mesh(ground, new MeshStandardMaterial({ color: new Color('#f7f9fd'), roughness: 1 })));

  // Stones on the sand.
  const dummy = new Object3D();
  const stoneGeo = new DodecahedronGeometry(1, 0);
  const stoneMat = new MeshStandardMaterial({ color: new Color('#5e79a8'), roughness: 0.85, flatShading: true });
  const STONES = 420;
  const stones = new InstancedMesh(stoneGeo, stoneMat, STONES);
  for (let i = 0; i < STONES; i++) {
    const x = (Math.random() - 0.5) * 56;
    const z = 12 - Math.random() * Math.random() * 70;
    const s = 0.025 + Math.pow(Math.random(), 4) * 0.26;
    dummy.position.set(x, height(x, z) + s * 0.25, z);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    dummy.scale.set(s * (0.8 + Math.random() * 0.6), s * 0.65, s);
    dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
  }
  scene.add(stones);

  // Stray stones drifting down through the air.
  const DRIFT = 26;
  const drift = new InstancedMesh(stoneGeo, stoneMat, DRIFT);
  const drifters = Array.from({ length: DRIFT }, () => ({
    x: (Math.random() - 0.5) * 14,
    y: 0.6 + Math.random() * 7,
    z: -4 - Math.random() * 14,
    s: 0.02 + Math.random() * Math.random() * 0.07,
    v: 0.05 + Math.random() * 0.12,
    r: Math.random() * 6,
  }));
  scene.add(drift);

  // The column of light: an open cone, bright where it faces the camera.
  const beamOn = { value: 0 };
  const beamShader = (strength, fadeTop) => new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBeam: beamOn },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    fog: false,
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vY = uv.y; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform float uTime; uniform float uBeam; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float core = pow(abs(dot(vN, vV)), 4.0);
        float a = core * smoothstep(0.0, 0.18, vY) * mix(1.0, 0.75, smoothstep(${fadeTop}, 1.0, vY)) * ${strength} * uBeam * (0.94 + 0.06 * sin(uTime * 1.7 + vY * 9.0));
        gl_FragColor = vec4(vec3(1.0), a); }`,
  });
  const beamZ = -14;
  const beam = new Mesh(new CylinderGeometry(0.9, 2.2, 40, 48, 1, true), beamShader('0.4', '0.7'));
  beam.position.set(0, 20, beamZ);
  scene.add(beam);
  const beamCore = new Mesh(new CylinderGeometry(0.3, 0.75, 40, 32, 1, true), beamShader('0.75', '0.8'));
  beamCore.position.copy(beam.position);
  scene.add(beamCore);

  // Soft glows: where the light meets the ground, and around the cloud.
  const glow = (size, strength) => new Mesh(
    new PlaneGeometry(size, size),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      uniforms: { uBeam: beamOn },
      fragmentShader: /* glsl */ `uniform float uBeam; varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)) * 2.0; gl_FragColor = vec4(vec3(1.0), pow(max(1.0 - d, 0.0), 2.2) * ${strength} * uBeam); }`,
    }),
  );
  const groundGlow = glow(10, '0.3');
  groundGlow.position.set(0, 0.6, beamZ + 1);
  groundGlow.scale.set(1.4, 0.45, 1);
  scene.add(groundGlow);
  const cloudGlow = glow(12, '0.42');
  scene.add(cloudGlow);

  // Where the particle cloud (v2-particles.js) hangs: a bloom in the light.
  cloudGlow.position.set(0, 5.6, -8);

  // Glints in the sand near the camera.
  const GLINTS = 2200;
  const sPos = new Float32Array(GLINTS * 3);
  const sSeed = new Float32Array(GLINTS);
  for (let i = 0; i < GLINTS; i++) {
    const z = 13 - Math.random() * 22;
    const x = (Math.random() - 0.5) * (8 + (13 - z) * 1.6);
    sPos.set([x, height(x, z) + 0.02, z], i * 3);
    sSeed[i] = Math.random();
  }
  const glintGeo = new BufferGeometry();
  glintGeo.setAttribute('position', new BufferAttribute(sPos, 3));
  glintGeo.setAttribute('aSeed', new BufferAttribute(sSeed, 1));
  const glintMat = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `uniform float uTime; uniform float uScale; attribute float aSeed; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vA = pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 50.0), 6.0);
        gl_PointSize = (1.5 + aSeed * 2.5) * uScale * clamp(10.0 / -mv.z, 0.4, 1.6); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.37, 0.47, 0.66), vA * smoothstep(0.5, 0.0, d)); }`,
  });
  scene.add(new Points(glintGeo, glintMat));

  // The N, standing on the valley floor like a lone figure.
  const figure = buildN(1.2);
  figure.traverse((o) => {
    if (o.material) {
      o.material = o.material.clone();
      o.material.color = new Color(o.material.color.getHexString() === '1d3a66' ? '#3a4f76' : '#5e79a8');
    }
  });
  const figureZ = -1;
  figure.position.set(0, height(0, figureZ) + 0.62, figureZ);
  scene.add(figure);
  // A soft shadow at its feet.
  const shadow = new Mesh(
    new PlaneGeometry(2.2, 0.8),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)) * 2.0; gl_FragColor = vec4(vec3(0.35), pow(max(1.0 - d, 0.0), 1.6) * 0.35); }`,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.25, height(0, figureZ) + 0.03, figureZ + 0.1);
  scene.add(shadow);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait screens: step back so the valley still fits across.
    camera.position.z = eye.z * Math.max(1, 1.2 / camera.aspect);
    camera.updateProjectionMatrix();
    glintMat.uniforms.uScale.value = renderer.getPixelRatio();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isCoarsePointer) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function draw(t, dt) {
    pointer.x = lerp(pointer.x, pointer.tx, 0.03);
    pointer.y = lerp(pointer.y, pointer.ty, 0.03);
    const p = stage.v2p ?? 1;
    const down = smooth(0.2, 0.62, p);
    beamOn.value = smooth(0.38, 0.62, p);
    camera.position.x = eye.x + pointer.x * 0.35;
    camera.position.y = lerp(3.4, eye.y, down) - pointer.y * 0.15;
    camera.lookAt(look.x, lerp(7.5, look.y, down), look.z);
    beam.material.uniforms.uTime.value = t;
    beamCore.material.uniforms.uTime.value = t;
    glintMat.uniforms.uTime.value = t;
    cloudGlow.lookAt(camera.position);
    for (let i = 0; i < DRIFT; i++) {
      const d = drifters[i];
      d.y -= d.v * dt;
      if (d.y < height(d.x, d.z)) d.y = 7 + Math.random() * 2;
      d.r += dt * 0.3;
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(d.r, d.r * 0.7, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      drift.setMatrixAt(i, dummy.matrix);
    }
    drift.instanceMatrix.needsUpdate = true;
    figure.rotation.y = Math.sin(t * 0.3) * 0.25;
    renderer.render(scene, camera);
    host.classList.add('has-3d');
  }

  if (prefersReducedMotion) {
    draw(0, 0);
    return;
  }

  let raf = 0;
  let running = false;
  let last = performance.now();
  let t = 0;
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    draw(t, dt);
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  let onScreen = false;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : onScreen && start()));
}
