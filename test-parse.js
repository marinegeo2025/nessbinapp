import fs from "fs";
import * as cheerio from "cheerio";

const html = fs.readFileSync("./thursday.html", "utf8");
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

console.log(JSON.stringify(results, null, 2));
