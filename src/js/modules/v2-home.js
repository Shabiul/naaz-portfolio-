import { gsap, ScrollTrigger, getLenis, stopScroll, startScroll } from '../core/scroll.js';
import { prefersReducedMotion } from '../core/env.js';

/**
 * Version 2 home — choreography, following mdx.so frame by frame:
 *
 *   loader    black screen; a halftone N assembles as the count climbs to 100%
 *             and the lines rotate; then it fades and the hero rises in.
 *   stage     the hero and the valley share one viewport, pinned for 1.3
 *             screens. Progress (0 → 1) goes to stage.v2p for the two canvases
 *             (v2-particles.js, v2-beam.js) and scrubs the layers here:
 *               0.00–0.22  hero copy lifts away
 *               0.08–0.52  mist rolls in, the studio sweep dissolves, the mist clears
 *               0.55–0.68  valley copy sharpens in from a blur
 *               0.82–1.00  a white cloud rises over everything
 *   ideas     headline and note fade up from 80px.
 *   reel      grows from a small card at the bottom of the screen to full size,
 *             then pins (no spacing) and shrinks to 0.8 under the next section.
 *   build     reaching "We Build" snaps it into view and opens it (pills fly
 *             to the corners, CSS .is-open); scrolling back up closes it.
 *   bars      four ticks at the bottom; the current section's tick lifts.
 *   footer    the wordmark's words rise out of their masks.
 *
 * Under reduced motion: no loader, pin, snap or scrub — everything shown.
 */
const EASE = 'power4.inOut';
const LINES_EVERY = 500; // ms per loader line

