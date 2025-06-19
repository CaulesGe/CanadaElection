import React, { useState, useEffect } from 'react';
import ElectionMap from './components/ElectionMap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.json(process.env.PUBLIC_URL + '/data/CA2021/2021result.json').then(setData);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="container-fluid">
          <h1 className="title">Canada Election 2021</h1>
          <div id="overview">   
            <h2 className="description">Overview of the election results.</h2>
            <select id="regionSelector">
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
            <div id="overview-chart"></div>
            <button id="moreDetailsButton">More Details</button>
          </div>
          <input type="text" id="ridingSearch" placeholder="Search by riding name or number..." />
          <div className="row" id='mapContainer'>
            <div className="col-12 col-md-8">  
              <p className="title">Click on the map to select a region.</p>
              <ElectionMap electionData={data} />       
            </div>
            <div id="detail" className="col-12 col-md-4">
              <h4 id="province">Province Name</h4>
              <h4 id="ridingName">Riding Name</h4>
            </div>
          </div>
          <h2 className="title">Riding Results</h2>
          <div id="ridingDetailContainer">
            <table id="ridingDetailTable">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Party</th>
                  <th>Vote %</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows will be inserted dynamically */}
              </tbody>
            </table>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
