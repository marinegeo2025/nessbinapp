// pages/api/blue.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const lang = req.query.lang || "gd"; // "gd" by default
  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const table = $("table").first();

    if (!table.length) {
      return res
        .status(404)
        .send(
          lang === "en"
            ? "<p>No blue bin collection data found.</p>"
            : "<p>Cha deach dàta cruinneachaidh biona gorm a lorg.</p>"
        );
    }

    const headers = [];
    table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

    const collectionData = {};

    table.find("tbody tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();
        if (area.includes("Ness")) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            if (dates && dates.toLowerCase() !== "n/a") {
              collectionData[month] = dates.split(", ").filter(Boolean);
            }
          }
        }
      }
    });

    // Switch UI text based on language
    const pageTitle =
      lang === "en"
        ? "BLUE Bin Collection Dates for Ness"
        : "Cinn-latha Cruinneachaidh Biona Gorm airson Nis";
    const noDataMsg =
      lang === "en"
        ? "No bin collection dates found. Try refreshing later."
        : "Chan eil cinn-latha cruinneachaidh rim faighinn. Feuch ri ùrachadh nas fhaide air adhart.";

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${pageTitle}</h1>
          ${
            Object.keys(collectionData).length
              ? Object.entries(collectionData)
                  .map(
                    ([month, dates]) => `
              <h2>${month}</h2>
              <ul>
                ${dates
                  .map(
                    (d) =>
                      `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                  )
                  .join("")}
              </ul>`
                  )
                  .join("")
              : `<p>${noDataMsg}</p>`
          }
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res
      .status(500)
      .send(
        lang === "en"
          ? `<p>Error fetching data: ${err.message}</p>`
          : `<p>Mearachd a’ faighinn dàta: ${err.message}</p>`
      );
  }
}
