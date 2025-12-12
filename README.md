# 🌊 Ness Bin App 🗑️

**nessbinapp.com** — keeping Ness on time for bins so folk can do more important things like go surf 🤙  

A simple, community tool that scrapes the **Comhairle nan Eilean Siar (CNES)** website and shows **live bin collection dates** for Ness villages.  
Locals can check bin days on the site or download `.ics` calendar files to sync with Google/Apple/Outlook.

💚 WE LOVE NESS 💚  

---

## ✨ Features

- ✅ **Black / Blue / Green bin scrapers** — live data from CNES tables  
- ✅ **North & South Ness calendar downloads** (`.ics`)  
- ✅ Clean, mobile-friendly UI with big buttons  
- ✅ Self-hosted on [Vercel](https://vercel.com) with custom domain: [nessbinapp.com](https://nessbinapp.com)  
- ✅ Shared CSS for consistent look across all pages  

---

## 📅 How it Works

1. Scrapers use **axios** + **cheerio** + **puppeteer** to fetch the CNES bin collection tables.  
2. Data is parsed into months/dates and shown in clean HTML pages.  
3. `/api/calendar/north` and `/api/calendar/south` use the same scraped data to build `.ics` files with the **ics** library.  
4. The `.ics` can be imported into any calendar app.  
5. Because CNES only publishes **~2–3 months at a time**, the `.ics` always matches what’s live.

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)  
- [Vercel Hosting](https://vercel.com/)  
- [Axios](https://axios-http.com/) for HTTP requests  
- [Cheerio](https://cheerio.js.org/) for HTML parsing
- [Puppeteer](https://pptr.dev/) for automation  
- [ics](https://www.npmjs.com/package/ics) for calendar file generation  
- Custom CSS styling  

---

## 🌍 Serving Ness

Villages covered:
- **North Ness** → Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Cross Skigersta  
- **South Ness** → Habost, Swainbost, Cross, North Dell, South Dell  

---

## 💚 Credits

Created by Alex Barnard  
Built with love for the **Ness community**  
Hosted on Vercel  
Data from: [CNES Bins and Recycling](https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris)  

💚 WE LOVE NESS 💚  

---

## 🚀 Future Ideas

- Weekly cron refresh to auto-update `.ics` when CNES adds new months  
- News and Surf forecast integration 🤙 🌊  
- From broke local binfluencer to global binllionaire
- From trash talk to perfect gaelic lexicon cearst mhah
- Ness Bin App is heading to the stars!
---
