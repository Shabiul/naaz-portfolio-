import { prefersReducedMotion } from '../core/env.js';

/**
 * Project filtering with FLIP re-ordering.
 *
 * Buttons come in groups (data-filter-group: industry, solution, tech). One
 * button per group is active; a project is shown when it matches every
 * group's active value, read from its data-industry / data-solution /
 * data-tech attributes. "all" in a group matches everything.
 *
 * Hiding items makes the survivors jump to new grid positions. FLIP records
 * where each one was, lets the browser lay out the new state, then animates
 * from the old position to the new — so the grid re-flows visibly instead of
 * snapping, and it costs two layout reads rather than a per-item tween.
 */

export default function filter(root) {
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const grid = root.querySelector('[data-filter-grid]');
  if (!buttons.length || !grid) return;

  const items = [...grid.children];
  const liveRegion = root.querySelector('[data-filter-status]');
  const emptyNote = root.querySelector('[data-filter-empty]');
  const active = Object.fromEntries(buttons.map((b) => [b.dataset.filterGroup, 'all']));

  function apply() {
    // FIRST — where is everything now.
    const first = new Map(items.map((item) => [item, item.getBoundingClientRect()]));

    let shown = 0;
    for (const item of items) {
      const matches = Object.entries(active).every(
        ([group, value]) => value === 'all' || (item.dataset[group] ?? '').split(/\s+/).includes(value),
      );
      item.hidden = !matches;
      if (matches) shown += 1;
    }

    if (liveRegion) {
      liveRegion.textContent = `${shown} project${shown === 1 ? '' : 's'} shown`;
    }
    if (emptyNote) emptyNote.hidden = shown > 0;

    if (prefersReducedMotion) return;

    // LAST + INVERT + PLAY.
    for (const item of items) {
      if (item.hidden) continue;
      const before = first.get(item);
      const after = item.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (!dx && !dy) continue;

      item.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    }
  }

  function select(group, value) {
    active[group] = value;
    for (const b of buttons) {
      if (b.dataset.filterGroup === group) b.setAttribute('aria-pressed', String(b.dataset.filter === value));
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      select(button.dataset.filterGroup, button.dataset.filter);
      apply();
    });
  });

  root.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
    for (const group of Object.keys(active)) select(group, 'all');
    apply();
  });
}
