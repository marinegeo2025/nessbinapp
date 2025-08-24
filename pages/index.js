import Head from "next/head";
import { useState, useEffect } from "react";

export default function Home() {
  const [lang, setLang] = useState("gd"); // Gaelic default

  // Load saved language preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) {
      setLang(saved);
    }
  }, []);

  // Toggle language and save to localStorage
  const toggleLang = () => {
    const newLang = lang === "gd" ? "en" : "gd";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <>
      <Head>
        <title>
          {lang === "en"
            ? "Ness Bin Collection Dates"
            : "Cinn-latha Cruinneachadh Bhionaichean Nis"}
        </title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="stylesheet" href="/style.css" />
      </Head>

      <div className="container">
        {/* Language toggle button */}
        <button
          onClick={toggleLang}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#067f0b",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {lang === "gd" ? "English" : "Gàidhlig"}
        </button>

        {lang === "en" ? (
          <>
            <h1>
              <i className="fas fa-trash"></i> Ness Bin Collection Dates
            </h1>
            <p className="villages">
              Clicking the black, blue, and green buttons below will display the
              CNES collection schedules for: Lionel, Habost, Swainbost, Cross,
              North Dell, South Dell, Fivepenny, Butt, Cross Skigersta, Skigersta,
              Eorodale, Adabrock, Port of Ness, Knockaird, and Eoropie.
            </p>
            <p>Select the bin type to view the latest collection dates:</p>

            <ul className="bin-list">
  <li>
    <a
      href={`/api/black?lang=${lang}`}
      target="_blank"
      className="bin-link btn-black"
    >
      <i className="fas fa-dumpster icon"></i>{" "}
      {lang === "en"
        ? "Black Bin (General Waste)"
        : "Biona Dubh (Sgudal Coitcheann)"}
    </a>
  </li>
  <li>
    <a
      href={`/api/blue?lang=${lang}`}
      target="_blank"
      className="bin-link btn-blue"
    >
      <i className="fas fa-recycle icon"></i>{" "}
      {lang === "en"
        ? "Blue Bin (Plastics and Paper)"
        : "Biona Gorm (Plastaig is Pàipear)"}
    </a>
  </li>
  <li>
    <a
      href={`/api/green?lang=${lang}`}
      target="_blank"
      className="bin-link btn-green"
    >
      <i className="fas fa-wine-bottle icon"></i>{" "}
      {lang === "en" ? "Green Bin (Glass)" : "Biona Uaine (Glainne)"}
    </a>
  </li>
</ul>

            <div style={{ marginTop: "20px" }}>
              <h3>📅 Open the Ness Bin Collection Schedules in Your Calendar:</h3>
              <a href="/api/calendar/north" className="bin-link north-bin-link">
                <i className="fas fa-download icon"></i> North Ness Bin Schedule
                <br />
                <span className="subtext">
                  (Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel,
                  Eorodale, Adabrock, Cross Skigersta)
                </span>
              </a>
              <a href="/api/calendar/south" className="bin-link south-bin-link">
                <i className="fas fa-download icon"></i> South Ness Bin Schedule
                <br />
                <span className="subtext">
                  (Habost, Swainbost, Cross, North and South Dell)
                </span>
              </a>
            </div>

            <p className="credit">
              Created by Alex Barnard using Github and Vercel. Each time this app
              loads, it scrapes data from the CNES website, meaning that it is up
              to date at the time the app is opened. The data used are from{" "}
              <a
                href="https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris"
                target="_blank"
              >
                CNES Bins and Recycling
              </a>
              .
              <br />
              <br />
              This free tool is shared under a{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
              >
                Creative Commons Attribution-NonCommercial-ShareAlike 4.0
                International
              </a>{" "}
              licence.
            </p>

            <p className="cute-text">
              <span className="heart">💚</span> WE LOVE NESS!{" "}
              <span className="heart">💚</span>
            </p>
          </>
        ) : (
          <>
            <h1>
              <i className="fas fa-trash"></i> Cinn-latha Cruinneachadh
              Bhionaichean Nis
            </h1>
            <p className="villages">
              Le bhith a’ briogadh air na putanan dubh, gorm is uaine gu h-ìosal,
              seallaidh e clàran cruinneachaidh Chomhairle nan Eilean Siar airson:
              Lìonal, Tobson, Suaineabost, Cros, Dail bho Thuath, Dail bhon Deas,
              Còig Peighinnean, Rubha, Cros Sgiogarstaidh, Sgiogarstaidh, Eòradal,
              Adabroc, Port Nis, Cnoc Àrd, agus Eòropaidh.
            </p>
            <p>Tagh seòrsa a’ bhiona gus na cinn-latha as ùire fhaicinn:</p>

            <ul className="bin-list">
              <li>
                <a
                  href="/api/black"
                  target="_blank"
                  className="bin-link btn-black"
                >
                  <i className="fas fa-dumpster icon"></i> Biona Dubh (Sgudal Coitcheann)
                </a>
              </li>
              <li>
                <a
                  href="/api/blue"
                  target="_blank"
                  className="bin-link btn-blue"
                >
                  <i className="fas fa-recycle icon"></i> Biona Gorm (Plastaig is
                  Pàipear)
                </a>
              </li>
              <li>
                <a
                  href="/api/green"
                  target="_blank"
                  className="bin-link btn-green"
                >
                  <i className="fas fa-wine-bottle icon"></i> Biona Uaine (Glainne)
                </a>
              </li>
            </ul>

            <div style={{ marginTop: "20px" }}>
              <h3>📅 Fosgail na Clàran Bhionaichean Nis anns a’ Mhìosachan agad:</h3>
              <a href="/api/calendar/north" className="bin-link north-bin-link">
                <i className="fas fa-download icon"></i> Clàr Bhionaichean Nis a Tuath
                <br />
                <span className="subtext">
                  (Cnoc Àrd, Còig Peighinnean, Rubha, Eòropaidh, Port Nis, Lìonal,
                  Eòradal, Adabroc, Cros Sgiogarstaidh)
                </span>
              </a>
              <a href="/api/calendar/south" className="bin-link south-bin-link">
                <i className="fas fa-download icon"></i> Clàr Bhionaichean Nis a Deas
                <br />
                <span className="subtext">
                  (Tobson, Suaineabost, Cros, Dail bho Thuath is Deas)
                </span>
              </a>
            </div>

            <p className="credit">
              Air a chruthachadh le Alex Barnard a’ cleachdadh Github agus Vercel.
              Gach turas a luchdaicheas an aplacaid seo, bidh e a’ sgrìobadh dàta
              bhon làrach-lìn ChNES, agus mar sin tha e suas gu latha nuair a thèid
              fhosgladh. Tha an dàta seo bho{" "}
              <a
                href="https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris"
                target="_blank"
              >
                CNES Bionaichean is Ath-chuairteachadh
              </a>
              .
              <br />
              <br />
              Tha an inneal an-asgaidh seo air a roinn fo{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
              >
                Ceadachas Creative Commons Attribution-NonCommercial-ShareAlike
                4.0 International
              </a>
              .
            </p>

            <p className="cute-text">
              <span className="heart">💚</span> GRÀDH MÒR AIR NIS!{" "}
              <span className="heart">💚</span>
            </p>
          </>
        )}
      </div>
    </>
  );
}
