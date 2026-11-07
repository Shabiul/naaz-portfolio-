import { isCoarsePointer, rafThrottle } from '../core/env.js';

/**
 * Grid spotlight — the Technology grid, and any grid of cards that opts in.
 *
 * One delegated pointermove on the grid writes --mx/--my to the hovered cell,
 * which its ::after gradient reads. `data-cell` on the grid names the cell
 * selector (default `.tech`), e.g. `data-cell=".svc-card"` on Services. Delegation matters here: the grid has ~40
 * cells and per-cell listeners would be 40 handlers firing layout reads.
 */

export default function techgrid(root) {
  if (isCoarsePointer) return;

  const selector = root.dataset.cell ?? '.tech';

  const onMove = rafThrottle((event) => {
    const cell = event.target.closest(selector);
    if (!cell || !root.contains(cell)) return;

    const rect = cell.getBoundingClientRect();
    cell.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    cell.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  root.addEventListener('pointermove', onMove, { passive: true });
}
