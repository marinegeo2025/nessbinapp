import fs from "fs";
import path from "path";

// Helper: group date strings by month label
function groupByMonth(dates) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  dates.forEach((d) => {
    const [month] = d.split(" ");
    let monthLabel = month;
    if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
      monthLabel = `${month} ${currentYear + 1}`;
    }
    groups[monthLabel] = groups[monthLabel] || [];
    groups[monthLabel].push(d);
  });

  return Object.entries(groups);
}

// Helper: render one area's HTML
function renderArea(area, dates, coverage) {
  const coverageHTML = coverage
    ? `<p class="coverage"><strong>Coverage:</strong> ${coverage}</p>`
    : "";

  const grouped = groupByMonth(dates)
    .map(([month, monthDates]) => {
      const cleaned = monthDates
        .map((d) => {
          const stripped = d.replace(new RegExp("^" + month + "\\s*", "i"), "").trim();
          return `<li><i class="fas fa-calendar-day"></i> ${stripped}</li>`;
        })
        .join("");
      return `<h3>${month}</h3><ul>${cleaned}</ul>`;
    })
    .join("");

  return `
    <h2>${area}</h2>
    ${coverageHTML}
    ${grouped}
  `;
}

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "black.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send("<p>⚠️ No black bin data available yet.</p>");
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // Predefine coverage text for Ness and Galson
    const areaCoverage = {
      Ness:
        "Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Cross, Skigersta",
      Galson:
        "Habost, Swainbost, Cross, North & South Dell, North & South Galson, Melbost Borve, High Borve, Borve",
    };

    const nessBlock = results.find((r) => /ness/i.test(r.area));
    const galsonBlock = results.find((r) => /galson/i.test(r.area));

    const nessHTML = nessBlock
      ? renderArea(nessBlock.area, nessBlock.dates, areaCoverage.Ness)
      : "<p>No data found for Ness.</p>";

    const galsonHTML = galsonBlock
      ? renderArea(galsonBlock.area, galsonBlock.dates, areaCoverage.Galson)
      : "<p>No data found for Galson.</p>";

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>BLACK Bin Collection Dates (Ness & Galson)</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .coverage { font-style: italic; margin-top: -8px; margin-bottom: 12px; color: #333; }
          .coverage strong { font-weight: 600; color: #000; }
        </style>
      </head>
      <body class="black-page">
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> BLACK Bin Collection Dates (Ness & Galson)</h1>
          ${nessHTML}
          ${galsonHTML}
          <p class="last-updated"><em>LAST UPDATED: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=en">← Back</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Black bin render error:", err);
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}
