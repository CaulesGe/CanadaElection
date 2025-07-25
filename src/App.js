import React, { useState, useEffect } from 'react';
import { MapController } from './components/electionMapView/MapController';
import { Overview } from './components/regionOverview/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as d3 from 'd3';
import { Helmet } from 'react-helmet';

function App() {
  const [candidatesByRiding, setCandidatesByRiding] = useState([]);
  //const [resultByDistrict, setResultByDistrict] = useState([]);
  const [allResultsByDistrict, setAllResultsByDistrict] = useState(null);
  const [percentageOfVoteByRegion, setPercentageOfVoteByRegion] = useState([]);
  const [allPercentageOfVoteByRegion, setAllPercentageOfVoteByRegion] = useState(null);
  const [numberOfVoteByRegion, setNumberOfVoteByRegion] = useState([]);
  const [allNumberOfVoteByRegion, setAllNumberOfVoteByRegion] = useState(null);
  const [selectedElection, setSelectedElection] = useState('2021');

  useEffect(() => {
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/allCandidatesResult.json`)
      .then(data => setCandidatesByRiding(data));

    // d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/resultByDistrict.json`)
    //   .then(data => setResultByDistrict(data));

    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/percentageOfVoteByRegion.json`)
      .then(data => setPercentageOfVoteByRegion(data));

    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/numberOfVoteByRegion.json`)
      .then(data => setNumberOfVoteByRegion(data));
  }, [selectedElection]);

  useEffect(() => {
    const files = [
        2004,
        2006,
        2008,
        2011,
        2015,
        2019,
        2021
    ];

    // load all resultByDistrict.json
    Promise.all(
      files.map(election =>
        d3.json(`${process.env.PUBLIC_URL}/data/${election}/resultByDistrict.json`)
          .then(data => ({ election, data }))
      )
    ).then(results => {
      const allResults = {};
      results.forEach(({ election, data }) => {
        allResults[election] = data;
      });
      setAllResultsByDistrict(allResults);
    });

    // load all percentageOfVoteByRegion
    Promise.all(
      files.map(election =>
        d3.json(`${process.env.PUBLIC_URL}/data/${election}/percentageOfVoteByRegion.json`)
          .then(data => ({ election, data }))
      )
    ).then(results => {
      const allResults = {};
      results.forEach(({ election, data }) => {
        allResults[election] = data;
      });
      setAllPercentageOfVoteByRegion(allResults);
    });

    // load all numberOfVoteByRegion
    Promise.all(
      files.map(election =>
        d3.json(`${process.env.PUBLIC_URL}/data/${election}/numberOfVoteByRegion.json`)
          .then(data => ({ election, data }))
      )
    ).then(results => {
      const allResults = {};
      results.forEach(({ election, data }) => {
        allResults[election] = data;
      });
      setAllNumberOfVoteByRegion(allResults);
    });

  }, []);

  if (!allResultsByDistrict || !allPercentageOfVoteByRegion || !allNumberOfVoteByRegion) {
    return <div style={{ textAlign: "center", marginTop: "3rem" }}>Loading election data...</div>;
  }


  return (
    <>
      <Helmet>
        <title>Interactive Canada Election Viewer 2004–2021 by Riding</title>
        <meta
          name="description"
          content="Visualize Canadian federal election results from 2004 to 2021 by riding and party. Search for ridings, compare seat counts and vote shares."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Interactive Canada Election Viewer 2004–2021 by Riding" />
        <meta property="og:description" content="Explore federal election results by riding and region with interactive maps and charts." />
        <meta property="og:image" content="https://canelectionview.com/leaf.png" />
        <meta property="og:url" content="https://canelectionview.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://canelectionview.com/" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Canada Election Map",
            "url": "https://canelectionview.com",
            "description": "Interactive map showing Canadian federal election results (2004–2021) by riding."
          })}
        </script>
      </Helmet>
      <div className="App">
        <header className="App-header">
          <div className="container-fluid">
            <div className="intro" style={{ padding: "1rem" }}>
              <h1>Canada Federal Election Viewer (2004–2021)</h1>
              <p id='about'>
                Explore Canadian federal election results by riding and region. Search by riding name or number, hover over each riding to see vote percentages, and view historical trends by party and region.
              </p>
            </div>
            <h2 id='electionTitle'>Canada Election - {selectedElection}</h2>
            <div id="electionSelector" className="mb-4">
              <label htmlFor="electionSelector" style={{margin: '10px'}}>Select Election:</label>
              <select
                className="form-select w-auto"
                onChange={(e) => setSelectedElection(e.target.value)}
                value={selectedElection}
              >
                <option value="2021">44th Federal Election - 2021</option>
                <option value="2019">43rd Federal Election - 2019</option>
                <option value="2015">42nd Federal Election - 2015</option>
                <option value="2011">41st Federal Election - 2011</option>
                <option value="2008">40th Federal Election - 2008</option>
                <option value="2006">39th Federal Election - 2006</option>
                <option value="2004">38th Federal Election - 2004</option>
              </select>
            </div>

            <div id="overview">
              <Overview
               
                allResultsByDistrict={allResultsByDistrict}
                percentageOfVoteByRegion={percentageOfVoteByRegion}
                allPercentageOfVoteByRegion={allPercentageOfVoteByRegion}
                numberOfVoteByRegion={numberOfVoteByRegion}
                allNumberOfVoteByRegion={allNumberOfVoteByRegion}
                selectedElection={selectedElection}

              />
            </div>
            <MapController
              resultByRiding={candidatesByRiding}
              resultByDistrict={allResultsByDistrict[selectedElection]}
              selectedElection={selectedElection}
            />
          </div>
        </header>
      </div>
    </>
    
  );
}

export default App;
