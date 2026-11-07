import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Points,
  Group,
  Mesh,
  PlaneGeometry,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
} from 'three';
import { N_PARTS, N_BOX } from './crystal.js';
import { prefersReducedMotion, isLowPower, isCoarsePointer, lerp } from '../core/env.js';

/**
 * Version 2 — the hero particle sculpture (mdx.so's morphing glitter object).
 *
 *   <section data-v2-stage> … <canvas data-module="v2Particles" data-lazy> …
 *
 * Tens of thousands of glitter points hold one shape at a time and flow into
 * the next every few seconds: the Naaz N → sphere → DNA helix → wireframe
 * cube → N … Every particle is white (the N in its logo blues); the
 * orange is a soft light glowing behind the shape, drifting slowly. Hovering
 * an element with [data-shape="…"] morphs straight to that shape.
 *
 * The stage is pinned by v2-home.js, which writes the scroll progress to
 * stage.v2p (0 → 1). As it scrolls the sculpture breaks apart into a cloud of
 * grey granules that hangs in the valley's light and churns, then fades as
 * the white cloud rises at the end.
 */

const R = 1;
const SHAPES = ['n', 'sphere', 'helix', 'cube']; // the N leads
const HOLD = 3.4; // seconds a shape rests
const MORPH = 2.0; // seconds a morph takes

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* --- Shape samplers: each returns one random point (x, y, z) on the shape ------- */
const rand = Math.random;
const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
function dir() {
  const u = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(a), u, s * Math.sin(a)];
}

function sphere() {
  const [x, y, z] = dir();
  const r = R * (1 - 0.22 * rand() ** 2.2);
  return [x * r, y * r, z * r];
}

function helix() {
  const H = 2.4 * R, RAD = 0.62 * R, TURNS = 1.35;
  if (rand() < 0.12) {
    // A rung between the two strands.
    const t = Math.floor(rand() * 14) / 13;
    const a = t * TURNS * Math.PI * 2;
    const k = rand();
    const x = Math.cos(a) * RAD * (1 - 2 * k);
    const z = Math.sin(a) * RAD * (1 - 2 * k);
    return [x + gauss() * 0.03, (t - 0.5) * H + gauss() * 0.03, z + gauss() * 0.03];
  }
  const t = rand();
  const a = t * TURNS * Math.PI * 2 + (rand() < 0.5 ? 0 : Math.PI);
  const [ox, oy, oz] = dir();
  const tube = 0.23 * R * rand() ** 0.35; // weighted to the surface so the strand reads as a tube
  return [Math.cos(a) * RAD + ox * tube, (t - 0.5) * H + oy * tube, Math.sin(a) * RAD + oz * tube];
}

const CUBE_EDGES = (() => {
  const s = 0.78 * R;
  const v = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  // Tilted onto a corner, as on the reference.
  const ax = 0.62, ay = 0.72;
  const rot = ([x, y, z]) => {
    const y1 = y * Math.cos(ax) - z * Math.sin(ax), z1 = y * Math.sin(ax) + z * Math.cos(ax);
    return [x * Math.cos(ay) + z1 * Math.sin(ay), y1, -x * Math.sin(ay) + z1 * Math.cos(ay)];
  };
  return e.map(([a, b]) => [rot(v[a]), rot(v[b])]);
})();
function cube() {
  const [a, b] = CUBE_EDGES[Math.floor(rand() * 12)];
  const t = rand();
  const [ox, oy, oz] = dir();
  const tube = 0.16 * R * rand() ** 0.4;
  return [a[0] + (b[0] - a[0]) * t + ox * tube, a[1] + (b[1] - a[1]) * t + oy * tube, a[2] + (b[2] - a[2]) * t + oz * tube];
}

function inside([x, y], pts) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
// The N also returns a 4th value: its blue, by the logo part it falls in (navy 1, steel 0.6).
const N_BLUE = { navy: 1, steel: 0.6 };
function nShape() {
  const k = (2.3 * R) / N_BOX.h;
  for (;;) {
    const p = [34 + rand() * (829 - 34), 28 + rand() * (975 - 28)];
    const part = N_PARTS.find((pt) => inside(p, pt.points));
    if (part) return [(p[0] - N_BOX.cx) * k, -(p[1] - N_BOX.cy) * k, (rand() - 0.5) * 0.55 * R, N_BLUE[part.tone]];
  }
}

