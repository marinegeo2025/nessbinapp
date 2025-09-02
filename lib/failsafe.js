// lib/failsafe.js
export function validateBinTable($, { expectedMonths = [], requiredKeyword = "Ness" }) {
  const table = $("table").first();
  if (!table.length) {
    throw new Error("No table found on CNES page");
  }

  // Collect headers
  const headers = [];
  table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

  // Must include at least one expected month
  const missingMonths = expectedMonths.filter(
    (m) => !headers.some((h) => h.toLowerCase().includes(m.toLowerCase()))
  );
  if (missingMonths.length > 0) {
    throw new Error(`Table headers missing months: ${missingMonths.join(", ")}`);
  }

  // Must include a row with the keyword (like "Ness" or "Galson")
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
