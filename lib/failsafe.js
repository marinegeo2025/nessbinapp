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

// Small helpers
const normalize = (s) =>
  String(s || "")
    .replace(/\u00a0/g, " ")   // NBSP → space
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();

const hasMonthHeader = (headers, expectedMonths = MONTHS) =>
  headers.some((h) =>
    expectedMonths.some((m) =>
      h.toLowerCase().includes(m.toLowerCase())
    )
  );

const collectHeaders = ($table) => {
  let headers = $table.find("thead th").map((_, th) => normalize($(th).text())).get();
  if (headers.length === 0) {
    headers = $table.find("tr").first().find("th,td").map((_, cell) => normalize($(cell).text())).get();
  }
  return headers;
};

/**
 * Minimal, robust validator for CNES bin tables.
 * - Ensures a schedule-looking table exists (has month-like header & a row for requiredKeyword)
 * - Handles markup variation (no <thead>, first column <th> vs <td>, NBSPs)
 * - Keeps original API — callers do not need to change.
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

  // Pick the first table that (a) has a month-like header and (b) has a row whose first cell includes requiredKeyword
  tables.each((_, t) => {
    if (picked) return;

    const $t = $(t);
    const headers = collectHeaders($t);
    if (!hasMonthHeader(headers, expectedMonths)) return; // not a schedule table

    // Prefer <tbody> rows; otherwise skip the header row
    const $rows = $t.find("tbody tr").length ? $t.find("tbody tr") : $t.find("tr").slice(1);

    let foundKeyword = false;
    $rows.each((_, r) => {
      const firstCell = $(r).children("th,td").first();
      const area = normalize(firstCell.text()).toLowerCase();
      if (area.includes(needle)) {
        foundKeyword = true;
        return false; // break
      }
    });

    if (foundKeyword) {
      picked = $t;
    }
  });

  if (!picked) {
    throw new Error(`No suitable schedule table found for "${requiredKeyword}"`);
  }

  // Final assertions on the picked table (keeps behaviour explicit & future-proof)
  const headers = collectHeaders(picked);
  if (!hasMonthHeader(headers, expectedMonths)) {
    throw new Error(`No month-like header found. Saw headers: ${headers.join(", ")}`);
  }

  let foundKeyword = false;
  const rows = picked.find("tbody tr").length ? picked.find("tbody tr") : picked.find("tr").slice(1);
  rows.each((_, row) => {
    const area = normalize($(row).children("th,td").first().text()).toLowerCase();
    if (area.includes(needle)) {
      foundKeyword = true;
      return false;
    }
  });

  if (!foundKeyword) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }

  // NOTE: We intentionally do not return the picked table to keep the API identical.
}
