// love peace and happiness
import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

// Helper for month translations
function translateMonth(month, t) {
  return t.months?.[month] || month;
}

// Helper: group date strings by month
function groupByMonth(dates) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0=Jan ... 11=Dec

  dates.forEach((d) => {
    const [month] = d.split(" ");
    let monthLabel = month;

    // ✅ Only add the year for early months (Jan–Mar) if relevant
    if (
      (currentMonth === 11 && /^(January|February|March)$/i.test(month)) ||
      /^(January|February|March)$/i.test(month)
    ) {
      const year =
        currentMonth === 11 && /^(January|February|March)$/i.test(month)
          ? currentYear + 1
          : currentYear;
      monthLabel = `${month} ${year}`;
    }

    groups[monthLabel] = groups[monthLabel] || [];
    groups[monthLabel].push(d);
  });

  return Object.entries(groups);
}

// Render helper
function renderArea(title, dates, coverage, t) {
  return `
    <h2>${title}</h2>
    <p class="coverage"><em>${coverage}</em></p>
    ${groupByMonth(dates)
      .map(([month, monthDates]) => {
        const [rawMonth, year] = month.split(" ");
        const translatedMonth = translateMonth(rawMonth, t);
        return `
          <h3>${translatedMonth}${year ? " " + year : ""}</h3>
          <ul>
            ${monthDates
              .map((d) => {
                const cleaned = d.replace(/^[A-Za-z]+\s*/, "").trim();
                return `<li><i class="fas fa-calendar-day"></i> ${cleaned}</li>`;
              })
              .join("")}
          </ul>`;
      })
      .join("")}
  `;
}

export default async function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "black.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`<p>⚠️ ${t.noData}</p>`);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    const areaCoverage = {
      "North Ness": t.blackNess,
      "South Ness": t.blackSouth,
    };

    const nessBlock = results.find((r) => /ness/i.test(r.area));
    const galsonBlock = results.find((r) => /galson/i.test(r.area));

    const northNessHTML = nessBlock
      ? renderArea(t.northNess, nessBlock.dates, areaCoverage["North Ness"], t)
      : `<p>${t.noData}</p>`;

    const southNessHTML = galsonBlock
      ? renderArea(t.southNess, galsonBlock.dates, areaCoverage["South Ness"], t)
      : `<p>${t.noData}</p>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.blackTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .coverage {
            font-style: italic;
            margin-top: -6px;
            margin-bottom: 10px;
            color: #444;
          }
        </style>
      </head>
      <body class="black-page">
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> ${t.blackTitle}</h1>
          ${northNessHTML}
          ${southNessHTML}
          <p class="last-updated"><em>${t.lastUpdated || "Last updated"}: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=${lang}">← ${lang === "gd" ? "Air ais" : "Back"}</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Black bin render error:", err);
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
