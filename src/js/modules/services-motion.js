import { gsap, ScrollTrigger, getLenis } from '../core/scroll.js';
import { prefersReducedMotion, isCoarsePointer, isLowPower, lerp } from '../core/env.js';

/**
 * Services page motion — everything scroll-linked or pointer-driven.
 *
 *   descent   "Build" pins and the scroll becomes a fall down an icy shaft:
 *             the camera drops, tilted down, and the ten services rise out
 *             of the mist past you, alternating left and right, each in a
 *             frame of 3D ice (igloo.inc-style).
 *   lift      the hero content lifts away as the fall begins.
 *   fallIn    cards, stats, terms and timeline steps tip and drop into place
 *             in 3D, scrubbed with the scroll.
 *   fan       the three packages start stacked and fan out into a row.
 *   flow      the "How we work" line fills with the scroll; each step lights
 *             when the line reaches it.
 *   parallax  the giant group numerals drift against the scroll.
 *   orbit     the hero orbit leans toward the cursor.
 *   magnetic  buttons marked [data-magnetic] pull toward the cursor.
 *   scramble  small labels marked [data-scramble] decode from random
 *             characters into their text as they come into view.
 *
 * Under reduced motion nothing moves: the flow is shown complete and every
 * other effect is skipped. The page is fully readable without this module.
 */

