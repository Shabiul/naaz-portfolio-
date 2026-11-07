/**
 * Conversion tracking: one place that names the moments that matter.
 *
 * Every tap on WhatsApp, a call link, an email link, a price card or anything
 * marked data-track, and every enquiry or waitlist submission, is pushed to
 * window.dataLayer (and to gtag when it is loaded). Nothing is sent anywhere
 * until an analytics ID is set at build time:
 *
 *   VITE_GA_ID=G-XXXXXXXXXX       Google Analytics 4
 *   VITE_CLARITY_ID=xxxxxxxxxx    Microsoft Clarity (free heatmaps, recordings)
 *
 * With neither set this only fills the dataLayer, which is harmless.
 */

const GA = import.meta.env.VITE_GA_ID;
const CLARITY = import.meta.env.VITE_CLARITY_ID;

function send(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

function load(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.append(s);
}

export function initTracking() {
  if (GA) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA);
    load(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA)}`);
  }
  if (CLARITY) {
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
    load(`https://www.clarity.ms/tag/${encodeURIComponent(CLARITY)}`);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a, button');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const tag = a.dataset.track;
    if (href.startsWith('https://wa.me')) send('whatsapp_click', { where: tag || location.pathname });
    else if (href.startsWith('tel:')) send('call_click', { where: tag || location.pathname });
    else if (href.startsWith('mailto:')) send('email_click', { where: tag || location.pathname });
    else if (a.hasAttribute('data-waitlist-open')) send('waitlist_open', { where: location.pathname });
    else if (tag) send('cta_click', { where: tag });
  }, true);

  // Enquiries: sent when the form is submitted, whichever form it is.
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.matches?.('[data-contact-form], [data-waitlist-form]')) {
      send(f.matches('[data-waitlist-form]') ? 'waitlist_submit' : 'enquiry_submit', { where: location.pathname });
    }
  }, true);
}
