import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Ness Bin Collection Dates</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="stylesheet" href="/style.css" />
      </Head>

      <div className="container">
        <h1>
          <i className="fas fa-trash"></i> Ness Bin Collection Dates
        </h1>
        <p className="villages">
          Clicking the black, blue, and green buttons below will display the CNES
          collection schedules for: Lionel, Habost, Swainbost, Cross, North Dell,
          South Dell, Fivepenny, Butt, Cross Skigersta, Skigersta, Eorodale,
          Adabrock, Port of Ness, Knockaird, and Eoropie.
        </p>
        <p>Select the bin type to view the latest collection dates:</p>

        <ul className="bin-list">
          <li>
            <a href="/api/black" target="_blank" className="bin-link btn-black">
              <i className="fas fa-dumpster icon"></i> Black Bin (General Waste)
            </a>
          </li>
          <li>
            <a href="/api/blue" target="_blank" className="bin-link btn-blue">
              <i className="fas fa-recycle icon"></i> Blue Bin (Plastics and Paper)
            </a>
          </li>
          <li>
            <a href="/api/green" target="_blank" className="bin-link btn-green">
              <i className="fas fa-wine-bottle icon"></i> Green Bin (Glass)
            </a>
          </li>
        </ul>

        <div style={{ marginTop: "20px" }}>
          <h3>📅 Open the Ness Bin Collection Schedules in Your Calendar:</h3>
          <a href="/api/calendar/north" className="bin-link north-bin-link">
            <i className="fas fa-download icon"></i> North Ness Bin Schedule
            <br />
            <span className="subtext">
              (Knockaird, Fivepenny, Butt, Eoropie, Port of Ness, Lionel, Eorodale,
              Adabrock, Cross Skigersta)
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
          Created by Alex Barnard using Vercel. Each time this app loads, it
          scrapes data from the CNES website, meaning that it is up to date at
          the time the app is opened. The data used are from{" "}
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
      </div>
    </>
  );
}
