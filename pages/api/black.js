import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "black.json");

    // If file missing — show graceful error
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`
        <p>⚠️ Black bin data not available yet.<br/>
        Please check back later.</p>
      `);
    }

    // Load JSON
    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];

    // Find the Ness section (can tweak keyword)
    const nessBlock = results.find((r) =>
      /ness|brue|barvas/i.test(r.area)
    );

    if (!nessBlock) {
      return res.status(500).send("<p>No data found for Ness.</p>");
    }

    // Group by month
    const grouped = {};
    nessBlock.dates.forEach((d) => {
      const [month] = d.split(" ");
      grouped[month] = grouped[month] || [];
      grouped[month].push(d);
    });

    // Get timestamp
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // Render HTML
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>BLACK Bin Collection Dates (Ness)</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="black-page">
  <div class="container">
    <h1><i class="fas fa-trash-alt"></i> BLACK Bin Collection Dates (Ness)</h1>
    ${
      Object.entries(grouped)
        .map(
          ([month, days]) => `
        <h3>${month}</h3>
        <ul>${days
          .map((d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`)
          .join("")}</ul>`
        )
        .join("")
    }
    <p><em>Last updated: ${lastUpdated}</em></p>
    <a class="back" href="/?lang=en">← Back</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error("Black bin render error:", err);
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}
