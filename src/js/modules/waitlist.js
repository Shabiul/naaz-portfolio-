import { stopScroll, startScroll } from '../core/scroll.js';

/**
 * Lynq waitlist — the dialog rendered by render.js (renderLynqWaitlist).
 *
 * Any [data-waitlist-open] opens it (those are real links to the contact page,
 * so without JavaScript they still work). The form posts to /api/contact like
 * every other enquiry, honeypot included; the message names the list and
 * what the visitor wants Lynq to handle. Afterwards the dialog thanks them
 * and offers a WhatsApp hello. If the mail server can't take it, it says so
 * and points to WhatsApp instead.
 */
export default function waitlist(dialog) {
  const form = dialog.querySelector('[data-waitlist-form]');
  const status = dialog.querySelector('[data-waitlist-status]');
  const send = form.querySelector('[type="submit"]');
  const wa = dialog.dataset.wa;

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    stopScroll();
    form.querySelector('input[name="name"]')?.focus();
  };
  dialog.addEventListener('close', startScroll);

  // Capture phase: runs before the page-transition handler (loader.js), which
  // leaves alone any click already handled — otherwise it would navigate away.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-waitlist-open]');
    if (!trigger) return;
    e.preventDefault();
    open();
  }, true);
  dialog.addEventListener('click', (e) => {
    // The close button, or a click on the backdrop around the card.
    if (e.target === dialog || e.target.closest('[data-waitlist-close]')) dialog.close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data.message = `Please add me to the Lynq waitlist. Lynq should handle: ${data.lynqUse || 'not sure yet'}.`;
    delete data.lynqUse;
    send.disabled = true;
    status.textContent = 'Adding you…';
    let ok = false;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    const hello = `https://wa.me/${wa}?text=${encodeURIComponent(`Hi Naaz AI Labs! I'm ${data.name}${data.company ? ` from ${data.company}` : ''} — I just joined the Lynq waitlist.`)}`;
    const done = document.createElement('div');
    done.className = 'waitlist__done';
    done.innerHTML = ok
      ? `<p class="waitlist__kicker"><span class="v2-dot" aria-hidden="true"></span> You're on the list</p>
         <h2 class="waitlist__title">Thanks, ${escapeHtml(data.name)}.</h2>
         <p class="waitlist__lede">We'll message you as founding-cohort slots open. Want to talk sooner?</p>`
      : `<p class="waitlist__kicker"><span class="v2-dot" aria-hidden="true"></span> Almost there</p>
         <h2 class="waitlist__title">We couldn't save that just now.</h2>
         <p class="waitlist__lede">Send us a hello on WhatsApp and we'll add you by hand — or write to <a href="mailto:hello@naazailabs.com">hello@naazailabs.com</a>.</p>`;
    done.insertAdjacentHTML(
      'beforeend',
      `<a class="v2-cta" href="${hello}" target="_blank" rel="noopener noreferrer" data-cta>Say hi on WhatsApp <span class="v2-arrow" aria-hidden="true">→</span></a>
       <button type="button" class="waitlist__close" data-waitlist-close aria-label="Close">×</button>`,
    );
    form.replaceWith(done);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
