const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/**
 * Minimal, robust validator for CNES bin tables.
 * - Ensures a table exists
 * - Ensures at least one month-like header exists (rolling months OK)
 * - Ensures at least one row's first cell contains the required keyword (e.g., "Ness")
 * Handles minor markup variation (no <thead>, first column <th> vs <td>).
 */
export function validateBinTable($, {
  expectedMonths = MONTHS,
  requiredKeyword = "Ness",
}) {
  const table = $("table").first();
  if (!table.length) {
    throw new Error("No table found on CNES page");
  }

  // Collect headers: prefer thead>th, else fall back to first row (th/td)
  let headers = table.find("thead th").map((_, th) => $(th).text().trim()).get();
  if (headers.length === 0) {
    headers = table.find("tr").first().find("th,td").map((_, cell) => $(cell).text().trim()).get();
  }

  // Require at least one recognizable month among headers (supports rolling month windows)
  const hasAnyMonth = headers.some(h =>
    expectedMonths.some(m => h.toLowerCase().includes(m.toLowerCase()))
  );
  if (!hasAnyMonth) {
    throw new Error(`No month-like header found. Saw headers: ${headers.join(", ")}`);
  }

  // Must include a row with the keyword (first cell may be th or td)
  const needle = String(requiredKeyword).toLowerCase();
  let foundKeyword = false;

  // Prefer tbody rows; fall back to all rows if no tbody
  const rows = table.find("tbody tr").length ? table.find("tbody tr") : table.find("tr").slice(1);
  rows.each((_, row) => {
    const firstCell = $(row).children("th,td").first();
    const area = firstCell.text().trim().toLowerCase();
    if (area.includes(needle)) {
      foundKeyword = true;
      return false; // break
    }
  });

  if (!foundKeyword) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }
}
