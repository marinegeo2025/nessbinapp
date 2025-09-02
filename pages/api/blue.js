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

    // 🚨 relaxed failsafe
    try {
      validateBinTable($, { requiredKeyword: "Ness" });
    } catch (err) {
      return res.status(500).send(`
        <p>⚠️ The CNES website structure has changed.<br/>
        Please contact 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a>.
      </p>
      `);
    }

    const collectionData = {};
    let insideNess = false;

    $("table tr").each((i, row) => {
      const cells = $(row).find("td").map((j, td) => $(td).text().trim()).get();

      if (cells.length === 0) return;

      // Detect Ness row
      if (/ness/i.test(cells[0]) || /ness/i.test(cells.join(" "))) {
        insideNess = true;
        return; // skip this row, just marker
      }

      // If we're in Ness section, look for Month -> Dates rows
      if (insideNess && cells.length >= 2) {
        const month = cells[0];
        const dates = cells[1];
        if (/^(January|February|March|April|May|June|July|August|September|October|November|December)$/i.test(month)) {
          collectionData[month] = dates
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
        }
      }

      // If we hit another Week block, stop Ness parsing
      if (insideNess && /week/i.test(cells[0]) && !/ness/i.test(cells[0])) {
        insideNess = false;
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
