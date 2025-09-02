// pages/api/calendar/[area].js
import axios from "axios";
import * as cheerio from "cheerio";
import { createEvents } from "ics";
import translations from "../../../lib/translations";
import { validateBinTable } from "../../../lib/failsafe";

const BLACK_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/thursday-collections";
const BLUE_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/wednesday-collections";
const GREEN_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

// Clean "21st" → 21
function cleanDate(d) {
  if (!d) return null;
  const match = d.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Parse a bin table into { month: [dates...] } – used for Green
function parseBinTable($, keyword) {
  const headers = [];
  $("thead th").each((i, th) => headers.push($(th).text().trim()));

  const data = {};
  $("tbody tr").each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      if (area.includes(keyword)) {
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];
          const dates = $(cells[i]).text().trim();
          if (dates && dates.toLowerCase() !== "n/a") {
            const parts = dates
              .split(",")
              .map((x) => cleanDate(x))
              .filter(Boolean);
            data[month] = (data[month] || []).concat(parts);
          }
        }
      }
    }
  });
  return data;
}

// Parse Black bins separately (Ness vs Galson)
function parseBlackBins($) {
  const headers = [];
  $("thead th").each((i, th) => headers.push($(th).text().trim()));

  const ness = {};
  const galson = {};

  $("tbody tr").each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      for (let i = 1; i < cells.length; i++) {
        const month = headers[i];
        const dates = $(cells[i]).text().trim();
        if (dates && dates.toLowerCase() !== "n/a") {
          const parts = dates
            .split(",")
            .map((x) => cleanDate(x))
            .filter(Boolean);
          if (/ness/i.test(area)) {
            ness[month] = (ness[month] || []).concat(parts);
          } else if (/galson/i.test(area)) {
            galson[month] = (galson[month] || []).concat(parts);
          }
        }
      }
    }
  });
  return { ness, galson };
}

// ✅ Parse Blue bins – headers = months, rows = weeks
function parseBlueBins($) {
  const headers = [];
  $("table thead th").each((i, th) => headers.push($(th).text().trim()));

  const nessData = {};

  $("table tbody tr").each((i, row) => {
    const cells = $(row).find("td").map((j, td) => $(td).text().trim()).get();
    if (cells.length === 0) return;

    const area = cells[0];
    if (/ness/i.test(area)) {
      for (let i = 1; i < cells.length; i++) {
        const month = headers[i];
        const dates = cells[i];
        if (month && dates && dates.toLowerCase() !== "n/a") {
          nessData[month] = dates
            .split(",")
            .map((d) => cleanDate(d))
            .filter(Boolean);
        }
      }
    }
  });

  return nessData;
}

// Convert parsed data to ICS events
function buildEvents(binType, t, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(data)) {
    for (const day of days) {
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (isNaN(monthIndex)) continue;
      events.push({
        title: `${t[`${binType}Button`]}`,
        start: [year, monthIndex + 1, day],
      });
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area } = req.query;
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    // --- Black bins ---
    const blackResp = await axios.get(BLACK_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $black = cheerio.load(blackResp.data);
    validateBinTable($black, { requiredKeyword: "Ness" });
    const { ness, galson } = parseBlackBins($black);

    // --- Blue bins ---
    const blueResp = await axios.get(BLUE_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $blue = cheerio.load(blueResp.data);
    validateBinTable($blue, { requiredKeyword: "Ness" });
    const blueData = parseBlueBins($blue);

    // --- Green bins ---
    const greenResp = await axios.get(GREEN_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $green = cheerio.load(greenResp.data);
    validateBinTable($green, { requiredKeyword: "Ness" });
    const greenData = parseBinTable($green, "Ness");

    // Build events
    let events = [];
    if (area === "north") {
      events = [
        ...buildEvents("black", t, lang === "en" ? "North Ness" : "Nis a Tuath", ness),
        ...buildEvents("blue", t, "Nis", blueData),
        ...buildEvents("green", t, "Nis", greenData),
      ];
    } else if (area === "south") {
      events = [
        ...buildEvents("black", t, lang === "en" ? "South Ness" : "Nis a Deas", galson),
        ...buildEvents("blue", t, "Nis", blueData),
        ...buildEvents("green", t, "Nis", greenData),
      ];
    } else {
      return res.status(404).send(lang === "en" ? "Area not found" : "Cha deach sgìre a lorg");
    }

    if (events.length === 0) {
      return res.status(500).send(t.noData);
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS Error:", error, events);
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
