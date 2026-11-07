import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * A single scroll authority for the whole site.
 *
 * Lenis owns the scroll position; GSAP's ticker drives it (rather than Lenis
 * running its own rAF) so smoothing and ScrollTrigger stay on the same frame
 * and never fight over layout reads.
 */

let lenis = null;

export function initScroll() {
  if (prefersReducedMotion) {
    // Native scrolling only. ScrollTrigger still works, animations are stripped
    // by the reduced-motion CSS block.
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({
    duration: 0.7,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Touch devices already have momentum scrolling; overriding it feels wrong.
    syncTouch: false,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/** Programmatic scroll that respects whichever engine is active. */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, duration: 0.8, ...options });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}

export function getLenis() {
  return lenis;
}

export { gsap, ScrollTrigger };
