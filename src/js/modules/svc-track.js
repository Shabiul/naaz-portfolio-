import { prefersReducedMotion } from '../core/env.js';
import { createAgents } from './svc-agents.js';

/**
 * "Connect & Grow" (render.js → growTrack): ten cards, three to a row.
 *
 * A card does not exist until the agents make it. Every card starts as nothing
 * (data-phase="pending": invisible, but its space is kept, so the page never
 * jumps). A row is built when it is on screen AND the reader has stopped
 * scrolling for a moment, so the agents arrive when you are looking, not while
 * the page is flying past. One row builds at a time (three cursors per card):
 *
 *   1. arrive  A flies to the card's top-left corner; B and C wait above it
 *   2. frame   when A lands it drags a selection frame out to the card's size
 *              (--d on the frame, 0 → 1); only the blue marquee exists, and the
 *              cursor is its corner
 *   3. fill    on release the card's body fades in with grey placeholders, and
 *              the cursors work in parallel:
 *                A  clicks the title and TYPES it, riding the text caret
 *                B  sweeps across the scene (its shapes appear along the
 *                   stroke), then clicks the line below and types it
 *                C  clicks the number, then presses the price and button
 *   4. leave   the cursors fly off the nearest edge of the screen
 *
 * Every step waits for the cursor that does it (arrive callbacks), never for a
 * guessed time, so a long flight on a slow machine cannot desynchronise it.
 * A row scrolled out of sight is shown finished at once. Under reduced motion,
 * and without JavaScript, every card simply shows.
 */
const TOTAL_LAYERS = 364;
const DRAG = 420; // dragging the frame out
const HOP_FLY = 160; // a cursor's flight to a part
const STAGGER = 80; // each card in a row starts a little after the last

const easeOut = (k) => 1 - Math.pow(1 - k, 3);