export default function servicesMotion(root) {
  const flowEl = root.querySelector('.flow');

  if (prefersReducedMotion) {
    if (flowEl) {
      flowEl.classList.add('is-scrubbed');
      flowEl.style.setProperty('--flow', '1');
      flowEl.querySelectorAll('.flow__step').forEach((s) => s.classList.add('is-active'));
    }
    return;
  }

  const mm = gsap.matchMedia();
  descent(root, mm);
  lift(root);
  fallIn(root);
  fan(root, mm);
  if (flowEl) flow(flowEl);
  parallax(root);
  scramble(root);
  if (!isCoarsePointer) {
    orbit(root);
    magnetic(root);
  }

  // Split headlines, lazy images and counters settle after first paint; pin
  // and trigger positions must be measured against the final layout.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* ---------------------------------------------------------------------------
   Descent — the "Build" stage as a fall
   ------------------------------------------------------------------------ */

/** Shared with ice-frames.js so the 3D camera and the HTML cards agree. */
export const DESCENT = {
  FOV: 35, // vertical field of view, degrees
  PITCH: -0.38, // camera tilt, radians: looking down the shaft
  Z: -10, // depth of every card in front of the camera's path
  SPACING: 7, // vertical world distance between services
};

/**
 * Each service i sits at world (±X, −i·SPACING, Z) — left, right, left… The
 * scroll position t (eased) puts the camera where service t is centred in
 * view; every card is then projected to the screen with the same maths
 * Three.js uses, so the HTML card (crisp text) and its 3D ice frame line up.
 * Cards below are far and small; the one you're passing is full size; the
 * ones above rise out of the top — which is what makes it feel like falling.
 */
function descent(root, mm) {
  const stage = root.querySelector('[data-ice-stage]');
  if (!stage) return;
  const items = [...stage.querySelectorAll('[data-ice-item]')];
  const n = items.length;
  const head = stage.querySelector('.ice-stage__head');
  const count = stage.querySelector('[data-ice-count]');
  const name = stage.querySelector('[data-ice-name]');
  const bar = stage.querySelector('[data-ice-bar]');
  const jumps = [...stage.querySelectorAll('[data-ice-jump]')];
  const names = items.map((el) => el.querySelector('.ice-card__name').textContent);
  const pad = (v) => String(v).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  items.forEach((el, i) => el.classList.add(i % 2 === 0 ? 'ice-item--left' : 'ice-item--right'));

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    stage.classList.add('is-live');

    const { FOV, PITCH, Z, SPACING } = DESCENT;
    const sinP = Math.sin(PITCH);
    const cosP = Math.cos(PITCH);
    // How far below the camera a card sits when it is centred in view.
    const dyFocus = -Math.tan(PITCH) * Z;
    const distFocus = -(-sinP * dyFocus + cosP * Z);

    // Viewport-dependent sizes (recomputed on resize).
    const view = { W: 1, H: 1, f: 1, cardW: 3.2, cardPx: 400, X: 2.4 };
    const world = items.map(() => ({ x: 0, y: 0, z: Z }));
    function measure() {
      view.W = stage.clientWidth;
      view.H = stage.clientHeight;
      view.f = view.H / 2 / Math.tan((FOV * Math.PI) / 360);
      // Card size at the moment of focus: generous on desktop, ~70% wide on
      // phones (leaving room for the zigzag without leaving the screen).
      const targetPx = Math.min(view.W * (view.W >= 1024 ? 0.22 : 0.62), 21 * 16);
      view.cardPx = targetPx;
      view.cardW = (targetPx * distFocus) / view.f;
      // Side offset: as far out as fits, but always some zigzag.
      const room = (view.W / 2 - targetPx / 2 - Math.max(24, view.W * 0.06)) * (distFocus / view.f);
      // On a phone there is no room beside the card, so the zigzag is a
      // smaller sway — at most what keeps the card on screen.
      const maxSway = ((view.W / 2 - targetPx / 2 - 10) * distFocus) / view.f;
      view.X = clamp(room, Math.min(view.cardW * 0.14, Math.max(0, maxSway)), 2.8);
      stage.style.setProperty('--card-w', `${targetPx.toFixed(1)}px`);
      items.forEach((_, i) => {
        world[i] = { x: (i % 2 === 0 ? -1 : 1) * view.X, y: -i * SPACING, z: Z };
      });
    }

    function project(p, camY) {
      const dy = p.y - camY;
      const yc = cosP * dy + sinP * p.z;
      const zc = -sinP * dy + cosP * p.z;
      if (zc > -0.5) return null;
      const k = view.f / -zc;
      return { sx: view.W / 2 + p.x * k, sy: view.H / 2 - yc * k, px: view.cardW * k };
    }

    let target = -0.35;
    let current = -0.35;
    let frames = null; // the 3D layer, if it loads
    const opacities = items.map(() => 0);

    function layout(t) {
      const camY = -t * SPACING - dyFocus;
      const { W, H } = view;
      items.forEach((el, i) => {
        const pr = project(world[i], camY);
        if (!pr) {
          el.style.opacity = '0';
          opacities[i] = 0;
          return;
        }
        // Fade in rising from the mist at the bottom; fade out leaving the top.
        const o = clamp((H * 1.12 - pr.sy) / (H * 0.35), 0, 1) * clamp((pr.sy + H * 0.02) / (H * 0.28), 0, 1);
        opacities[i] = o;
        const s = pr.px / view.cardPx;
        el.style.transform = `translate3d(${(pr.sx - W / 2).toFixed(1)}px, ${(pr.sy - H / 2).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        el.style.opacity = o.toFixed(3);
        el.style.zIndex = String(Math.round(s * 100));
        const d = Math.abs(i - t);
        el.style.setProperty('--meta', clamp(1 - d * 2.2, 0, 1).toFixed(3));
        const active = d < 0.5;
        el.classList.toggle('is-active', active);
        el.toggleAttribute('inert', !active);
      });
      // The section title belongs to the top of the fall only.
      if (head) head.style.opacity = clamp(1 - (t + 0.35) * 1.4, 0, 1).toFixed(3);
      const at = clamp(Math.round(t), 0, n - 1);
      if (count) count.textContent = `[${pad(at + 1)}/${pad(n)}]`;
      if (name) name.textContent = names[at];
      bar?.style.setProperty('--p', clamp(t / Math.max(1, n - 1), 0, 1).toFixed(4));
      jumps.forEach((b, i) => b.toggleAttribute('aria-current', i === at));
      frames?.update({ camY, world, cardW: view.cardW, opacities, t });
    }

    // Scroll range: from just before the first service to just after the last.
    const T0 = -0.35;
    const T1 = n - 1 + 0.6;
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      // About half a screen of scrolling per service (kept short on purpose).
      end: () => `+=${(T1 - T0) * innerHeight * 0.45}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        target = T0 + progress * (T1 - T0);
      },
      onRefresh: () => {
        measure();
        layout(current);
      },
    });

    // Ease toward the scroll target every tick: a glide, not a jump.
    const tick = () => {
      if (Math.abs(target - current) < 0.0005) return;
      current += (target - current) * 0.1;
      layout(current);
    };
    gsap.ticker.add(tick);
    measure();
    layout(current);

    // Index buttons scroll to that service's moment in the pinned range.
    const onJump = (event) => {
      const i = Number(event.currentTarget.dataset.iceJump);
      const y = trigger.start + (trigger.end - trigger.start) * ((i - T0) / (T1 - T0)) + 1;
      const lenis = getLenis();
      lenis ? lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' });
    };
    jumps.forEach((b) => b.addEventListener('click', onJump));

    // 3D shaft and ice frames: a separate chunk, fetched only for capable devices.
    if (!isLowPower) {
      import('./ice-frames.js')
        .then(({ createIceFrames }) => {
          frames = createIceFrames(stage, items, DESCENT);
          if (frames) {
            stage.classList.add('has-3d');
            layout(current);
          }
        })
        .catch((error) => console.error('[naaz] ice frames failed', error));
    }

    return () => {
      gsap.ticker.remove(tick);
      jumps.forEach((b) => b.removeEventListener('click', onJump));
      frames?.destroy();
      frames = null;
      stage.classList.remove('is-live', 'has-3d');
      stage.style.removeProperty('--card-w');
      if (head) head.style.removeProperty('opacity');
      items.forEach((el) => {
        el.removeAttribute('style');
        el.removeAttribute('inert');
      });
    };
  });
}

