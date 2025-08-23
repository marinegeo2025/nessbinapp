// pages/api/calendar/[area].js
import axios from "axios";
import * as cheerio from "cheerio";
import { createEvents } from "ics";

const BLACK_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";
const GREEN_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";
const BLUE_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";

// Helper: fetch and parse a table
async function fetchTable(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 10000,
  });
  const $ = cheerio.load(response.data);
  return $("table").first();
}

// Helper: clean dates like "3rd", "21st" → "3", "21"
function cleanDay(str) {
  if (!str || str.toLowerCase().includes("n/a")) return null;
  return str.replace(/(\d+)(st|nd|rd|th)/, "$1");
}

// Parse Black Bin split (North vs South Ness)
function parseBlackBins($table) {
  const headers = [];
  $table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

  const ness = {};
  const galson = {};

  $table.find("tbody tr").each((i, row) => {
    const cells = [];
    $(row).find("td").each((j, cell) => cells.push($(cell).text().trim()));

    if (cells.length >= 2) {
      const area = cells[0];
      for (let i = 1; i < cells.length; i++) {
        const month = headers[i];
        const dates = cells[i].split(",").map(d => d.trim());
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

// Generic parse (Blue / Green)
function parseBinData($table, keyword) {
  const headers = [];
  $table.find("thead th").each((i, th) => headers.push($(th).text().trim()));

  const data = {};
  $table.find("tbody tr").each((i, row) => {
    const cells = [];
    $(row).find("td").each((j, cell) => cells.push($(cell).text().trim()));

    if (cells.length >= 2) {
      const area = cells[0];
      if (area.includes(keyword)) {
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];
          const dates = cells[i].split(",").map(d => d.trim());
          data[month] = (data[month] || []).concat(dates);
        }
      }
    }
  });
  return data;
}

// Build ICS events
function buildEvents(binColor, data, areaName) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, dates] of Object.entries(data)) {
    for (const date of dates) {
      const clean = cleanDay(date);
      if (!clean) continue;

      const dateString = `${clean} ${month} ${year}`;
      const dt = new Date(dateString);

      if (!isNaN(dt)) {
        events.push({
          title: `${binColor} Bin Collection (${areaName})`,
          start: [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()],
          end: [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()],
          startOutputType: "local",
        });
      }
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area } = req.query;

  try {
    // Fetch data
    const blackTable = await fetchTable(BLACK_URL);
    const { ness, galson } = parseBlackBins(blackTable);

    const blueTable = await fetchTable(BLUE_URL);
    const blueData = parseBinData(blueTable, "Ness");

    const greenTable = await fetchTable(GREEN_URL);
    const greenData = parseBinData(greenTable, "Ness");

    // Build calendar
    let events = [];
    if (area === "north") {
      events = events.concat(buildEvents("Black", ness, "North Ness"));
    } else if (area === "south") {
      events = events.concat(buildEvents("Black", galson, "South Ness"));
    } else {
      return res.status(404).send("Area not found");
    }
    events = events.concat(buildEvents("Blue", blueData, "Ness"));
    events = events.concat(buildEvents("Green", greenData, "Ness"));

    const { error, value } = createEvents(events);
    if (error) return res.status(500).send("Error creating ICS");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-ness-bin-schedule.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to build calendar");
  }
}
