import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations";

function cleanDay(str) {
  const m = str.match(/^(\d{1,2})/);
  return m ? parseInt(m[1], 10) : null;
}

function monthIndex(month) {
  return new Date(`${month} 1, 2000`).getMonth();
}

function buildEvents(title, dates) {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const events = [];

  dates.forEach((d) => {
    const [month, dayRaw] = d.split(" ");
    const day = cleanDay(dayRaw);
    const mIndex = monthIndex(month);
    if (day === null || isNaN(mIndex)) return;

    const eventYear =
      currentMonth === 11 && mIndex <= 1 ? year + 1 : year;

    events.push({
      title,
      start: [eventYear, mIndex + 1, day],
    });
  });

  return events;
}

export default function handler(req, res) {
  const { area } = req.query; // brue | barvas
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const load = (f) =>
      JSON.parse(fs.readFileSync(path.join(process.cwd(), f), "utf8"));

    const black = load("black.json");
    const blue = load("blue.json");
    const green = load("green.json");

    let events = [];

    // Black + Blue always shared
    events.push(
      ...buildEvents(`${t.blackButton} (Brue & Barvas)`, black.results[0].dates),
      ...buildEvents(`${t.blueButton} (Brue & Barvas)`, blue.results[0].dates)
    );

    // Green splits by area
    const greenBlock =
      area === "brue"
        ? green.results.find((r) => /brue/i.test(r.area))
        : green.results.find((r) => /barvas/i.test(r.area));

    if (greenBlock) {
      events.push(
        ...buildEvents(
          `${t.greenButton} (${area === "brue" ? "Brue" : "Barvas"})`,
          greenBlock.dates
        )
      );
    }

    if (!events.length) return res.status(500).send(t.noData);

    const { error, value } = createEvents(events);
    if (error) throw error;

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-bins-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error(err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
