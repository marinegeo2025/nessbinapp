import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";
import { validateBinTable } from "../../lib/failsafe"; // use relaxed failsafe

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

    // 🚨 run relaxed failsafe
    try {
      validateBinTable($, { requiredKeyword: "Ness" });
    } catch (err) {
      return res.status(500).send(`
        <p>⚠️ The CNES website structure has changed.<br/>
        Please contact 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a> 
        so Ness Bin App can be updated.</p>
      `);
    }

    // ✅ Parse Ness block manually
    const collectionData = {};

    // Find the "Week X - Ness" block
    $("tbody tr, div").each((i, el) => {
      const areaText = $(el).text().trim();
      if (/week\s*\d+\s*-\s*ness/i.test(areaText)) {
        // Once we find the Ness section, look ahead for month/date rows
        const parent = $(el).parent();
        parent.find("td, div").each((j, cell) => {
          const text = $(cell).text().trim();
          if (!text) return;

          // Detect month names
          const monthMatch = text.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/i);
          if (monthMatch) {
            const month = monthMatch[0];
            // Dates will be after the month name
            const dates = text.replace(month, "").trim();
            if (dates) {
              collectionData[month] = dates
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean);
            }
          }
        });
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
