const translations = {
  en: {
    // --- Landing page ---
    title: "Ness Bin Collection Dates",
    description:
      "Check bin collection dates for Ness: black, blue, and green bins. Includes iCal download links.",
    villages:
      "Clicking the black, blue, and green buttons below will display the CNES collection schedules for: Lionel, Habost, Swainbost, Cross, North Dell, South Dell, Fivepenny, Butt, Cross Skigersta, Skigersta, Eorodale, Adabrock, Port of Ness, Knockaird, and Eoropie.",
    selectBin: "Select the bin type to view the latest collection dates:",
    calendarHeader: "📅 Open the Ness Bin Collection Schedules in Your Calendar:",
    northSchedule: "North Ness Bin Schedule",
    northVillages:
      "(Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Skigersta, Cross Skigersta)",
    southSchedule: "South Ness Bin Schedule",
    southVillages: "(Habost, Swainbost, Cross, North and South Dell)",
    credit:
      `Built with ❤️ by Alex Barnard using GitHub and Vercel. 
      Each time this app loads, it scrapes live data from the CNES website, so it’s always up to date. 
      The data used are from CNES Bins and Recycling.`,
    licence: `
      This project is a community tool — if you spot any errors or have suggestions, I’ll make corrections as quickly as possible.  
      Thank you for contributing and helping keep Ness connected 💚  
      <br /><br />
      ☕ If you’d like to support the project:  
      <a href="https://ko-fi.com/fuelthestoke" target="_blank">Buy me a coffee</a>  
      <br />
      📬 For questions or updates:  
      <a href="#" onclick="this.innerText='al@daisyscoldwatersurfteam.com'; return false;">Click to reveal my email</a>  
      <br /><br />
      This free tool is shared under a 
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
      Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
      </a> licence.
    `,
    cute: "💚 WE LOVE NESS! 💚",

    // --- Bin pages ---
    blackTitle: "BLACK Bin Collection Dates",
    blackNess:
      "Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Skigersta, Cross Skigersta",
    blackSouth: "Habost, Swainbost, Cross, North & South Dell",

    blueTitle: "BLUE Bin Collection Dates for Ness",
    greenTitle: "GREEN Bin Collection Dates for Ness",

    noData: "No bin collection dates found. Try refreshing later.",
    errorFetching: "Error fetching data:",

    // --- Bin button labels ---
    blackButton: "Black Bin (General Waste)",
    blueButton: "Blue Bin (Plastics and Paper)",
    greenButton: "Green Bin (Glass)",
  },

  gd: {
    // --- Landing page ---
    title: "Cinn-latha Cruinneachadh Bhionaichean Nis",
    description:
      "Thoir sùil air cinn-latha cruinneachaidh bhionaichean ann an Nis: dubh, gorm, is uaine. A’ gabhail a-steach ceanglaichean iCal.",
    villages:
      "Le bhith a’ briogadh air na putanan dubh, gorm is uaine gu h-ìosal, seallaidh e clàran cruinneachaidh Chomhairle nan Eilean Siar airson: Lìonal, Tobson, Suaineabost, Cros, Dail bho Thuath, Dail bhon Deas, Còig Peighinnean, Rubha, Cros Sgiogarstaidh, Sgiogarstaidh, Eòradal, Adabroc, Port Nis, Cnoc Àrd, agus Eòropaidh.",
    selectBin: "Tagh seòrsa a’ bhiona gus na cinn-latha as ùire fhaicinn:",
    calendarHeader:
      "📅 Fosgail na Clàran Bhionaichean Nis anns a’ Mhìosachan agad:",
    northSchedule: "Clàr Bhionaichean Nis a Tuath",
    northVillages:
      "(Cnoc Àrd, Còig Peighinnean, Rubha, Eòropaidh, Port Nis, Lìonal, Eòradal, Adabroc, Sgiogarstaidh, Cros Sgiogarstaidh)",
    southSchedule: "Clàr Bhionaichean Nis a Deas",
    southVillages: "(Tobson, Suaineabost, Cros, Dail bho Thuath is Deas)",
    credit:
      `Air a chruthachadh le ❤️ le Alex Barnard a’ cleachdadh GitHub agus Vercel. 
      Gach turas a luchdaicheas an aplacaid seo, bidh e a’ sgrìobadh dàta bhon làrach-lìn ChNES, agus mar sin tha e suas gu latha. 
      Tha an dàta seo bho CNES Bionaichean is Ath-chuairteachadh.`,
    licence: `
      ’S e pròiseact coimhearsnachd a tha seo — ma chì thu mearachdan no ma tha molaidhean agad, nì mi ceartachaidhean cho luath ’s a ghabhas.  
      Tapadh leibh airson cur ris agus a bhith a’ cuideachadh Nis a chumail ceangailte 💚  
      <br /><br />
      ☕ Ma tha thu airson taic a thoirt don phròiseact:  
      <a href="https://ko-fi.com/fuelthestoke" target="_blank">Ceannaich cofaidh dhomh</a>  
      <br />
      📬 Airson ceistean no ùrachaidhean:  
      <a href="#" onclick="this.innerText='al@daisyscoldwatersurfteam.com'; return false;">Briog an seo gus mo phost-d fhaicinn</a>  
      <br /><br />
      Tha an inneal seo air a roinn fo 
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
      Ceadachas Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
      </a>.
    `,
    cute: "💚 GRÀDH MÒR AIR NIS! 💚",

    // --- Bin pages ---
    blackTitle: "BIONA DUBH – Cinn-latha Cruinneachaidh",
    blackNess:
      "Cnoc Àrd, Còig Peighinnean, Rubha, Eòropaidh, Port Nis, Lìonal, Eòradal, Adabroc, Sgiogarstaidh, Cros Sgiogarstaidh",
    blackSouth: "Tobson, Suaineabost, Cros, Dail bho Thuath is Deas",

    blueTitle: "BIONA GORM – Cinn-latha Cruinneachaidh Nis",
    greenTitle: "BIONA UAINE – Cinn-latha Cruinneachaidh Nis",

    noData:
      "Cha deach cinn-latha cruinneachaidh bhionaichean a lorg. Feuch ris ath-luchdachadh an duilleag nas fhaide air adhart.",
    errorFetching: "Mearachd a’ faighinn dàta:",

    // --- Bin button labels ---
    blackButton: "Biona Dubh (Sgudal Coitcheann)",
    blueButton: "Biona Gorm (Plastaig is Pàipear)",
    greenButton: "Biona Uaine (Glainne)",
  },
};

export default translations;
