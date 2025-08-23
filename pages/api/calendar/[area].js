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

// Fetch & parse a CNES table
async function fetchTable(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000,
  });
  const $ = cheerio.load(response.data);
  return $("table").first();
}

// Clean "21st" → 21, ignore "n/a"
function cleanDate(dateStr) {
  if (!dateStr) return null;
  const trimmed = dateStr.trim().toLowerCase();
  if (trimmed === "n/a" || trimmed === "na") return null;

  const match = trimmed.match(/^(\d+)/);
  if (!match) return null;

  const dayNum = parseInt(match[1], 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return null;

  return dayNum;
}

// Parse Black bins → Ness vs Galson
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
        const dates = $(cells[i]).text().trim();
        if (!dates || dates.toLowerCase() === "n/a") continue;
        const parts = dates.split(",").map((d) => d.trim());
        if (area.includes("Ness")) {
          ness[month] = (ness[month] || []).concat(parts);
        } else if (area.includes("Galson")) {
          galson[month] = (galson[month] || []).concat(parts);
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
          const dates = $(cells[i]).text().trim();
          if (!dates || dates.toLowerCase() === "n/a") continue;
          const parts = dates.split(",").map((d) => d.trim());
          data[month] = (data[month] || []).concat(parts);
        }
      }
    }
  });
  return data;
}

// Build events safely
function buildEvents(binColor, areaName, binData) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, dates] of Object.entries(binData)) {
    for (const raw of dates) {
      const day = cleanDate(raw);
      if (!day) continue;

      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (isNaN(monthIndex)) continue;

      events.push({
        title: `${binColor} Bin Collection (${areaName})`,
        start: [year, monthIndex + 1, day],
        end: [year, monthIndex + 1, day],
      });
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area, debug } = req.query;

  try {
    // Scrape all three bin tables
    const blackTable = await fetchTable(BLACK_URL);
    const { ness, galson } = parseBlackBins(blackTable);

    const blueTable = await fetchTable(BLUE_URL);
    const blueData = parseBinData(blueTable, "Ness");

    const greenTable = await fetchTable(GREEN_URL);
    const greenData = parseBinData(greenTable, "Ness");

    // Select which area’s black bins
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

    if (debug === "1") {
      // Debug mode → see parsed events
      return res.status(200).json(events);
    }

    if (events.length === 0) {
      return res.status(500).send("No events found");
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS Error:", error);
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
