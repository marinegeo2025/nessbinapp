// pages/api/blue.js
import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations.js";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  const CNES_URL =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/thursday-collections";

  try {
    // --- Use ScrapingBee to render JS and return full HTML
    const { data } = await axios.get("https://app.scrapingbee.com/api/v1/", {
      params: {
        api_key: process.env.SCRAPINGBEE_KEY,
        url: CNES_URL,
        render_js: true,
        wait: 3000, // wait 3s for accordions to load
      },
      headers: { "User-Agent": "NessBinApp/1.0" },
      timeout: 20000,
    });

    const $ = cheerio.load(data);
    const results = [];

    // Now that JS is rendered, accordions exist
    $(".accordion__pane").each((_, el) => {
      const area = $(el).find(".accordion__pane_heading").text().trim();
      const lines = $(el)
        .find(".accordion__pane_content .field__item")
        .map((_, el2) => $(el2).text().trim())
        .get();

      if (area && lines.length) {
        const dates = lines.filter(
          (line) => !line.toLowerCase().startsWith("bins are collected")
        );
        results.push({ area, dates });
      }
    });

    if (results.length === 0) {
      console.log("⚠️ No results found in rendered HTML — CNES may have changed layout");
      return res.status(500).send(`
        <p>⚠️ CNES website structure may have changed.<br/>
        Please contact 
        <a href="mailto:al@daisyscoldwatersurfteam.com">al@daisyscoldwatersurfteam.com</a>.
        </p>
      `);
    }

    // Filter for Brue / Barvas section
    const nessBlock = results.find((r) =>
      r.area.toLowerCase().includes("brue")
    );

    if (!nessBlock) {
      return res.status(500).send(`<p>${t.noData}</p>`);
    }

    // --- Render HTML page
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8" />
        <title>${t.blueTitle}</title>
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>
          <h2>${nessBlock.area}</h2>
          ${
            nessBlock.dates.length
              ? `<ul>${nessBlock.dates
                  .map(
                    (d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                  )
                  .join("")}</ul>`
              : `<p>${t.noData}</p>`
          }
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Blue Bin scrape error:", err.message);
    res
      .status(500)
      .send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
