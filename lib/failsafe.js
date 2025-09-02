// lib/failsafe.js
export function validateBinTable($, { requiredKeyword = "Ness" }) {
  const table = $("table").first();
  if (!table.length) {
    throw new Error("No table found on CNES page");
  }

  // Collect headers (lowercased for easier matching)
  const headers = [];
  table.find("thead th").each((i, th) => headers.push($(th).text().trim().toLowerCase()));

  // ✅ Check at least one month is present (Jan–Dec)
  const months = ["jan", "feb", "mar", "apr", "may", "jun", 
                  "jul", "aug", "sep", "oct", "nov", "dec"];
  if (!months.some((m) => headers.some((h) => h.includes(m)))) {
    throw new Error("No month names found in table headers");
  }

  // ✅ Check for Ness (case-insensitive, allows variations like 'North Ness')
  let foundKeyword = false;
  table.find("tbody tr").each((i, row) => {
    const area = $(row).find("td").first().text().trim().toLowerCase();
    if (area.includes(requiredKeyword.toLowerCase())) {
      foundKeyword = true;
    }
  });
  if (!foundKeyword) {
    throw new Error(`No row containing "${requiredKeyword}" found`);
  }
}
