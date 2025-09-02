// lib/failsafe.js
export function validateBinTable($, { requiredKeyword = "Ness" }) {
  const pageText = $("body").text().toLowerCase();

  // ✅ Must contain the keyword (e.g. Ness)
  if (!pageText.includes(requiredKeyword.toLowerCase())) {
    throw new Error(`No "${requiredKeyword}" found in page content`);
  }

  // ✅ Must contain at least one month name (short or long)
  const months = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  if (!months.some((m) => pageText.includes(m))) {
    throw new Error("No month names found in page content");
  }

  // ✅ Also sanity check for digits (dates like 6th, 13th, etc.)
  if (!/\d{1,2}/.test(pageText)) {
    throw new Error("No numeric dates found in page content");
  }
}
