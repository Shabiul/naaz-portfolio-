/**
 * Google Apps Script: writes each website enquiry as a row in this Sheet.
 *
 * Setup (once, about 3 minutes):
 *  1. Create a Google Sheet (e.g. "Naaz AI Labs enquiries").
 *  2. Extensions → Apps Script. Replace the contents with this file.
 *  3. Set SECRET below to a long random string.
 *  4. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.
 *     Authorise when asked, then copy the Web app URL (ends in /exec).
 *  5. In Vercel (project → Settings → Environment Variables) add:
 *       SHEETS_WEBHOOK_URL = that /exec URL
 *       SHEETS_SECRET      = the same SECRET
 *     Then redeploy. The header row is created on the first enquiry.
 *
 * After editing this script later, use Deploy → Manage deployments → Edit →
 * New version, otherwise the live URL keeps running the old code.
 */
const SECRET = 'change-me-to-a-long-random-string';
const HEADERS = ['Received (IST)', 'Name', 'Phone', 'Email', 'Company', 'Industry', 'Tier', 'Message', 'Page'];

// A leading = + - @ would make Sheets treat the cell as a formula.
const safe = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v);

function doPost(e) {
  const out = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return out({ ok: false, error: 'forbidden' });

    lock.waitLock(10000);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    const when = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([
      when,
      safe(d.name || ''),
      safe(d.phone || ''),
      safe(d.email || ''),
      safe(d.company || ''),
      safe(d.industry || ''),
      safe(d.tier || ''),
      safe(d.message || ''),
      safe(d.page || ''),
    ]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
