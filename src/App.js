import React, { useState, useEffect } from 'react';
import ElectionMap from './components/electionMapView/ElectionMap';
import RidingBarChart from './components/electionMapView/RidingBarChart';
import { RidingTable } from './components/electionMapView/RidingTable';
// import { RegionSeatBarChart } from './components/RegionSeatBarChart';
// import { RegionVoteBarChart } from './components/RegionVoteBarChart';
import { Overview } from './components/regionOverview/Overview';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [resultByRiding, setResultByRiding] = useState([]);
  const [resultByRegion, setResultByRegion] = useState([]);
  const [percentageOfVoteByRegion, setPercentageOfVoteByRegion] = useState([]);
  const [numberOfVoteByRegion, setNumberOfVoteByRegion] = useState([]);
  const [selectedRiding, setSelectedRiding] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(["Total"]);


  useEffect(() => {
    d3.json(process.env.PUBLIC_URL + '/data/CA2021/2021result.json').then(setResultByRiding);
    d3.json(process.env.PUBLIC_URL + '/data/CA2021/resultByDistrict.json').then(setResultByRegion);
    d3.json(process.env.PUBLIC_URL + '/data/CA2021/percentageOfVoteByRegion.json').then(setPercentageOfVoteByRegion);
    d3.json(process.env.PUBLIC_URL + '/data/CA2021/numberOfVoteByRegion.json').then(setNumberOfVoteByRegion);
  }, []);

  
  return (
    <div className="App">
      <header className="App-header">
        <div className="container-fluid">
          <h1 className="title">Canada Election 2021</h1>
          <div id="overview">   
            <h2 className="description">Overview of the election results.</h2>
            <select id="regionSelector" onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="Total">Canada (Total)</option>
              <option value="N.L.">Newfoundland and Labrador</option>
              <option value="P.E.I.">Prince Edward Island</option>
              <option value="N.S.">Nova Scotia</option>
              <option value="N.B.">New Brunswick</option>
              <option value="Que.">Quebec</option>
              <option value="Ont.">Ontario</option>
              <option value="Man.">Manitoba</option>
              <option value="Sask.">Saskatchewan</option>
              <option value="Alta.">Alberta</option>
              <option value="B.C.">British Columbia</option>
              <option value="Y.T.">Yukon</option>
              <option value="N.W.T.">Northwest Territories</option>
              <option value="Nun.">Nunavut</option>
            </select>
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
                selectedRegion={selectedRegion}
                resultByRegion={resultByRegion}
                percentageOfVoteByRegion={percentageOfVoteByRegion}
                numberOfVoteByRegion={numberOfVoteByRegion}
              />
          
          </div>
          <input type="text" id="ridingSearch" placeholder="Search by riding name or number..." />
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
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
