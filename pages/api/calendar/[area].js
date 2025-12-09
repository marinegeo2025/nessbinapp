// pages/api/calendar/[area].js

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations";
import { validateBinTable } from "../../../lib/failsafe";

// CNES URLs
const BLACK_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";
const GREEN_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

// --- Utility: clean “21st” → 21
function cleanDate(d) {
  if (!d) return null;
  const match = d.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// --- Parse tabular CNES bin data into { month: [dates...] }
function parseBinTable($, keyword) {
  const headers = [];
  $("thead th").each((i, th) => headers.push($(th).text().trim()));
  if (headers.length === 0) {
    $("tr").first().find("th,td").each((i, cell) => headers.push($(cell).text().trim()));
  }

  const data = {};
  const rows = $("tbody tr").length ? $("tbody tr") : $("tr").slice(1);

  rows.each((_, row) => {
    const cells = $(row).find("th,td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      if (area.toLowerCase().includes(keyword.toLowerCase())) {
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];
          const dates = $(cells[i]).text().trim();
          if (month && dates && dates.toLowerCase() !== "n/a") {
            const parts = dates
              .split(",")
              .map((x) => cleanDate(x))
              .filter(Boolean);
            if (parts.length) {
              data[month] = (data[month] || []).concat(parts);
            }
          }
        }
      }
    }
  });
  return data;
}

// --- Build ICS events
function buildEvents(binType, t, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];
  for (const [month, days] of Object.entries(data)) {
    for (const day of days) {
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (!isNaN(monthIndex)) {
        events.push({
          title: `${t[`${binType}Button`]} (${areaName})`,
          start: [year, monthIndex + 1, day],
        });
      }
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area } = req.query;
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    // --- BLACK BIN (live CNES)
    const blackResp = await axios.get(BLACK_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $black = cheerio.load(blackResp.data);
    validateBinTable($black, { expectedMonths: [], requiredKeyword: "Ness" });
    const blackData = parseBinTable($black, "Ness");

    // --- GREEN BIN (live CNES)
    const greenResp = await axios.get(GREEN_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $green = cheerio.load(greenResp.data);
    validateBinTable($green, { expectedMonths: [], requiredKeyword: "Ness" });
    const greenData = parseBinTable($green, "Ness");

    // --- BLUE BIN (from pre-scraped JSON)
    let blueData = {};
    try {
      const filePath = path.join(process.cwd(), "wednesday.json");
      if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const nessBlock = json.results.find((r) =>
          r.area.toLowerCase().includes("ness")
        );
        if (nessBlock) {
          nessBlock.dates.forEach((d) => {
            const [month, dayRaw] = d.split(" ");
            const day = cleanDate(dayRaw);
            if (!isNaN(day)) {
              blueData[month] = blueData[month] || [];
              blueData[month].push(day);
            }
          });
        }
      }
    } catch (err) {
      console.warn("⚠️ Could not load wednesday.json for blue bins:", err.message);
    }

    // --- Combine all bins
    let events = [];
    if (area === "north" || area === "south") {
      events = [
        ...buildEvents("black", t, "Ness", blackData),
        ...buildEvents("blue", t, "Ness", blueData),
        ...buildEvents("green", t, "Ness", greenData),
      ];
    } else {
      return res.status(404).send(lang === "en" ? "Area not found" : "Cha deach sgìre a lorg");
    }

    if (events.length === 0) {
      return res.status(500).send(t.noData);
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS generation error:", error);
      return res.status(500).send(t.errorFetching);
    }

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-ness-bin-schedule-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar build error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
