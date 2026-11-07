import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  HemisphereLight,
  DirectionalLight,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  AnimationMixer,
  LoopOnce,
  Raycaster,
  Vector2,
  Box3,
  Group,
  BoxGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { isCoarsePointer } from '../core/env.js';

/**
 * The robot — a full rigged 3D model that plays on the page itself (loaded
 * lazily by v2-robot.js, on every page).
 *
 * Model: RobotExpressive by Tomás Laulhé (Quaternius), modified by Don
 * McCurdy — CC0 1.0, from the three.js examples (public/models/).
 *
 * The page is its playground. Headings, paragraphs and buttons are ledges
 * (their top edges, read live from the DOM), and the robot moves between
 * them with simple platform physics in screen pixels — the camera is
 * orthographic with one world unit per CSS pixel, so a ledge's
 * getBoundingClientRect() is directly where its feet go.
 *
 *   rest the cursor  on text for a moment and it walks over, jumps up onto it (a tall ledge: it grabs
 *                    the edge, hangs, and pulls itself up) and walks along it
 *   point lower      it walks to the edge and jumps off, landing on whatever
 *                    is below — another ledge or the bottom of the screen
 *   scroll           it rides the ledge it stands on; if the ledge carries it
 *                    off the top it falls; a ledge scrolling up past its hands
 *                    gets grabbed, and it hangs and climbs onto it
 *   leave it alone   after a few seconds it hops around the visible text on its own, then sits
 *   hover / click    waves / jump → thumbs up → nod → dance → punch → no;
 *                    four quick clicks and it plays dead — X eyes, tongue out — then gets back up
 *   ← / →            walks left / right
 *   hop targets      a section can mark elements [data-robot-hop]; while one
 *                    sits in an .is-active parent, the robot leaps onto it —
 *                    on the services page that's each ice card as you scroll
 *
 * The canvas is fixed to the viewport and never takes the pointer, so every
 * link, button and text selection keeps working underneath.
 */

const LEDGES = 'main h1, main h2, main h3, main h4, main p, main blockquote, main .v2-cta, main .v2-ghost, main .btn, main button, main .v2-tag, main .v2-chip, main .scope-pill, main .sim__pill, footer p, footer h2, [data-robot-hop]';
const EMOTES = ['Jump', 'ThumbsUp', 'Yes', 'Dance', 'Punch']; // no 'No': a head-shake reads as rejection
const ONCE = ['Jump', 'ThumbsUp', 'Yes', 'No', 'Wave', 'Punch', 'Death', 'Sitting', 'Standing', 'WalkJump'];
const GRAVITY = 2600; // px/s²
const REACH = 2.3; // highest ledge it will go for, in robot heights
const HANDS = 0.9; // hand height when hanging, in robot heights
const IDLE_PLAY = 7000; // ms without input before it plays on its own
const PLAY_EVERY = 5500; // ms between its own hops while playing
const SIT_AFTER = 20000; // ms without input before it sits down
const DWELL = 550; // ms the cursor rests on a ledge before it goes for it
const WALK = 0.9; // walking speed in robot heights per second (matches the walk cycle)
const RUN = 2.2; // running speed, same units
const ACCEL = 3.2; // walking acceleration, robot heights per second²
const BRAKE = 6; // and braking, so it eases into a stop instead of halting
// Frame-rate independent easing: `rate` is roughly "1 / seconds to settle".
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

