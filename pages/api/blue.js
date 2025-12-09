import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import translations from "../../lib/translations.js";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "thursday.html");

    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`
        <p>⚠️ ${t.errorFetching || "Bin data not available yet."}<br/>
        Please check back later.</p>
      `);
    }

    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);
    const results = [];

    $(".accordion-pane").each((_, el) => {
      const area = $(el).find("h3 button").text().trim();
      const dates = [];

      $(el)
        .find("ol li")
        .each((_, li) => dates.push($(li).text().trim()));

      if (area && dates.length > 0) {
        results.push({ area, dates });
      }
    });

    // 🟦 Focus on Ness (Barvas / Brue)
    const nessBlock = results.find((r) =>
      r.area.toLowerCase().includes("brue")
    );

    if (!nessBlock) {
      return res.status(500).send(`<p>${t.noData}</p>`);
    }

    // 🗓️ Group dates by month, and clean them up
    const monthGroups = {};
    nessBlock.dates.forEach((fullDate) => {
      const match = fullDate.match(/^([A-Za-z]+)\s+(\d+\w*)(.*)$/);
      if (match) {
        const [, month, day, note] = match;
        const cleanDate = `${day}${note ? " " + note.trim() : ""}`;
        if (!monthGroups[month]) monthGroups[month] = [];
        monthGroups[month].push(cleanDate);
      } else {
        // fallback for weird strings
        if (!monthGroups["Other"]) monthGroups["Other"] = [];
        monthGroups["Other"].push(fullDate);
      }
    });

   // 🕓 Load actual scrape time from .lastupdated (written by GitHub Action)
let lastUpdated;
try {
  const updatedPath = path.join(process.cwd(), ".lastupdated");
  if (fs.existsSync(updatedPath)) {
    const iso = fs.readFileSync(updatedPath, "utf8").trim();
    const parsed = new Date(iso);
    if (!isNaN(parsed)) {
      lastUpdated = parsed.toLocaleString("en-GB", {
        timeZone: "Europe/London",
      });
    }
  }
} catch (e) {
  console.error("Couldn't read .lastupdated:", e);
}

// fallback to current time if missing or invalid
if (!lastUpdated) {
  lastUpdated = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });
}

    // 🎨 Styled output
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
    console.error("Blue Bin local parse error:", err);
    res
      .status(500)
      .send(`<p>${t.errorFetching || "Error:"} ${err.message}</p>`);
  }
}
