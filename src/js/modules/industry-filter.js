import { ScrollTrigger, scrollTo } from '../core/scroll.js';

/**
 * Solutions Plate 03 — the sticky industry pill bar (renderIndustryFilterBar).
 *
 * Picking an industry hides the other seven and opens its panel, so a buyer
 * on a phone sees their three tiers instead of scrolling past twenty-one they
 * don't need; "All Industries" brings the full matrix back. A #industry-id
 * in the URL (or a click on a link to one) picks that industry on load.
 */
export default function industryFilter(bar) {
  const pills = [...bar.querySelectorAll('[data-ind]')];
  const items = [...document.querySelectorAll('[data-industry]')];
  const matrix = bar.closest('section') ?? bar;

  function show(id, { scroll = true } = {}) {
    if (id !== 'all' && !items.some((it) => it.id === id)) return;
    pills.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.ind === id)));
    items.forEach((it) => {
      it.hidden = id !== 'all' && it.id !== id;
    });
    if (id !== 'all') {
      // Open its panel through the accordion's own control, so its state and ARIA stay right.
      const head = items.find((it) => it.id === id)?.querySelector('.industry__head');
      if (head && head.getAttribute('aria-expanded') !== 'true') head.click();
    }
    ScrollTrigger.refresh();
    if (scroll) scrollTo(matrix, { offset: -70 });
  }

  pills.forEach((p) => p.addEventListener('click', () => show(p.dataset.ind)));
  const fromHash = () => location.hash.length > 1 && show(decodeURIComponent(location.hash.slice(1)), { scroll: false });
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
