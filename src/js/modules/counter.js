import { prefersReducedMotion } from '../core/env.js';

/**
 * Animated counters.
 *
 * Counts once, on first sight. Uses the element's own text as the target so the
 * real number is in the HTML — crawlers and no-JS visitors see the final value,
 * and there is no duplicate source of truth in a data attribute.
 *
 *   <span data-module="counter" data-lazy>250</span>
 *   <span data-module="counter" data-decimals="1">4.9</span>
 *   <span data-module="counter" data-prefix="₹" data-locale="en-IN">₹1,00,000</span>
 *
 * `data-locale` sets the digit grouping (en-IN gives 1,00,000); default en-US.
 */

const DURATION = 1800;

export default function counter(el) {
  const target = parseFloat(el.dataset.value ?? el.textContent.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(target)) return;

  const decimals = Number(el.dataset.decimals ?? 0);
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const locale = el.dataset.locale ?? 'en-US';

  const format = (value) =>
    `${prefix}${value.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  if (prefersReducedMotion) {
    el.textContent = format(target);
    return;
  }

  // Reserve the final width so the row does not reflow as digits are added.
  el.style.display = 'inline-block';
  el.style.minWidth = `${format(target).length}ch`;
  el.textContent = format(0);

  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / DURATION, 1);
    // Expo-out: fast commitment, long settle. Matches --ease-out-expo.
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = format(target * eased);
    if (t < 1) requestAnimationFrame(frame);
    else {
      el.textContent = format(target);
      // The reserved width only matters mid-count; released, the final text
      // sits at its natural width (a ch is wider than a digit in some fonts).
      el.style.minWidth = '';
    }
  }

  requestAnimationFrame(frame);
}
