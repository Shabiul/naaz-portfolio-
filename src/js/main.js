import '../styles/main.css';

import { initScroll } from './core/scroll.js';
import { mountModules } from './core/registry.js';
import { initNav } from './modules/nav.js';
import { initLoader, initPageTransitions } from './modules/loader.js';
import { initReveal, initPathDraw } from './modules/reveal.js';
import { initTilt } from './modules/tilt.js';
import { initYear, initContactPrefill, initContactFormResult } from './modules/page-bits.js';
import { initTracking } from './core/track.js';

/**
 * Boot.
 *
 * Order matters: the scroll engine must exist before anything registers a
 * ScrollTrigger, and the loader must be able to lock scrolling immediately.
 * Everything after that is independent and failure-isolated.
 */

document.documentElement.classList.remove('no-js');

function boot() {
  try {
    initScroll();
    initNav();
    initLoader();
    initPageTransitions();

    // Always-on behaviours, driven by attributes rather than data-module.
    initReveal();
    initPathDraw();
    initTilt();
    initYear();
    initContactPrefill();
    initContactFormResult();
    initTracking();

    // Per-element behaviours, code-split and optionally viewport-gated.
    mountModules();
  } catch (error) {
    // A boot failure must still leave a readable page: the CSS fallback class
    // drops every hidden-until-revealed element back to visible.
    document.documentElement.classList.add('js-failed');
    console.error('[naaz] boot failed', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
