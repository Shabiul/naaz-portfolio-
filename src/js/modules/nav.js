import { rafThrottle, clamp } from '../core/env.js';
import { scrollTo, stopScroll, startScroll } from '../core/scroll.js';

/**
 * Navigation.
 *
 * Four behaviours, one scroll handler:
 *   1. condense into the glass rail once past the fold
 *   2. hide on scroll-down, return on scroll-up (give the page back its height)
 *   3. invert colour when floating over a navy section
 *   4. drive the reading-progress hairline
 *
 * The colour-context test uses elementFromPoint against a probe just under the
 * rail. That is one hit-test per frame — cheaper and far more robust than
 * maintaining an observer per section and reconciling overlaps.
 */

const STUCK_AFTER = 40;
const HIDE_AFTER = 400;

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const toggle = nav.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-nav-drawer]');
  const progress = nav.querySelector('[data-nav-progress]');

  let lastY = window.scrollY;
  let navHeight = nav.offsetHeight;

  const onScroll = rafThrottle(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle('is-stuck', y > STUCK_AFTER);

    // Never hide while the drawer is open — the close control lives in it.
    const goingDown = y > lastY;
    const shouldHide = goingDown && y > HIDE_AFTER && !document.body.classList.contains('is-nav-open');
    nav.classList.toggle('is-hidden', shouldHide);

    if (progress) {
      progress.style.setProperty('--progress', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : '0');
    }

    updateContext();
    lastY = y;
  });

  function updateContext() {
    // Probe the page just below the rail, on the left where the wordmark sits.
    nav.style.pointerEvents = 'none';
    const probe = document.elementFromPoint(24, navHeight + 4);
    nav.style.pointerEvents = '';

    // Nothing under the probe (mid-transition, off-screen) — keep what we have
    // rather than snapping to light.
    if (!probe) return;

    // The intro curtain is always navy but carries no data-theme; treat it as
    // dark so the rail does not flash dark-on-dark before the first scroll.
    const onDark = probe.closest(
      '[data-theme="dark"], .hero, .footer, .page-head--dark, [data-loader]',
    );
    nav.dataset.navContext = onDark ? 'dark' : 'light';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { navHeight = nav.offsetHeight; updateContext(); }, { passive: true });
  onScroll();

  // Recompute once the page is fully settled and again when the intro curtain
  // clears the probe point — neither fires a scroll event on its own.
  window.addEventListener('load', updateContext);
  document.querySelector('[data-loader]')?.addEventListener('transitionend', updateContext, { once: true });
  setTimeout(updateContext, 0);

  /* --- Mobile drawer ----------------------------------------------------- */
  if (toggle && drawer) {
    const setDrawer = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      drawer.toggleAttribute('inert', !open);
      document.body.classList.toggle('is-nav-open', open);
      // The menu scrolls on its own on short screens; the page behind must not.
      if (open) stopScroll();
      else startScroll();
      if (open) nav.classList.remove('is-hidden');
    };

    setDrawer(false);
    drawer.setAttribute('data-lenis-prevent', '');

    toggle.addEventListener('click', () => {
      setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
    });

    drawer.addEventListener('click', (event) => {
      if (event.target.closest('a')) setDrawer(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
        toggle.focus();
      }
    });
  }

  /* --- Current page in the link bar ------------------------------------- */
  const here = location.pathname.replace(/\/index\.html$/, '/');
  nav.querySelectorAll('.v2-nav__links a').forEach((a) => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* --- Smooth anchor navigation ------------------------------------------ */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    scrollTo(target, { offset: -navHeight - 16 });
    // Keep the URL shareable and the back button meaningful.
    history.pushState(null, '', id);
    // Move focus so keyboard and screen-reader users land where sighted users do.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}
