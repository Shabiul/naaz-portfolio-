import { industries, icons } from '../data/industries.js';
import { technologies } from '../data/technology.js';
import { logos } from '../data/tech-logos.js';
import { processSteps } from '../data/process.js';
import { processArt, processMeta } from '../data/process-art.js';
import { trajectoryArt } from '../data/about-art.js';
import { growArt } from '../data/service-art.js';
import { projects, projectFilterGroups, projectFacets, categorySlug, SOLUTIONS, solutionTags } from '../data/projects.js';
import { serviceGroups, websitePackages, pricingTerms, howWeWork } from '../data/services.js';
import { company, guarantees, lynqPlans, packages, team } from '../data/company.js';
import { faqCategories, faqItems } from '../data/faq.js';
import { careers, roles } from '../data/careers.js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Build-time renderers.
 *
 * These run in Node during dev-server transform and production build, never in
 * the browser. The output is plain static HTML, so the solutions matrix is
 * fully crawlable and costs zero runtime JavaScript — while the source stays a
 * single data file instead of two thousand lines of copy-pasted markup.
 */

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

/** A visibly unfinished slot. Never a plausible-looking invention. */
const slot = (label) => `<span class="is-slot">&lt;${escape(label)}&gt;</span>`;

const glyph = (name, extra = '') =>
  `<svg class="${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="24" height="24">${icons[name] ?? ''}</svg>`;

const CHECK =
  '<svg class="tier__check" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"><path d="m2 6.5 2.5 2.5L10 3.5"/></svg>';

const CHEVRON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="m4 6 4 4 4-4"/></svg>';

function renderMeter(level, label = 'Complexity') {
  const segments = Array.from({ length: 5 }, (_, i) =>
    `<span class="meter__seg${i < level ? ' is-on' : ''}"></span>`,
  ).join('');

  return `<span class="meter" role="img" aria-label="${label}: ${level} of 5">
      <span class="mono-meta">${escape(label)}</span>
      <span class="meter__track" aria-hidden="true">${segments}</span>
    </span>`;
}

/**
 * Tier card.
 *
 * The three tiers must *escalate* visually, not just differ. Each rank gets a
 * denser surface treatment than the last — flat → raised with an accent rule →
 * inverted navy with registration marks. A buyer scanning the row should feel
 * the step up before reading a single feature.
 */
const TIER_RANK = { Standard: 1, Intermediate: 2, Premium: 3 };
const TIER_CLASS = { 1: 'tier--std', 2: 'tier--int', 3: 'tier--prem' };

function renderTier(tier, index, all, industryId) {
  const rank = TIER_RANK[tier.name] ?? index + 1;
  // The whole card links to the contact page with its scope pre-filled.
  const scope = `/contact.html?industry=${industryId}&amp;tier=${tier.name.toLowerCase()}`;

  // Cumulative scope: Intermediate genuinely contains Standard, so the count a
  // buyer cares about is everything they end up with, not the delta we wrote.
  const cumulative = all
    .slice(0, index + 1)
    .reduce((total, t) => total + t.features.length, 0);

  const pips = [1, 2, 3]
    .map((i) => `<span class="tier__pip${i <= rank ? ' is-on' : ''}"></span>`)
    .join('');

  const corners =
    rank === 3
      ? `<span class="mark-corner mark-corner--tl" aria-hidden="true"></span>
         <span class="mark-corner mark-corner--br" aria-hidden="true"></span>`
      : '';

  return `<article class="tier ${TIER_CLASS[rank]}${rank === 3 ? ' tier--premium' : ''}" data-rank="${rank}">
      ${corners}
      <header class="tier__head">
        <div class="tier__rank" role="img" aria-label="Band ${rank} of 3">
          <span class="tier__pips" aria-hidden="true">${pips}</span>
          <span class="tier__label">${escape(tier.label)}</span>
        </div>
        <h3 class="tier__name">${escape(tier.name)}</h3>
      </header>

      ${rank === 2 ? '<span class="tier__badge">Most chosen · Best ROI</span>' : ''}
      <div class="tier__spend">
        <p class="tier__spend-label">Investment</p>
        <p class="tier__spend-value">${tier.investment ? escape(tier.investment) : slot('Investment')}</p>
        ${rank === 2 ? '<p class="tier__anchor">One-time build · Less than 2 months of a single junior hire</p>' : ''}
      </div>

      <p class="tier__count">Client receives <strong>${cumulative}</strong> delivered capabilities</p>

      ${tier.inherits ? `<p class="tier__inherits">Everything in ${escape(tier.inherits)}, plus</p>` : ''}
      <ul class="tier__list">
        ${tier.features.map((f) => `<li class="tier__feature">${CHECK}<span>${escape(f)}</span></li>`).join('\n        ')}
      </ul>

      <dl class="tier__facts">
        <div><dt>Build time</dt><dd>${tier.timeline ? escape(tier.timeline) : slot('Timeline')}</dd></div>
        <div><dt>Team</dt><dd>${tier.team ? escape(tier.team) : slot('Team')}</dd></div>
      </dl>
      <a class="tier__cta" href="${scope}">Scope this ${escape(tier.name.toLowerCase())} build <span aria-hidden="true">→</span></a>
    </article>`;
}

function renderIndustry(industry, index) {
  const number = String(index + 1).padStart(2, '0');

  return `<article class="industry" id="${industry.id}" data-industry data-reveal="up">
      <h2 class="sr-only">${escape(industry.name)}</h2>
      <button class="industry__head" type="button" aria-expanded="false" aria-controls="panel-${industry.id}">
        <img class="industry__bg" src="/img/industries/${industry.id}.jpg" alt="" width="900" height="600" loading="lazy" decoding="async" />
        <span class="industry__icon">${glyph(industry.icon)}</span>
        <span class="industry__titles">
          <span class="industry__name">${escape(industry.name)}</span>
          <span class="industry__blurb">${escape(industry.blurb)}</span>
        </span>
        <span class="industry__meta">
          ${renderMeter(industry.complexity)}
          <span class="mono-meta">${escape(industry.timeline)}</span>
        </span>
        <span class="industry__chev" aria-hidden="true">${CHEVRON}</span>
      </button>

      <div class="industry__panel" id="panel-${industry.id}">
        <div>
          <div class="industry__body">
            <div class="grid12">
              <p class="col-full md:col-7 lede">${escape(industry.outcome)}</p>
              <dl class="col-full md:col-4 md:start-9 industry__facts">
                <div><dt class="mono-meta">Timeline</dt><dd>${escape(industry.timeline)}</dd></div>
                <div><dt class="mono-meta">Team</dt><dd>${escape(industry.team)}</dd></div>
                <div><dt class="mono-meta">Index</dt><dd>${number} / ${String(industries.length).padStart(2, '0')}</dd></div>
              </dl>
            </div>

            <div class="tiers">
              ${industry.tiers.map((t, i, all) => renderTier(t, i, all, industry.id)).join('\n              ')}
            </div>

            <div class="industry__foot">
              <ul class="industry__stack">
                ${industry.stack.map((tech) => `<li class="tag">${escape(tech)}</li>`).join('\n                ')}
              </ul>
              <a class="btn btn--ghost" href="/contact.html?industry=${industry.id}">
                Scope a ${escape(industry.name.toLowerCase())} build
                <span class="btn__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>`;
}

/** Solutions Plate 03: a sticky pill bar that narrows the matrix to one industry (industry-filter.js). */
export function renderIndustryFilterBar() {
  const short = { 'real-estate': 'Real Estate', resort: 'Resort', travel: 'Travel', crm: 'CRM', hospitality: 'Hospitality', finance: 'Finance', events: 'Events', education: 'Education' };
  return `<nav class="ind-filter" aria-label="Show one industry" data-module="industryFilter">
            <button type="button" class="ind-filter__pill" data-ind="all" aria-pressed="true">All Industries</button>
            ${industries
              .map(
                (ind, i) =>
                  `<button type="button" class="ind-filter__pill" data-ind="${ind.id}" aria-pressed="false"><span>${String(i + 1).padStart(2, '0')}</span>${escape(short[ind.id] ?? ind.name)}</button>`,
              )
              .join('\n            ')}
          </nav>`;
}

export function renderIndustries() {
  return `<div class="industries" data-module="industry" data-reveal-group>
      ${industries.map(renderIndustry).join('\n      ')}
    </div>`;
}

/** Compact industry grid used on the home page as a routing device. */
export function renderIndustryIndex() {
  return industries
    .map(
      (industry, i) => `<a class="ind-link" href="/industries/${industry.id}.html" data-reveal="up" data-reveal-item>
        <img class="ind-link__img" src="/img/industries/${industry.id}.jpg" alt="" width="900" height="600" loading="lazy" decoding="async" />
        <span class="ind-link__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="ind-link__icon">${glyph(industry.icon)}</span>
        <span class="ind-link__name">${escape(industry.name)}</span>
        <span class="ind-link__blurb">${escape(industry.blurb)}</span>
        <span class="ind-link__go" aria-hidden="true">→</span>
      </a>`,
    )
    .join('\n      ');
}

export function renderIndustryFooterLinks() {
  return industries
    .map(
      (industry) =>
        `<li><a class="footer__link" href="/industries/${industry.id}.html">${escape(industry.name)}</a></li>`,
    )
    .join('\n            ');
}

