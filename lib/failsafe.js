// lib/failsafe.js

// Month names are only used for a soft warning (not for failing)
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Sept","Oct","Nov","Dec"
];

// --- helpers ---
const normalize = (s) =>
  String(s || "")
    .replace(/\u00a0/g, " ")   // NBSP → space
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();

const looksLikeMonthToken = (txt) => {
  const t = txt.toLowerCase();
  return MONTHS.some(m => t.includes(m.toLowerCase()));
};

// Prefer <tbody> rows; else skip the first row as header-ish
const getDataRows = ($table) =>
  $table.find("tbody tr").length ? $table.find("tbody tr") : $table.find("tr").slice(1);

// Does a row (excluding first cell) contain any day numbers like "6", "21", "6th", "21st", "6, 20, 27"?
const rowHasAnyDayNumber = ($row) => {
  const $cells = $row.children("th,td");
  for (let i = 1; i < $cells.length; i++) {
    const txt = normalize($($cells[i]).text());
    if (/\b\d{1,2}(st|nd|rd|th)?\b/.test(txt)) return true;
  }
  return false;
};

// Soft header check for logging only (never throws)
const softHeaderCheck = ($table) => {
  const theadTexts = $table.find("thead th").map((_, th) => normalize($(th).text())).get();
  const fallbackHead = !$table.find("thead th").length
    ? $table.find("tr").slice(0, 2).find("th,td").map((_, c) => normalize($(c).text())).get()
    : [];
  const headers = theadTexts.length ? theadTexts : fallbackHead;
  const hasMonthToken = headers.some(looksLikeMonthToken);
  if (!hasMonthToken && headers.length) {
    // Don’t fail; just leave a breadcrumb in logs if you have server logs
    // console.warn("NessBinApp: no obvious month-like tokens in headers:", headers);
  }
};

// Core “does this table look parseable for <keyword>?”
const tableHasKeywordWithDates = ($table, keywordLower) => {
  softHeaderCheck($table); // never throws
  const rows = getDataRows($table);
  let ok = false;
  rows.each((_, r) => {
    const $r = $(r);
    const area = normalize($r.children("th,td").first().text()).toLowerCase();
    if (area.includes(keywordLower) && rowHasAnyDayNumber($r)) {
      ok = true; return false; // break
    }
  });
  return ok;
};

/**
 * Calm, low-noise validator:
 * - Only throws when there's no table at all, or we cannot find a row for `requiredKeyword`
 *   that contains any date-like numbers to parse.
 * - Normal CNES updates (month names changing/headers moving/extra tables) won't trigger.
 * - API unchanged; callers don’t need to change anything.
 */
export function validateBinTable($, {
  expectedMonths = MONTHS,     // kept for compatibility; not used to fail
  requiredKeyword = "Ness",
}) {
  const tables = $("table");
  if (!tables.length) {
    throw new Error("No table found on CNES page");
  }

  const needle = String(requiredKeyword).toLowerCase();

  // 1) Try the first table (maintains your original behaviour when pages are stable)
  const first = tables.first();
  if (tableHasKeywordWithDates(first, needle)) return;

  // 2) Fall back: scan remaining tables (handles when a small notice table appears above)
  let found = false;
  tables.slice(1).each((_, t) => {
    if (found) return;
    if (tableHasKeywordWithDates($(t), needle)) { found = true; }
  });

  if (!found) {
    throw new Error(`No parseable "${requiredKeyword}" row with dates found on this page.`);
  }
}
