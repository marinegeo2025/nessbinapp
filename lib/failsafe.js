// lib/failsafe.js
export function validateBinTable($, { requiredKeyword = "Ness" }) {
  // ✅ Ensure there is at least some tabular/structured data
  if ($("table").length === 0 && $("body").text().indexOf("Ness") === -1) {
    throw new Error("No recognizable table or Ness data found on CNES page");
  }

  // ✅ Check for month names anywhere in the document (not just <thead>)
  const text = $("body").text().toLowerCase();
  const months = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  if (!months.some((m) => text.includes(m))) {
    throw new Error("No month names found in page content");
  }

  // ✅ Check for Ness (case-insensitive, anywhere in page text)
  if (!text.includes(requiredKeyword.toLowerCase())) {
    throw new Error(`No "${requiredKeyword}" found in page content`);
  }
}
