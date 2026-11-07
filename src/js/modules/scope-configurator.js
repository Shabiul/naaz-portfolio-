/**
 * Contact — the 2-tap scope configurator with an instant WhatsApp handoff.
 *
 * The form is real HTML (radio pills, checkboxes, inputs) that posts to
 * /api/contact natively when JavaScript is off; the honeypot stays as is.
 * This module upgrades it:
 *
 *   1. reads ?industry=, ?tier=, ?product= and ?ref= and pre-selects the pills,
 *      with a banner saying what was pre-loaded
 *   2. writes the `message` the backend needs from the tapped bottleneck chips
 *      (plus any optional note), so nobody has to type an essay on a phone
 *   3. on submit: opens WhatsApp with the scope pre-written (inside the click,
 *      so it isn't popup-blocked) when "Open WhatsApp" is ticked, posts the
 *      enquiry to /api/contact for the email record, and turns the form into a
 *      preliminary scope card with the build window, the three written
 *      guarantees and the WhatsApp button
 */

// ↓ The studio's WhatsApp number, country code first, digits only (wa.me format).
const NAAZ_WHATSAPP_NUMBER = '919448434344';

const INDUSTRY = {
  'real-estate': 'Real Estate',
  resort: 'Resort',
  travel: 'Travel Agency',
  crm: 'CRM Systems',
  hospitality: 'Hospitality',
  finance: 'Finance',
  events: 'Event Management',
  education: 'Education',
  lynq: 'Lynq WhatsApp AI',
  other: 'Something else',
};
const TIER = {
  standard: 'Standard · Foundation',
  intermediate: 'Intermediate · Operations',
  premium: 'Premium · Full AI',
  'lynq-cohort': 'Lynq Monthly Cohort',
  'not-sure': 'Not sure yet',
};
const PLAN = { receptionist: 'Receptionist', 'sales-associate': 'Sales Associate', 'sales-manager': 'Sales Manager', waitlist: 'Waitlist' };
const WINDOW = {
  standard: '2–3 weeks',
  intermediate: '4–6 weeks',
  premium: '6–10 weeks',
  'lynq-cohort': '7 days',
  'not-sure': 'Advised within one business day',
};
// Industries that arrive under another name (the Lynq simulator's healthcare scenario).
const ALIAS = { healthcare: 'other', 'clinics-healthcare': 'other' };

export default function scopeConfigurator(form) {
  const params = new URLSearchParams(location.search);
  const banner = form.querySelector('[data-scope-banner]');
  const message = form.querySelector('[name="message"]');
  const submit = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-scope-status]');
  const autoWa = form.querySelector('[data-scope-autowa]');
  const pick = (name, value) => {
    const input = form.querySelector(`[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
    return Boolean(input);
  };
  const picked = (name) => form.querySelector(`[name="${name}"]:checked`)?.value ?? '';

  // The note is optional once the chips can stand in for it.
  message.required = false;

  /* --- 1. Pre-load from the URL ----------------------------------------------- */
  const product = params.get('product');
  let industry = params.get('industry') ?? '';
  industry = ALIAS[industry] ?? industry;
  let tier = params.get('tier') ?? '';
  const plan = PLAN[tier] ?? '';
  if (product === 'lynq') {
    if (!industry) industry = 'lynq';
    tier = 'lynq-cohort';
  }
  const ref = params.get('ref') ?? '';
  const gotIndustry = industry && pick('industry', industry);
  const gotTier = tier && pick('tier', tier);
  if (gotIndustry || gotTier) {
    const parts = [gotIndustry && INDUSTRY[industry], gotTier && (plan ? `Lynq ${plan}` : TIER[tier])].filter(Boolean);
    banner.innerHTML = `<strong>Scope pre-loaded: ${parts.join(' · ')}</strong>${ref ? ` <span>(like ${escapeHtml(ref.replace(/-/g, ' '))})</span>` : ''} — confirm your details below to receive your timeline and architecture.`;
    banner.hidden = false;
  }

  /* --- 2 + 3. Compose, hand off, post, show the scope ---------------------------- */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const chips = [...form.querySelectorAll('[name="bottleneck"]:checked')].map((c) => c.value);
    const ind = INDUSTRY[picked('industry')] || 'Not specified';
    const band = picked('tier');
    const bandLabel = plan && band === 'lynq-cohort' ? `Lynq ${plan}` : TIER[band] || 'Not sure yet';
    const note = data.message?.trim();

    // The backend needs a message: the chips (and the optional note) are it.
    data.message = [
      `Scope configured on naazailabs.com — ${ind} (${bandLabel}).`,
      chips.length ? `Fix first: ${chips.join('; ')}.` : '',
      ref ? `Wants something like: ${ref}.` : '',
      note ? `Note: ${note}` : '',
    ].filter(Boolean).join('\n');
    data.industry = ind;
    data.tier = bandLabel;
    delete data.bottleneck;

    const firstName = (data.name || '').trim();
    const wa = `https://wa.me/${NAAZ_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hi Naaz AI Labs! I'm ${firstName}${data.company ? ` from ${data.company}` : ''}. ` +
        `I just configured a scope on naazailabs.com for ${ind} (${bandLabel}). ` +
        `Priority bottleneck: ${chips[0] || 'to discuss'}. Let's discuss the scope and timeline.`,
    )}`;

    // Inside the click, so the browser lets the new tab open.
    if (autoWa?.checked) window.open(wa, '_blank', 'noopener');

    submit.disabled = true;
    status.textContent = 'Sending your scope…';
    let emailed = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      emailed = res.ok;
    } catch {
      emailed = false;
    }

    showScope({ name: firstName, ind, bandLabel, window: WINDOW[band] || WINDOW['not-sure'], chips, wa, emailed });
  });

  function showScope(s) {
    const card = document.createElement('div');
    card.className = 'scope-card';
    card.setAttribute('tabindex', '-1');
    card.innerHTML = `
      <p class="scope-card__kicker"><span class="v2-dot" aria-hidden="true"></span> Preliminary scope</p>
      <h2 class="scope-card__title">Thanks${s.name ? `, ${escapeHtml(s.name)}` : ''} — here's your starting point.</h2>
      <dl class="scope-card__facts">
        <div><dt>Industry</dt><dd>${escapeHtml(s.ind)}</dd></div>
        <div><dt>Scope band</dt><dd>${escapeHtml(s.bandLabel)}</dd></div>
        <div><dt>Estimated build window</dt><dd>${escapeHtml(s.window)}</dd></div>
        <div><dt>Fix first</dt><dd>${s.chips.length ? s.chips.map(escapeHtml).join('<br />') : 'We’ll find it together'}</dd></div>
      </dl>
      <ul class="scope-card__guarantees">
        <li><strong>7-Day Launch</strong> live on your own WhatsApp number</li>
        <li><strong>0 Lock-In</strong> monthly plans cancel on 15 days’ notice</li>
        <li><strong>100% Refund</strong> if the system does not go live</li>
      </ul>
      <a class="v2-cta scope-card__wa" href="${s.wa}" target="_blank" rel="noopener noreferrer" data-cta>Open scope in WhatsApp <span class="v2-arrow" aria-hidden="true">→</span></a>
      <p class="scope-card__note">${
        s.emailed
          ? 'A copy is on its way to our inbox too — the full timeline and architecture follow within one business day.'
          : 'The email copy didn’t go through, so WhatsApp is the fastest way to reach us — or write to <a href="mailto:hello@naazailabs.com">hello@naazailabs.com</a>.'
      }</p>`;
    form.replaceWith(card);
    card.focus({ preventScroll: true });
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