/** Technology grid: the official logo where one exists, else the line glyph. */
export function renderTechnology() {
  return technologies
    .map((tech) => {
      const logo = logos[tech.name];
      const mark = logo
        ? `<svg class="tech__glyph tech__logo" viewBox="${logo.viewBox}" fill="currentColor" style="--brand:${logo.hex}" aria-hidden="true">${logo.body}</svg>`
        : `<svg class="tech__glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${tech.glyph}</svg>`;
      return `<div class="tech">
        ${mark}
        <span class="tech__name">${escape(tech.name)}</span>
        <span class="tech__cat">${escape(tech.category)}</span>
      </div>`;
    })
    .join('\n      ');
}

/** Contractual commitments, rendered as the trust strip. */
export function renderGuarantees() {
  return guarantees
    .map(
      (g) => `<div class="metric" data-reveal="up" data-reveal-item>
        <p class="stat__value">${escape(g.value)}<span class="stat__suffix">${escape(g.unit)}</span></p>
        <p class="stat__label">${escape(g.label)}</p>
        <p class="body-muted" style="font-size:var(--text-sm);margin-block-start:.5rem">${escape(g.detail)}</p>
      </div>`,
    )
    .join('\n      ');
}

/** Lynq subscription plans. */
export function renderLynqPlans() {
  return lynqPlans
    .map((plan, i) => {
      const rank = i + 1;
      // Same escalation vocabulary as the industry tiers, so a client moving
      // between the two pages reads one hierarchy, not two.
      const variant = `${TIER_CLASS[rank]}${plan.enterprise ? ' tier--premium' : ''}`;
      const flag = plan.popular
        ? '<span class="plan__flag">Most popular</span>'
        : plan.enterprise
          ? '<span class="plan__flag plan__flag--alt">Enterprise</span>'
          : '';
      const corners = plan.enterprise
        ? `<span class="mark-corner mark-corner--tl" aria-hidden="true"></span>
           <span class="mark-corner mark-corner--br" aria-hidden="true"></span>`
        : '';
      const pips = [1, 2, 3]
        .map((n) => `<span class="tier__pip${n <= rank ? ' is-on' : ''}"></span>`)
        .join('');

      return `<article class="tier plan ${variant}" data-rank="${rank}" data-reveal="up" data-reveal-item>
        ${flag}
        ${corners}
        <header class="tier__head">
          <div class="tier__rank" role="img" aria-label="Plan ${rank} of 3">
            <span class="tier__pips" aria-hidden="true">${pips}</span>
            <span class="tier__label">${escape(plan.channel)}</span>
          </div>
          <h3 class="tier__name">${escape(plan.name)}</h3>
          <p class="body-muted" style="font-size:var(--text-sm)">${escape(plan.summary)}</p>
        </header>

        <div class="plan__price">
          <span class="plan__amount">${escape(plan.price)}</span>
          <span class="mono-meta">/ month</span>
          <p class="mono-meta" style="margin-block-start:.4rem">${escape(plan.annual)} on annual · save 15%</p>
          <p class="mono-meta">Setup ${escape(plan.setup)}</p>
          ${plan.roi ? `<p class="plan__roi">“${escape(plan.roi)}”</p>` : ''}
        </div>

        <ul class="tier__list">
          ${plan.features.map((f) => `<li class="tier__feature">${CHECK}<span>${escape(f)}</span></li>`).join('\n          ')}
        </ul>

        <table class="plan__limits">
          <caption class="sr-only">${escape(plan.name)} monthly limits</caption>
          <tbody>
            ${plan.limits.map(([k, v]) => `<tr><th scope="row">${escape(k)}</th><td>${escape(v)}</td></tr>`).join('\n            ')}
          </tbody>
        </table>

        <a class="v2-cta plan__cta" href="/contact.html?product=lynq&amp;tier=${plan.tier}" data-cta>${escape(plan.cta)} <span class="v2-arrow" aria-hidden="true">→</span></a>
      </article>`;
    })
    .join('\n      ');
}

/** Contact details, so a change never has to be hunted for. */
export function renderContactRows() {
  return `<div class="contact-row">
        <span>Email</span>
        <a class="link" href="mailto:${company.email}">${escape(company.email)}</a>
      </div>
      ${company.phones
        .map(
          (p) => `<div class="contact-row">
        <span>${escape(p.label)}</span>
        <a class="link" href="tel:${p.tel}">${escape(p.display)}</a>
      </div>`,
        )
        .join('\n      ')}
      <div class="contact-row">
        <span>${escape(company.whatsapp.label)}</span>
        <a class="link" href="https://wa.me/${company.whatsapp.tel.slice(1)}" target="_blank" rel="noopener noreferrer">${escape(company.whatsapp.display)}</a>
      </div>
      <div class="contact-row">
        <span>Studio</span>
        <span style="font-size:var(--text-sm)">${escape(company.location)}<br />${escape(company.region)}</span>
      </div>
      <div class="contact-row">
        <span>Hours</span>
        <span style="font-size:var(--text-sm)">${escape(company.hours)}</span>
      </div>
      <div class="contact-row">
        <span>Platform</span>
        <a class="link" href="${company.product.href}">${escape(company.product.label)}</a>
      </div>`;
}

/**
 * One leader's full-width section on the About page (<!--@render:leader:ceo-->
 * or :cto). The founder's portrait arrives from the left, the CTO's from the
 * right; the copy follows. Both reveal through the site's [data-reveal] system.
 */
export function renderLeader(which) {
  const m = team[which === 'cto' ? 1 : 0];
  const side = which === 'cto' ? 'right' : 'left';
  const img = m.photo
    ? `<img src="${m.photo}" alt="${escape(m.name)}, ${escape(m.role)}" width="1200" height="1500" loading="lazy" decoding="async" />`
    : `<span class="leader__initials" aria-hidden="true">${escape(m.initials)}</span>`;
  return `<div class="shell leader__grid">
          <figure class="leader__photo" data-reveal="${side}">${img}</figure>
          <div class="leader__copy" data-reveal="up" style="--reveal-delay:260ms">
            <p class="eyebrow">${which === 'cto' ? 'Technology' : 'Leadership'}</p>
            <h2 class="leader__name">${escape(m.name)}</h2>
            <p class="mono-meta">${escape(m.role)}</p>
            <p class="leader__tag">${escape(m.tagline)}</p>
          </div>
        </div>`;
}

/** One labelled row of buttons per filter group, each starting on "All". */
export function renderProjectFilters() {
  return projectFilterGroups
    .map(
      (group) => `<div class="filters__group" role="group" aria-labelledby="filter-${group.id}">
          <span class="filters__label mono-meta" id="filter-${group.id}">${escape(group.label)}</span>
          <div class="filters__options">
            ${[{ value: 'all', label: 'All' }, ...group.options]
              .map(
                (f) =>
                  `<button class="filter" type="button" data-filter-group="${group.id}" data-filter="${f.value}" aria-pressed="${f.value === 'all'}">${escape(f.label)}</button>`,
              )
              .join('\n            ')}
          </div>
        </div>`,
    )
    .join('\n        ');
}

/**
 * Project cards.
 *
 * The default "cover" is a generated gradient composition rather than a
 * screenshot — placeholder imagery of work that does not exist yet would be a
 * fabrication, and a stock photo would undercut the studio's own claim to
 * craft. Where a real capture of the live site exists (`screenshot: true`,
 * see the doc comment in src/data/projects.js), that image is used instead.
 *
 * `status: 'ongoing'` marks a project still in build — the studio isn't
 * ready to send visitors to a live client site that's mid-work, so the "Visit"
 * link is withheld (the summary text stays fully visible either way; nothing
 * here is gated behind a click) and a stamp sits over the cover instead.
 *
 * `gallery` lists extra screenshots (filenames under public/img/work/) shown
 * in a lightbox when the card's media is clicked — see gallery.js. Optional;
 * most projects have just the one cover image and no click behaviour at all.
 */
const solutionLabel = Object.fromEntries(SOLUTIONS);

/**
 * Work cards: what each build is, architecturally, by its strongest solution
 * tag — and where "Build similar" sends the visitor on the contact page.
 */
const OUTCOME = [
  ['ai', 'AI agent front desk'],
  ['crm', 'Lead capture + automated pipeline'],
  ['automation', 'WhatsApp enquiry spine'],
  ['web', 'Enquiry-first website'],
  ['marketing', 'Campaign-driven enquiries'],
  ['gmb', 'Local search visibility'],
];
const CONTACT_INDUSTRY = {
  'Real Estate': 'real-estate',
  'Hotels & Resorts': 'resort',
  'Tours & Travels': 'travel',
  Education: 'education',
  'Event Management': 'events',
  Finance: 'finance',
};
const outcomeOf = (p) => OUTCOME.find(([tag]) => solutionTags(p).includes(tag))?.[1];
const similarHref = (p) =>
  p.industry === 'AI Product'
    ? `/contact.html?product=lynq&amp;ref=${p.slug}`
    : `/contact.html?industry=${CONTACT_INDUSTRY[p.industry] ?? 'other'}&amp;ref=${p.slug}`;