export default function svcTrack(root) {
  const cards = [...root.querySelectorAll('.gcard')];
  const canvas = root.querySelector('.gtrack__agents');
  const hud = root.querySelector('[data-hud]');
  const hudText = root.querySelector('[data-hud-text]');
  const replay = root.querySelector('[data-hud-replay]');
  if (!cards.length) return;

  const effect = !prefersReducedMotion && !!canvas && typeof canvas.getContext === 'function';

  if (!effect) {
    cards.forEach((c) => c.classList.add('is-revealed'));
    if (hud) hud.hidden = true;
    return;
  }

  const crew = createAgents(canvas, { count: 9 });
  const rect = crew.rect;
  const timers = new Map(); // card → cancel functions
  let lastRow = null;
  let layers = 0;
  let counter = 0;

  cards.forEach((c) => {
    c.dataset.phase = 'pending';
    c.querySelectorAll('.gcard__title, .gcard__text').forEach((e) => (e.dataset.full = e.textContent));
  });

  const later = (card, ms, fn) => {
    const t = setTimeout(fn, ms);
    timers.get(card).push(() => clearTimeout(t));
  };
  const stop = (card) => {
    (timers.get(card) || []).forEach((u) => u());
    timers.set(card, []);
  };
  const frameOf = (card) => card.querySelector('.gcard__frame');

  function complete(card) {
    card.dataset.phase = 'built';
    card.classList.add('is-revealed');
    card.querySelectorAll('.gcard__copy > :not(.gcard__sk)').forEach((e) => {
      e.classList.add('made');
      e.style.minBlockSize = '';
      e.querySelector('.caret')?.remove();
      if (e.dataset.full) e.textContent = e.dataset.full;
    });
  }

  function count(to, ms, label) {
    cancelAnimationFrame(counter);
    const from = layers;
    const t0 = performance.now();
    const loop = (now) => {
      const k = ms ? Math.min(1, (now - t0) / ms) : 1;
      layers = Math.round(from + (to - from) * easeOut(k));
      hudText.textContent = `${label} · ${crew.size} agents · ${layers} / ${TOTAL_LAYERS} layers`;
      if (k < 1) counter = requestAnimationFrame(loop);
    };
    counter = requestAnimationFrame(loop);
  }

  /** Type `el`'s text out character by character; the cursor rides the caret. */
  function type(card, el, cur, done) {
    const full = el.dataset.full || el.textContent;
    el.style.minBlockSize = `${el.offsetHeight}px`; // keep the layout from jumping
    el.textContent = '';
    el.classList.add('made', 'typed');
    const text = document.createTextNode('');
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.style.setProperty('--c', cur.color);
    el.append(text, caret);
    crew.hold(cur, () => {
      const c = rect(caret);
      return { x: c.right + 2, y: c.top + c.height * 0.35 };
    });
    const step = Math.max(1, Math.ceil(full.length / 22));
    let i = 0;
    const iv = setInterval(() => {
      i = Math.min(full.length, i + step);
      text.nodeValue = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(iv);
        caret.remove();
        done();
      }
    }, 17);
    timers.get(card).push(() => clearInterval(iv));
  }

  /** Build one card with three cursors: A drags the frame, then each does its own job. */
  function buildCard(card, [A, B, C], delay, onDone) {
    stop(card);
    const r = () => rect(card);
    const frame = frameOf(card);
    const art = card.querySelector('.gcard__art');
    const [index, title, text, foot] = card.querySelectorAll('.gcard__copy > :not(.gcard__sk)');
    const tag = card.querySelector('.gcard__tag');
    if (tag) tag.textContent = `${A.name} · Frame`;

    // Back to a clean slate (Replay).
    card.className = card.className.replace(/\b(is-revealed|made|m\d)\b/g, '').replace(/\s+/g, ' ').trim();
    [index, title, text, foot].forEach((e) => {
      e.classList.remove('made', 'typed');
      e.style.minBlockSize = '';
      e.querySelector('.caret')?.remove();
      if (e.dataset.full) e.textContent = e.dataset.full;
    });
    frame.style.setProperty('--d', '0');
    delete card.dataset.sized;
    art.querySelectorAll('svg > *').forEach((n) => (n.style.transitionDelay = ''));
    let d = 0;
    let left = 3;
    const job = (cur) => () => {
      crew.leave(cur);
      if (--left === 0) {
        complete(card);
        onDone();
      }
    };

    const fill = () => {
      card.dataset.phase = 'paint';
      const at = (el, fx, fy, px = 0) => () => {
        const e = rect(el);
        return { x: e.left + Math.min(e.width * fx, px || 1e9), y: e.top + e.height * fy };
      };

      // A: click the title and type it.
      crew.go(A, () => {
        const e = rect(title);
        return { x: e.left + 6, y: e.top + 10 };
      }, HOP_FLY, () => {
        card.classList.add('m2');
        type(card, title, A, job(A));
      });

      // B: sweep across the scene, then type the line.
      crew.go(B, at(art, 0.08, 0.14), HOP_FLY, () => {
        card.classList.add('is-revealed');
        const kids = [...art.querySelectorAll('svg > *')];
        kids.forEach((n, k) => (n.style.transitionDelay = `${((k / Math.max(1, kids.length - 1)) * 0.28).toFixed(3)}s`));
        crew.go(B, at(art, 0.92, 0.86), 300, () => {
          crew.go(B, () => {
            const e = rect(text);
            return { x: e.left + 6, y: e.top + 8 };
          }, HOP_FLY, () => {
            card.classList.add('m3');
            type(card, text, B, job(B));
          });
        });
      });

      // C: click the number, then press the price and button.
      crew.go(C, at(index, 0.4, 0.5, 70), HOP_FLY, () => {
        index.classList.add('made');
        card.classList.add('m1');
        crew.go(C, at(foot, 0.5, 0.5, 90), HOP_FLY + 20, () => {
          foot.classList.add('made');
          card.classList.add('m4');
          const cta = foot.querySelector('.gcard__cta');
          cta?.classList.add('press');
          later(card, 160, () => {
            cta?.classList.remove('press');
            job(C)();
          });
        });
      });
    };

    // A lands on the corner, then drags the frame out; the cursor IS its bottom-right corner.
    const drag = () => {
      const t0 = performance.now();
      crew.hold(A, () => ({ x: r().left + r().width * d + 2, y: r().top + r().height * d + 2 }));
      let id = 0;
      const loop = (now) => {
        const k = Math.min(1, (now - t0) / DRAG);
        d = easeOut(k);
        frame.style.setProperty('--d', d.toFixed(3));
        if (d > 0.3) card.dataset.sized = '1';
        if (k < 1) id = requestAnimationFrame(loop);
        else fill();
      };
      id = requestAnimationFrame(loop);
      timers.get(card).push(() => cancelAnimationFrame(id));
    };

    later(card, delay, () => {
      card.dataset.phase = 'frame';
      crew.go(A, () => ({ x: r().left + 2, y: r().top + 2 }), 260, drag);
      crew.go(B, () => ({ x: r().left + r().width * 0.32, y: r().top - 34 }), 260);
      crew.go(C, () => ({ x: r().left + r().width * 0.68, y: r().top - 34 }), 260);
    });
  }

  // A row is "in view" while its cards are on screen enough to watch them being made.
  const inView = (row) => {
    const r = rect(row[0]);
    return r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.12;
  };

  /** Show a row finished, with no animation (it was scrolled past before its turn). */
  function instant(row) {
    row.forEach((c) => {
      stop(c);
      complete(c);
    });
  }

  /** Wait for the reader to stop scrolling (or give up waiting after a moment). */
  function whenSettled(row, cb) {
    let calm = 0;
    let last = window.scrollY;
    const t0 = performance.now();
    const tick = () => {
      if (!inView(row)) return cb(false);
      const y = window.scrollY;
      calm = Math.abs(y - last) < 5 ? calm + 1 : 0;
      last = y;
      if (calm >= 6 || performance.now() - t0 > 1600) return cb(true);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  let busy = false;
  const queue = [];
  function pump() {
    if (busy || !queue.length) return;
    const row = queue.shift();
    if (!inView(row)) {
      instant(row);
      return pump();
    }
    busy = true;
    whenSettled(row, (ok) => {
      if (!ok) {
        instant(row);
        busy = false;
        return pump();
      }
      buildRow(row, () => {
        busy = false;
        pump();
      });
    });
  }

  function buildRow(row, next) {
    lastRow = row;
    const t0 = performance.now();
    const from = layers;
    const to = Math.round(((cards.indexOf(row[row.length - 1]) + 1) / cards.length) * TOTAL_LAYERS);
    hud.hidden = false;
    hud.dataset.state = 'building';
    count(from + Math.round((to - from) * 0.4), 900, row.length > 1 ? `Building ${row.length} cards` : 'Building');
    crew.setGuides(row.map(frameOf));
    let left = row.length;
    let over = false;
    const crews = row.map((_, k) => crew.agents.slice(k * 3, k * 3 + 3));

    const finish = (aborted) => {
      if (over) return;
      over = true;
      clearInterval(watch);
      crew.setGuides([]);
      crews.flat().forEach((a) => crew.leave(a));
      hud.dataset.state = 'built';
      count(to, aborted ? 0 : 300, 'Built');
      if (!aborted) {
        setTimeout(() => {
          hudText.textContent = `Built by ${crews.flat().length} agents in ${((performance.now() - t0) / 1000).toFixed(1)}s · ${to} / ${TOTAL_LAYERS} layers`;
        }, 320);
      }
      next && next();
    };

    // If the reader scrolls the row out of sight mid-build, finish it at once.
    const watch = setInterval(() => {
      if (!inView(row)) {
        instant(row);
        finish(true);
      }
    }, 150);

    row.forEach((card, k) => {
      buildCard(card, crews[k], k * STAGGER, () => {
        if (--left === 0) finish(false);
      });
    });
  }

  // Group the cards into the visible rows (3, 2 or 1 across, from the grid itself).
  const n = getComputedStyle(cards[0].parentElement).gridTemplateColumns.split(' ').length || 1;
  const rows = [];
  for (let i = 0; i < cards.length; i += n) rows.push(cards.slice(i, i + n));

  replay?.addEventListener('click', () => {
    if (!lastRow || busy) return;
    busy = true;
    buildRow(lastRow, () => {
      busy = false;
      pump();
    });
  });

  // A row is queued once its WHOLE card is on screen (below the nav), so the
  // typing and the button are made where you can see them. On a screen too short
  // for that, as much of the card as fits.
  const done = new Set();
  const need = () => Math.min(0.97, (window.innerHeight - 110) / Math.max(1, cards[0].offsetHeight));
  const partial = new Set(); // rows more than ~40% on screen, waiting for the reader to stop
  const queueRow = (row) => {
    if (done.has(row)) return;
    done.add(row);
    partial.delete(row);
    io.unobserve(row[0]);
    queue.push(row);
    pump();
  };
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const row = rows.find((rw) => rw[0] === e.target);
        if (!row || done.has(row)) return;
        if (e.isIntersecting && e.intersectionRatio >= need() - 0.02) queueRow(row);
        else if (e.isIntersecting && e.intersectionRatio >= 0.4) partial.add(row);
        else partial.delete(row);
      }),
    { rootMargin: '-96px 0px 0px 0px', threshold: [0, 0.25, 0.4, 0.5, 0.75, 0.9, 0.97, 1] },
  );
  rows.forEach((rw) => io.observe(rw[0]));

  // A row the reader scrolled clean past, without it ever being whole on screen, is shown finished.
  let sweeping = false;
  let idle = 0;
  window.addEventListener(
    'scroll',
    () => {
      // Stopped with a row only partly on screen: build it anyway after a moment.
      clearTimeout(idle);
      idle = setTimeout(() => [...partial].forEach(queueRow), 1100);
      if (sweeping) return;
      sweeping = true;
      requestAnimationFrame(() => {
        sweeping = false;
        rows.forEach((rw) => {
          if (done.has(rw)) return;
          if (rw[rw.length - 1].getBoundingClientRect().bottom < 40) {
            done.add(rw);
            io.unobserve(rw[0]);
            instant(rw);
          }
        });
      });
    },
    { passive: true },
  );

  // Arriving on /services.html#service-… brings that card to the middle.
  window.addEventListener(
    'load',
    () =>
      setTimeout(() => {
        const c = cards.find((x) => `#${x.id}` === location.hash);
        c?.scrollIntoView({ block: 'center' });
      }, 400),
    { once: true },
  );
}
