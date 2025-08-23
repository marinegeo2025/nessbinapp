// pages/index.js
import { useEffect, useState } from "react";

export default function Home() {
  const [black, setBlack] = useState(null);
  const [blue, setBlue] = useState(null);
  const [green, setGreen] = useState(null);

  // Fetch all 3 APIs
  useEffect(() => {
    fetch("/api/black").then(r => r.json()).then(setBlack);
    fetch("/api/blue").then(r => r.json()).then(setBlue);
    fetch("/api/green").then(r => r.json()).then(setGreen);
  }, []);

  const renderTable = (data, title, color) => {
    if (!data) return <p>Loading {title}…</p>;
    if (data.error) return <p>Error: {data.error}</p>;

    return (
      <div className={`bin-table ${color}`}>
        <h2>{title}</h2>
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
      <h1>Ness Bin App 🗑️</h1>
      <p>Check your next bin collection dates for Ness.</p>

      {renderTable(black, "Black Bins", "black")}
      {renderTable(blue, "Blue Bins", "blue")}
      {renderTable(green, "Green Bins", "green")}

      <style jsx>{`
        main {
          font-family: Arial, sans-serif;
          padding: 2rem;
          text-align: center;
        }
        h1 {
          margin-bottom: 1rem;
        }
        .bin-table {
          margin: 2rem auto;
          max-width: 600px;
          border: 2px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
        }
        .bin-table.black { border-color: #333; }
        .bin-table.blue { border-color: #0070f3; }
        .bin-table.green { border-color: #1f9d55; }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 0.5rem;
        }
        th {
          background: #f5f5f5;
        }
      `}</style>
    </main>
  );
}