export function renderProjects() {
  return projects
    .map((project, i) => {
      const ongoing = project.status === 'ongoing';
      const gallery = project.gallery ?? [];

      // Client name is a visible placeholder until permission to publish it is
      // given — never a plausible-sounding invention.
      const client = project.client
        ? `<span class="mono-meta">${escape(project.client)}</span>`
        : '<span class="mono-meta is-slot">&lt;Client Name&gt;</span>';

      const media = project.screenshot
        ? `<img src="/img/work/${project.slug}.jpg" alt="${escape(project.live && !project.linkLabel ? `${project.title} website` : project.title)}" width="900" height="675" loading="lazy" decoding="async" />`
        : (() => {
            const hue = 210 + (i % 3) * 14;
            const cover = `background:
          radial-gradient(120% 90% at 22% 18%, hsl(${hue} 32% 34% / .95), transparent 62%),
          radial-gradient(90% 80% at 82% 86%, hsl(${hue - 18} 28% 46% / .55), transparent 60%),
          linear-gradient(160deg, #101b35, #040812)`;
            // The "Ongoing" stamp already explains an empty cover here — stacking
            // the <Project Screenshot> slot underneath it would just be two
            // messages fighting for the same centred spot.
            const slot = ongoing
              ? ''
              : '<span class="project__slot" aria-hidden="true">&lt;Project Screenshot&gt;</span>';
            return `<div class="project__cover" style="${cover}">${slot}</div>`;
          })();

      const statusStamp = ongoing
        ? '<span class="project__status"><span>Ongoing</span></span>'
        : '';

      const galleryCue = gallery.length
        ? `<span class="project__gallery-cue" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5"/><path d="M5.5 14.5h9v-9"/></svg>
            ${gallery.length + 1} photos
          </span>`
        : '';

      const mediaAttrs = gallery.length
        ? ` data-module="gallery" data-gallery='${escape(
            JSON.stringify([`/img/work/${project.slug}.jpg`, ...gallery.map((g) => `/img/work/${g}`)]),
          )}' data-gallery-title="${escape(project.title)}" role="button" tabindex="0" aria-label="View ${gallery.length + 1} screenshots of ${escape(project.title)}"`
        : '';

      const facets = projectFacets(project);
      return `<article class="project" data-industry="${facets.industry}" data-solution="${facets.solution}" data-tech="${facets.tech}" data-reveal="up" data-reveal-item>
        <div class="project__media" data-tilt="5"${mediaAttrs}>
          ${media}
          ${statusStamp}
          ${galleryCue}
        </div>
        <div class="project__body">
          <div class="project__row">
            <span class="mono-meta">${escape(project.industry)}</span>
            <span class="mono-meta">${escape(project.year)}</span>
          </div>
          ${outcomeOf(project) ? `<span class="project__outcome">${escape(outcomeOf(project))}</span>` : ''}
          <h2 class="project__title">${escape(project.title)}</h2>
          <p class="body-muted" style="font-size:var(--text-sm)">${project.summary ? escape(project.summary) : slot('Description on delivery')}</p>
          <div class="project__row" style="margin-block-start:.75rem">
            ${client}
            <span class="project__links">
              <a class="project__similar" href="${similarHref(project)}" data-cta>Build similar&nbsp;<span aria-hidden="true">→</span></a>
              ${project.live && !ongoing ? `<a class="link link--accent" href="${project.live}"${project.live.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(project.linkLabel ?? 'Visit')}&nbsp;<span aria-hidden="true">→</span></a>` : ''}
            </span>
          </div>
          <ul class="industry__stack" style="margin-block-start:.75rem">
            ${solutionTags(project).map((t) => `<li class="tag">${escape(solutionLabel[t])}</li>`).join('')}
          </ul>
        </div>
      </article>`;
    })
    .join('\n      ');
}

export function renderProcess() {
  return processSteps
    .map((step, i) => {
      const meta = processMeta[i];
      const art = processArt[i];
      return `<li class="step" data-reveal="up" data-reveal-item>
        <span class="step__dot" aria-hidden="true"></span>
        <p class="step__index">Phase ${String(i + 1).padStart(2, '0')}${meta ? ` <span>· ${escape(meta.time)}</span>` : ''}</p>
        <h2 class="step__title">${escape(step.title)}</h2>
        <p class="step__text">${escape(step.text)}</p>
        ${meta ? `<ul class="step__gets" aria-label="What you get">${meta.gets.map((g) => `<li>${escape(g)}</li>`).join('')}</ul>` : ''}
        <figure class="step__art vart" aria-hidden="true"><svg viewBox="0 0 320 220">${art}</svg></figure>
      </li>`;
    })
    .join('\n      ');
}

/** About page timeline — four milestones, one line each, each with its picture. */
export function renderTrajectory() {
  const steps = [
    ['Origin', 'Custom web platforms', 'Systems, not templates.', ''],
    ['Expansion', 'CRM and automation', 'What happens after the enquiry.', ''],
    ['Today', 'AI-native delivery', 'Voice agents and document AI.', ' workflow__step--current'],
    ['Next', 'Industry platforms', 'Eight industries, one playbook.', ' workflow__step--future'],
  ];
  return steps
    .map(
      ([meta, title, detail, cls], i) => `<li class="workflow__step${cls}" data-reveal="up" data-reveal-item>
                <span class="workflow__node" aria-hidden="true">0${i + 1}</span>
                <span class="workflow__meta">${meta}</span>
                <h3 class="workflow__title">${title}</h3>
                <p class="workflow__detail">${detail}</p>
                <figure class="workflow__art vart" aria-hidden="true"><svg viewBox="0 0 320 220">${trajectoryArt[i]}</svg></figure>
              </li>`,
    )
    .join('\n              ');
}

/**
 * FAQ accordion. Native <details>/<summary> rather than the industry
 * page's JS-driven pattern — this page's entire job is being read directly
 * by crawlers and AI answer engines, many of which never execute JS, so
 * every question and answer has to be real, expandable HTML with no
 * dependency on a module loading.
 */
export function renderFaq() {
  return faqCategories
    .map(
      (cat) => `<div class="faq__group" data-reveal="up" data-reveal-item>
        <p class="eyebrow" data-reveal="fade">${escape(cat.label)}</p>
        <div class="faq__list">
          ${cat.items
            .map(
              (item) => `<details class="faq__item">
            <summary class="faq__question">
              <span>${escape(item.q)}</span>
              <span class="faq__chev" aria-hidden="true">${CHEVRON}</span>
            </summary>
            <div class="faq__answer"><p>${escape(item.a)}</p></div>
          </details>`,
            )
            .join('\n          ')}
        </div>
      </div>`,
    )
    .join('\n      ');
}

/**
 * FAQPage structured data, generated from the exact same array that powers
 * the visible accordion above. Google's FAQ rich-result eligibility requires
 * the schema to match what a visitor actually sees, so there is deliberately
 * no second, hand-maintained copy of these answers to drift out of sync.
 */
export function renderFaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/faq.html#faq`,
    url: `${SITE}/faq.html`,
    name: 'Naaz AI Labs — FAQ',
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': ORG_ID },
    author: { '@id': FOUNDER_ID },
    inLanguage: 'en-IN',
    dateModified: SITE_UPDATED,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/* ==========================================================================
   PER-INDUSTRY LANDING PAGES  (/industries/<id>.html)

   One renderer over the eight real rows in industries.js. These are not
   name-swapped doorway pages: each carries a different problem statement,
   a different three-band scope matrix, a different tech stack, and — where
   they exist — the real client projects delivered in that vertical. Nothing
   on these pages is generated copy; every fact traces to industries.js,
   projects.js, or company.js.
   ========================================================================== */

const SITE = 'https://www.naazailabs.com';
const ORG_ID = `${SITE}/#org`;
const FOUNDER_ID = `${SITE}/#founder`;
// Bumped by hand when page content materially changes — an honest
// dateModified for AI-citation provenance, not an auto-stamp on every deploy.
const SITE_UPDATED = '2026-09-10';

// projects.js uses display-name industry labels that don't all match the
// industries.js `name`. Only the honest overlaps are mapped; CRM matches on
// the 'crm' tag instead, since CRM builds span every category.
const INDUSTRY_PROJECT_LABELS = {
  'real-estate': ['Real Estate'],
  resort: ['Hotels & Resorts'],
  travel: ['Tours & Travels'],
  crm: [],
  hospitality: ['Hotels & Resorts'],
  finance: ['Finance'],
  events: ['Event Management'],
  education: ['Education'],
};

const industryBySlug = (slug) => industries.find((i) => i.id === slug);

/** Real client projects delivered in this vertical, most recent first. */
function industryProjects(slug) {
  const labels = INDUSTRY_PROJECT_LABELS[slug] ?? [];
  const matches =
    slug === 'crm'
      ? (p) => solutionTags(p).includes('crm') && p.industry !== 'AI Product'
      : (p) => labels.includes(p.industry);
  return projects.filter((p) => matches(p) && p.status !== 'ongoing');
}

