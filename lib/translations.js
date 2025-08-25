const translations = {
  en: {
    // --- Landing page ---
    titleLine1: "Ness",
  titleLine2: "Bin Collection Dates",
    description:
      "Check bin collection dates for Ness: black, blue, and green bins. Includes iCal download links.",
    villages:
      "Clicking the black, blue, and green buttons below will display the CNES collection schedules for: Lionel, Habost, Swainbost, Cross, North Dell, South Dell, Fivepenny, Cross Skigersta, Skigersta, Eorodale, Adabrock, Port of Ness, Knockaird, and Eoropie.",
    selectBin: "Select the bin type to view the latest collection dates:",
    calendarHeader: "📅 Open the Ness Bin Collection Schedules in Your Calendar:",
    northSchedule: "North Ness Bin Schedule",
    northVillages:
      "(Knockaird, Fivepenny, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Skigersta, Cross Skigersta)",
    southSchedule: "South Ness Bin Schedule",
    southVillages: "(Habost, Swainbost, Cross, North and South Dell)",
    credit: `
  Created by Alex Barnard using Github and Vercel. Each time this app loads, it collects data from the CNES website, meaning that it is up to date at the time the app is opened. 
  The data used are from 
  <a href="https://www.cne-siar.gov.uk/bins-and-recycling" target="_blank">
    CNES Bins and Recycling
  </a>.
`,
licence: `
  This free tool is shared under a 
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
    Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
  </a> licence.
  <br /><br />
  This project is a community tool, if you spot any errors or have suggestions, I’ll make corrections as quickly as possible.  
  Thank you for contributing and helping keep Ness connected 💚
  <br /><br />
  ☕ Support the project: 
  <a href="https://ko-fi.com/fuelthestoke" target="_blank">Buy me a coffee</a>  
  <br />
  📬 Questions or updates: 
  <a href="#" onclick="this.innerText='al@daisyscoldwatersurfteam.com'; return false;">
    Click to reveal my email
  </a>
`,
cute: "💚 WE LOVE NESS! 💚",

    // --- Bin pages ---
    blackTitle: "BLACK Bin Collection Dates",
    blackNess:
      "Knockaird, Fivepenny, Eoropie, Port of Ness, Lionel, Eorodale, Adabrock, Skigersta, Cross Skigersta",
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
      "Le bhith a’ briogadh air na putanan dubh, gorm is uaine gu h-ìosal, seallaidh e clàran cruinneachaidh Chomhairle nan Eilean Siar airson: Lìonal, Tàbost, Suaineabost, Cros, Dail bho Thuath, Dail bho Deas, Na Còig Peighinnean, An Rathad Ùr, Sgiogarstaigh, Eòrodal, Adabroc, Am Port, An Cnoc Àrd, agus Eòropaidh.",
    selectBin: "Tagh seòrsa a’ bhiona gus na cinn-latha as ùire fhaicinn:",
    calendarHeader:
      "📅 Fosgail na Clàran Bhionaichean Nis anns a’ Mhìosachan agad:",
    northSchedule: "Clàr Bhionaichean Nis a Tuath",
    northVillages:
      "(An Cnoc Àrd, Na Còig Peighinnean, Eòropaidh, Am Port, Lìonal, Eòrodal, Adabroc, Sgiogarstaigh, An Rathad Ùr)",
    southSchedule: "Clàr Bhionaichean Nis a Deas",
    southVillages: "(Tàbost, Suaineabost, Cros, Dail bho Thuath is Deas)",
    credit: `
  Air a chruthachadh le Alex Barnard a’ cleachdadh Github agus Vercel. 
  Gach turas a luchdaicheas an aplacaid seo, bidh e a’ sgrìobadh dàta bhon làrach-lìn ChNES, 
  agus mar sin tha e suas gu latha nuair a thèid fhosgladh. 
  Tha an dàta seo bho 
  <a href="https://www.cne-siar.gov.uk/bins-and-recycling" target="_blank">
    CNES Bionaichean is Ath-chuairteachadh
  </a>.
`,
licence: `
  Tha an inneal seo air a roinn fo 
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
    Ceadachas Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
  </a>.
  <br /><br />
  ’S e pròiseact coimhearsnachd a tha seo, ma chì thu mearachdan no ma tha molaidhean agad, 
  nì mi ceartachaidhean cho luath ’s a ghabhas.  
  Tapadh leibh airson cur ris agus airson a bhith a’ cuideachadh Nis a chumail ceangailte 💚
  <br /><br />
  ☕ Taic ris a’ phròiseact: 
  <a href="https://ko-fi.com/fuelthestoke" target="_blank">Ceannaich cofaidh dhomh</a>  
  <br />
  📬 Ceistean no ùrachaidhean: 
  <a href="#" onclick="this.innerText='al@daisyscoldwatersurfteam.com'; return false;">
    Briog an seo gus mo phost-d fhaicinn
  </a>
`,
cute: "💚 GRÀDH MÒR AIR NIS! 💚",

    // --- Bin pages ---
    blackTitle: "BIONA DUBH – Cinn-latha Cruinneachaidh",
    blackNess:
      "An Cnoc Àrd, Na Còig Peighinnean, Eòropaidh, Am Port, Lìonal, Eòrodal, Adabroc, Sgiogarstaigh, An Rathad Ùr",
    blackSouth: "Tàbost, Suaineabost, Cros, Dail bho Thuath is Deas",

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
