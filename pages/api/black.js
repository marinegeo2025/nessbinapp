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

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "black.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`<p>⚠️ No black bin data available yet.</p>`);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // Grab Galson + Ness specifically
    const nessBlock = results.find((r) => /ness/i.test(r.area));
    const galsonBlock = results.find((r) => /galson/i.test(r.area));

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
      </head>
      <body class="black-page">
        <div class="container">
          <h1><i class="fas fa-trash-alt"></i> BLACK Bin Collection Dates (Ness & Galson)</h1>

          ${
            nessBlock
              ? `
                <h2>${nessBlock.area}</h2>
                ${groupByMonth(nessBlock.dates)
                  .map(
                    ([month, monthDates]) => `
                      <h3>${month}</h3>
                      <ul>
                        ${monthDates
                          .map(
                            (d) =>
                              `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                          )
                          .join("")}
                      </ul>`
                  )
                  .join("")}`
              : "<p>No data found for Ness.</p>"
          }

          ${
            galsonBlock
              ? `
                <h2>${galsonBlock.area}</h2>
                ${groupByMonth(galsonBlock.dates)
                  .map(
                    ([month, monthDates]) => `
                      <h3>${month}</h3>
                      <ul>
                        ${monthDates
                          .map(
                            (d) =>
                              `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                          )
                          .join("")}
                      </ul>`
                  )
                  .join("")}`
              : "<p>No data found for Galson.</p>"
          }

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