function faqForIndustry(industry) {
  const noun = industry.name.toLowerCase();
  return [
    {
      q: `Do you work with ${noun} clients outside Bangalore?`,
      a: `Yes. The studio is in JP Nagar, Bengaluru, and we deliver for ${noun} clients across Karnataka and the rest of India. Client data is stored in India.`,
    },
    {
      q: `How long does a ${noun} build take?`,
      a: `${industry.timeline} depending on the delivery band — Standard is the fastest, Premium the most involved. A Lynq subscription goes live in 7 days from advance payment.`,
    },
    {
      q: `What does a ${noun} project include?`,
      a: `${industry.tiers[0].name} covers ${industry.tiers[0].features.slice(0, 3).join(', ').toLowerCase()} and more. ${industry.tiers[industry.tiers.length - 1].name} adds AI voice agents, prediction, and document AI. See the full three-band breakdown on this page.`,
    },
  ];
}

/** Head block: title, description, canonical, og:url — one per industry. */
export function renderIndustryLandingHead(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return '';
  const url = `${SITE}/industries/${slug}.html`;
  const title = `${ind.name} AI, CRM &amp; Automation in Bangalore | Naaz AI Labs`;
  const desc = `${ind.blurb} ${ind.name} websites, CRMs, and AI automation built by Naaz AI Labs in Bangalore — serving Karnataka and across India.`;
  return `<title>${title}</title>
    <meta name="description" content="${escape(desc)}" />
    <meta property="og:title" content="${ind.name} AI, CRM &amp; Automation in Bangalore" />
    <meta property="og:description" content="${escape(ind.blurb)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:url" content="${url}" />`;
}

/** Service + BreadcrumbList + FAQPage structured data for one industry. */
export function renderIndustryLandingSchema(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return '';
  const url = `${SITE}/industries/${slug}.html`;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `${ind.name} AI, CRM & Automation in Bangalore`,
      description: ind.blurb,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${url}#service` },
      publisher: { '@id': ORG_ID },
      author: { '@id': FOUNDER_ID },
      inLanguage: 'en-IN',
      datePublished: SITE_UPDATED,
      dateModified: SITE_UPDATED,
      primaryImageOfPage: `${SITE}/img/og-image.jpg`,
    },
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `${ind.name} — AI, CRM & automation`,
      description: ind.blurb,
      serviceType: ind.name,
      provider: { '@id': ORG_ID },
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Karnataka' },
        { '@type': 'Country', name: 'India' },
      ],
      url,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Solutions', item: `${SITE}/solutions.html` },
        { '@type': 'ListItem', position: 3, name: ind.name, item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#webpage` },
      publisher: { '@id': ORG_ID },
      dateModified: SITE_UPDATED,
      mainEntity: faqForIndustry(ind).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  return `<script type="application/ld+json">\n${JSON.stringify(
    { '@context': 'https://schema.org', '@graph': graph },
    null,
    2,
  )}\n</script>`;
}

/** The full page body for one industry landing page. */
export function renderIndustryLanding(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return `<!-- unknown industry: ${escape(slug)} -->`;

  const idx = industries.indexOf(ind);
  const related = [industries[(idx + 1) % industries.length], industries[(idx + 2) % industries.length]];
  const work = industryProjects(slug);

  const workBlock = work.length
    ? `<section class="section section--ruled">
          <div class="shell">
            <div class="grid12" style="margin-block-end:2.5rem">
              <p class="col-full md:col-3 eyebrow" data-reveal="fade">Delivered</p>
              <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">
                ${escape(ind.name)} systems, in production.
              </h2>
            </div>
            <ul class="ind-work" data-reveal-group>
              ${work
                .map(
                  (p) => `<li class="ind-work__item" data-reveal="up" data-reveal-item>
                <span class="ind-work__name">${escape(p.title)}</span>
                <span class="body-muted" style="font-size:var(--text-sm)">${p.summary ? escape(p.summary) : ''}</span>
                ${
                  p.live
                    ? `<a class="link link--accent" href="${p.live}" target="_blank" rel="noopener noreferrer">${escape(p.linkLabel ?? 'Visit')}&nbsp;<span aria-hidden="true">→</span></a>`
                    : ''
                }
              </li>`,
                )
                .join('\n              ')}
            </ul>
            <a class="btn btn--ghost" href="/proof-of-work.html" style="margin-block-start:2rem">
              See all proof of work
              <span class="btn__arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>`
    : `<section class="section section--ruled">
          <div class="shell">
            <p class="lede" data-reveal="up">
              See systems we have shipped across every vertical in
              <a class="link link--accent" href="/proof-of-work.html">proof of work</a>.
            </p>
          </div>
        </section>`;

  const faqs = faqForIndustry(ind);

  return `<header class="page-head page-head--dark grain" data-theme="dark">
      <div class="glow" style="inline-size:38rem;block-size:38rem;inset-block-start:-12rem;inset-inline-end:-8rem;--glow-opacity:.32"></div>
      <div class="gridlines" aria-hidden="true"></div>
      <div class="shell layer-content">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden="true">/</span><a href="/solutions.html">Solutions</a><span aria-hidden="true">/</span><span aria-current="page">${escape(ind.name)}</span>
        </nav>
        <div class="grid12" style="margin-block-start:1.5rem">
          <div class="col-full md:col-7">
            <p class="page-head__index">Industry · ${escape(ind.name)}</p>
            <h1 class="page-head__title" style="margin-block-start:1.25rem" data-module="splitText">
              AI &amp; automation for ${escape(ind.name)}
            </h1>
          </div>
          <div class="col-full md:col-4 md:start-9" style="align-self:end">
            <p class="lede" data-reveal="up">
              ${escape(ind.outcome)} Delivered from our Bengaluru studio, for clients across Karnataka and India.
            </p>
          </div>
        </div>
        <div class="hero__actions" style="margin-block-start:2rem" data-reveal="up">
          <a class="btn btn--invert btn--lg" href="/contact.html?industry=${ind.id}">
            Scope a ${escape(ind.name.toLowerCase())} build
            <span class="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a class="btn btn--ghost btn--lg" href="/solutions.html#${ind.id}">
            Compare all industries
          </a>
        </div>
      </div>
    </header>

    <section class="section section--tight">
      <div class="shell">
        <dl class="metrics" data-reveal="up">
          <div class="metric">
            <p class="stat__label">Typical timeline</p>
            <p class="title-3">${escape(ind.timeline)}</p>
          </div>
          <div class="metric">
            <p class="stat__label">Delivery team</p>
            <p class="title-3">${escape(ind.team)}</p>
          </div>
          <div class="metric">
            <p class="stat__label">Serving</p>
            <p class="title-3">Bengaluru · Karnataka · India</p>
          </div>
        </dl>
        <ul class="industry__stack" style="margin-block-start:2rem">
          ${ind.stack.map((t) => `<li class="tag">${escape(t)}</li>`).join('\n          ')}
        </ul>
      </div>
    </section>

    <section class="section section--flush-top" aria-label="${escape(ind.name)} delivery bands">
      <div class="shell">
        <div class="grid12" style="margin-block-end:2.5rem">
          <p class="col-full md:col-3 eyebrow" data-reveal="fade">What your investment builds</p>
          <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">
            Three delivery bands for ${escape(ind.name.toLowerCase())}.
          </h2>
        </div>
        <div class="tiers">
          ${ind.tiers.map((t, i, all) => renderTier(t, i, all, ind.id)).join('\n          ')}
        </div>
      </div>
    </section>

    ${workBlock}

    <section class="section">
      <div class="shell">
        <div class="grid12" style="margin-block-end:2.5rem">
          <p class="col-full md:col-3 eyebrow" data-reveal="fade">${escape(ind.name)} FAQ</p>
          <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">Questions, answered.</h2>
        </div>
        <div class="faq">
          <div class="faq__list">
            ${faqs
              .map(
                (f) => `<details class="faq__item">
              <summary class="faq__question">
                <span>${escape(f.q)}</span>
                <span class="faq__chev" aria-hidden="true">${CHEVRON}</span>
              </summary>
              <div class="faq__answer"><p>${escape(f.a)}</p></div>
            </details>`,
              )
              .join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--ruled">
      <div class="shell grid12" style="align-items:center">
        <div class="col-full md:col-6">
          <p class="eyebrow" data-reveal="fade">Related</p>
          <h2 class="title-1" style="margin-block-start:1.25rem" data-reveal="up">Other industries we build for.</h2>
          <p class="lede" style="margin-block-start:1.5rem" data-reveal="up">
            ${related
              .map((r) => `<a class="link link--accent" href="/industries/${r.id}.html">${escape(r.name)}</a>`)
              .join(' · ')}
            · <a class="link link--accent" href="/solutions.html">all eight</a>
          </p>
        </div>
        <div class="col-full md:col-4 md:start-9" data-reveal="up">
          <a class="btn btn--lg" href="/contact.html?industry=${ind.id}">
            Start your project
            <span class="btn__arrow" aria-hidden="true">→</span>
          </a>
          <p class="mono-meta" style="margin-block-start:1rem">Reply within one business day</p>
        </div>
      </div>
    </section>`;
}

/* ==========================================================================
   SERVICES — the twenty services and indicative pricing from the company
   profile. Every figure traces to src/data/services.js.
   ========================================================================== */

const serviceId = (name) => `service-${categorySlug(name)}`;

/**
 * A service's line icon. `pathLength="1"` on every shape normalises its
 * length, so one CSS dash rule draws any icon in (see .svc-card__icon).
 */
