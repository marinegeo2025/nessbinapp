import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "thursday.html");
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);

    const results = [];

    $(".accordion-pane").each((i, el) => {
      const area = $(el).find("h3 button").text().trim();
      const dates = [];
      $(el)
        .find("ol li")
        .each((_, li) => dates.push($(li).text().trim()));
      if (area && dates.length > 0) results.push({ area, dates });
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
