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
    .replace(/\s+/g, " ")
    .trim();

const hasMonthToken = (text, expectedMonths = MONTHS) => {
  const lower = text.toLowerCase();
  return expectedMonths.some((m) => lower.includes(m.toLowerCase()));
};

// Collect “header-like” texts.
// Prefer all thead>th; if missing, gather cells from the first 3 rows (covers multi-row headers).
const collectHeaderCandidates = ($table) => {
  let parts = $table.find("thead th").map((_, th) => normalize($(th).text())).get();
  if (parts.length === 0) {
    const rows = $table.find("tr").slice(0, 3); // first 3 rows as a tolerant fallback
    parts = rows.find("th,td").map((_, cell) => normalize($(cell).text())).get();
  }
  // de-dup while preserving order
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (p && !seen.has(p)) { seen.add(p); deduped.push(p); }
  }
  return deduped;
};

// Row iterator (prefers <tbody> rows; else skips the first row assuming it's header-ish)
const getDataRows = ($table) =>
  $table.find("tbody tr").length
    ? $table.find("tbody tr")
    : $table.find("tr").slice(1);

/**
 * Robust validator for CNES bin tables.
 * - Finds the first “schedule-looking” table (month-like header + row with requiredKeyword)
 * - Tolerates: no <thead>, multi-row headers, first column as <th> or <td>, NBSPs, extra tables above.
 * - API unchanged: throws on failure; returns nothing on success.
 */
export function validateBinTable($, {
  expectedMonths = MONTHS,
  requiredKeyword = "Ness",
}) {
  const tables = $("table");
  if (!tables.length) {
    throw new Error("No table found on CNES page");
  }

  const needle = String(requiredKeyword).toLowerCase();
  let picked = null;

  // Pick the first table that has any month-like header token AND a row whose first cell contains the keyword
  tables.each((_, t) => {
    if (picked) return;

    const $t = $(t);
    const headers = collectHeaderCandidates($t);

    // Require at least one month token somewhere in the header candidates
    const headerHasMonth = headers.some((h) => hasMonthToken(h, expectedMonths));
    if (!headerHasMonth) return;

    // Now ensure a keyword row exists
    const rows = getDataRows($t);
    let foundKeyword = false;
    rows.each((_, r) => {
      const area = normalize($(r).children("th,td").first().text()).toLowerCase();
      if (area.includes(needle)) { foundKeyword = true; return false; } // break
    });

    if (foundKeyword) picked = $t;
  });

  if (!picked) {
    throw new Error(`No suitable schedule table found for "${requiredKeyword}"`);
  }

  // Final explicit assertions on the chosen table (belt-and-braces)
  const pickedHeaders = collectHeaderCandidates(picked);
  const pickedHasMonth = pickedHeaders.some((h) => hasMonthToken(h, expectedMonths));
  if (!pickedHasMonth) {
    throw new Error(`No month-like header found. Saw headers: ${pickedHeaders.join(", ")}`);
  }

  let found = false;
  getDataRows(picked).each((_, row) => {
    const area = normalize($(row).children("th,td").first().text()).toLowerCase();
    if (area.includes(needle)) { found = true; return false; }
  });
  if (!found) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }
}
