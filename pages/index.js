import { useEffect, useState } from "react";

export default function Home() {
  const [selectedBin, setSelectedBin] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (selectedBin) {
      fetch(`/api/${selectedBin}`)
        .then(r => r.json())
        .then(setData)
        .catch(() => setData({ error: "Could not load data" }));
    }
  }, [selectedBin]);

  const renderTable = (data) => {
    if (!data) return null;
    if (data.error) return <p className="error">{data.error}</p>;

    return (
      <div className="table">
        <table>
          <thead>
            <tr>
              {data.headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main>
      <h1>🗑️ Ness Bin Collection Dates</h1>
      <p className="intro">
        Clicking the black, blue, and green buttons below will display the CNES
        collection schedules for all Ness villages.
      </p>

      <p>Select the bin type to view the latest collection dates:</p>

      <div className="buttons">
        <button className="black" onClick={() => setSelectedBin("black")}>
          🗑 Black Bin (General Waste)
        </button>
        <button className="blue" onClick={() => setSelectedBin("blue")}>
          ♻️ Blue Bin (Plastics and Paper)
        </button>
        <button className="green" onClick={() => setSelectedBin("green")}>
          🍾 Green Bin (Glass)
        </button>
      </div>

      {renderTable(data)}

      <h2>📅 Open the Ness Bin Collection Schedules in Your Calendar:</h2>

      <div className="banners">
        <a
          href="/api/calendar/north"
          className="banner north-bin-link"
        >
          <div className="overlay">
            <h3>North Ness Bin Schedule</h3>
            <p>
              (Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel,
              Eorodale, Adabrock, Cross Skigersta)
            </p>
          </div>
        </a>

        <a
          href="/api/calendar/south"
          className="banner south-bin-link"
        >
          <div className="overlay">
            <h3>South Ness Bin Schedule</h3>
            <p>
              (Habost, Swainbost, Cross, North and South Dell)
            </p>
          </div>
        </a>
      </div>

      <footer>
        <p>
          Created by Alex Barnard using Vercel. Data from{" "}
          <a href="https://www.cne-siar.gov.uk/bins-and-recycling/">
            CNES Bins and Recycling
          </a>.
        </p>
        <p>
          Shared under a{" "}
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
            Creative Commons Attribution-NonCommercial-ShareAlike 4.0
          </a>{" "}
          licence.
        </p>
        <p className="love">💚 WE LOVE NESS! 💚</p>
      </footer>

      <style jsx>{`
        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        h1 { color: #006400; }
        .intro { font-style: italic; margin-bottom: 1rem; }
        .buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 2rem 0;
        }
        button {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          color: #fff;
          cursor: pointer;
        }
        button.black { background: #333; }
        button.blue { background: #0070f3; }
        button.green { background: #1f9d55; }
        .table { margin: 2rem 0; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; }
        th { background: #f9f9f9; }
        .banners {
          display: grid;
          gap: 1rem;
          margin: 2rem 0;
        }
        .banner {
          display: block;
          position: relative;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          overflow: hidden;
          height: 160px;
          background-size: cover;
          background-position: center;
        }
        .north-bin-link { background-image: url("/images/north-ness.jpeg"); }
        .south-bin-link { background-image: url("/images/south-ness.jpeg"); }
        .overlay {
          background: rgba(0,0,0,0.5);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }
        footer { margin-top: 3rem; font-size: 0.9rem; }
        .love { font-weight: bold; color: #1f9d55; }
      `}</style>
    </main>
  );
}