export default function v2RobotScene(canvas) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  const layer = canvas.parentElement;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 4000);
  camera.position.z = 2000;
  scene.add(new HemisphereLight(0xffffff, 0x9aa8c4, 2.1));
  // A cool rim from behind lifts the silhouette off the page.
  const rim = new DirectionalLight(0xbcd0f5, 1.6);
  rim.position.set(300, 300, -600);
  scene.add(rim);
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-300, 600, 800);
  scene.add(sun);

  // A soft blob shadow under the feet (a ledge has no floor to cast onto).
  const shadow = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uAlpha: { value: 0.22 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `uniform float uAlpha; varying vec2 vUv;
        void main(){ float d = distance(vUv, vec2(0.5)) * 2.0; gl_FragColor = vec4(vec3(0.06, 0.08, 0.12), pow(max(1.0 - d, 0.0), 1.5) * uAlpha); }`,
    }),
  );
  shadow.position.z = -500;
  scene.add(shadow);

  /* --- Screen, size, state -------------------------------------------------------- */
  let W = 1;
  let H = 1;
  let RH = 150; // robot height in px
  let floorY = 1;
  const s = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, mode: 'ground', on: null, grab: null, dropTo: null, leap: null, walking: false, hangT: 0, yaw: 0, lookYaw: 0, lookPitch: 0 };
  const goal = { x: 0, el: null };
  const pointer = { x: 0, y: 0, seen: false };
  let lastInput = performance.now();
  let lastPlay = 0;
  let sitting = false;
  const cooldown = {};
  const ready = (key, ms) => {
    const now = performance.now();
    if (now - (cooldown[key] ?? 0) < ms) return false;
    cooldown[key] = now;
    return true;
  };
  const clampX = (x) => Math.max(RH * 0.3, Math.min(W - RH * 0.3, x));

  function resize() {
    W = innerWidth;
    H = innerHeight;
    renderer.setSize(W, H, false);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    // Small enough to stand on a line of text without hiding the paragraph.
    RH = Math.round(Math.max(90, Math.min(isCoarsePointer ? 110 : 165, H * (W < H ? 0.12 : 0.17))));
    // Above the mobile action bar when it is showing.
    const dock = document.querySelector('.v2-dock');
    floorY = H - 2 - (dock && getComputedStyle(dock).display !== 'none' ? dock.offsetHeight : 0);
    if (robot) robot.scale.setScalar(RH / modelH);
    shadow.scale.set(RH * 0.55, RH * 0.13, 1);
    s.x = clampX(s.x);
  }

  /* --- Ledges: the page's text and buttons, tracked while on screen ---------------- */
  const visible = new Set();
  const lastTop = new Map();
  const prevTop = new Map(); // each ledge's top one frame ago — ledges move (scroll, the services descent)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
  });
  // Diffed, not rebuilt: clearing `visible` on every rescan left the robot with
  // no ledges for a frame, so it dropped or lost its target every few seconds.
  const watched = new Set();
  function scan() {
    const now = new Set(
      [...document.querySelectorAll(LEDGES)].filter(
        (el) =>
          !el.closest('.v2-robot-layer, .nav-drawer, [data-v2-loader], [hidden], .v2-talk__card, .gtrack') &&
          // A hop card is one ledge: its inner text isn't a second place to land.
          !(el.closest('[data-robot-hop]') && !el.hasAttribute('data-robot-hop')),
      ),
    );
    for (const el of watched) {
      if (now.has(el)) continue;
      io.unobserve(el);
      watched.delete(el);
      visible.delete(el);
      lastTop.delete(el);
    }
    for (const el of now) {
      if (watched.has(el)) continue;
      io.observe(el);
      watched.add(el);
    }
  }
  const rectOf = (el) => el.getBoundingClientRect();
  const shown = (el) => (el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
  // A ledge it can use: wide enough, on screen, and low enough that its head stays in view.
  const usable = (r) => r.width >= 60 && r.height > 0 && r.top > RH * 0.7 && r.top < floorY - 6 && r.right > 0 && r.left < W;
  function ledgeAt(px, py) {
    let best = null;
    let area = Infinity;
    for (const el of visible) {
      const r = rectOf(el);
      if (px < r.left || px > r.right || py < r.top - 10 || py > r.bottom + 4 || !usable(r) || !shown(el)) continue;
      const a = r.width * r.height;
      if (a < area) { area = a; best = el; }
    }
    return best;
  }

  /* --- Model and animation ------------------------------------------------------------ */
  let robot = null;
  let modelH = 1;
  let footOffset = 0;
  let mixer = null;
  let head = null;
  let headRest = null;
  const actions = {};
  let current = null;
  let busy = false; // a one-shot emote is playing
  let dancing = false;

  function play(name, fade = 0.4) {
    const next = actions[name];
    if (!next || next === current) return;
    current?.fadeOut(fade);
    next.paused = false;
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(fade).play();
    current = next;
  }
  const grounded = () => s.mode === 'ground' || s.mode === 'platform';
  function emote(name) {
    if (!actions[name] || sitting || !grounded()) return;
    dancing = name === 'Dance';
    busy = !dancing;
    s.walking = false; // plant the feet: no sliding while it gestures
    s.speed = 0;
    play(name, 0.35);
  }
  function stand() {
    if (!sitting) return;
    sitting = false;
    busy = true;
    play('Standing', 0.3);
  }

  /* --- Playing dead: X eyes and a lolling tongue, parented to the head bone --------- */
  // Positions are in the head bone's own space (the model's units, not pixels):
  // the round eyes sit at x ±0.007, y 0.006 on the front face (z ≈ 0.0125).
  let eyes = null;
  const dead = new Group();
  dead.visible = false;
  let tongue = null;
  let deadTip = 0;
  function buildDeadFace() {
    if (!head) return;
    eyes = robot.getObjectByName('Head_4');
    const ink = new MeshBasicMaterial({ color: 0x0b1226 });
    for (const x of [-0.007, 0.007]) {
      const cross = new Group();
      for (const a of [Math.PI / 4, -Math.PI / 4]) {
        const bar = new Mesh(new BoxGeometry(0.0105, 0.0017, 0.0012), ink);
        bar.rotation.z = a;
        cross.add(bar);
      }
      cross.position.set(x, 0.0065, 0.0136);
      dead.add(cross);
    }
    const pink = new MeshStandardMaterial({ color: 0xe8647c, roughness: 0.55 });
    tongue = new Group();
    const body = new Mesh(new BoxGeometry(0.0036, 0.0075, 0.0016), pink);
    body.position.y = -0.00375; // hangs from the pivot at the mouth line
    const tip = new Mesh(new BoxGeometry(0.0036, 0.0014, 0.0017), new MeshStandardMaterial({ color: 0xc94a63, roughness: 0.55 }));
    tip.position.y = -0.0076;
    tongue.add(body, tip);
    // Drawn over the body: lying down, the torso sits in front of the mouth, and the tongue should loll over it.
    for (const m of [body, tip]) {
      m.material.depthTest = false;
      m.renderOrder = 5;
    }
    tongue.position.set(0.0012, 0.0006, 0.0128);
    dead.add(tongue);
    head.add(dead);
  }
  function deadFace(on) {
    if (!eyes) return;
    dead.visible = on;
    eyes.visible = !on;
  }

  new GLTFLoader().load('/models/robot-expressive.glb', (gltf) => {
    robot = gltf.scene;
    // Re-skin the stock model in the brand palette: steel-blue body, pale
    // plating, midnight face — satin metal rather than flat toy plastic.
    const SKIN = { Main: ['#5e79a8', 0.42, 0.3], Grey: ['#dfe6f2', 0.5, 0.2], Black: ['#101b35', 0.35, 0.1] };
    robot.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        const k = SKIN[m.name];
        if (!k) return;
        m.color.set(k[0]);
        m.roughness = k[1];
        m.metalness = k[2];
        m.needsUpdate = true;
      });
    });
    const box = new Box3().setFromObject(robot);
    modelH = box.max.y - box.min.y;
    footOffset = -box.min.y;
    robot.traverse((o) => {
      if (o.isBone && o.name === 'Head') head = o;
    });
    headRest = head?.quaternion.clone();
    buildDeadFace();
    mixer = new AnimationMixer(robot);
    for (const clip of gltf.animations) {
      const a = mixer.clipAction(clip);
      if (ONCE.includes(clip.name)) {
        a.clampWhenFinished = true;
        a.loop = LoopOnce;
      }
      actions[clip.name] = a;
    }
    mixer.addEventListener('finished', ({ action }) => {
      const name = action.getClip().name;
      if (name === 'Sitting') return; // seated until you come back
      if (name === 'Jump' && !grounded()) return; // a jump in flight ends on landing
      if (name === 'Death') {
        setTimeout(() => { busy = true; deadFace(false); play('Standing', 0.3); }, 2200);
        return;
      }
      busy = false;
      play('Idle', 0.4);
    });
    resize();
    scan();
    // Drops in from the right to say hello.
    s.x = clampX(W * 0.86);
    s.y = floorY;
    goal.x = clampX(W * 0.78);
    scene.add(robot);
    if (import.meta.env.DEV) window.__robotModel = robot;
    play('Idle', 0);
    layer.classList.add('has-3d');
    start();
  });
  window.addEventListener('resize', () => { resize(); scan(); });
  setInterval(scan, 3000); // pages change (filters, accordions, the scope card)

  /* --- Movement primitives ---------------------------------------------------------------- */
  // `dropTo`: the ledge it means to land on ('floor' for the bottom); it passes
  // through anything else on the way down instead of stair-stepping. A fall it
  // didn't choose (its ledge scrolled away) has none and lands on whatever's below.
  function takeoff(vx, vy, dropTo = null) {
    s.mode = 'air';
    s.on = null;
    s.vx = vx;
    s.vy = vy;
    s.dropTo = dropTo;
    s.walking = false;
    s.speed = 0;
    dancing = false;
    play('Jump', 0.12);
    // Skip the wind-up crouch: the body is already leaving the ground.
    if (actions.Jump && current === actions.Jump && vy < 0) actions.Jump.time = actions.Jump.getClip().duration * 0.12;
  }
  // Up onto ledge `el` (top `r.top`), aiming for `x` on it: a short one it jumps
  // onto, a tall one it grabs and hangs from. The sideways speed is set so the
  // arc gets there — from a ledge that doesn't reach under it, too.
  const tries = { el: null, n: 0 };
  function jumpUp(el, r, x) {
    tries.n = tries.el === el ? tries.n + 1 : 1;
    tries.el = el;
    const rise = s.y - r.top;
    const dx = x - s.x;
    if (rise > RH * HANDS) {
      // Arrive under the edge at the top of the jump, hands at the ledge.
      const vy = Math.sqrt(2 * GRAVITY * (rise - RH * HANDS + 14));
      s.grab = el;
      takeoff(dx / (vy / GRAVITY), -vy, el);
    } else {
      // Clear the top by a quarter of its height, land on the way down.
      const over = RH * 0.25;
      const vy = Math.sqrt(2 * GRAVITY * (rise + over));
      takeoff(dx / ((vy + Math.sqrt(2 * GRAVITY * over)) / GRAVITY), -vy, el);
    }
  }
  // A homing leap onto a hop target: an arc that re-aims at the target's live
  // position every frame, so it lands even on a card that's still gliding.
  function leapTo(el) {
    const r = rectOf(el);
    const dist = Math.hypot((r.left + r.right) / 2 - s.x, r.top - s.y);
    s.mode = 'leap';
    s.on = null;
    s.leap = { el, t: 0, x0: s.x, y0: s.y, dur: 0.55 + dist / 2400 };
    s.walking = false;
    dancing = false;
    play('Jump', 0.08);
    if (actions.Jump && current === actions.Jump) actions.Jump.time = actions.Jump.getClip().duration * 0.2;
  }
  function hopOff(dir, dropTo) {
    takeoff(dir * RH * 1.2, -Math.sqrt(2 * GRAVITY * RH * 0.3), dropTo);
  }
  function walk(tx, dt, span) {
    const lo = span ? span[0] : RH * 0.3;
    const hi = span ? span[1] : W - RH * 0.3;
    const target = Math.max(lo, Math.min(hi, tx));
    const gap = target - s.x;
    // Hysteresis: ignore small offsets, but once walking, finish the step.
    const dist = Math.abs(gap);
    if (dist < (s.walking ? 4 : 16)) {
      s.walking = false;
      s.speed = 0;
      return false;
    }
    s.walking = true;
    // Ease up to speed, and slow down on the approach so it arrives rather than stops dead.
    const top = RH * (dist > RH * 2.5 ? RUN : WALK);
    const want = Math.min(top, dist * 3 + RH * 0.2);
    const step = (want > s.speed ? ACCEL : BRAKE) * RH * dt;
    s.speed += Math.max(-step, Math.min(step, want - s.speed));
    s.x += Math.sign(gap) * Math.min(dist, s.speed * dt);
    const run = s.speed > RH * 1.5;
    play(run ? 'Running' : 'Walking', 0.35);
    // Keep the feet in step with the ground speed.
    current?.setEffectiveTimeScale(Math.max(0.55, Math.min(1.25, s.speed / (RH * (run ? RUN : WALK)))));
    s.yaw = damp(s.yaw, Math.sign(gap) * Math.PI * 0.5, 9, dt);
    return true;
  }

  /* --- Input ----------------------------------------------------------------------------- */
  const ray = new Raycaster();
  const ndc = new Vector2();
  function overRobot(px, py) {
    if (!robot) return false;
    ndc.set((px / W) * 2 - 1, -(py / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(robot, true).length > 0;
  }
  function aim(px, py) {
    const el = ledgeAt(px, py);
    if (el !== goal.el) tries.n = 0; // a fresh target gets fresh attempts
    goal.el = el;
    if (el) {
      const r = rectOf(el);
      goal.x = Math.max(r.left + RH * 0.25, Math.min(r.right - RH * 0.25, px));
    } else {
      goal.x = clampX(px + (px > W * 0.75 ? -1 : 1) * RH * 1.2);
    }
  }
  function wake() {
    lastInput = performance.now();
    stand();
  }
  const pending = { el: null, since: 0 };
  let lastPointer = 0;
  let nodPending = false;
  function hover(px, py) {
    lastPointer = performance.now();
    const el = ledgeAt(px, py);
    if (el !== pending.el) {
      pending.el = el;
      pending.since = lastPointer;
    }
  }
  // The cursor steers: along the current footing straight away, onto a new
  // ledge only once it has rested there a moment — no hopping at every twitch.
  function steer(now) {
    if (!pointer.seen || now - lastPointer >= IDLE_PLAY) return;
    if (pending.el !== goal.el && now - pending.since >= DWELL) {
      tries.n = 0;
      goal.el = pending.el;
      if (goal.el) nodPending = true;
    }
    let x;
    if (goal.el) {
      const r = rectOf(goal.el);
      x = Math.max(r.left + RH * 0.25, Math.min(r.right - RH * 0.25, pointer.x));
    } else {
      x = clampX(pointer.x + (pointer.x > W * 0.75 ? -1 : 1) * RH * 1.2);
    }
    // Dead zone: small cursor moves along a row (the services) don't send it
    // pacing back and forth, turning left and right each time.
    if (Math.abs(x - goal.x) > RH * 1.5) goal.x = x;
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    wake();
    const over = overRobot(e.clientX, e.clientY);
    document.documentElement.classList.toggle('is-over-robot', over);
    // A hover gets a nod (up and down); the wave's side-to-side arm read as a 'no'.
    if (over && !cooldown.hovering && !busy && grounded() && ready('nod', 4000)) emote('Yes');
    cooldown.hovering = over;
    if (!over) hover(e.clientX, e.clientY);
  }, { passive: true });

  let clicks = [];
  window.addEventListener('pointerdown', (e) => {
    wake();
    if (overRobot(e.clientX, e.clientY)) {
      const now = performance.now();
      clicks = [...clicks.filter((t) => now - t < 2200), now];
      if (clicks.length >= 4 && grounded()) {
        clicks = [];
        dancing = false;
        busy = true;
        deadFace(true);
        play('Death', 0.2);
        return;
      }
      cooldown.emote = ((cooldown.emote ?? -1) + 1) % EMOTES.length;
      emote(EMOTES[cooldown.emote]);
    } else if (e.pointerType === 'touch') {
      aim(e.clientX, e.clientY);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    wake();
    lastPointer = 0; // keys take over from the cursor
    goal.el = null;
    goal.x = clampX(s.x + (e.key === 'ArrowRight' ? 1 : -1) * RH * 1.6);
  });
  window.addEventListener('scroll', () => { lastInput = performance.now(); }, { passive: true });

  // Left alone, it picks a ledge within reach and goes for it.
  function playOnItsOwn(now) {
    if (now - lastInput < IDLE_PLAY || now - lastPlay < PLAY_EVERY || busy || sitting || !grounded()) return;
    lastPlay = now;
    const options = [...visible].filter((el) => {
      if (el === s.on) return false;
      const r = rectOf(el);
      const rise = s.y - r.top;
      return usable(r) && shown(el) && rise < RH * REACH && rise > -H * 0.6 && Math.abs((r.left + r.right) / 2 - s.x) < W * 0.5;
    });
    if (!options.length) {
      goal.el = null;
      goal.x = clampX(s.x + (Math.random() - 0.5) * RH * 4);
      return;
    }
    const el = options[Math.floor(Math.random() * options.length)];
    const r = rectOf(el);
    goal.el = el;
    goal.x = r.left + RH * 0.3 + Math.random() * Math.max(0, r.width - RH * 0.6);
  }

  /* --- Frame ----------------------------------------------------------------------------- */
  // A section can hand the robot its next stage: the [data-robot-hop] element
  // inside whatever is .is-active (the services page's current ice card).
  function hopTarget(now) {
    const hop = document.querySelector('.is-active > [data-robot-hop]');
    if (!hop || !visible.has(hop) || !shown(hop) || !usable(rectOf(hop))) return false;
    if (goal.el !== hop) {
      tries.n = 0;
      goal.el = hop;
    }
    const r = rectOf(hop);
    goal.x = (r.left + r.right) / 2;
    lastInput = now; // no idle play or sitting while it's busy hopping
    return true;
  }

  function think(dt, now) {
    if (!hopTarget(now)) {
      steer(now);
      playOnItsOwn(now);
    }
    if (!sitting && !busy && grounded() && now - lastInput > SIT_AFTER) {
      sitting = true;
      dancing = false;
      play('Sitting', 0.5);
    }

    // Track ledges scrolling past: one rising through its hands gets grabbed.
    const handY = s.y - RH * 0.92;
    for (const el of visible) {
      const r = rectOf(el);
      const before = lastTop.get(el);
      lastTop.set(el, r.top);
      prevTop.set(el, before ?? r.top);
      if (
        grounded() && !busy && !sitting && el !== s.on && before !== undefined &&
        before > handY + 1 && r.top <= handY && r.top > handY - 60 &&
        s.x > r.left && s.x < r.right && usable(r) && shown(el) && ready('grab', 2500)
      ) {
        s.mode = 'hang';
        s.on = el;
        s.hangT = 0;
        hangPose();
      }
    }

    if (s.mode === 'ground' || s.mode === 'platform') {
      let span = null;
      if (s.mode === 'platform') {
        const r = rectOf(s.on);
        if (!s.on.isConnected || !usable(r)) {
          // The ledge is gone, scrolled under the floor or carried off the top: drop.
          if (r.top >= floorY - 6) { s.mode = 'ground'; s.on = null; s.y = floorY; }
          else {
            // Don't land straight back on the ledge it just slipped off.
            const left = s.on;
            takeoff(0, 0);
            s.skip = left;
          }
          return;
        }
        s.y = r.top;
        span = [r.left + RH * 0.2, r.right - RH * 0.2];
        s.x = Math.max(span[0], Math.min(span[1], s.x));
      } else {
        s.y = floorY;
      }
      if (busy || sitting) {
        s.yaw = damp(s.yaw, 0, 5, dt); // turn to face you while it gestures
        return;
      }

      let moved = false;
      let target = goal.el && goal.el !== s.on && goal.el.isConnected ? goal.el : null;
      if (target) {
        let r = rectOf(target);
        // Too high for one jump: climb via the best stepping stone on the way up.
        if (usable(r) && s.y - r.top > RH * REACH) {
          const step = stepToward(r);
          if (step) {
            target = step;
            r = rectOf(step);
          }
        }
        if (!usable(r)) {
          goal.el = null;
        } else {
          const rise = s.y - r.top;
          const under = Math.max(r.left + RH * 0.2, Math.min(r.right - RH * 0.2, s.x));
          if (target.hasAttribute('data-robot-hop')) {
            // Hop targets: leap straight there from wherever it stands, any height.
            leapTo(target);
          } else if (rise > 8 && rise <= RH * REACH && tries.el === target && tries.n >= 3) {
            goal.el = null; // three misses: give it up
          } else if (rise > 8 && rise <= RH * REACH) {
            // Get as close beneath it as our footing allows, then jump for it.
            moved = walk(under, dt, span);
            if (!moved) jumpUp(target, r, under);
          } else if (rise > RH * REACH) {
            moved = walk(under, dt, span); // too high: stand under it and look up
          } else if (span) {
            // Lower or level: walk to our edge facing it and hop off toward it.
            const dir = Math.sign(goal.x - s.x) || 1;
            moved = walk(dir > 0 ? span[1] : span[0], dt, span);
            if (!moved) hopOff(dir, target);
          } else {
            moved = walk(goal.x, dt, null);
          }
        }
      } else if (span) {
        // Aiming somewhere off this ledge: walk to its edge and jump down.
        const inside = goal.x >= span[0] - 4 && goal.x <= span[1] + 4;
        if (inside || goal.el === s.on) moved = walk(goal.x, dt, span);
        else {
          const dir = Math.sign(goal.x - s.x);
          moved = walk(dir > 0 ? span[1] : span[0], dt, span);
          if (!moved) hopOff(dir, 'floor');
        }
      } else {
        moved = walk(goal.x, dt, null);
      }

      if (!moved && grounded() && !dancing && current !== actions.Idle) play('Idle', 0.4);
      if (!moved && grounded()) {
        s.yaw = damp(s.yaw, 0, 4, dt); // face the viewer when still
        if (nodPending && !busy && !dancing) {
          nodPending = false;
          emote('Yes'); // the model's own up-and-down nod
        }
      }
    } else if (s.mode === 'air') {
      const prevY = s.y;
      s.vy += GRAVITY * dt;
      s.x = clampX(s.x + s.vx * dt);
      s.y += s.vy * dt;
      if (s.vx) s.yaw = damp(s.yaw, Math.sign(s.vx) * Math.PI * 0.5, 10, dt);
      // Reaching for a ledge: catch it at the top of the jump.
      if (s.grab) {
        const r = rectOf(s.grab);
        if (s.vy > -120 && s.y - RH * HANDS <= r.top + 10 && s.x > r.left - 20 && s.x < r.right + 20 && usable(r)) {
          s.mode = 'hang';
          s.on = s.grab;
          s.grab = null;
          s.hangT = 0;
          s.x = Math.max(r.left + RH * 0.2, Math.min(r.right - RH * 0.2, s.x));
          hangPose();
          return;
        }
        if (s.vy > 200) {
          // Missed it: land wherever it can, including back where it started.
          s.grab = null;
          s.dropTo = null;
        }
      }
      if (s.vy > 0) {
        // Land where it meant to; on a fall it didn't choose, on the first ledge below.
        for (const el of visible) {
          if ((s.dropTo && s.dropTo !== el) || el === s.skip) continue;
          const r = rectOf(el);
          // Measured against the ledge itself, so one rising under the feet still catches them.
          const was = prevTop.get(el) ?? r.top;
          if (s.x >= r.left && s.x <= r.right && prevY - was <= 6 && s.y >= r.top && usable(r) && shown(el)) {
            land('platform', el, r.top);
            return;
          }
        }
        if (s.y >= floorY) land('ground', null, floorY);
      }
    } else if (s.mode === 'leap') {
      const L = s.leap;
      const r = rectOf(L.el);
      if (!L.el.isConnected || !usable(r)) {
        s.leap = null;
        takeoff(0, 0); // the card went away mid-leap: just fall
        return;
      }
      L.t += dt;
      const u = Math.min(1, L.t / L.dur);
      const tx = Math.max(r.left + RH * 0.25, Math.min(r.right - RH * 0.25, (r.left + r.right) / 2));
      const arc = RH * 0.7 + Math.max(0, L.y0 - r.top) * 0.2;
      s.x = L.x0 + (tx - L.x0) * u;
      s.y = L.y0 + (r.top - L.y0) * u - arc * 4 * u * (1 - u);
      s.yaw = damp(s.yaw, Math.sign(tx - L.x0) * Math.PI * 0.5, 9, dt);
      if (u >= 1) {
        s.leap = null;
        land('platform', L.el, r.top);
      }
    } else if (s.mode === 'hang') {
      const r = rectOf(s.on);
      if (!s.on.isConnected || !usable(r)) { release(); takeoff(0, 0); return; }
      s.y = r.top + RH * HANDS;
      s.yaw = damp(s.yaw, 0, 12, dt);
      s.hangT += dt;
      if (s.hangT > 0.6) {
        // Pull up: a small hop that lands on the ledge.
        const ledge = s.on;
        release();
        takeoff(0, -Math.sqrt(2 * GRAVITY * (RH * HANDS + 16)), ledge);
      }
    }
  }
  // A ledge within one jump that is closer to `goalRect` (higher, and near it sideways).
  function stepToward(goalRect) {
    const gx = (goalRect.left + goalRect.right) / 2;
    let best = null;
    let score = Infinity;
    for (const el of visible) {
      if (el === s.on) continue;
      const r = rectOf(el);
      const rise = s.y - r.top;
      if (rise < RH * 0.3 || rise > RH * REACH || r.top <= goalRect.top || !usable(r) || !shown(el)) continue;
      const sc = Math.abs((r.left + r.right) / 2 - gx) + (r.top - goalRect.top) * 0.6;
      if (sc < score) { score = sc; best = el; }
    }
    return best;
  }
  function hangPose() {
    const a = actions.Jump;
    if (!a) return;
    current?.fadeOut(0.1);
    a.reset().fadeIn(0.1).play();
    a.time = a.getClip().duration * 0.42; // arms up, mid-jump
    a.paused = true;
    current = a;
    s.vx = 0;
    s.vy = 0;
    dancing = false;
  }
  function release() {
    if (actions.Jump) actions.Jump.paused = false;
  }
  function land(mode, el, y) {
    if (el && el === tries.el) tries.n = 0; // made it
    s.mode = mode;
    s.on = el;
    s.y = y;
    s.vx = 0;
    s.vy = 0;
    s.grab = null;
    s.skip = null;
    play('Idle', 0.4);
  }

  function render(dt, now) {
    if (!robot) return;
    think(dt, now);
    // ground / platform / air / leap / hang, on the layer for styling (and debugging).
    if (layer.dataset.mode !== s.mode) layer.dataset.mode = s.mode;
    if (import.meta.env.DEV) window.__robot = { x: Math.round(s.x), y: Math.round(s.y), RH, yaw: +s.yaw.toFixed(2), mode: s.mode, action: current?.getClip().name, walking: s.walking, goal: Math.round(goal.x), busy };

    robot.position.set(s.x - W / 2, H / 2 - s.y + footOffset * (RH / modelH), 0);
    robot.rotation.y = s.yaw;
    // Reset the head to its rest pose before the animation writes it, so the
    // cursor-look below never piles up frame on frame (it used to wobble).
    if (head && headRest) head.quaternion.copy(headRest);
    mixer.update(dt);
    if (dead.visible && tongue) tongue.rotation.z = Math.sin(now / 160) * 0.12;
    // Lying on its back the face points at the ceiling: tip the head toward the viewer (the neck stays put) so the X eyes and tongue read.
    const lying = dead.visible && current === actions.Death && actions.Death.time > actions.Death.getClip().duration * 0.45;
    deadTip = damp(deadTip, lying ? 1 : 0, lying ? 4 : 6, dt);
    if (head && deadTip > 0.001) head.rotateX(1.15 * deadTip);
    robot.position.y += RH * 0.2 * deadTip; // the tipped head would dip below the floor

    // Shadow on whatever it stands on; fades while it's in the air.
    shadow.position.x = s.x - W / 2;
    shadow.position.y = H / 2 - (grounded() ? s.y : s.mode === 'hang' ? -9999 : s.y);
    shadow.material.uniforms.uAlpha.value = grounded() ? 0.22 : 0.08;
    renderer.render(scene, camera);
  }

  let raf = 0;
  let running = false;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    render(dt, now);
    raf = requestAnimationFrame(frame);
  };
  function start() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
