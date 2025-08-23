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
      return res.status(404).send("<p>Could not find bin collection info.</p>");
    }

    const headers = [];
    table.find("thead th").each((i, el) => headers.push($(el).text().trim()));

    const rows = [];
    table.find("tbody tr").each((i, row) => {
      const rowData = [];
      $(row)
        .find("td")
        .each((j, cell) => rowData.push($(cell).text().trim()));
      if (rowData.length > 0) rows.push(rowData);
    });

    // Render HTML directly
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Black Bin Schedule</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif;
            padding: 20px;
            background: #f7f7f7;
            text-align: center;
          }
          table {
            border-collapse: collapse;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
          }
          th {
            background: #333;
            color: white;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <h1>🗑 Black Bin Collection Schedule</h1>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>Error fetching data: ${err.message}</p>`);
  }
}
