import { prefersReducedMotion, isLowPower } from '../core/env.js';

/**
 * The robot's loader. The robot rides on every page, so its 3D code (Three.js
 * and the model) waits until the page has loaded and gone idle — it never
 * competes with the first paint. Skipped for reduced motion and low-powered
 * devices; it is decoration, not content.
 */
export default function v2Robot(canvas) {
  if (prefersReducedMotion || isLowPower) return;
  const go = () => import('./v2-robot-scene.js').then((m) => m.default(canvas));
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 800));
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
