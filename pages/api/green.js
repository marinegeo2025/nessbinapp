import fs from "fs";
import path from "path";

// Helper: group dates by month
function groupByMonth(dates) {
  const groups = {};
  dates.forEach((d) => {
    const [month] = d.split(" ");
    groups[month] = groups[month] || [];
    groups[month].push(d);
  });
  return Object.entries(groups);
}

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "green.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send("<p>⚠️ No green bin data available yet.</p>");
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", { timeZone: "Europe/London" });

    // find Ness
    const ness = results.find((r) => /ness/i.test(r.area));

    const nessHTML = ness
      ? `
        <h2>${ness.area}</h2>
        <p>${ness.coverage || ""}</p>
        ${groupByMonth(ness.dates)
          .map(
            ([month, monthDates]) => `
              <h3>${month}</h3>
              <ul>
                ${monthDates
                  .map(
                    (d) =>
                      `<li><i class="fas fa-calendar-day"></i> ${d
                        .replace(new RegExp("^" + month + "\\s*", "i"), "")
                        .trim()}</li>`
                  )
                  .join("")}
              </ul>`
          )
          .join("")}
      `
      : "<p>No data found for Ness.</p>";

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>GREEN Bin Collection Dates (Ness)</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body class="green-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> GREEN Bin Collection Dates (Ness)</h1>
          ${nessHTML}
          <p class="last-updated"><em>LAST UPDATED: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=en">← Back</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Green bin render error:", err);
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}
