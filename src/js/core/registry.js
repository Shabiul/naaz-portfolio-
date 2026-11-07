/**
 * Module registry.
 *
 * Every behaviour on the site is a module attached to an element via
 * `data-module="name"`. Nothing is wired by hand in page markup, and nothing
 * global is imported by a page that does not use it — the dynamic imports below
 * let Rollup split each behaviour into its own chunk.
 *
 * Add `data-lazy` to defer construction until the element nears the viewport —
 * how the animated counters avoid running before anyone can see them.
 */

const registry = {
  heroRobot: () => import('../modules/hero-robot.js'),
  counter: () => import('../modules/counter.js'),
  industry: () => import('../modules/industry.js'),
  filter: () => import('../modules/filter.js'),
  process: () => import('../modules/process.js'),
  techgrid: () => import('../modules/techgrid.js'),
  splitText: () => import('../modules/split-text.js'),
  contactForm: () => import('../modules/contact-form.js'),
  spider: () => import('../modules/spider.js'),
  gallery: () => import('../modules/gallery.js'),
  servicesMotion: () => import('../modules/services-motion.js'),
  svcTrack: () => import('../modules/svc-track.js'),
  // Three.js lives in this chunk alone; only services.html uses it.
  crystal: () => import('../modules/crystal.js'),
  // Version 2 home (mdx.so-style).
  v2Orb: () => import('../modules/v2-orb.js'),
  v2Beam: () => import('../modules/v2-beam.js'),
  v2Particles: () => import('../modules/v2-particles.js'),
  v2Robot: () => import('../modules/v2-robot.js'),
  lynqSim: () => import('../modules/lynq-sim.js'),
  industryFilter: () => import('../modules/industry-filter.js'),
  scopeConfigurator: () => import('../modules/scope-configurator.js'),
  waitlist: () => import('../modules/waitlist.js'),
  v2Home: () => import('../modules/v2-home.js'),
};

const mounted = new WeakMap();

async function construct(el, name) {
  const load = registry[name];
  if (!load) {
    console.warn(`[naaz] unknown module "${name}"`, el);
    return;
  }

  const seen = mounted.get(el) ?? new Set();
  if (seen.has(name)) return;
  seen.add(name);
  mounted.set(el, seen);

  try {
    const mod = await load();
    mod.default?.(el);
  } catch (error) {
    // A failed behaviour must never take the page down with it.
    console.error(`[naaz] module "${name}" failed`, error);
  }
}

/**
 * Mount every module inside `root`. Safe to call again after DOM changes —
 * already-mounted pairs are skipped.
 */
export function mountModules(root = document) {
  const nodes = root.querySelectorAll('[data-module]');
  if (!nodes.length) return;

  const lazyObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        for (const name of entry.target.dataset.module.split(/\s+/)) {
          construct(entry.target, name);
        }
      }
    },
    { rootMargin: '300px 0px' },
  );

  for (const el of nodes) {
    if (el.hasAttribute('data-lazy')) {
      lazyObserver.observe(el);
      continue;
    }
    for (const name of el.dataset.module.split(/\s+/)) {
      construct(el, name);
    }
  }
}
