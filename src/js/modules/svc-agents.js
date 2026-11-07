/**
 * Agent cursors — the "page is being built by a crew of agents" effect.
 *
 * Real pointer cursors (they do not rotate) with a name chip, on a canvas fixed
 * to the viewport. A small tween engine drives them: `go()` flies a cursor to a
 * target along a gentle curve (longer flights take longer), and `arrive` fires
 * the moment it lands, with a click ripple. Targets are functions read every
 * frame, so a cursor stays attached to its element while the page scrolls.
 *
 * Built to stay smooth on slow machines:
 *  - each cursor is drawn once to a small sprite and then just blitted
 *  - element rects are read at most once per frame (`rect()`), however many
 *    cursors and guides ask, so the page is never forced to lay out repeatedly
 *  - the loop sleeps when nothing is on screen
 *
 * The canvas never takes the pointer, and is not created for reduced motion.
 */
const PALETTE = [
  ['#ff7d9c', 'Nova'],
  ['#4ad6dc', 'Kite'],
  ['#f4efe4', 'Aria'],
  ['#a58bff', 'Juno'],
  ['#6fa8ff', 'Echo'],
  ['#ffc36b', 'Lyra'],
  ['#ff7d9c', 'Sage'],
  ['#4ad6dc', 'Remy'],
  ['#a58bff', 'Iris'],
];
// A classic pointer: tip at the origin.
const ARROW = new Path2D('M0 0 L0 16.5 L4.4 12.6 L7.3 19.4 L10.2 18.1 L7.3 11.6 L13 11.6 Z');
const SCALE = 1.18;
const PAD = 6;