/** The valley cloud: a loose, clumpy ball of granules. */
function cloud() {
  for (;;) {
    const [x, y, z] = dir();
    const r = Math.cbrt(rand());
    const p = [x * r * 0.72, y * r * 0.62, z * r * 0.6];
    // Thin it into clumps.
    const c = Math.sin(p[0] * 5.1 + 1.3) * Math.sin(p[1] * 4.3 + 0.7) * Math.sin(p[2] * 4.7 + 2.1);
    if (c > -0.35 || rand() < 0.25) return p;
  }
}

const SAMPLERS = { sphere, helix, cube, n: nShape };

export default function v2Particles(canvas) {
  if (isLowPower) return;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
  const stage = canvas.closest('[data-v2-stage]') ?? canvas.parentElement;
  const host = canvas.closest('[data-orb-host]') ?? stage;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  const rig = new Group();
  scene.add(rig);

  const COUNT = isCoarsePointer ? 32000 : 100000;
  const from = new Float32Array(COUNT * 3);
  const to = new Float32Array(COUNT * 3);
  const cloudPos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT * 4); // delay, tone, size, phase
  const blue = new Float32Array(COUNT * 2); // blue tint: from, to (only the N has any)
  const fill = (arr, fn) => { for (let i = 0; i < COUNT; i++) arr.set(fn(), i * 3); };
  fill(cloudPos, cloud);
  for (let i = 0; i < COUNT; i++) seed.set([rand(), rand(), rand(), rand()], i * 4);

  const geo = new BufferGeometry();
  const aFrom = new BufferAttribute(from, 3);
  const aTo = new BufferAttribute(to, 3);
  geo.setAttribute('position', aFrom);
  geo.setAttribute('aTo', aTo);
  geo.setAttribute('aCloud', new BufferAttribute(cloudPos, 3));
  geo.setAttribute('aSeed', new BufferAttribute(seed, 4));
  const aBlue = new BufferAttribute(blue, 2);
  geo.setAttribute('aBlue', aBlue);

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 1 },
    uDisperse: { value: 0 },
    uSwirl: { value: 0 },
    uFade: { value: 1 },
    uScale: { value: 1 },
    uCamZ: { value: 6 },
  };
  const material = new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime, uMorph, uDisperse, uSwirl, uScale, uCamZ;
      attribute vec3 aTo; attribute vec3 aCloud; attribute vec4 aSeed; attribute vec2 aBlue;
      varying vec3 vColor; varying float vAlpha; varying float vSpark;
      ${NOISE}
      void main() {
        // Morph: each particle leaves on its own delay and bows outward on the way.
        float k = clamp(uMorph * 1.6 - aSeed.x * 0.6, 0.0, 1.0);
        k = k * k * (3.0 - 2.0 * k);
        vec3 shape = mix(position, aTo, k);
        float bow = sin(k * 3.14159);
        if (bow > 0.001) shape += normalize(shape + 1e-4) * bow * (0.18 + 0.25 * snoise(shape * 1.7 + uTime * 0.3));
        // Breathing shimmer.
        shape += 0.01 * normalize(shape + 1e-4) * snoise(shape * 3.0 + uTime * 0.4);

        // The valley cloud: differential spin plus churning noise.
        vec3 c = aCloud;
        float r = length(c.xz);
        float ang = uTime * (0.35 - 0.2 * r) + uSwirl * 1.4 * (1.0 - r);
        float ca = cos(ang), sa = sin(ang);
        c.xz = mat2(ca, -sa, sa, ca) * c.xz;
        if (uSwirl > 0.001) c += uSwirl * 0.42 * vec3(snoise(c * 1.3 + uTime * 0.12), snoise(c * 1.3 + 5.0 + uTime * 0.12) * 0.6, snoise(c * 1.3 + 9.0 + uTime * 0.12));
        c.y += 0.42 + 0.05 * sin(uTime * 0.6);

        // Breaking apart: particles fall and scatter on their own delay.
        float d = clamp(uDisperse * 1.5 - aSeed.x * 0.5, 0.0, 1.0);
        d = d * d * (3.0 - 2.0 * d);
        vec3 p = mix(shape, c, d);
        p.y -= sin(d * 3.14159) * (0.35 + aSeed.w * 0.6);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        // Look: frosted white, a touch greyer toward the back for depth; a few sparkles.
        float spark = step(0.97, aSeed.y);
        float tw = 0.55 + 0.45 * sin(uTime * (2.0 + aSeed.w * 4.0) + aSeed.w * 50.0);
        vSpark = spark * tw;
        float back = smoothstep(-0.6, 1.0, -mv.z - uCamZ);
        vec3 glitter = mix(vec3(1.0), vec3(0.72, 0.75, 0.8), back);
        // The N in its logo blues: navy and steel, a few white sparkles left in.
        float tone = mix(aBlue.x, aBlue.y, k);
        vec3 blueCol = mix(vec3(0.42, 0.58, 0.9), vec3(0.16, 0.33, 0.7), smoothstep(0.6, 1.0, tone));
        glitter = mix(glitter, blueCol, smoothstep(0.0, 0.6, tone) * 0.9 * (1.0 - spark));
        // Dispersed grains: the brand's steel blues, with a few pale sparkles.
        vec3 granule = mix(vec3(0.23, 0.31, 0.46), vec3(0.56, 0.65, 0.8), aSeed.y);
        granule = mix(granule, vec3(0.78, 0.84, 0.93), spark);
        vColor = mix(glitter, granule, d);

        float size = mix(1.7, 3.2, aSeed.z * aSeed.z) + spark * 2.5;
        size *= mix(1.0, 0.8 + aSeed.z * 1.5, d);
        gl_PointSize = size * uScale * (5.8 / -mv.z);
        // The cloud is sparser than the sculpture: about half the particles bow out.
        vAlpha = mix(0.92, 0.95 * step(aSeed.w, 0.5), d);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uFade;
      varying vec3 vColor; varying float vAlpha; varying float vSpark;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;
        float a = smoothstep(0.5, 0.2, r) * vAlpha * uFade;
        // A faint grey edge on each grain, so white-on-pale still reads as glitter.
        vec3 col = mix(vColor, vColor * 0.8, smoothstep(0.22, 0.45, r));
        gl_FragColor = vec4(col + vSpark * 0.4, a);
      }`,
  });
  const points = new Points(geo, material);
  points.frustumCulled = false;
  rig.add(points);

  // The warm light behind the sculpture: a soft steel-blue glow that drifts slowly.
  const glow = new Mesh(
    new PlaneGeometry(3.4, 3.4),
    new ShaderMaterial({
      uniforms: { uFade: uniforms.uFade, uDisperse: uniforms.uDisperse },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `uniform float uFade, uDisperse; varying vec2 vUv;
        void main(){ float d = distance(vUv, vec2(0.5)) * 2.0; float a = pow(max(1.0 - d, 0.0), 2.2) * 0.5 * (1.0 - uDisperse) * uFade;
          gl_FragColor = vec4(0.37, 0.47, 0.66, a); }`,
    }),
  );
  glow.position.z = -1.4;
  glow.renderOrder = -1;
  scene.add(glow);

  /* --- Morph scheduling ----------------------------------------------------------- */
  let shape = '';
  let since = 0; // seconds since the last morph started
  function morphTo(name) {
    if (name === shape) return;
    // Freeze where each particle is now (same per-particle ease as the shader) as the new start.
    const m = uniforms.uMorph.value;
    for (let i = 0; i < COUNT; i++) {
      let k = Math.min(1, Math.max(0, m * 1.6 - seed[i * 4] * 0.6));
      k = k * k * (3 - 2 * k);
      for (let j = i * 3; j < i * 3 + 3; j++) from[j] += (to[j] - from[j]) * k;
      blue[i * 2] += (blue[i * 2 + 1] - blue[i * 2]) * k;
    }
    const fn = SAMPLERS[name];
    for (let i = 0; i < COUNT; i++) {
      const [x, y, z, b = 0] = fn();
      to[i * 3] = x;
      to[i * 3 + 1] = y;
      to[i * 3 + 2] = z;
      blue[i * 2 + 1] = b;
    }
    aFrom.needsUpdate = true;
    aTo.needsUpdate = true;
    aBlue.needsUpdate = true;
    uniforms.uMorph.value = 0;
    shape = name;
    since = 0;
  }
  // Open on the N, already formed.
  morphTo(SHAPES[0]);
  from.set(to);
  for (let i = 0; i < COUNT; i++) blue[i * 2] = blue[i * 2 + 1];
  uniforms.uMorph.value = 1.2;
  const next = () => SHAPES[(SHAPES.indexOf(shape) + 1) % SHAPES.length];
  // Hovering a service holds its shape; the timer only cycles when nothing is hovered.
  let held = false;
  document.querySelectorAll('[data-shape]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      if (!SAMPLERS[el.dataset.shape]) return;
      held = true;
      morphTo(el.dataset.shape);
    });
    el.addEventListener('pointerleave', () => { held = false; since = 0; });
  });
  if (import.meta.env.DEV) window.__v2rig = rig; // for local motion checks

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // The sculpture spans ~60% of the height, narrower screens by width.
    const fillH = Math.min(0.6, 0.9 * camera.aspect);
    camera.position.set(0, 0, (2.3 * R) / (2 * Math.tan((16 * Math.PI) / 180) * fillH));
    // Portrait: lift the sculpture clear of the headline and the paragraph under it.
    if (camera.aspect < 1) camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    uniforms.uScale.value = renderer.getPixelRatio() * Math.max(0.8, h / 900);
    uniforms.uCamZ.value = camera.position.z;
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

  let nod = 0; // 0 → 1 while the N is showing
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function draw(t, dt) {
    const p = stage.v2p ?? 0;
    uniforms.uTime.value = t;
    uniforms.uDisperse.value = smooth(0.06, 0.36, p);
    uniforms.uSwirl.value = smooth(0.42, 0.8, p);
    uniforms.uFade.value = 1 - smooth(0.86, 0.97, p);
    // Morph on a timer while the sculpture is whole.
    since += dt;
    uniforms.uMorph.value = Math.min(1.2, since / MORPH);
    if (!held && since > MORPH + HOLD && uniforms.uDisperse.value < 0.01) morphTo(next());
    // The light behind drifts slowly around the centre.
    glow.position.x = Math.cos(t * 0.23) * 0.35;
    glow.position.y = Math.sin(t * 0.31) * 0.3 - 0.05;
    // Frame-rate independent easing, so every change of pose glides in.
    const ease = (rate) => 1 - Math.exp(-rate * dt);
    pointer.x = lerp(pointer.x, pointer.tx, ease(2.4));
    pointer.y = lerp(pointer.y, pointer.ty, ease(2.4));
    let tiltX = pointer.y * 0.15;
    if (shape === 'n' && uniforms.uDisperse.value < 0.01) {
      // The N is flat: turn it to face the viewer, then nod it gently up and
      // down (a left-right sway read as a head-shake "no").
      // Wrap the spin into (-π, π] so it takes the short way to the front, and
      // turn quickly: the turn finishes while the particles are still forming
      // the N, so it never reads as a sideways sway.
      const TAU = Math.PI * 2;
      rig.rotation.y = ((((rig.rotation.y + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      rig.rotation.y = lerp(rig.rotation.y, 0, ease(7));
      nod = lerp(nod, 1, ease(1.2));
    } else {
      rig.rotation.y += dt * (0.22 - uniforms.uDisperse.value * 0.12);
      nod = lerp(nod, 0, ease(2));
    }
    tiltX += Math.sin(t * 1.1) * 0.22 * nod;
    rig.rotation.x = lerp(rig.rotation.x, tiltX, ease(4));
    rig.position.x = pointer.x * 0.08;
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
