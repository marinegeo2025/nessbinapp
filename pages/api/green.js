// pages/api/green.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const table = $("table").first();

    if (!table.length) {
      return res.status(404).send("<p>No green bin collection data found.</p>");
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

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>GREEN Bin Collection Dates for Ness</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      </head>
      <body>
        <div class="container">
          <h1><i class="fas fa-trash"></i> GREEN Bin Collection Dates for Ness</h1>
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
              : "<p>No bin collection dates found. Try refreshing later.</p>"
          }
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>Error fetching data: ${err.message}</p>`);
  }
}
