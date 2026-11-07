import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  IcosahedronGeometry,
  ShaderMaterial,
  Points,
  BufferGeometry,
  BufferAttribute,
  Color,
} from 'three';
import { prefersReducedMotion, isLowPower, isCoarsePointer, lerp } from '../core/env.js';

/**
 * Version 2 — the frosted orb (hero and "We Build" section).
 *
 *   <canvas data-module="v2Orb" data-lazy [data-tone="white"]>
 *
 * A sugar-frosted sphere: a slightly lumpy surface (low-frequency noise in
 * the vertex shader), fine grain and sparkling specks in the fragment shader,
 * a warm glow deep in the centre fading to a pale frosted rim, lit softly
 * from above. A layer of twinkling motes sits just above the surface. It
 * slowly turns and leans toward the cursor. data-tone="white" is the paler
 * variant used further down the page.
 *
 * Skipped on low-powered devices or without WebGL — the CSS orb underneath
 * ([data-orb-fallback]) stays. Under reduced motion: one still frame.
 */

// Ashima Arts 3D simplex noise (MIT).
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

const RADIUS = 1.04;
// Share of the canvas height the orb's diameter fills (capped by width on narrow screens).
const FILL = 0.48;

export default function v2Orb(canvas) {
  if (isLowPower) return;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
  const white = canvas.dataset.tone === 'white';

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);

  const uniforms = {
    uTime: { value: 0 },
    uGlow: { value: new Color('#bccbe3') },
    uWarm: { value: new Color('#ffffff') },
    uFrost: { value: new Color('#fffefb') },
    uShade: { value: new Color('#d3d9e6') },
    uGlowAmt: { value: white ? 0.5 : 0.62 },
  };

  const orb = new Mesh(
    new IcosahedronGeometry(RADIUS, 80),
    new ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal; varying vec3 vView; varying vec3 vObj; varying vec3 vWorldN;
        ${NOISE}
        void main() {
          // Lumpy, slowly shifting silhouette.
          float n = snoise(normal * 1.3 + vec3(0.0, uTime * 0.08, 0.0)) * 0.035
                  + snoise(normal * 3.2 - vec3(uTime * 0.05)) * 0.012;
          vec3 p = position + normal * n;
          vObj = p;
          vNormal = normalize(normalMatrix * normal);
          vWorldN = normalize(mat3(modelMatrix) * normal);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uGlow; uniform vec3 uWarm; uniform vec3 uFrost; uniform vec3 uShade; uniform float uGlowAmt;
        varying vec3 vNormal; varying vec3 vView; varying vec3 vObj; varying vec3 vWorldN;
        ${NOISE}
        float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        void main() {
          vec3 n = normalize(vNormal);
          float facing = clamp(dot(vView, n), 0.0, 1.0);
          // Soft light from above and a little to the left.
          float light = clamp(dot(vWorldN, normalize(vec3(-0.35, 0.8, 0.5))) * 0.5 + 0.5, 0.0, 1.0);
          // Warm core seen through the frost: strongest face-on, gone at the rim.
          float core = pow(facing, 2.6);
          vec3 col = mix(uFrost, uWarm, core * 0.85);
          col = mix(col, uGlow, pow(facing, 7.0) * uGlowAmt);
          col = mix(uShade, col, 0.7 + 0.3 * light);
          // Frost grain: two scales of noise, like sugar.
          float g1 = snoise(vObj * 22.0) * 0.5 + 0.5;
          float g2 = snoise(vObj * 70.0) * 0.5 + 0.5;
          col *= 0.93 + 0.07 * g1 + 0.05 * (g2 - 0.5);
          // A few faint craters / folds.
          float fold = smoothstep(0.55, 0.75, snoise(vObj * 4.0 + 3.0) * 0.5 + 0.5);
          col = mix(col, col * 0.94, fold * 0.5);
          // Sparkling specks that catch the light.
          vec3 cell = floor(vObj * 120.0);
          float h = hash(cell);
          float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 40.0);
          float speck = step(0.93, h) * tw;
          col = mix(col, vec3(0.30, 0.42, 0.64), speck * 0.85);
          // Pale frosted rim that dissolves softly into the background.
          float rim = pow(1.0 - facing, 3.0);
          col = mix(col, uFrost * 1.02, rim * 0.6);
          float alpha = smoothstep(0.0, 0.12, facing);
          gl_FragColor = vec4(col, alpha);
        }`,
    }),
  );
  scene.add(orb);

  // Twinkling motes just above the surface.
  const COUNT = 1400;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = RADIUS * (1.0 + Math.random() * 0.03);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    seed[i] = Math.random();
  }
  const motesGeo = new BufferGeometry();
  motesGeo.setAttribute('position', new BufferAttribute(pos, 3));
  motesGeo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  const motes = new Points(
    motesGeo,
    new ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uScale: { value: 1 } },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uScale; attribute float aSeed; varying float vA;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // Only the hemisphere facing the camera, twinkling.
          vec3 n = normalize(mat3(modelViewMatrix) * position);
          vA = smoothstep(0.1, 0.5, n.z) * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.5) + aSeed * 60.0), 3.0));
          gl_PointSize = (1.0 + aSeed * 1.6) * uScale;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.37, 0.47, 0.66), vA * smoothstep(0.5, 0.1, d)); }`,
    }),
  );
  orb.add(motes);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the orb at a fixed share of the height, narrower screens by width.
    const fill = Math.min(FILL, 0.78 * (w / h));
    camera.position.set(0, 0, (2 * RADIUS) / (2 * Math.tan((16 * Math.PI) / 180) * fill));
    camera.updateProjectionMatrix();
    motes.material.uniforms.uScale.value = renderer.getPixelRatio();
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

  const host = canvas.closest('[data-orb-host]') ?? canvas.parentElement;
  const reveal = () => host.classList.add('has-3d');

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
    reveal();
    return;
  }

  let raf = 0;
  let running = false;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;
    pointer.x = lerp(pointer.x, pointer.tx, 0.04);
    pointer.y = lerp(pointer.y, pointer.ty, 0.04);
    orb.rotation.y += dt * 0.06;
    orb.rotation.x = pointer.y * 0.12;
    orb.position.x = pointer.x * 0.06;
    renderer.render(scene, camera);
    if (!host.classList.contains('has-3d')) reveal();
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  let onScreen = false;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : onScreen && start()));
}
