import React, { useState, useEffect } from 'react';
// import ElectionMap from './components/electionMapView/ElectionMap';
// import RidingBarChart from './components/electionMapView/RidingBarChart';
// import { RidingTable } from './components/electionMapView/RidingTable';
// import { RegionSeatBarChart } from './components/RegionSeatBarChart';
import { MapController } from './components/electionMapView/MapController';
// import { RegionVoteBarChart } from './components/RegionVoteBarChart';
import { Overview } from './components/regionOverview/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [candidatesByRiding, setCandidatesByRiding] = useState([]);
  const [resultByDistrict, setResultByDistrict] = useState([]);
  const [percentageOfVoteByRegion, setPercentageOfVoteByRegion] = useState([]);
  const [numberOfVoteByRegion, setNumberOfVoteByRegion] = useState([]);
  // const [selectedRiding, setSelectedRiding] = useState(null);
  // const [selectedCandidates, setSelectedCandidates] = useState([]);
  //const [selectedRegion, setSelectedRegion] = useState(["Total"]);
  const [selectedElection, setSelectedElection] = useState(['44thCA2021']);

  function cleanKeys(data) {
    return data.map(entry => {
      const cleaned = {};
      Object.entries(entry).forEach(([key, value]) => {
        const newKey = key.split('/')[0].trim();
        let newValue = value;

        if (typeof value === 'string' && value.includes('/')) {
        newValue = value.split('/')[0].trim(); // Remove everything after `/` in string value
        }
        cleaned[newKey] = newValue;
      });
      return cleaned;
    });
  }
  
  useEffect(() => {
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/allCandidatesResult.json`)
      .then(data => setCandidatesByRiding(cleanKeys(data)));
  
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/resultByDistrict.json`)
      .then(data => setResultByDistrict(cleanKeys(data)));
  
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/percentageOfVoteByRegion.json`)
      .then(data => setPercentageOfVoteByRegion(cleanKeys(data)));
  
    d3.json(`${process.env.PUBLIC_URL}/data/${selectedElection}/numberOfVoteByRegion.json`)
      .then(data => setNumberOfVoteByRegion(cleanKeys(data)));
  }, [selectedElection]);

  
  return (
    <div className="App">
      <header className="App-header">
        <div className="container-fluid">
          <h1 className="title">Canada Election 2021</h1>
          <div id="electionSelector">
            <select onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="44thCA2021">44th Federal Election - 2021</option>
                <option value="43rdCA2019">43rd Federal Election - 2019</option>
                <option value="42ndCA2015">42nd Federal Election - 2015</option>
                <option value="41stCA2011">41st Federal Election - 2011</option>
          </select>
          </div>
          
          <div id="overview">   
              {/* <RegionSeatBarChart
                selectedRegion={selectedRegion}
                resultByDistrict={resultByRegion}
              />
              <RegionVoteBarChart
                selectedRegion={selectedRegion}
                percentageOfVoteByRegion={percentageOfVoteByRegion}
                numberOfVoteByRegion={numberOfVoteByRegion}
              /> */}
              <Overview
                resultByDistrict={resultByDistrict}
                percentageOfVoteByRegion={percentageOfVoteByRegion}
                numberOfVoteByRegion={numberOfVoteByRegion}
                selectedElection={selectedElection}
              />
          
          </div>
          {/* <input type="text" id="ridingSearch" placeholder="Search by riding name or number..." />
          <div className="row" id='mapContainer'>
            <div className="col-12 col-md-8">  
              <p className="title">Click on the map to select a region.</p>
              <ElectionMap 
                electionData={resultByRiding} 
                setSelectedRiding={setSelectedRiding} 
                setSelectedCandidates={setSelectedCandidates}
              />
       
            </div>
            <div id="detail" className="col-12 col-md-4">
              <RidingBarChart
                riding={selectedRiding}
                candidates={selectedCandidates}
            />
            </div>
          </div>
          <h2 className="title">Riding Results</h2>
          <div id="ridingDetailContainer">
            <RidingTable 
              candidates={selectedCandidates}
            />
          </div> */}
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
