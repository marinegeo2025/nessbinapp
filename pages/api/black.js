import fs from "fs";
import path from "path";

// ✅ Helper: group date strings by month and roll over for next year if needed
function groupByMonth(dates) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

  dates.forEach((d) => {
    const [month] = d.split(" ");
    let monthLabel = month;

    if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
      monthLabel = `${month} ${currentYear + 1}`;
    } else {
      monthLabel = `${month} ${currentYear}`;
    }

    groups[monthLabel] = groups[monthLabel] || [];
    groups[monthLabel].push(d);
  });

  return Object.entries(groups);
}

// ✅ Helper: render one section (area + villages + date list)
function renderArea(title, dates, coverage) {
  return `
    <h2>${title}</h2>
    <p class="coverage"><em>${coverage}</em></p>
    ${groupByMonth(dates)
      .map(
        ([month, monthDates]) => `
          <h3>${month}</h3>
          <ul>
            ${monthDates
              .map((d) => {
                // 🧹 Remove the month name from inside each date
                const cleaned = d
                  .replace(/^[A-Za-z]+\s*/, "")
                  .trim();
                return `<li><i class="fas fa-calendar-day"></i> ${cleaned}</li>`;
              })
              .join("")}
          </ul>`
      )
      .join("")}
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

    // ✅ Location lists
    const areaCoverage = {
      "North Ness": "Knockaird, Fivepenny, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Skigersta, Cross Skigersta",
      "South Ness": "Habost, Swainbost, Cross, North & South Dell",
    };

    const nessBlock = results.find((r) => /ness/i.test(r.area));
    const galsonBlock = results.find((r) => /galson/i.test(r.area));

    const northNessHTML = nessBlock
      ? renderArea("North Ness", nessBlock.dates, areaCoverage["North Ness"])
      : "<p>No data found for North Ness.</p>";

    const southNessHTML = galsonBlock
      ? renderArea("South Ness", galsonBlock.dates, areaCoverage["South Ness"])
      : "<p>No data found for South Ness.</p>";

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>BLACK Bin Collection Dates (North Ness & South Ness)</title>
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
          <h1><i class="fas fa-trash-alt"></i> BLACK Bin Collection Dates (North Ness & South Ness)</h1>
          ${northNessHTML}
          ${southNessHTML}
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
