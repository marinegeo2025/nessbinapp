// love peace and happiness
import Head from "next/head";
import { useState, useEffect } from "react";
import translations from "../lib/translations";   // in index.js

export default function Home() {
  const [lang, setLang] = useState("gd"); // Gaelic default

  // Load saved language preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  // Toggle language and save to localStorage
  const toggleLang = () => {
    const newLang = lang === "gd" ? "en" : "gd";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = translations[lang]; // shorthand

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="stylesheet" href="/style.css" />
        <link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon.png" />
<meta name="theme-color" content="#067f0b" />
   
      </Head>

      <div className="container">
        {/* Header row with centered title + language toggle button */}
        <div className="header-row">
          <h1>
  <i className="fas fa-trash"></i>{" "}
  {lang === "en" ? (
    <>
      {t.titleLine1} <br /> {t.titleLine2}
    </>
  ) : (
    t.title
  )}
</h1>
          <button onClick={toggleLang} className="lang-toggle">
            {lang === "gd" ? "Gàidhlig" : "English"}
          </button>
        </div>

        <p className="villages">{t.villages}</p>
        <p>{t.selectBin}</p>

        <ul className="bin-list">
          <li>
            <a
              href={`/api/black?lang=${lang}`}
              className="bin-link bin-button btn-black"
            >
              <i className="fas fa-dumpster icon"></i> {t.blackButton}
            </a>
          </li>
          <li>
            <a
              href={`/api/blue?lang=${lang}`}
              className="bin-link bin-button btn-blue"
            >
              <i className="fas fa-recycle icon"></i> {t.blueButton}
            </a>
          </li>
          <li>
            <a
              href={`/api/green?lang=${lang}`}
              className="bin-link bin-button btn-green"
            >
              <i className="fas fa-wine-bottle icon"></i> {t.greenButton}
            </a>
          </li>
        </ul>

       <div style={{ marginTop: "20px" }}>
  <h3>{t.calendarHeader}</h3>
  <a
    href={`/api/calendar/north?lang=${lang}`}
    className="bin-link north-bin-link"
  >
    <i className="fas fa-download icon"></i> {t.northSchedule}
    <br />
    <span className="subtext">{t.northVillages}</span>
  </a>
  <a
    href={`/api/calendar/south?lang=${lang}`}
    className="bin-link south-bin-link"
  >
    <i className="fas fa-download icon"></i> {t.southSchedule}
    <br />
    <span className="subtext">{t.southVillages}</span>
  </a>
</div>

</div>

{/* 🎄 Festive Message (December only) */}
{new Date().getMonth() === 11 && (
  <>
    {/* ❄️ Snowfall (December only) */}
    <div className="snow"></div>

    <div className="festive-message">
      <p>{t.festiveMessage}</p>
      <div className="sparkle-wrap">
        <span>✨</span><span>🎅</span><span>🎄</span><span>⭐</span><span>🎁</span>
      </div>
    </div>
  </>
)}

  <div
        className="credit"
        dangerouslySetInnerHTML={{ __html: `${t.credit}<br /><br />${t.licence}` }}
      />

      <p className="cute-text">{t.cute}</p>
    </div>
  </>
  );
}

