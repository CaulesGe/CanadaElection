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
    return;
  }

  return (
    <>
      <Helmet>
        <title>Canada Election Map Viewer</title>
        <meta name="description" content="Interactive map to explore Canadian federal election results by riding and party." />
      </Helmet>
      <div className="App">
        <header className="App-header">
          <div className="container-fluid">
            <h1 className="title">Canada Election - {selectedElection}</h1>
            <div id="electionSelector" className="mb-4">
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
