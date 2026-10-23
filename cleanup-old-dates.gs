/**
 * Movie Night Planner: deletes past dates from the free-dates tab every night, so the sheet never fills up.
 * Paste this into the Google Sheet: Extensions -> Apps Script, then run installDailyCleanup once (see SETUP-GOOGLE.md).
 *
 * It only touches rows whose date column is a real date before today. Anything it can't read (weekday rows like
 * "Friday", empty cells, notes) is kept, and so is the header row. The movies tab is never touched.
 * Rows with something in a "Locked" column are kept too: they are your past movie nights, and the site uses the
 * latest one for "N days since your last movie night".
 */
const DATES_TAB_GID = 1440545244; // the number after gid= in the free-dates tab's address
const DATE_COLUMN = 2;            // column B ("When are you free?"); the form's timestamp is column A
const DATE_ORDER = 'dmy';         // for slash dates like 3/4/2026: 'dmy' = day first, 'mdy' = month first (same as config.js)

function cleanOldDates() {
  const sheet = SpreadsheetApp.getActive().getSheets().find((s) => s.getSheetId() === DATES_TAB_GID);
  if (!sheet) throw new Error('No tab with gid ' + DATES_TAB_GID + ': check DATES_TAB_GID.');
  const last = sheet.getLastRow();
  if (last < 2) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const width = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, width).getValues()[0];
  const lockCol = header.findIndex((h) => /lock|zamk|booked|potvrz/i.test(String(h))); // -1 = no Locked column
  const values = sheet.getRange(2, 1, last - 1, width).getValues();
  let deleted = 0;
  for (let i = values.length - 1; i >= 0; i--) { // bottom to top, so row numbers stay valid while deleting
    const d = toDate(values[i][DATE_COLUMN - 1]);
    const lock = lockCol >= 0 ? String(values[i][lockCol]).trim() : '';
    const locked = lock !== '' && !/^(false|no|n|0|-)$/i.test(lock);
    if (d && d < today && !locked) { sheet.deleteRow(i + 2); deleted++; }
  }
  console.log('Deleted ' + deleted + ' past date row(s).');
}

// A date cell (Date object) or text like "2026-10-18", "18.10.2026", "18. 10. 26", "18/10/2026"; anything else -> null
function toDate(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') return isNaN(v) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
  const s = String(v || '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return make(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})\s*([./])\s*(\d{1,2})\s*\2\s*(\d{2}|\d{4})\s*$/.exec(s);
  if (!m) return null;
  let a = +m[1], b = +m[3], y = +m[4];
  if (y < 100) y += 2000;
  const mdy = m[2] === '/' && (DATE_ORDER === 'mdy' ? b <= 31 && a <= 12 : a <= 12 && b > 12);
  return mdy ? make(y, a, b) : make(y, b, a);
}

function make(y, m, d) {
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null; // rejects 31.2. etc.
}

// Run this once: it sets up the nightly run (around 3 am) and cleans right away
function installDailyCleanup() {
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === 'cleanOldDates').forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('cleanOldDates').timeBased().everyDays(1).atHour(3).create();
  cleanOldDates();
}
