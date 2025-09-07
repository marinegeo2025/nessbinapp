import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";
import { validateBinTable } from "../../lib/failsafe";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd"; // Gaelic default
  const t = translations[lang];

  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // 🚨 run failsafe before parsing
    try {
      validateBinTable($, { expectedMonths: [], requiredKeyword: "Ness" });
    } catch (err) {
      return res.status(500).send(`
        <p>⚠️ The CNES website structure has changed.<br/>
        Please contact 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a> 
        so Ness Bin App can be updated.</p>
      `);
    }

    // Collect headers (with fallback)
    const headers = [];
    $("thead th").each((i, th) => headers.push($(th).text().trim()));
    if (headers.length === 0) {
      $("tr").first().find("th,td").each((i, cell) => headers.push($(cell).text().trim()));
    }

    const collectionData = {};
    const rows = $("tbody tr").length ? $("tbody tr") : $("tr").slice(1);

    rows.each((_, row) => {
      const cells = $(row).find("th,td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();
        if (area.toLowerCase().includes("ness")) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            if (month && dates && dates.toLowerCase() !== "n/a") {
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
        <title>${t.greenTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      </head>
      <body class="green-page">
        <div class="container">
          <h1><i class="fas fa-wine-bottle"></i> ${t.greenTitle}</h1>
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
