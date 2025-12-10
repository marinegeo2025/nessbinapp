import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

function groupByMonth(dates) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

  dates.forEach((d) => {
    const [month] = d.split(" ");
    let label = month;
    // Add next-year label if we’re in December and see Jan–Mar
    if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
      label = `${month} ${currentYear + 1}`;
    }
    groups[label] = groups[label] || [];
    groups[label].push(d);
  });

  return Object.entries(groups);
}

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "black.json");

    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`<p>⚠️ ${t.noData}</p>`);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];

    // Find both Ness (north) and Galson (south)
    const nessBlock = results.find((r) => /ness/i.test(r.area));
    const galsonBlock = results.find((r) => /galson/i.test(r.area));

    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`<!DOCTYPE html>
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

    ${
      nessBlock
        ? `
        <h2>${t.blackNess}</h2>
        ${groupByMonth(nessBlock.dates)
          .map(
            ([month, monthDates]) => `
              <h3>${month}</h3>
              <ul>
                ${monthDates
                  .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
                  .join("")}
              </ul>`
          )
          .join("")}
      `
        : `<p>${t.noData}</p>`
    }

    ${
      galsonBlock
        ? `
        <h2>${t.blackSouth}</h2>
        ${groupByMonth(galsonBlock.dates)
          .map(
            ([month, monthDates]) => `
              <h3>${month}</h3>
              <ul>
                ${monthDates
                  .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
                  .join("")}
              </ul>`
          )
          .join("")}
      `
        : `<p>${t.noData}</p>`
    }

    <p><em>Last updated: ${lastUpdated}</em></p>
    <a class="back" href="/?lang=${lang}">← ${lang === "en" ? "Back" : "Air ais"}</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error("Black bin render error:", err);
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
