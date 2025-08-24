// pages/api/black.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const lang = req.query.lang || "gd"; // check query
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

    // Switch headings based on language
    const title =
      lang === "en"
        ? "BLACK Bin Collection Dates"
        : "Cinn-latha Cruinneachadh Biona Dubh";
    const nessHeading =
      lang === "en"
        ? "Ness – Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Cross Skigersta"
        : "Nis – Cnoc Àrd, Còig Peighinnean, Rubha, Eòropaidh, Port Nis, Lìonal, Eòradal, Adabroc, Cros Sgiogarstaidh";
    const galsonHeading =
      lang === "en"
        ? "Habost, Swainbost, Cross, North & South Dell"
        : "Tobson, Suaineabost, Cros, Dail bho Thuath is Deas";

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      </head>
      <body class="black-page">
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> ${title}</h1>
          <h2>${nessHeading}</h2>
          ${
            Object.keys(nessData).length
              ? Object.entries(nessData)
                  .map(
                    ([month, dates]) => `
                <h3>${month}</h3>
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
              : lang === "en"
              ? "<p>No collection dates available for Ness.</p>"
              : "<p>Chan eil cinn-latha cruinneachaidh ri fhaighinn airson Nis.</p>"
          }
        </div>

        <div class="container">
          <h2>${galsonHeading}</h2>
          ${
            Object.keys(galsonData).length
              ? Object.entries(galsonData)
                  .map(
                    ([month, dates]) => `
                <h3>${month}</h3>
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
              : lang === "en"
              ? "<p>No collection dates available for Galson.</p>"
              : "<p>Chan eil cinn-latha cruinneachaidh ri fhaighinn airson Ghabhsann.</p>"
          }
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>Error fetching data: ${err.message}</p>`);
  }
}
