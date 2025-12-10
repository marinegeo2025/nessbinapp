import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

// Helper for month translations
function translateMonth(month, t) {
  return t.months?.[month] || month;
}

export default async function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "green.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`<p>⚠️ ${t.noData}</p>`);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    const nessBlock = results.find((r) => /ness/i.test(r.area));

    const nessHTML = nessBlock
      ? `
          ${Object.entries(
            nessBlock.dates.reduce((acc, date) => {
              const [month] = date.split(" ");
              acc[month] = acc[month] || [];
              acc[month].push(date.replace(/^[A-Za-z]+\s*/, "").trim());
              return acc;
            }, {})
          )
            .map(([month, days]) => {
              // Determine year rollover for December scraping
              const currentYear = new Date(json.lastUpdated).getFullYear();
              const currentMonth = new Date(json.lastUpdated).getMonth();
              let year = currentYear;
              if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
                year = currentYear + 1;
              }

              const translatedMonth = translateMonth(month, t);

              return `
                <h3>${translatedMonth} ${year}</h3>
                <ul>
                  ${days
                    .map(
                      (d) =>
                        `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                    )
                    .join("")}
                </ul>`;
            })
            .join("")}
        `
      : `<p>${t.noData}</p>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.greenTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body class="green-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${t.greenTitle}</h1>
          ${nessHTML}
          <p class="last-updated"><em>${t.lastUpdated || "Last updated"}: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=${lang}">← ${lang === "gd" ? "Air ais" : "Back"}</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Green bin render error:", err);
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
