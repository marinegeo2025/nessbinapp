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

// Fetch CNES table
async function fetchTable(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  return $("table").first();
}

// Clean "21st" -> 21
function cleanDate(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Split and clean multiple dates in one cell
function parseDates(cellText) {
  if (!cellText || cellText.toLowerCase() === "n/a") return [];
  return cellText
    .split(",")
    .map((d) => cleanDate(d))
    .filter((n) => n !== null && n >= 1 && n <= 31);
}

// Build events (title + start only)
function buildEvents(binColor, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(data)) {
    for (const day of days) {
      try {
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        if (isNaN(monthIndex)) continue;

        const dt = new Date(year, monthIndex, day);
        if (isNaN(dt.getTime())) continue;

        events.push({
          title: `${binColor} Bin Collection (${areaName})`,
          start: [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()],
        });
      } catch {
        continue;
      }
    }
  }
  return events;
}

// Parse black bins (Ness vs Galson)
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

// Generic parser (Blue/Green)
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

export default async function handler(req, res) {
  const { area, debug } = req.query;

  try {
    // Scrape CNES
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

    // DEBUG MODE — short-circuit before ICS
    if (debug === "1") {
      console.log("DEBUG EVENTS:", events);
      return res.status(200).json(events);
    }

    if (events.length === 0) {
      return res.status(500).send("No events found");
    }

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
