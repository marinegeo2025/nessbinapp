import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    // --- Path to your saved HTML file
    const filePath = path.join(process.cwd(), "thursday.html");

    // --- Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "thursday.html not found. It may not have been scraped yet.",
      });
    }

    // --- Read and parse HTML
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);
    const results = [];

    // --- Extract accordion data
    $(".accordion-pane").each((i, el) => {
      const area = $(el).find("h3 button").text().trim();
      const dates = [];

      $(el)
        .find("ol li")
        .each((_, li) => dates.push($(li).text().trim()));

      if (area && dates.length > 0) {
        results.push({ area, dates });
      }
    });

    // --- Get last modified date
    const stats = fs.statSync(filePath);
    const lastUpdated = stats.mtime.toISOString();

    // --- Return response
    res.status(200).json({
      lastUpdated,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("Error parsing Thursday HTML:", err);
    res.status(500).json({ error: err.message });
  }
}
