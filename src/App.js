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


  useEffect(() => {
    d3.json(process.env.PUBLIC_URL + '/data/44thCA2021/2021result.json').then(setCandidatesByRiding);
    d3.json(process.env.PUBLIC_URL + '/data/44thCA2021/resultByDistrict.json').then(setResultByDistrict);
    d3.json(process.env.PUBLIC_URL + '/data/44thCA2021/percentageOfVoteByRegion.json').then(setPercentageOfVoteByRegion);
    d3.json(process.env.PUBLIC_URL + '/data/44thCA2021/numberOfVoteByRegion.json').then(setNumberOfVoteByRegion);
  }, []);

  
  return (
    <div className="App">
      <header className="App-header">
        <div className="container-fluid">
          <h1 className="title">Canada Election 2021</h1>
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
                resultByRegion={resultByDistrict}
                percentageOfVoteByRegion={percentageOfVoteByRegion}
                numberOfVoteByRegion={numberOfVoteByRegion}
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
          />
        </div>
      </header>
    </div>
  );
}

export default App;
