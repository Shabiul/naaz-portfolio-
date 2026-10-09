/**
 * Contact form submission.
 *
 * The form's own action/method already point at /api/contact, so a visitor
 * without JavaScript still gets a working native POST and a server-side
 * redirect back to a status message (see api/contact.js and page-bits.js).
 * This module only intercepts that submission to upgrade it: no full page
 * reload, inline success/error copy, and a disabled button while it's in
 * flight.
 */

export default function contactForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');

  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    status.textContent = '';
    status.classList.remove('is-error', 'is-success');
    submitBtn?.setAttribute('disabled', '');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');

      form.reset();
      form.hidden = true;
      status.textContent = "Thanks — we'll reply within one business day.";
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.message || 'Could not send your message. Please email us directly at hello@naazailabs.com.';
      status.classList.add('is-error');
      submitBtn?.removeAttribute('disabled');
    }
  });
}
