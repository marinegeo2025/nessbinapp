import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";

// --- failsafe check ---
function validateBinTable($, { expectedMonths = [], requiredKeyword = "Ness" }) {
  const table = $("table").first();
  if (!table.length) {
    throw new Error("No table found on CNES page");
  }

  const headers = [];
  table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

  // must include at least one expected month
  const missingMonths = expectedMonths.filter(
    (m) => !headers.some((h) => h.toLowerCase().includes(m.toLowerCase()))
  );
  if (missingMonths.length > 0) {
    throw new Error(`Table headers missing months: ${missingMonths.join(", ")}`);
  }

  // must include a row with "Ness"
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
// ----------------------

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd"; // Gaelic default
  const t = translations[lang];

  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // 🚨 run failsafe before parsing
    try {
      validateBinTable($, { expectedMonths: ["January", "February"], requiredKeyword: "Ness" });
    } catch (err) {
      return res.status(500).send(`
        <p>⚠️ The CNES website structure has changed.<br/>
        Please contact the developer at 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a> 
        so Ness Bin App can be updated.</p>
      `);
    }

    // ✅ Parsing only happens if structure check passed
    const headers = [];
    $("thead th").each((i, th) => headers.push($(th).text().trim()));

    const collectionData = {};
    $("tbody tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();
        if (area.includes("Ness")) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            if (dates && dates.toLowerCase() !== "n/a") {
              collectionData[month] = dates
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean);
            }
          }
        }
      }
    });

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.blueTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>
          ${
            Object.keys(collectionData).length
              ? Object.entries(collectionData)
                  .map(
                    ([month, dates]) => `
              <h2>${month}</h2>
              <ul>
                ${dates
                  .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
                  .join("")}
              </ul>`
                  )
                  .join("")
              : `<p>${t.noData}</p>`
          }
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