const serviceIcon = (svg) =>
  `<svg class="svc-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg.replace(/<(path|circle|rect)\b/g, '<$1 pathLength="1"')}</svg>`;

/** One service card. Shared by the rail and the bento grid. */
function serviceCard(s, n, reveal) {
  return `<article class="svc-card glow-ring" id="${serviceId(s.name)}" data-tilt="4" data-reveal="${reveal}" data-reveal-item>
              <div class="svc-card__top">
                <span class="svc-card__badge">${serviceIcon(s.icon)}</span>
                <span class="svc-card__num" aria-hidden="true">${String(n).padStart(2, '0')}</span>
              </div>
              <h3 class="svc-card__name">${escape(s.name)}</h3>
              <p class="svc-card__text">${escape(s.text)}</p>
              <p class="svc-card__price">${s.price ? escape(s.price) : 'Quoted to scope'}</p>
            </article>`;
}

/** A group's heading block: range, split headline, summary. */
function serviceGroupHead(group) {
  return `<div class="grid12 svc-group__head">
            <p class="col-full md:col-3 eyebrow" data-reveal="fade" data-scramble>${escape(group.range)}</p>
            <div class="col-full md:col-8 md:start-5">
              <h2 class="title-1" id="${group.id}-title" data-module="splitText">${escape(group.label)}</h2>
              <p class="lede" style="margin-block-start:1rem" data-reveal="up">${escape(group.summary)}</p>
            </div>
          </div>`;
}

/**
 * "Build" as an ice stage, after igloo.inc: the section pins and the scroll
 * walks through the ten services one at a time — the current one centred in
 * a frame of 3D ice shards, the next waiting at the right, spec lines beside
 * it, an index down the right edge and a counter bottom-left.
 *
 * The card content is plain, crisp HTML; the ice is only the border (drawn by
 * ice-frames.js in WebGL, or a CSS frame as the fallback). Without JS or under
 * reduced motion the ten simply list down the page.
 */
function iceItem(s, n, total) {
  const num = String(n).padStart(2, '0');
  return `<li class="ice-item" id="${serviceId(s.name)}" data-ice-item>
            <div class="ice-meta" aria-hidden="true">
              <p class="ice-mono ice-meta__title">SERVICE_${num} <span>//</span> BUILD</p>
              <p class="ice-mono">PRICE&nbsp; ${s.price ? escape(s.price) : 'Quoted to scope'}</p>
              <p class="ice-mono"><span class="ice-dot"></span> ${num} OF ${String(total).padStart(2, '0')}</p>
              <a class="ice-mono ice-meta__link" href="/contact.html" tabindex="-1">[ Get a quote ]</a>
            </div>
            <article class="ice-card" data-robot-hop>
              <div class="svc-card__top">
                <span class="svc-card__badge">${serviceIcon(s.icon)}</span>
                <span class="ice-card__num" aria-hidden="true">${num}</span>
              </div>
              <h3 class="ice-card__name">${escape(s.name)}</h3>
              <p class="ice-card__text">${escape(s.text)}</p>
              <div class="ice-card__foot">
                <p class="svc-card__price">${s.price ? escape(s.price) : 'Quoted to scope'}</p>
                <a class="ice-mono ice-card__link" href="/contact.html">[ Get a quote ]</a>
              </div>
            </article>
          </li>`;
}

/**
 * "Connect & Grow" as a scroll-driven gallery: the section pins and the ten
 * services slide past as large cards, each with its own vector scene, while a
 * numbered rail along the top tracks where you are (svc-track.js). Without
 * JavaScript, on phones and under reduced motion it is a plain swipeable row.
 */
function growTrack(group, offset) {
  const total = group.services.length;
  const ticks = group.services
    .map((s, i) => `<button class="gtrack__tick" type="button" data-i="${i}" aria-label="Show ${escape(s.name)}"><span>${String(offset + i + 1).padStart(2, '0')}</span></button>`)
    .join('');
  const cards = group.services
    .map((s, i) => {
      const num = String(offset + i + 1).padStart(2, '0');
      return `<article class="gcard" id="${serviceId(s.name)}" data-i="${i}">
              <div class="gcard__art vart" aria-hidden="true"><svg viewBox="0 0 320 220">${growArt[i]}</svg><span class="gcard__ph"><b></b></span></div>
              <div class="gcard__copy">
                <p class="gcard__index">${num}<span> / ${offset + total}</span></p>
                <h3 class="gcard__title">${escape(s.name)}</h3>
                <p class="gcard__text">${escape(s.text)}</p>
                <div class="gcard__foot">
                  <span class="gcard__price">${s.price ? escape(s.price) : 'Quoted to scope'}</span>
                  <a class="gcard__cta" href="/contact.html">Get a quote <span aria-hidden="true">→</span></a>
                </div>
                <span class="gcard__sk" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              </div>
              <span class="gcard__frame" aria-hidden="true">
                <em class="gcard__tag">${escape(s.name)}</em>
                <i class="h h1"></i><i class="h h2"></i><i class="h h3"></i><i class="h h4"></i><i class="h h5"></i><i class="h h6"></i><i class="h h7"></i><i class="h h8"></i>
                <em class="gcard__dim"></em>
              </span>
            </article>`;
    })
    .join('\n            ');
  return `<div class="gtrack" data-module="svcTrack">
          <canvas class="gtrack__agents" aria-hidden="true"></canvas>
          <div class="gtrack__bar" aria-label="${escape(group.label)} services">
            <div class="gtrack__top">
              <div class="gtrack__ticks">${ticks}</div>
              <div class="gtrack__hud" data-hud hidden>
                <span class="hud__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="hud__text" data-hud-text></span>
                <button class="hud__replay" type="button" data-hud-replay>Replay</button>
              </div>
            </div>
            <span class="gtrack__line" aria-hidden="true"><i></i></span>
          </div>
          <div class="gtrack__viewport">
            <div class="gtrack__rail">
            ${cards}
            </div>
          </div>
        </div>`;
}

/**
 * The two service groups, numbered 01–20 straight through:
 *   "Build"           — the ice stage (above).
 *   "Connect & Grow"  — a bento grid on midnight with three feature cards;
 *                       icon draw-in, cursor spotlight, tilt, sweeping ring.
 */
export function renderServiceGroups() {
  const [build, grow] = serviceGroups;
  let n = 0;
  const total = build.services.length;
  const iceItems = build.services.map((s) => iceItem(s, ++n, total)).join('\n          ');
  const index = build.services
    .map((s, i) => `<li><button type="button" data-ice-jump="${i}" aria-label="Show ${escape(s.name)}"><span>${String(i + 1).padStart(2, '0')}</span></button></li>`)
    .join('');

  return `<section class="ice-stage" id="${build.id}" aria-labelledby="${build.id}-title" data-ice-stage>
        <canvas class="ice-stage__canvas" aria-hidden="true" data-ice-canvas></canvas>
        <div class="ice-stage__head">
          <p class="ice-mono" data-scramble>[ ${escape(build.label.toUpperCase())} · ${escape(build.range.replace(/\s/g, ''))} ]</p>
          <h2 class="ice-stage__title" id="${build.id}-title">${escape(build.label)}</h2>
          <p class="ice-stage__summary">${escape(build.summary)}</p>
        </div>
        <ol class="ice-stage__list">
          ${iceItems}
        </ol>
        <ol class="ice-index" aria-label="${escape(build.label)} services">${index}</ol>
        <div class="ice-counter" aria-hidden="true">
          <p class="ice-mono"><span data-ice-count>[01/${String(total).padStart(2, '0')}]</span> <span data-ice-name>${escape(build.services[0].name)}</span></p>
          <span class="ice-counter__bar"><span data-ice-bar></span></span>
        </div>
      </section>

      <section class="section section--ruled svc-group svc-group--dark grain" id="${grow.id}" aria-labelledby="${grow.id}-title" data-theme="dark">
        <div class="glow" style="inline-size:36rem;block-size:36rem;inset-block-start:-10rem;inset-inline-end:-8rem;--glow-opacity:.3"></div>
        <div class="shell layer-content">
          ${serviceGroupHead(grow)}
          ${growTrack(grow, n)}
        </div>
      </section>`;
}

/**
 * Hero orbit: every service icon on two counter-rotating rings around the
 * badge. Decorative — the services themselves are the cards below.
 */
export function renderServiceOrbit() {
  const all = serviceGroups.flatMap((g) => g.services);
  const ring = (items, cls) =>
    `<div class="orbit__ring ${cls}" style="--n:${items.length}">
            ${items
              .map(
                (s, i) =>
                  `<span class="orbit__item" style="--i:${i}"><span class="orbit__chip">${serviceIcon(s.icon)}</span></span>`,
              )
              .join('\n            ')}
          </div>`;
  return `<div class="orbit" aria-hidden="true" data-orbit>
          <div class="orbit__tilt" data-orbit-tilt>
            ${ring(all.slice(0, 8), 'orbit__ring--inner')}
            ${ring(all.slice(8), 'orbit__ring--outer')}
            <div class="orbit__core"><img src="/img/logo-n.png" alt="" width="167" height="200" /></div>
          </div>
        </div>`;
}

