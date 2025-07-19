import React, { useState, useEffect } from 'react';
import { MapController } from './components/electionMapView/MapController';
import { Overview } from './components/regionOverview/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [candidatesByRiding, setCandidatesByRiding] = useState([]);
  const [resultByDistrict, setResultByDistrict] = useState([]);
  const [percentageOfVoteByRegion, setPercentageOfVoteByRegion] = useState([]);
  const [numberOfVoteByRegion, setNumberOfVoteByRegion] = useState([]);
  const [selectedElection, setSelectedElection] = useState('44thCA2021');

  useEffect(() => {
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/allCandidatesResult.json`)
      .then(data => setCandidatesByRiding(data));

    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/resultByDistrict.json`)
      .then(data => setResultByDistrict(data));

    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/percentageOfVoteByRegion.json`)
      .then(data => setPercentageOfVoteByRegion(data));

    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/numberOfVoteByRegion.json`)
      .then(data => setNumberOfVoteByRegion(data));
  }, [selectedElection]);

  return (
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
              <option value="44thCA2021">44th Federal Election - 2021</option>
              <option value="43rdCA2019">43rd Federal Election - 2019</option>
              <option value="42ndCA2015">42nd Federal Election - 2015</option>
              <option value="41stCA2011">41st Federal Election - 2011</option>
              <option value="40thCA2008">40th Federal Election - 2008</option>
              <option value="39thCA2006">39th Federal Election - 2006</option>
              <option value="38thCA2004">38th Federal Election - 2004</option>
            </select>
          </div>

          <div id="overview">
            <Overview
              resultByDistrict={resultByDistrict}
              percentageOfVoteByRegion={percentageOfVoteByRegion}
              numberOfVoteByRegion={numberOfVoteByRegion}
              selectedElection={selectedElection}
            />
          </div>

          <MapController
            resultByRiding={candidatesByRiding}
            resultByDistrict={resultByDistrict}
            selectedElection={selectedElection}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
