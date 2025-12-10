import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations.js";

// Clean “21st” → 21
function cleanDate(d) {
  if (!d) return null;
  const match = d.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Build ICS events
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
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    // --- Load local JSON data
    const loadJSON = (filename) => {
      const filePath = path.join(process.cwd(), filename);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    };

    const black = loadJSON("black.json");
    const blue = loadJSON("wednesday.json");
    const green = loadJSON("green.json");

    if (!black || !blue || !green) {
      throw new Error("Missing local JSON bin data.");
    }

    // --- Extract areas
    const blackNorth = black.results.find((r) => /ness/i.test(r.area));
    const blackSouth = black.results.find((r) => /galson/i.test(r.area));
    const blueNess = blue.results.find((r) => /ness/i.test(r.area));
    const greenNess = green.results.find((r) => /ness/i.test(r.area));

    // --- Convert to { month: [dayNumbers] }
    const convertToMonthData = (dates) => {
      const data = {};
      dates.forEach((d) => {
        const [month, dayRaw] = d.split(" ");
        const day = cleanDate(dayRaw);
        if (!isNaN(day)) {
          data[month] = data[month] || [];
          data[month].push(day);
        }
      });
      return data;
    };

    const blackNorthData = blackNorth ? convertToMonthData(blackNorth.dates) : {};
    const blackSouthData = blackSouth ? convertToMonthData(blackSouth.dates) : {};
    const blueData = blueNess ? convertToMonthData(blueNess.dates) : {};
    const greenData = greenNess ? convertToMonthData(greenNess.dates) : {};

    // --- Combine
    let events = [];

    if (area === "north") {
      events = [
        ...buildEvents("black", t, lang === "gd" ? "Nis a Tuath" : "North Ness", blackNorthData),
        ...buildEvents("blue", t, "Ness", blueData),
        ...buildEvents("green", t, "Ness", greenData),
      ];
    } else if (area === "south") {
      events = [
        ...buildEvents("black", t, lang === "gd" ? "Nis a Deas" : "South Ness", blackSouthData),
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