/** Four counters under the hero — every figure computed from the site's data. */
export function renderServiceStats() {
  const count = serviceGroups.reduce((total, g) => total + g.services.length, 0);
  const stats = [
    [count, '', 'Services, one team'],
    [industries.length, '', 'Industries served'],
    [projects.length, '+', 'Live projects'],
    [7, '', 'Days to go live on Lynq'],
  ];
  return stats
    .map(
      ([value, suffix, label]) => `<div class="svc-stat" data-reveal="up" data-reveal-item>
          <p class="svc-stat__value"><span data-module="counter" data-lazy${suffix ? ` data-suffix="${suffix}"` : ''}>${value}${suffix}</span></p>
          <p class="svc-stat__label" data-scramble>${escape(label)}</p>
        </div>`,
    )
    .join('\n        ');
}

/**
 * Two rows of service names scrolling in opposite directions under the hero.
 * The second copy of each track exists only to make the loop seamless, so
 * it is hidden from assistive tech; the real list is the cards below.
 */
export function renderServiceMarquee() {
  const names = serviceGroups.flatMap((g) => g.services.map((s) => s.name));
  const half = Math.ceil(names.length / 2);
  const row = (items, reverse) => {
    const chips = items.map((name) => `<span class="svc-chip">${escape(name)}</span>`).join('');
    return `<div class="marquee svc-marquee${reverse ? ' svc-marquee--reverse' : ''}" aria-hidden="true">
            <div class="marquee__track">${chips}</div>
            <div class="marquee__track">${chips}</div>
          </div>`;
  };
  return `<div class="svc-marquees">
          ${row(names.slice(0, half), false)}
          ${row(names.slice(half), true)}
        </div>`;
}

/** Compact two-column list of all twenty services, for the home page. */
export function renderServiceIndex() {
  let n = 0;
  return serviceGroups
    .map(
      (group) => `<div data-reveal="up" data-reveal-item>
        <p class="eyebrow" style="margin-block-end:1rem">${escape(group.label)} · ${escape(group.range)}</p>
        <ul class="tier__list">
          ${group.services
            .map((s) => {
              n += 1;
              return `<li class="tier__feature"><span class="mono-meta">${String(n).padStart(2, '0')}</span><a class="link" href="/services.html#${serviceId(s.name)}">${escape(s.name)}</a></li>`;
            })
            .join('\n          ')}
        </ul>
      </div>`,
    )
    .join('\n      ');
}

/** The three website packages, on the same escalating tier cards as Solutions. */
export function renderWebsitePackages() {
  return websitePackages
    .map((pkg, i) => {
      const rank = i + 1;
      const pips = [1, 2, 3]
        .map((p) => `<span class="tier__pip${p <= rank ? ' is-on' : ''}"></span>`)
        .join('');
      const corners =
        rank === 3
          ? `<span class="mark-corner mark-corner--tl" aria-hidden="true"></span>
         <span class="mark-corner mark-corner--br" aria-hidden="true"></span>`
          : '';
      // Each rupee figure counts up on first sight; the final value is the
      // span's own text, so crawlers and no-JS visitors read the real price.
      const price = escape(pkg.price).replace(
        /₹([\d,]+)/g,
        (_, n) => `<span data-module="counter" data-lazy data-prefix="₹" data-locale="en-IN">₹${n}</span>`,
      );
      return `<article class="tier ${TIER_CLASS[rank]}${rank === 3 ? ' tier--premium glow-ring glow-ring--on' : ''}" data-rank="${rank}" data-tilt="4" data-reveal="up" data-reveal-item>
        ${corners}
        <header class="tier__head">
          <div class="tier__rank" role="img" aria-label="Package ${rank} of 3">
            <span class="tier__pips" aria-hidden="true">${pips}</span>
            <span class="tier__label">Package ${String(rank).padStart(2, '0')}</span>
          </div>
          <h3 class="tier__name">${escape(pkg.name)}</h3>
        </header>
        <div class="tier__spend">
          <p class="tier__spend-label">Indicative</p>
          <p class="tier__spend-value">${price}</p>
        </div>
        <ul class="tier__list">
          ${pkg.features.map((f) => `<li class="tier__feature">${CHECK}<span>${escape(f)}</span></li>`).join('\n          ')}
        </ul>
      </article>`;
    })
    .join('\n      ');
}

/** Pricing terms; each line slides in on the parent's reveal stagger. */
export function renderPricingTerms() {
  return pricingTerms
    .map((t) => `<li class="tier__feature" data-reveal="left" data-reveal-item>${CHECK}<span>${escape(t)}</span></li>`)
    .join('\n          ');
}

/**
 * The six steps as a timeline: the connecting line draws across (down, on
 * phones) when the list is revealed, and each step pops in on the stagger.
 */
export function renderHowWeWork() {
  return `<ol class="flow" data-reveal="fade" data-reveal-group>
        ${howWeWork
          .map(
            (step, i) => `<li class="flow__step" data-reveal="up" data-reveal-item>
          <span class="flow__dot">${String(i + 1).padStart(2, '0')}</span>
          <span class="flow__title">${escape(step)}</span>
        </li>`,
          )
          .join('\n        ')}
      </ol>`;
}

/** OfferCatalog structured data, generated from the same list the page shows. */
export function renderServicesSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${SITE}/services.html#catalog`,
    name: 'Naaz AI Labs — Services',
    url: `${SITE}/services.html`,
    provider: { '@id': ORG_ID },
    itemListElement: serviceGroups.map((group) => ({
      '@type': 'OfferCatalog',
      name: group.label,
      itemListElement: group.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.text, provider: { '@id': ORG_ID } },
        priceCurrency: 'INR',
      })),
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/* ==========================================================================
   BLOG — every post is one file in blog/. Its <head> meta tags are the single
   source of truth: the blog index, each post's header, its BlogPosting schema
   and its "more posts" footer are all read from them, so publishing a post is
   adding one file (and one sitemap line). Required per post:
     <title>, meta description, og:title (the headline),
     article:published_time (YYYY-MM-DD), one or more article:tag,
     and the body inside <article class="post-body">…</article>.
   Optional: article:modified_time.
   ========================================================================== */

const BLOG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../blog');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const prettyDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