const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function createAgents(canvas, { count = 9 } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 1;
  let H = 1;
  let dpr = 1;
  let raf = 0;
  let tick = 0;
  let guides = [];
  let guideAlpha = 0;
  const rects = new WeakMap();

  /** getBoundingClientRect, read at most once per frame. */
  function rect(el) {
    const c = rects.get(el);
    if (c && c.t === tick) return c.r;
    const r = el.getBoundingClientRect();
    rects.set(el, { t: tick, r });
    return r;
  }

  function resize() {
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    agents.forEach((a) => (a.sprite = null));
  }

  const agents = Array.from({ length: count }, (_, i) => ({
    x: -120,
    y: -120,
    color: PALETTE[i % PALETTE.length][0],
    name: PALETTE[i % PALETTE.length][1],
    from: { x: -120, y: -120 },
    get: null,
    t0: 0,
    dur: 1,
    fly: false,
    bend: 0,
    arrive: null,
    click: -1e9,
    shown: false,
    phase: Math.random() * 6.28,
    sprite: null,
  }));
  resize();
  window.addEventListener('resize', resize);

  /** Draw a cursor and its name chip once; every frame after that is a single blit. */
  function spriteFor(a) {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = '700 10.5px Arial, sans-serif';
    const chipW = g.measureText(a.name).width + 14;
    const w = Math.ceil(Math.max(14 * SCALE, 11 * SCALE + chipW) + PAD * 2);
    const h = Math.ceil((20 + 17) * SCALE + PAD * 2);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    g.scale(dpr, dpr);
    g.translate(PAD, PAD);
    g.save();
    g.scale(SCALE, SCALE);
    g.shadowColor = 'rgba(8,14,34,0.45)';
    g.shadowBlur = 6;
    g.shadowOffsetY = 2;
    g.fillStyle = a.color;
    g.fill(ARROW);
    g.shadowColor = 'transparent';
    g.lineWidth = 1.2;
    g.lineJoin = 'round';
    g.strokeStyle = '#0e1730';
    g.stroke(ARROW);
    g.font = '700 10.5px Arial, sans-serif';
    g.translate(11, 20);
    g.fillStyle = a.color;
    g.beginPath();
    g.roundRect(0, 0, chipW, 17, 8.5);
    g.fill();
    g.fillStyle = '#0e1730';
    g.fillText(a.name, 7, 12.3);
    g.restore();
    return { c, w, h };
  }

  /** A point just off the nearest edge of the screen. */
  const edge = (p) => {
    const m = Math.min(p.x, W - p.x, p.y, H - p.y);
    if (m === p.x) return { x: -90, y: p.y };
    if (m === W - p.x) return { x: W + 90, y: p.y };
    if (m === p.y) return { x: p.x, y: -90 };
    return { x: p.x, y: H + 90 };
  };

  function go(a, get, dur = 350, arrive = null) {
    const target = get();
    // A parked cursor enters from the edge nearest its target.
    if (!a.shown) {
      const e = edge(target);
      a.x = e.x;
      a.y = e.y;
      a.shown = true;
    }
    // Longer flights take longer, so a cursor never teleports across the screen.
    const dist = Math.hypot(target.x - a.x, target.y - a.y);
    a.from = { x: a.x, y: a.y };
    a.get = get;
    a.t0 = performance.now();
    a.dur = Math.max(dur, Math.min(620, 140 + dist * 0.34));
    a.fly = true;
    a.bend = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.14);
    a.arrive = arrive;
    start();
  }

  /** Attach a cursor to a moving target (a typing caret, a dragged corner) with no flight. */
  function hold(a, get) {
    a.shown = true;
    a.get = get;
    a.fly = false;
    a.arrive = null;
    start();
  }

  function leave(a, dur = 320) {
    const e = edge({ x: a.x, y: a.y });
    go(a, () => e, dur, () => {
      a.shown = false;
      a.get = null;
    });
  }

  function frame(now) {
    tick++;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Smart guides: short ticks past each edge of the frames being drawn.
    guideAlpha += ((guides.length ? 1 : 0) - guideAlpha) * 0.2;
    if (guideAlpha > 0.02) {
      ctx.globalAlpha = 0.5 * guideAlpha;
      ctx.strokeStyle = '#7fa2e8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const ext = 44;
      guides.forEach((el) => {
        const r = rect(el);
        const L = Math.round(r.left) + 0.5;
        const R = Math.round(r.right) + 0.5;
        const T = Math.round(r.top) + 0.5;
        const B = Math.round(r.bottom) + 0.5;
        ctx.moveTo(L - ext, T);
        ctx.lineTo(R + ext, T);
        ctx.moveTo(L - ext, B);
        ctx.lineTo(R + ext, B);
        ctx.moveTo(L, T - ext);
        ctx.lineTo(L, B + ext);
        ctx.moveTo(R, T - ext);
        ctx.lineTo(R, B + ext);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    let moving = guides.length > 0 || guideAlpha > 0.02;
    agents.forEach((a) => {
      if (!a.shown) return;
      moving = true;
      if (a.get) {
        const t = a.get();
        if (a.fly) {
          const k = Math.min(1, (now - a.t0) / a.dur);
          if (k >= 1) {
            a.x = t.x;
            a.y = t.y;
            a.fly = false;
            a.click = now;
            const fn = a.arrive;
            a.arrive = null;
            fn && fn();
          } else {
            // Quadratic curve: the control point is pushed sideways off the straight line.
            const e = easeInOut(k);
            const mx = (a.from.x + t.x) / 2 + (a.from.y - t.y) * a.bend;
            const my = (a.from.y + t.y) / 2 + (t.x - a.from.x) * a.bend;
            a.x = (1 - e) * (1 - e) * a.from.x + 2 * (1 - e) * e * mx + e * e * t.x;
            a.y = (1 - e) * (1 - e) * a.from.y + 2 * (1 - e) * e * my + e * e * t.y;
          }
        } else {
          a.x = t.x; // holding: stay attached as the page scrolls
          a.y = t.y;
        }
      }
      if (a.x < -80 || a.x > W + 80 || a.y < -80 || a.y > H + 80) return;

      // A hand is never perfectly still.
      const wx = a.fly ? 0 : Math.sin(now * 0.0043 + a.phase) * 0.9;
      const wy = a.fly ? 0 : Math.cos(now * 0.0051 + a.phase) * 0.9;

      const ck = (now - a.click) / 380;
      if (ck >= 0 && ck < 1) {
        ctx.globalAlpha = (1 - ck) * 0.8;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 4 + ck * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!a.sprite) a.sprite = spriteFor(a);
      ctx.drawImage(a.sprite.c, a.x + wx - PAD, a.y + wy - PAD, a.sprite.w, a.sprite.h);
    });

    raf = moving ? requestAnimationFrame(frame) : 0;
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  return {
    agents,
    go,
    hold,
    leave,
    rect,
    setGuides(list) {
      guides = list;
      start();
    },
    start,
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    get size() {
      return agents.length;
    },
  };
}
