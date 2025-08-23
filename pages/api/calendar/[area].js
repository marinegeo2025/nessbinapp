// pages/api/calendar/[area].js
import axios from "axios";
import * as cheerio from "cheerio";
import { createEvents } from "ics";

const BLACK_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";
const BLUE_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";
const GREEN_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

// Helper: clean "21st" → 21
function cleanDate(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
function parseDates(cellText) {
  if (!cellText || cellText.toLowerCase() === "n/a") return [];
  return cellText
    .split(",")
    .map((d) => cleanDate(d))
    .filter((n) => n !== null && n >= 1 && n <= 31);
}

// Scrape table
async function fetchTable(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(response.data);
  return $("table").first();
}

// Parse Black → Ness vs Galson
function parseBlackBins($table) {
  const headers = [];
  $table.find("thead th").each((i, th) => headers.push($(th).text().trim()));
  const ness = {};
  const galson = {};
  $table.find("tbody tr").each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      for (let i = 1; i < cells.length; i++) {
        const month = headers[i];
        const dates = parseDates($(cells[i]).text().trim());
        if (area.includes("Ness")) {
          ness[month] = (ness[month] || []).concat(dates);
        } else if (area.includes("Galson")) {
          galson[month] = (galson[month] || []).concat(dates);
        }
      }
    }
  });
  return { ness, galson };
}

// Generic parser (Blue / Green)
function parseBinData($table, keyword) {
  const headers = [];
  $table.find("thead th").each((i, th) => headers.push($(th).text().trim()));
  const data = {};
  $table.find("tbody tr").each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      if (area.includes(keyword)) {
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];
          const dates = parseDates($(cells[i]).text().trim());
          data[month] = (data[month] || []).concat(dates);
        }
      }
    }
  });
  return data;
}

// Build events
function buildEvents(binColor, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];
  for (const [month, days] of Object.entries(data)) {
    for (const day of days) {
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (isNaN(monthIndex)) continue;
      events.push({
        title: `${binColor} Bin Collection (${areaName})`,
        start: [year, monthIndex + 1, day],
      });
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area, debug } = req.query;

  try {
    // Scrape tables
    const blackTable = await fetchTable(BLACK_URL);
    const { ness, galson } = parseBlackBins(blackTable);
    const blueTable = await fetchTable(BLUE_URL);
    const blueData = parseBinData(blueTable, "Ness");
    const greenTable = await fetchTable(GREEN_URL);
    const greenData = parseBinData(greenTable, "Ness");

    // Build events
    let events = [];
    if (area === "north") {
      events = [
        ...buildEvents("Black", "North Ness", ness),
        ...buildEvents("Blue", "Ness", blueData),
        ...buildEvents("Green", "Ness", greenData),
      ];
    } else if (area === "south") {
      events = [
        ...buildEvents("Black", "South Ness", galson),
        ...buildEvents("Blue", "Ness", blueData),
        ...buildEvents("Green", "Ness", greenData),
      ];
    } else {
      return res.status(404).send("Area not found");
    }

    // FORCE DEBUG MODE
    if (debug === "1") {
      return res.status(200).json(events);
    }

    if (events.length === 0) {
      return res.status(500).send("No events found");
    }

    // ICS generation
    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS Error:", error, events);
      return res.status(500).send("Failed to build calendar");
    }

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-ness-bin-schedule.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar build error:", err);
    res.status(500).send("Failed to build calendar");
  }
}
