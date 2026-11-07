import nodemailer from 'nodemailer';

/**
 * Contact form submission handler.
 *
 * Vercel parses the request body automatically based on Content-Type, so this
 * accepts both the JS-enhanced fetch (JSON) and a plain native form POST
 * (application/x-www-form-urlencoded) from a browser with JavaScript off —
 * the site must not become a dead end just because a script failed to load.
 *
 * Which shape the caller gets back is decided by the same signal: the JS
 * module sends `Accept: application/json` and reads a JSON body; a native
 * submission has no such header and gets a redirect back to the page instead,
 * since a plain browser is about to navigate whether we like it or not.
 */

const FIELDS = ['name', 'company', 'email', 'phone', 'industry', 'tier', 'message'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

function wantsJson(req) {
  return (req.headers.accept || '').includes('application/json');
}

function redirect(res, path) {
  res.writeHead(303, { Location: path });
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body ?? {};
  const json = wantsJson(req);

  // Honeypot: a field real visitors never see or fill in. A bot filling every
  // input on the page trips it; a human never does.
  if (body.website) {
    return json ? res.status(200).json({ ok: true }) : redirect(res, '/contact.html?sent=1');
  }

  const data = Object.fromEntries(
    FIELDS.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : '']),
  );

  // A way to reach them is what matters: a valid email or a phone number. The
  // long form still sends both; the short home form sends a phone and a name.
  const phoneDigits = data.phone.replace(/\D/g, '');
  const hasEmail = EMAIL_RE.test(data.email);
  if (!data.name || (!hasEmail && phoneDigits.length < 7) || (data.email && !hasEmail)) {
    const message = 'Please fill in your name and a phone number or a valid email.';
    return json
      ? res.status(400).json({ error: message })
      : redirect(res, '/contact.html?error=1');
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, SHEETS_WEBHOOK_URL, SHEETS_SECRET } = process.env;
  const mailOn = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
  const sheetOn = Boolean(SHEETS_WEBHOOK_URL);
  if (!mailOn && !sheetOn) {
    console.error('[contact] no delivery configured: set SMTP_* and/or SHEETS_WEBHOOK_URL');
    const message = 'The enquiry form is not configured yet. Please email us directly at hello@naazailabs.com.';
    return json
      ? res.status(500).json({ error: message })
      : redirect(res, '/contact.html?error=1');
  }

  const summaryRows = [
    ['Name', data.name],
    ['Company', data.company],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Industry', data.industry],
    ['Tier of interest', data.tier],
  ].filter(([, value]) => value);

  const text = [
    ...summaryRows.map(([label, value]) => `${label}: ${value}`),
    '',
    "What isn't working right now:",
    data.message || '(No message — please call or WhatsApp them back.)',
  ].join('\n');

  const html = `
    <table cellpadding="0" cellspacing="0" style="font:14px/1.5 sans-serif;color:#0b1f4d">
      ${summaryRows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#5e79a8">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="margin-top:16px"><strong>What isn't working right now:</strong></p>
    <p>${escapeHtml(data.message || '(No message — please call or WhatsApp them back.)').replace(/\n/g, '<br>')}</p>
  `;

  const recipientEmail = CONTACT_TO_EMAIL || 'hello@naazailabs.com';

  const sendEmail = () => {
    const port = Number(SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter.sendMail({
      from: `"Naaz AI Labs website" <${SMTP_USER}>`,
      to: recipientEmail,
      ...(hasEmail ? { replyTo: `${data.name} <${data.email}>` } : {}),
      subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
      text,
      html,
    });
  };

  // One row per enquiry in a Google Sheet, through an Apps Script web app
  // (docs/contact-sheet.gs). Needs no Google credentials here, only its URL.
  const logToSheet = async () => {
    const response = await fetch(SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SHEETS_SECRET || '', ...data, page: req.headers.referer || '' }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) throw new Error(`sheet responded ${response.status} ${result.error || ''}`);
  };

  // Either route is enough to count as received; a failure in one is logged,
  // not shown to the visitor, unless both fail.
  const jobs = [];
  if (mailOn) jobs.push(['email', sendEmail()]);
  if (sheetOn) jobs.push(['sheet', logToSheet()]);
  const results = await Promise.allSettled(jobs.map(([, job]) => job));
  results.forEach((r, i) => r.status === 'rejected' && console.error(`[contact] ${jobs[i][0]} failed`, r.reason));
  if (results.every((r) => r.status === 'rejected')) {
    const message = 'Could not send your message. Please email us directly at hello@naazailabs.com.';
    return json
      ? res.status(502).json({ error: message })
      : redirect(res, '/contact.html?error=1');
  }

  return json ? res.status(200).json({ ok: true }) : redirect(res, '/contact.html?sent=1');
}