export default function v2Home(root) {
  const body = document.body;
  const hero = root.querySelector('[data-v2-hero]');
  const stage = root.querySelector('[data-v2-stage]');
  const reel = root.querySelector('.v2-reel');
  const frame = root.querySelector('[data-v2-reel]');
  const grow = root.querySelector('[data-v2-reel-grow]');
  const play = root.querySelector('[data-v2-reel-play]');
  const build = root.querySelector('[data-v2-build]');
  const head = root.querySelector('[data-v2-services-head]');
  const copy = root.querySelector('[data-v2-build-copy]');
  const bars = document.querySelector('[data-v2-bars]');
  const loader = document.querySelector('[data-v2-loader]');

  if (play && frame) {
    play.addEventListener('click', () => {
      const video = frame.querySelector('video');
      reel.classList.add('is-playing');
      video.muted = false;
      video.controls = true;
      video.currentTime = 0;
      video.play();
      video.requestFullscreen?.().catch(() => {});
    });
  }

  if (prefersReducedMotion) {
    loader?.remove();
    body.classList.add('is-static');
    hero?.classList.add('is-in');
    build?.classList.add('is-open');
    if (stage) stage.v2p = 0;
    return;
  }

  runLoader(loader, () => hero?.classList.add('is-in'));

  // Stage: hero → mist → valley → white, scrubbed over 1.3 screens (kept short).
  if (stage) {
    stage.v2p = 0;
    const layer = (sel) => stage.querySelector(sel);
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${innerHeight * 1.3}`,
          pin: true,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            stage.v2p = progress;
            if (progress > 0.45 && progress < 0.97) setBar(0);
          },
        },
      })
      .to(hero, { yPercent: -35, autoAlpha: 0, duration: 0.22 }, 0)
      .to(layer('[data-v2-mist]'), { autoAlpha: 1, duration: 0.18 }, 0.08)
      .to(layer('[data-v2-studio]'), { autoAlpha: 0, duration: 0.2 }, 0.18)
      .to(layer('[data-v2-mist]'), { autoAlpha: 0, duration: 0.2 }, 0.32)
      .fromTo(layer('[data-v2-valley]'), { autoAlpha: 0, filter: 'blur(12px)' }, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.13 }, 0.55)
      .to(layer('[data-v2-valley]'), { autoAlpha: 0, duration: 0.08 }, 0.86)
      // Absolute px: the CSS parks it a full height down, and yPercent would add to that.
      .fromTo(layer('[data-v2-rise]'), { y: () => layer('[data-v2-rise]').offsetHeight }, { y: 0, duration: 0.18 }, 0.82);
  }

  // Ideas: fade up from 80px, the note just ahead of the headline.
  root.querySelectorAll('[data-v2-fade]').forEach((el, i) => {
    gsap.fromTo(
      el,
      { y: 80, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 2,
        delay: i === 0 ? 0.2 : 0.05,
        ease: EASE,
        scrollTrigger: { trigger: el.parentElement, start: 'top 90%', toggleActions: 'play none none reverse' },
      },
    );
  });

  // Showreel: grows in from a small card, then pins and shrinks under the next section.
  if (reel && frame) {
    if (grow) {
      gsap.fromTo(
        grow,
        { scale: 0.24, autoAlpha: 0.5 },
        { scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: reel, start: 'top bottom', end: 'top 10%', scrub: 0.3 } },
      );
    }
    gsap.timeline({
      scrollTrigger: {
        trigger: reel,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        scrub: 0.5,
        onLeaveBack: () => {
          if (!reel.classList.contains('is-playing')) return;
          reel.classList.remove('is-playing');
          const video = frame.querySelector('video');
          video.muted = true;
          video.controls = false;
        },
      },
    }).to(frame, { scale: 0.8, duration: 0.9 }, 0.1);
  }

  // "We Build": snap in and open; scroll back up past it to close.
  if (build && copy && head) {
    gsap.set(copy, { yPercent: -100, autoAlpha: 0 });
    const open = () => {
      build.classList.add('is-open');
      gsap.to(head, { yPercent: -100, autoAlpha: 0, duration: 0.8, ease: EASE, overwrite: true });
      gsap.to(copy, { yPercent: -50, autoAlpha: 1, duration: 1.2, ease: EASE, overwrite: true });
    };
    const close = () => {
      build.classList.remove('is-open');
      gsap.to(head, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: EASE, overwrite: true });
      gsap.to(copy, { yPercent: -100, autoAlpha: 0, duration: 0.8, ease: EASE, overwrite: true });
    };
    ScrollTrigger.create({
      trigger: build,
      start: 'top 35%',
      onEnter: () => {
        open();
        getLenis()?.scrollTo(build, { offset: 0, duration: 0.7, lock: true });
      },
      onLeaveBack: close,
    });
  }

  // Bars: on from the valley through "We Build"; the current section's tick lifts.
  const ticks = bars ? [...bars.children] : [];
  function setBar(n) {
    ticks.forEach((t, i) => t.classList.toggle('is-active', i === n));
  }
  if (bars && stage) {
    ScrollTrigger.create({
      trigger: stage,
      start: () => `top+=${innerHeight * 0.8} top`,
      endTrigger: build ?? stage,
      end: 'bottom bottom',
      onToggle: ({ isActive }) => bars.classList.toggle('is-on', isActive),
    });
    root.querySelectorAll('[data-bar]').forEach((section) => {
      const n = Number(section.dataset.bar) - 1;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: ({ isActive }) => isActive && setBar(n),
      });
    });
  }

  // Footer wordmark: each word rises out of its mask as the footer arrives.
  const letters = document.querySelectorAll('[data-v2-wordmark] i');
  if (letters.length) {
    gsap.fromTo(
      letters,
      { yPercent: 105 },
      {
        yPercent: 0,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: letters[0].closest('[data-v2-wordmark]'), start: 'top bottom', end: 'bottom bottom', scrub: 0.3 },
      },
    );
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/**
 * The loader: a halftone N (dots sized by a fake left/right shading, revealed
 * left to right), rotating lines, a 0–100% count and a bar. It runs for at
 * most ~1.2s from navigation (less once the page has loaded) and until the page has loaded, then fades and calls `done`.
 */
function runLoader(loader, done) {
  // Once per visit: coming back to the home page in the same session skips it.
  let seen = false;
  try {
    seen = sessionStorage.getItem('naaz-v2-loader') === '1';
    sessionStorage.setItem('naaz-v2-loader', '1');
  } catch {}
  if (!loader || seen) {
    loader?.remove();
    return done();
  }
  stopScroll();
  const canvas = loader.querySelector('[data-v2-loader-mark]');
  const countEl = loader.querySelector('[data-v2-loader-count]');
  const barEl = loader.querySelector('[data-v2-loader-bar]');
  const lines = [...loader.querySelectorAll('.v2-loader__lines span')];
  const ctx = canvas.getContext('2d');
  let dots = [];

  const img = new Image();
  img.onload = () => {
    // Sample the logo's alpha on a dot grid.
    const COLS = 22;
    const rows = Math.round((COLS * img.height) / img.width);
    const off = document.createElement('canvas');
    off.width = COLS;
    off.height = rows;
    const o = off.getContext('2d');
    o.drawImage(img, 0, 0, COLS, rows);
    const data = o.getImageData(0, 0, COLS, rows).data;
    dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < COLS; x++) {
        const a = data[(y * COLS + x) * 4 + 3] / 255;
        if (a < 0.2) continue;
        // Bigger dots toward the outer edges, small through the middle, like a lit fold.
        const edge = Math.abs(x / (COLS - 1) - 0.5) * 2;
        dots.push({ x: (x + 0.5) / COLS, y: (y + 0.5) / rows, r: a * (0.12 + 0.2 * edge * edge), aspect: rows / COLS });
      }
    }
  };
  img.src = '/img/logo-n.png';

  let line = 0;
  lines[0]?.classList.add('is-on');
  const rotate = setInterval(() => {
    lines[line].classList.replace('is-on', 'is-off');
    line = (line + 1) % lines.length;
    lines[line].classList.remove('is-off');
    lines[line].classList.add('is-on');
  }, LINES_EVERY);

  let loaded = document.readyState === 'complete';
  window.addEventListener('load', () => (loaded = true), { once: true });
  let shown = 0;
  let prev = performance.now();

  function frame(now) {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    // Timed from navigation start (performance.now()'s zero), not from when this
    // script ran, so the whole intro is over ~1.75s after the visitor arrives.
    // Climbs toward 90% on time, the rest once the page has loaded — or at
    // 1.0s regardless, so slow media can't hold the page hostage.
    const t = now / 1000;
    const target = loaded || t > 1.0 ? Math.min(1, t) : Math.min(0.9, t);
    // Eased on the clock, not per frame, so a slow device can't stretch it out.
    shown += (target - shown) * (1 - Math.exp(-12 * dt));
    if (target === 1 && (shown > 0.995 || t > 1.15)) shown = 1;
    countEl.textContent = `${Math.round(shown * 100)}%`;
    barEl.style.scale = `${shown} 1`;

    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio, 2);
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f4efe4';
    for (const d of dots) {
      const cell = w / 22;
      const ih = w * d.aspect;
      const reveal = Math.min(1, Math.max(0, shown * 1.6 - d.x * 0.6));
      if (!reveal) continue;
      ctx.globalAlpha = reveal;
      ctx.beginPath();
      ctx.arc(d.x * w, (h - ih) / 2 + d.y * ih, Math.max(0.6, d.r * cell * 1.8 * reveal), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (shown < 1) return requestAnimationFrame(frame);
    clearInterval(rotate);
    setTimeout(() => {
      loader.classList.add('is-done');
      startScroll();
      setTimeout(done, 120);
      setTimeout(() => loader.remove(), 600);
    }, 40);
  }
  requestAnimationFrame(frame);
}