/* ---------------------------------------------------------------------------
   Lift — the hero content rises away as the fall begins
   ------------------------------------------------------------------------ */
function lift(root) {
  const hero = root.querySelector('.svc-hero');
  const copy = root.querySelector('.svc-hero__copy');
  if (!hero || !copy) return;
  gsap.to(copy, {
    yPercent: -28,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ---------------------------------------------------------------------------
   Fall-in — elements tip forward and drop into place in 3D, with the scroll
   ------------------------------------------------------------------------ */
function fallIn(root) {
  const groups = [
    ['.svc-stats', '.svc-stat'],
    ['.svc-bento', '.svc-card'],
    ['.svc-terms__list', 'li'],
    ['.flow', '.flow__step'],
  ];
  for (const [containerSel, childSel] of groups) {
    const container = root.querySelector(containerSel);
    if (!container) continue;
    const children = [...container.querySelectorAll(`:scope > ${childSel}`)];
    if (!children.length) continue;
    // The scrub owns transform and opacity; CSS transitions on them would lag it.
    children.forEach((el) => el.classList.add('is-falling'));
    gsap.fromTo(
      children,
      { rotationX: -68, yPercent: 55, z: -220, opacity: 0, transformPerspective: 1200, transformOrigin: '50% 100%' },
      {
        rotationX: 0,
        yPercent: 0,
        z: 0,
        opacity: 1,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: { trigger: container, start: 'top 96%', end: 'top 42%', scrub: 0.9 },
      },
    );
  }
}

function fan(root, mm) {
  const container = root.querySelector('[data-svc-fan]');
  if (!container) return;

  // Only where the packages sit side by side; stacked on phones they just reveal.
  mm.add('(min-width: 60rem)', () => {
    const cards = [...container.children];
    const mid = (cards.length - 1) / 2;
    gsap.from(cards, {
      xPercent: (i) => (mid - i) * 104,
      yPercent: 8,
      rotation: (i) => (i - mid) * 7,
      scale: 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 92%',
        end: 'top 38%',
        scrub: 0.8,
      },
    });
  });
}

function flow(flowEl) {
  const steps = [...flowEl.querySelectorAll('.flow__step')];
  flowEl.classList.add('is-scrubbed');

  ScrollTrigger.create({
    trigger: flowEl,
    start: 'top 78%',
    end: 'top 30%',
    scrub: 0.6,
    onUpdate: ({ progress }) => {
      flowEl.style.setProperty('--flow', progress.toFixed(4));
      // A step lights once the line has reached its position along the track.
      steps.forEach((step, i) => {
        step.classList.toggle('is-active', progress >= i / Math.max(1, steps.length - 1) - 0.001);
      });
    },
  });
}

function parallax(root) {
  root.querySelectorAll('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: 20 },
      {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function orbit(root) {
  const host = root.querySelector('[data-orbit]');
  const tilt = root.querySelector('[data-orbit-tilt]');
  if (!host || !tilt) return;

  let visible = false;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(host);

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = null;

  function tick() {
    cx = lerp(cx, tx, 0.07);
    cy = lerp(cy, ty, 0.07);
    tilt.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
    raf = Math.abs(cx - tx) + Math.abs(cy - ty) > 0.02 ? requestAnimationFrame(tick) : null;
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!visible) return;
      tx = (event.clientX / innerWidth - 0.5) * 16;
      ty = (event.clientY / innerHeight - 0.5) * -16;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true },
  );
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—+';

/**
 * Decode effect: each character cycles through random glyphs, then locks in,
 * left to right. The real text is in the HTML (and in aria-label while the
 * effect runs), so crawlers and screen readers always read the actual words.
 */
function scramble(root) {
  const els = [...root.querySelectorAll('[data-scramble]')];
  if (!els.length) return;

  const run = (el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text.trim());
    const duration = 700 + text.length * 18;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const locked = Math.floor(t * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        out += i < locked || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
      else {
        el.textContent = text;
        el.removeAttribute('aria-label');
      }
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        run(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

function magnetic(root) {
  root.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (event.clientX - (r.left + r.width / 2)) * 0.28,
        y: (event.clientY - (r.top + r.height / 2)) * 0.28,
        duration: 0.4,
        ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    });
  });
}
