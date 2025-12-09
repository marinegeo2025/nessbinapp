import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    // ✅ Load the lightweight JSON file
    const filePath = path.join(process.cwd(), "wednesday.json");
    const json = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(json);

    // ✅ Send JSON response (for debugging or integration)
    if (req.query.format === "json") {
      return res.status(200).json(data);
    }

    // ✅ Otherwise render as styled HTML (same visual as before)
    const results = data.results || [];
    const lastUpdated = new Date(data.lastupdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>BLUE Bin Collection Dates for Ness</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> BLUE Bin Collection Dates for Ness</h1>
          ${
            results.length
              ? results
                  .map(
                    ({ area, dates }) => `
                    <h2>${area}</h2>
                    ${groupByMonth(dates)
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
                  )
                  .join("")
              : "<p>No data available.</p>"
          }
          <p><em>LAST UPDATED: ${lastUpdated}</em></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}

// Helper function to group date strings by month name
function groupByMonth(dates) {
  const groups = {};
  dates.forEach((d) => {
    const [month] = d.split(" ");
    groups[month] = groups[month] || [];
    groups[month].push(d);
  });
  return Object.entries(groups);
}
