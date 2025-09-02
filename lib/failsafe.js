// lib/failsafe.js
export function validateBinTable($, options = {}) {
  const { expectedMonths = [], requiredKeyword = "Ness" } = options;

  // Check that a table exists
  const table = $("table").first();
  if (!table.length) {
    throw new Error("No table found on CNES page");
  }

  // Check headers include expected months
  const headers = [];
  table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

  const missingMonths = expectedMonths.filter(
    (m) => !headers.some((h) => h.toLowerCase().includes(m.toLowerCase()))
  );
  if (missingMonths.length > 0) {
    throw new Error(
      `Table headers missing expected months: ${missingMonths.join(", ")}`
    );
  }

  // Check at least one row has the required keyword (like "Ness")
  let foundKeyword = false;
  table.find("tbody tr").each((i, row) => {
    const area = $(row).find("td").first().text().trim();
    if (area.includes(requiredKeyword)) {
      foundKeyword = true;
    }
  });

  if (!foundKeyword) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }
}
