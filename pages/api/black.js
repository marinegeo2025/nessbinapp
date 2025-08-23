// pages/api/black.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const table = $("table").first();

    if (!table.length) {
      return res.status(404).send("<p>No bin collection data found.</p>");
    }

    const headers = [];
    table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

    const nessData = {};
    const galsonData = {};

    table.find("tbody tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();

        if (area.includes("Ness")) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            nessData[month] = dates.split(", ").filter(Boolean);
          }
        } else if (area.includes("Galson")) {
          for (let i = 1; i < cells.length; i++) {
            const month = headers[i];
            const dates = $(cells[i]).text().trim();
            galsonData[month] = dates.split(", ").filter(Boolean);
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
        <title>BLACK Bin Collection Dates – Ness & Galson Area</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background: #f7f9fc;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
            margin: 0;
          }
          .container {
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 600px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: clamp(1.8rem, 5vw, 2.4rem);
            color: #000;
            text-align: center;
          }
          h2 {
            font-size: clamp(1.4rem, 4vw, 1.8rem);
            color: #444;
            font-weight: 600;
            text-align: center;
          }
          h3 {
            margin-top: 15px;
            font-size: 1.2rem;
            color: #333;
          }
          ul { list-style: none; padding: 0; }
          li {
            background: #eef3f7;
            margin: 6px 0;
            padding: 8px;
            border-radius: 6px;
            font-size: 1rem;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> BLACK Bin Collection Dates</h1>

          <h2>Ness – Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Cross Skigersta</h2>
          ${Object.keys(nessData).length
            ? Object.entries(nessData).map(([month, dates]) => `
              <h3>${month}</h3>
              <ul>
                ${dates.map(d => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`).join("")}
              </ul>
            `).join("")
            : "<p>No collection dates available for Ness.</p>"}
        </div>

        <div class="container">
          <h2>Habost, Swainbost, Cross, North & South Dell</h2>
          ${Object.keys(galsonData).length
            ? Object.entries(galsonData).map(([month, dates]) => `
              <h3>${month}</h3>
              <ul>
                ${dates.map(d => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`).join("")}
              </ul>
            `).join("")
            : "<p>No collection dates available for Galson.</p>"}
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>Error fetching data: ${err.message}</p>`);
  }
}
