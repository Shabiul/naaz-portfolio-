import { prefersReducedMotion } from '../core/env.js';
import { stopScroll, startScroll } from '../core/scroll.js';

/**
 * Loading curtain.
 *
 * Shown once per session, on the cover only. Two rules keep it from being the
 * self-indulgent kind:
 *   • it never waits longer than the page actually needs
 *   • it is skipped entirely on repeat navigation and under reduced motion
 *
 * The counter is tied to real progress (document readiness + fonts), not a
 * fake timer, so it cannot sit at 99% while the page is already usable.
 */

const SESSION_KEY = 'naaz:intro-seen';
const MIN_VISIBLE_MS = 700;

export function initLoader() {
  const loader = document.querySelector('[data-loader]');
  const page = document.querySelector('[data-page]');

  const reveal = () => {
    page?.classList.add('is-ready');
    document.body.classList.remove('is-loading');
    startScroll();
  };

  if (!loader) {
    reveal();
    return;
  }

  const alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1';
  if (alreadySeen || prefersReducedMotion) {
    loader.remove();
    reveal();
    return;
  }

  document.body.classList.add('is-loading');
  stopScroll();

  const countEl = loader.querySelector('[data-loader-count]');
  const barEl = loader.querySelector('[data-loader-bar] span');
  const startedAt = performance.now();

  let displayed = 0;
  let target = 8;

  // Real signals, weighted by how much of the visible experience each unlocks.
  const advance = (to) => { target = Math.max(target, to); };

  document.fonts?.ready.then(() => advance(65));
  window.addEventListener('load', () => advance(100));
  // Failsafe: a hung third-party request must not hold the page hostage.
  const failsafe = setTimeout(() => advance(100), 1000);

  function tick() {
    // Ease toward target so the number always moves, even between signals.
    displayed += Math.max((target - displayed) * 0.2, target > displayed ? 1.2 : 0);
    const shown = Math.min(Math.round(displayed), 100);

    if (countEl) countEl.textContent = String(shown).padStart(3, '0');
    if (barEl) barEl.style.setProperty('--p', (shown / 100).toFixed(3));

    if (shown >= 100 && performance.now() - startedAt >= MIN_VISIBLE_MS) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    clearTimeout(failsafe);
    sessionStorage.setItem(SESSION_KEY, '1');
    loader.classList.add('is-done');
    reveal();
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }

  requestAnimationFrame(tick);
}

/**
 * Outgoing page wipe on internal links.
 *
 * A same-origin click paints the curtain, then lets navigation proceed — the
 * incoming page starts from its own reveal. This is a multi-page site by
 * design (each page is independently cacheable and crawlable); the wipe is what
 * buys back the continuity a SPA would have given.
 */
export function initPageTransitions() {
  if (prefersReducedMotion) return;

  const wipe = document.createElement('div');
  wipe.className = 'page-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  document.body.append(wipe);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    // Anything that is not a plain left-click navigation to another page of
    // this site should behave exactly as the browser intends.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      link.origin !== window.location.origin ||
      link.pathname === window.location.pathname ||
      link.getAttribute('href')?.startsWith('#')
    ) {
      return;
    }

    event.preventDefault();
    wipe.classList.add('is-active');
    // Match the CSS wipe duration; navigating early shows a half-drawn curtain.
    setTimeout(() => { window.location.href = link.href; }, 480);
  });

  // Restoring from bfcache must not leave the curtain down.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) wipe.classList.remove('is-active');
  });
}
