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

// Fetch + parse table
async function fetchTable(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(response.data);
  return $("table").first();
}

// Clean date strings ("21st" → "21")
function cleanDate(dateStr) {
  if (!dateStr) return null;
  const trimmed = dateStr.trim().toLowerCase();
  if (trimmed === "n/a" || trimmed === "na") return null;
  return dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
}

// Build events
function buildEvents(binColor, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, dates] of Object.entries(data)) {
    for (const raw of dates) {
      const day = cleanDate(raw);
      if (!day) continue;

      const dateString = `${day} ${month} ${year}`;
      const dt = new Date(dateString);
      if (isNaN(dt)) continue;

      events.push({
        title: `${binColor} Bin Collection (${areaName})`,
        start: [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()],
        end: [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()],
      });
    }
  }
  return events;
}

// Parse Black bins (split Ness vs Galson)
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

// Generic parser for Blue/Green
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

export default async function handler(req, res) {
  const { area } = req.query;

  try {
    // Scrape all three tables
    const blackTable = await fetchTable(BLACK_URL);
    const { ness, galson } = parseBlackBins(blackTable);

    const blueTable = await fetchTable(BLUE_URL);
    const blueData = parseBinData(blueTable, "Ness");

    const greenTable = await fetchTable(GREEN_URL);
    const greenData = parseBinData(greenTable, "Ness");

    // Build events for chosen area
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

    if (events.length === 0) {
      return res.status(500).send("No events found");
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS error:", error);
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
