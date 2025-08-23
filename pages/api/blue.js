// pages/api/blue.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const url =
    "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/recycling-blue-bin/thursday-collections";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const table = $("table").first();

    if (!table.length) {
      return res.status(404).json({ error: "Bin collection info not found" });
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

    res.status(200).json({ headers, rows });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data", details: err.message });
  }
}
