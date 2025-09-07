// lib/failsafe.js

// Full names + common abbreviations (incl. "Sept")
const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const MONTHS_ABBR = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Sept","Oct","Nov","Dec"
];
const MONTHS = MONTHS_FULL.concat(MONTHS_ABBR);

// Helpers
const normalize = (s) =>
  String(s || "")
    .replace(/\u00a0/g, " ")   // NBSP → space
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();

const hasMonthToken = (text) => {
  const lower = text.toLowerCase();
  return MONTHS.some((m) => lower.includes(m.toLowerCase()));
};

// Gather header-like texts: prefer thead>th; otherwise first 3 rows th/td (covers 2-row headers)
const collectHeaderCandidates = ($table) => {
  let parts = $table.find("thead th").map((_, th) => normalize($(th).text())).get();
  if (parts.length === 0) {
    const rows = $table.find("tr").slice(0, 3);
    parts = rows.find("th,td").map((_, cell) => normalize($(cell).text())).get();
  }
  // de-dup
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (p && !seen.has(p)) { seen.add(p); deduped.push(p); }
  }
  return deduped;
};

// Prefer <tbody> rows; otherwise skip first row (header-ish)
const getDataRows = ($table) =>
  $table.find("tbody tr").length
    ? $table.find("tbody tr")
    : $table.find("tr").slice(1);

// Does the Ness row have at least one numeric day like "6" or "21st"?
const nessRowHasDayNumbers = ($table, needleLower) => {
  let ok = false;
  getDataRows($table).each((_, r) => {
    const $cells = $(r).children("th,td");
    const area = normalize($cells.first().text()).toLowerCase();
    if (!area.includes(needleLower)) return;
    // Check any subsequent cell for one or more integers
    for (let i = 1; i < $cells.length; i++) {
      const txt = normalize($($cells[i]).text());
      // Matches "6", "21", "6, 20, 27", "6th", "21st" etc.
      if (/\b\d{1,2}(st|nd|rd|th)?\b/.test(txt)) {
        ok = true;
        return false; // break cells loop
      }
    }
    if (ok) return false; // break rows loop
  });
  return ok;
};

/**
 * Robust, minimal validator for CNES bin tables.
 * Rules:
 *  - A suitable table must exist:
 *      (header includes a month token) OR (Ness row contains day numbers)
 *  - And at least one row whose first cell includes the required keyword (e.g., "Ness")
 * Tolerates: no <thead>, multi-row headers, first column as <th> or <td>, NBSPs, extra tables.
 *
 * NOTE: Signature unchanged. Callers don't need to pass expectedMonths anymore.
 */
export function validateBinTable($, {
  expectedMonths = MONTHS,     // kept for backward compat; not required by callers
  requiredKeyword = "Ness",
}) {
  const tables = $("table");
  if (!tables.length) {
    throw new Error("No table found on CNES page");
  }

  const needle = String(requiredKeyword).toLowerCase();
  let picked = null;

  // Pick the first table that looks like the schedule
  tables.each((_, t) => {
    if (picked) return;

    const $t = $(t);
    const headers = collectHeaderCandidates($t);
    const headerHasMonth = headers.some(hasMonthToken);

    // Must have a Ness row at all
    let foundNessRow = false;
    getDataRows($t).each((_, r) => {
      const area = normalize($(r).children("th,td").first().text()).toLowerCase();
      if (area.includes(needle)) { foundNessRow = true; return false; }
    });
    if (!foundNessRow) return;

    // Accept the table if either the headers look like months OR the Ness row clearly has day numbers
    if (headerHasMonth || nessRowHasDayNumbers($t, needle)) {
      picked = $t;
    }
  });

  if (!picked) {
    throw new Error(`No suitable schedule table found for "${requiredKeyword}"`);
  }

  // Final belt-and-braces: ensure a Ness row truly exists on picked table
  let found = false;
  getDataRows(picked).each((_, row) => {
    const area = normalize($(row).children("th,td").first().text()).toLowerCase();
    if (area.includes(needle)) { found = true; return false; }
  });
  if (!found) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }
}
