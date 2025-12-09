import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "wednesday.json");

    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`
        <p>⚠️ ${t.errorFetching || "Bin data not available yet."}<br/>
        Please check back later.</p>
      `);
    }

    // 📦 Load the JSON file
    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // 🟦 Find the Ness area
    const nessBlock = json.results.find((r) =>
      r.area.toLowerCase().includes("ness")
    );

    if (!nessBlock) {
      return res.status(500).send(`<p>${t.noData || "No data for Ness."}</p>`);
    }

    // 🗓️ Group dates by month
    const monthGroups = {};
    nessBlock.dates.forEach((fullDate) => {
      const match = fullDate.match(/^([A-Za-z]+)\s+(\d+\w*)(.*)$/);
      if (match) {
        const [, month, day, note] = match;
        const cleanDate = `${day}${note ? " " + note.trim() : ""}`;
        if (!monthGroups[month]) monthGroups[month] = [];
        monthGroups[month].push(cleanDate);
      } else {
        if (!monthGroups["Other"]) monthGroups["Other"] = [];
        monthGroups["Other"].push(fullDate);
      }
    });

    // 🕓 Use lastUpdated from JSON
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // 🎨 Render HTML
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.blueTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>
          <h2>${nessBlock.area}</h2>
          ${Object.entries(monthGroups)
            .map(
              ([month, days]) => `
              <h3>${month}</h3>
              <ul>
                ${days
                  .map(
                    (d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                  )
                  .join("")}
              </ul>`
            )
            .join("")}
          <p class="last-updated"><i>Last updated: ${lastUpdated}</i></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Blue Bin JSON parse error:", err);
    res
      .status(500)
      .send(`<p>${t.errorFetching || "Error:"} ${err.message}</p>`);
  }
}
