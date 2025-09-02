import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";
import { validateBinTable } from "../../lib/failsafe";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // 🚨 failsafe
    validateBinTable($, { requiredKeyword: "Ness" });

    const headers = [];
    $("table thead th").each((i, th) => headers.push($(th).text().trim()));

    const collectionData = {};

    $("table tbody tr").each((i, row) => {
      const cells = $(row).find("td").map((j, td) => $(td).text().trim()).get();
      if (cells.length === 0) return;

      const area = cells[0];
      if (/ness/i.test(area)) {
        // This row is Ness – map months to dates
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];       // August, September, October
          const dates = cells[i];
          if (month && dates && dates.toLowerCase() !== "n/a") {
            collectionData[month] = dates
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean);
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
                ${dates.map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`).join("")}
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