function readPost(slug) {
  const html = readFileSync(resolve(BLOG_DIR, `${slug}.html`), 'utf8');
  const meta = (attr, key) =>
    [...html.matchAll(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`, 'g'))].map((m) => decode(m[1]));
  const body = html.match(/<article class="post-body[^"]*"[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const post = {
    slug,
    url: `${SITE}/blog/${slug}.html`,
    path: `/blog/${slug}.html`,
    headline: meta('property', 'og:title')[0],
    description: meta('name', 'description')[0],
    published: meta('property', 'article:published_time')[0],
    modified: meta('property', 'article:modified_time')[0],
    tags: meta('property', 'article:tag'),
    minutes: Math.max(1, Math.round(words / 220)),
  };
  for (const key of ['headline', 'description', 'published']) {
    if (!post[key]) throw new Error(`[blog] ${slug}.html is missing its ${key} meta tag`);
  }
  return post;
}

/** All posts, newest first. */
function allPosts() {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => readPost(f.replace(/\.html$/, '')))
    .sort((a, b) => b.published.localeCompare(a.published));
}

const postMeta = (post) =>
  `<time datetime="${post.published}">${prettyDate(post.published)}</time> · ${post.minutes} min read`;

function postCard(post) {
  return `<article class="card card--interactive post-card" data-reveal="up" data-reveal-item>
        <p class="eyebrow eyebrow--bare">${escape(post.tags.slice(0, 2).join(' · '))}</p>
        <h2 class="title-3 post-card__title"><a class="post-card__link" href="${post.path}">${escape(post.headline)}</a></h2>
        <p class="body-muted">${escape(post.description)}</p>
        <p class="mono-meta">${postMeta(post)}</p>
      </article>`;
}

/** The blog index list. */
export function renderBlogIndex() {
  const posts = allPosts();
  return posts.length
    ? posts.map(postCard).join('\n      ')
    : '<p class="lede">The first posts are on their way.</p>';
}

/** Blog structured data, listing every post. */
export function renderBlogSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE}/blog.html#blog`,
    url: `${SITE}/blog.html`,
    name: 'Naaz AI Labs Blog',
    description:
      'Notes on AI agents, automation, websites, CRMs and search visibility from an AI and automation company in Bengaluru.',
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-IN',
    blogPost: allPosts().map((p) => ({
      '@type': 'BlogPosting',
      headline: p.headline,
      url: p.url,
      datePublished: p.published,
      author: { '@id': FOUNDER_ID },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/** A post's header: breadcrumb, tags, headline, date and reading time. */
export function renderPostHeader(slug) {
  const post = readPost(slug);
  return `<header class="page-head">
          <div class="shell">
            <nav class="crumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog.html">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${escape(post.tags[0] ?? 'Post')}</span>
            </nav>
            <div class="grid12" style="margin-block-start:1.5rem">
              <div class="col-full md:col-9">
                <p class="page-head__index">${escape(post.tags.join(' · '))}</p>
                <h1 class="page-head__title" style="margin-block-start:1.25rem">${escape(post.headline)}</h1>
                <p class="lede" style="margin-block-start:1.5rem;max-inline-size:52ch">${escape(post.description)}</p>
                <p class="mono-meta" style="margin-block-start:1.5rem">By ${escape(company.founder)}, ${escape(company.founderRole)} · ${postMeta(post)}</p>
              </div>
            </div>
          </div>
        </header>`;
}

/** BlogPosting + BreadcrumbList structured data for one post. */
export function renderPostSchema(slug) {
  const post = readPost(slug);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${post.url}#post`,
        headline: post.headline,
        description: post.description,
        url: post.url,
        mainEntityOfPage: post.url,
        datePublished: post.published,
        dateModified: post.modified ?? post.published,
        keywords: post.tags.join(', '),
        image: `${SITE}/img/og-image.jpg`,
        author: { '@id': FOUNDER_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': `${SITE}/blog.html#blog` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog.html` },
          { '@type': 'ListItem', position: 3, name: post.headline, item: post.url },
        ],
      },
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * After a post: a call to action, then up to three related posts — the ones
 * sharing the most tags with this post, newest first on a tie — so readers
 * (and crawlers) move between posts on the same topic.
 */
export function renderPostFooter(slug) {
  const posts = allPosts();
  const current = posts.find((p) => p.slug === slug);
  const shared = (p) => p.tags.filter((t) => current?.tags.includes(t)).length;
  const others = posts
    .filter((p) => p.slug !== slug)
    .map((p, i) => ({ p, score: shared(p), i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 3)
    .map(({ p }) => p);
  const more = others.length
    ? `
        <section class="section section--ruled">
          <div class="shell">
            <p class="eyebrow" data-reveal="fade">More from the blog</p>
            <div class="post-list" style="margin-block-start:2rem" data-reveal-group>
              ${others.map(postCard).join('\n              ')}
            </div>
          </div>
        </section>`
    : '';
  return `<section class="section section--ruled">
          <div class="shell grid12" style="align-items:center">
            <div class="col-full md:col-7">
              <h2 class="title-1" data-reveal="up">Want this built for your business?</h2>
              <p class="lede" style="margin-block-start:1rem" data-reveal="up">
                See the <a class="link link--accent" href="/services.html">services and pricing</a>, the
                <a class="link link--accent" href="/proof-of-work.html">live projects</a>, or tell us what isn't working.
              </p>
            </div>
            <div class="col-full md:col-4 md:start-9" data-reveal="up">
              <a class="btn btn--lg" href="/contact.html">Discuss your project <span class="btn__arrow" aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>${more}`;
}

/* ==========================================================================
   VERSION 2 — home page (mdx.so-style). Every figure and project comes from
   the same data files as version 1.
   ========================================================================== */

/** Featured projects on the v2 home, in display order. The full list lives
    on the Proof of Work page. */
const V2_FEATURED = [
  'al-safr',
  'plan-my-decor',
  'zafoor-clinic',
  'lumi-hospital',
  'sid-events',
  'lynq-platform',
  'sarakki-homes',
  'casa-paradiso',
  'somu-holidays',
  'crown-celebrity',
  'arena-financial-services',
  'trip-banao-marketing',
];

const v2Featured = () => V2_FEATURED.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
const solutionLabelV2 = Object.fromEntries(SOLUTIONS);

/** Filter pills for the featured projects: All, then each solution present. */
export function renderV2Filters() {
  const used = SOLUTIONS.filter(([tag]) => v2Featured().some((p) => solutionTags(p).includes(tag)));
  return [['all', 'All'], ...used]
    .map(
      ([value, label]) =>
        `<button class="v2-chip" type="button" data-filter-group="solution" data-filter="${value}" aria-pressed="${value === 'all'}">${escape(label)}</button>`,
    )
    .join('\n          ');
}

/** Large two-column project cards. */
export function renderV2Projects() {
  return v2Featured()
    .map((p) => {
      const tags = solutionTags(p).map((t) => solutionLabelV2[t]).join(' / ');
      const facets = projectFacets(p);
      const link = p.live && !p.linkLabel ? p.live : '/proof-of-work.html';
      const external = link.startsWith('http');
      return `<article class="v2-project" data-industry="${facets.industry}" data-solution="${facets.solution}">
            <a class="v2-project__link" href="${link}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
              <span class="v2-project__media"><img src="/img/work/${p.slug}.jpg" alt="${escape(p.title)} website" width="900" height="675" loading="lazy" decoding="async" /></span>
              <span class="v2-project__meta">${escape(tags)}</span>
              <span class="v2-project__title">${escape(p.title)} <span aria-hidden="true">↗</span></span>
            </a>
          </article>`;
    })
    .join('\n          ');
}

/** Interest pills in the v2 contact form (sent as the "tier" field). */
export function renderV2Interests() {
  const options = ['Website', 'Web app', 'Mobile app', 'CRM', 'WhatsApp automation', 'AI agents', 'SEO & Google profile', 'Ads', 'Branding', 'Something else'];
  return options
    .map(
      (label, i) => `<label class="v2-option"><input type="radio" name="tier" value="${escape(label)}"${i === 0 ? ' checked' : ''} /><span>${escape(label)}</span></label>`,
    )
    .join('\n                  ');
}

/** Lynq handoff simulator (home Plate 02 and lynq.html), chat or spoken voice call; driven by lynq-sim.js. */
export function renderLynqSimulator() {
  const scenarios = [
    ['real-estate', '01', 'Real Estate · Kannada + English'],
    ['resort', '02', 'Resort · 2 AM Room Enquiry'],
    ['healthcare', '03', 'Healthcare · Hindi + English'],
  ];
  return `<div class="sim" data-module="lynqSim">
            <div class="sim__head">
              <p class="sim__kicker"><span class="v2-dot" aria-hidden="true"></span> Zero-latency preview</p>
              <h2 class="sim__title">Simulate a live Lynq handoff</h2>
              <div class="sim__modes" role="group" aria-label="Channel">
                <button type="button" class="sim__mode" data-sim-mode="chat" aria-pressed="true">WhatsApp chat</button>
                <button type="button" class="sim__mode" data-sim-mode="voice" aria-pressed="false">Voice call <span>· with sound</span></button>
              </div>
              <div class="sim__pills" role="tablist" aria-label="Scenarios">
                ${scenarios
                  .map(
                    ([id, n, label], i) =>
                      `<button type="button" role="tab" class="sim__pill" data-scenario="${id}" aria-selected="${i === 0}"><span>${n}</span>${escape(label)}</button>`,
                  )
                  .join('\n                ')}
              </div>
            </div>
            <div class="sim__body">
              <div class="sim__phone">
                <div class="sim__bar">
                  <span class="sim__avatar" aria-hidden="true"></span>
                  <span class="sim__who"><strong data-sim-contact>Ravi · +91 98xxx xx210</strong><span data-sim-channel>WhatsApp · Lynq AI replying</span></span>
                  <span class="sim__time" data-sim-time>10:45 PM</span>
                </div>
                <ol class="sim__log" data-sim-log aria-live="polite"></ol>
                <div class="sim__call" data-sim-call data-state="ready" hidden>
                  <p class="sim__call-state" data-sim-call-state>Ready</p>
                  <div class="sim__orb" aria-hidden="true">
                    <span class="sim__wave" data-sim-wave><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
                  </div>
                  <p class="sim__call-who"><strong data-sim-call-who>Ravi · +91 98xxx xx210</strong> · <span data-sim-call-timer>00:00</span></p>
                  <ol class="sim__transcript" data-sim-transcript aria-live="polite"></ol>
                  <div class="sim__call-actions">
                    <button type="button" class="sim__call-btn" data-sim-replay hidden>↻ Replay the call</button>
                    <button type="button" class="sim__call-btn" data-sim-mute aria-pressed="false">Mute</button>
                  </div>
                </div>
              </div>
              <aside class="sim__crm" aria-label="What Lynq captured">
                <p class="sim__label">Detected language</p>
                <p class="sim__lang" data-sim-lang>Detecting…</p>
                <p class="sim__label">CRM record</p>
                <dl class="sim__fields" data-sim-fields>
                  <div><dt>Name</dt><dd data-field="Name">—</dd></div>
                  <div><dt>Budget</dt><dd data-field="Budget">—</dd></div>
                  <div><dt>Intent</dt><dd data-field="Intent">—</dd></div>
                </dl>
                <p class="sim__label">Lead score</p>
                <p class="sim__score" data-sim-score>—</p>
                <span class="sim__meter" aria-hidden="true"><span data-sim-score-bar></span></span>
                <p class="sim__label">Google Calendar</p>
                <p class="sim__slot" data-sim-slot>Waiting…</p>
              </aside>
            </div>
            <div class="sim__foot">
              <p class="sim__note">Illustrative scenarios — names and numbers are examples. Nothing is sent anywhere.</p>
              <span class="sim__actions">
                <a class="v2-ghost" href="/contact.html?product=lynq&amp;tier=waitlist" data-waitlist-open>Join the waitlist</a>
                <a class="v2-cta" href="/contact.html?product=lynq&amp;industry=real-estate" data-sim-cta data-cta>Deploy this flow <span class="v2-arrow" aria-hidden="true">→</span></a>
              </span>
            </div>
          </div>`;
}

/** The written commitments as the home page's v2 strip. */
export function renderV2Guarantees() {
  return guarantees
    .map(
      (g) => `<div class="v2-commit__item" data-v2-fade>
              <p class="v2-commit__value">${escape(g.value)}<span>${escape(g.unit)}</span></p>
              <p class="v2-commit__label">${escape(g.label)}</p>
              <p class="v2-commit__detail">${escape(g.detail)}</p>
            </div>`,
    )
    .join('\n            ');
}

/** Home: the three price bands under the guarantees; each card opens the contact page on that tier. */
export function renderV2Packages() {
  return packages
    .map(
      (p) => `<a class="v2-pack__card" href="/contact.html?tier=${p.tier}" data-v2-fade data-track="package_${p.tier}">
              <span class="v2-pack__tier">${escape(p.name)} <em>${escape(p.label)}</em></span>
              <span class="v2-pack__price"><small>from</small> ${escape(p.from)}</span>
              <span class="v2-pack__fit">${escape(p.fit)}</span>
              <span class="v2-pack__meta">${escape(p.window)} <b aria-hidden="true">Get a fixed quote →</b></span>
            </a>`,
    )
    .join('\n            ');
}

/** Home Plate 01: the eight industries as a compact routing grid. */
export function renderV2Industries() {
  return industries
    .map(
      (ind, i) => `<a class="v2-ind__card" href="/industries/${ind.id}.html">
              <img src="/img/industries/${ind.id}.jpg" alt="" width="900" height="600" loading="lazy" decoding="async" />
              <span class="v2-ind__num">${String(i + 1).padStart(2, '0')}</span>
              <span class="v2-ind__name">${escape(ind.name)}</span>
              <span class="v2-ind__blurb">${escape(ind.blurb)}</span>
              <span class="v2-ind__go" aria-hidden="true">↗</span>
            </a>`,
    )
    .join('\n            ');
}

/** Lynq waitlist dialog (home and lynq.html), opened by any [data-waitlist-open]; driven by waitlist.js. */
export function renderLynqWaitlist() {
  const uses = [['chat', 'WhatsApp chat'], ['voice', 'Voice calls'], ['both', 'Both']];
  return `<dialog class="waitlist" id="lynq-waitlist" data-module="waitlist" data-wa="${company.whatsapp.tel.replace('+', '')}" aria-labelledby="waitlist-title" data-lenis-prevent>
      <form class="waitlist__form" action="/api/contact" method="post" data-waitlist-form>
        <button type="button" class="waitlist__close" data-waitlist-close aria-label="Close">×</button>
        <p class="waitlist__kicker"><span class="v2-dot" aria-hidden="true"></span> Lynq · early access</p>
        <h2 class="waitlist__title" id="waitlist-title">Join the Lynq waitlist</h2>
        <p class="waitlist__lede">The self-serve portal is still in build. Leave your details and we'll message you as founding-cohort slots open.</p>
        <div class="field-honeypot" aria-hidden="true">
          <label for="waitlist-website">Leave this field empty</label>
          <input id="waitlist-website" name="website" type="text" tabindex="-1" autocomplete="off" />
        </div>
        <input type="hidden" name="industry" value="Lynq" />
        <input type="hidden" name="tier" value="Lynq waitlist" />
        <input type="hidden" name="message" value="Please add me to the Lynq waitlist." />
        <div class="waitlist__grid">
          <label class="waitlist__field"><span>Your name</span><input name="name" type="text" autocomplete="name" required /></label>
          <label class="waitlist__field"><span>Email</span><input name="email" type="email" autocomplete="email" required /></label>
          <label class="waitlist__field"><span>WhatsApp number <em>(optional)</em></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" /></label>
          <label class="waitlist__field"><span>Business <em>(optional)</em></span><input name="company" type="text" autocomplete="organization" /></label>
        </div>
        <fieldset class="waitlist__uses">
          <legend>Lynq should handle</legend>
          ${uses
            .map(
              ([v, l], i) =>
                `<label class="scope-pill"><input type="radio" name="lynqUse" value="${l}"${i === 2 ? ' checked' : ''} /><span>${l}</span></label>`,
            )
            .join('\n          ')}
        </fieldset>
        <button class="v2-cta waitlist__send" type="submit" data-cta>Join the waitlist <span class="v2-arrow" aria-hidden="true">→</span></button>
        <p class="waitlist__status" data-waitlist-status role="status" aria-live="polite"></p>
      </form>
    </dialog>`;
}

/* ==========================================================================
   CAREERS  (/careers.html)
   Roles live in data/careers.js. Native <details> for the full description,
   so every requirement is real HTML for crawlers and for visitors without JS.
   Applications go by email (resumes attach naturally) or WhatsApp.
   ========================================================================== */

const mailApply = (subject, intro, track) => {
  const body = `Hi Naaz AI Labs,\n\n${intro} My resume is attached.\n\nName:\nPhone:\nCollege / current company:\nLinks (GitHub, portfolio, LinkedIn):\n`;
  return `mailto:${careers.apply.email}?subject=${encodeURIComponent(subject)}&amp;body=${encodeURIComponent(body)}" data-track="${track}`;
};

const applyLinks = (title, intro, id) => `<a class="v2-cta" href="${mailApply(`Application: ${title}`, intro, `apply_${id}`)}">Apply by email <span class="v2-arrow" aria-hidden="true">→</span></a>
          <a class="careers__alt" href="https://wa.me/${careers.apply.whatsapp}?text=${encodeURIComponent(`Hi Naaz AI Labs, I would like to apply for ${title}.`)}" target="_blank" rel="noopener noreferrer" data-track="apply_wa_${id}">or on WhatsApp</a>`;

const list = (b) => {
  const tag = b.ordered ? 'ol' : 'ul';
  return `<${tag} class="careers__list">${b.items.map((t) => `<li>${escape(t)}</li>`).join('')}</${tag}>`;
};

const block = (b) => `<section class="careers__block"><h3 class="careers__h">${escape(b.h)}</h3>${list(b)}</section>`;

/** Jump links: one pill per role, plus the open-application card. */
export function renderCareersNav() {
  return [...roles.map((r) => [r.id, r.title]), ['open-application', 'Other role']]
    .map(([id, t]) => `<a class="careers__jump" href="#${id}">${escape(t)}</a>`)
    .join('\n          ');
}

export function renderCareers() {
  return roles
    .map((role, i) => {
      const [main, ...rest] = role.blocks;
      const steps = rest.find((b) => b.ordered);
      const send = rest.find((b) => b.h === 'Send us');
      const side = rest.filter((b) => b !== steps && b !== send);
      const facts = [['Team', role.team], ['Experience', role.experience], ['Location', careers.location], ...role.stats.slice(1)];
      return `<article class="careers__role" id="${role.id}" data-reveal="up" data-reveal-item>
        <header class="careers__head">
          <p class="careers__num">${String(i + 1).padStart(2, '0')}</p>
          <h2 class="careers__title">${escape(role.title)}</h2>
          <span class="careers__tag">${escape(role.type)}</span>
        </header>
        <p class="careers__summary">${escape(role.summary)}</p>
        <dl class="careers__facts">
          ${facts.map(([k, v]) => `<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}
        </dl>
        <div class="careers__apply">
          ${applyLinks(role.title, `I would like to apply for ${role.title}.`, role.id)}
        </div>
        <details class="careers__more">
          <summary class="careers__toggle">
            <span class="careers__toggle-open">View full role and requirements</span>
            <span class="careers__toggle-close">Hide details</span>
            <span class="faq__chev" aria-hidden="true">${CHEVRON}</span>
          </summary>
          <div class="careers__body">
            <div class="careers__main">${block(main)}</div>
            <div class="careers__side">${side.map(block).join('')}</div>
            <section class="careers__process">
              <h3 class="careers__h">${escape(steps.h)}</h3>
              <ol class="careers__steps">${steps.items.map((t) => `<li>${escape(t)}</li>`).join('')}</ol>
            </section>
            <section class="careers__send">
              <div><h3 class="careers__h">${escape(send.h)}</h3>${list(send)}</div>
              <div class="careers__apply">${applyLinks(role.title, `I would like to apply for ${role.title}.`, `${role.id}_full`)}</div>
            </section>
          </div>
        </details>
      </article>`;
    })
    .join('\n      ');
}

/** The "can't find your role" card: same two routes, no role attached. */
export function renderCareersOpen() {
  return applyLinks('Open application', 'I could not find a role that fits, so I am introducing myself. Here is what I do best and where I could help:', 'open');
}

export function renderCareersPerks() {
  return careers.perks
    .map(
      ([h, t], i) =>
        `<li class="careers__perk" data-reveal="up" data-reveal-item><span class="careers__perk-n">${String(i + 1).padStart(2, '0')}</span><strong>${escape(h)}</strong><span>${escape(t)}</span></li>`,
    )
    .join('\n        ');
}

/** JobPosting structured data, one per role, from the same array as the page. */
export function renderCareersSchema() {
  const graph = roles.map((role) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.fullTitle,
    description: `<p>${escape(role.summary)}</p><ul>${role.blocks[0].items.map((t) => `<li>${escape(t)}</li>`).join('')}</ul>`,
    datePosted: '2026-11-02',
    employmentType: 'FULL_TIME',
    directApply: false,
    url: `${SITE}/careers.html#${role.id}`,
    industry: 'Information Technology',
    hiringOrganization: { '@type': 'Organization', '@id': ORG_ID, name: 'Naaz AI Labs', sameAs: SITE },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
    },
  }));
  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
}
