import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";
import { validateBinTable } from "../../lib/failsafe";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd"; // default Gaelic
  const t = translations[lang];

  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // 🚨 run failsafe before parsing (no brittle month list)
    try {
      validateBinTable($, { expectedMonths: [], requiredKeyword: "Ness" });
      validateBinTable($, { expectedMonths: [], requiredKeyword: "Galson" });
    } catch (err) {
      return res.status(500).send(`
        <p>⚠️ The CNES website structure has changed.<br/>
        Please contact 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a> 
        so Ness Bin App can be updated.</p>
      `);
    }

    // Collect headers (with fallback if needed)
    const headers = [];
    $("thead th").each((i, th) => headers.push($(th).text().trim()));
    if (headers.length === 0) {
      $("tr").first().find("th,td").each((i, cell) => headers.push($(cell).text().trim()));
    }

    const nessData = {};
    const galsonData = {};

    const rows = $("tbody tr").length ? $("tbody tr") : $("tr").slice(1);
    rows.each((_, row) => {
      const cells = $(row).find("th,td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();
        const target =
          area.includes("Ness") ? nessData :
          area.includes("Galson") ? galsonData : null;

        if (target) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            if (month && dates) {
              target[month] = dates
                .split(",")
                .map(d => d.trim())
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
        <title>${t.blackTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      </head>
      <body class="black-page">
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> ${t.blackTitle}</h1>
          <h2>${t.blackNess}</h2>
          ${
            Object.keys(nessData).length
              ? Object.entries(nessData)
                  .map(
                    ([month, dates]) => `
                <h3>${month}</h3>
                <ul>
                  ${dates
                    .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
                    .join("")}
                </ul>
              `
                  )
                  .join("")
              : `<p>${t.noData}</p>`
          }
        </div>

        <div class="container">
          <h2>${t.blackSouth}</h2>
          ${
            Object.keys(galsonData).length
              ? Object.entries(galsonData)
                  .map(
                    ([month, dates]) => `
    <h3>${month}</h3>
    <ul>
      ${dates
        .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
        .join("")}
    </ul>
  `
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
