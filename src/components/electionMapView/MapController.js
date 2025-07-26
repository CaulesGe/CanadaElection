import * as d3 from 'd3';
import Select from 'react-select';
import './MapController.css';

import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { ElectionMap20132023 } from './ElectionMap2013-2023';
// import { ElectionMapPrev2013 } from './ElectionMapPrev2013';
import { ElectionMap } from './ElectionMap';
import {RidingBarChart} from './RidingBarChart';
import { RidingTable } from './RidingTable';

export const MapController = ({resultByRiding, resultByDistrict, selectedElection}) => {
    const mapRef = useRef(null);
   // const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    const candidatesByRiding = Array.from(
        d3.group(resultByRiding, d => d["Electoral District Number"]),
        ([key, value]) => ({ key, value })
    );

    // All options for the Select dropdown
    const ridingOptions = useMemo(() => {
        return resultByDistrict.map(r => ({
            value: r["Electoral District Number"],
            label: `${r["Electoral District Number"]} — ${r["Electoral District Name"]}`
        }));
    }, [resultByDistrict]);

    if (!selectedElection || !resultByRiding.length || !resultByDistrict.length) {
        return <div>Loading map...</div>; // or null
    }

    return (
        <div id='mapController'>
            <h3 id='ridingMapTitle'>Riding Map</h3>
            <div id="ridingSearch" >
                <Select
                    options={ridingOptions}
                    classNamePrefix="custom-select"
                    placeholder="Search by riding name or number..."
                    isClearable
                    onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        const districtNumber = selectedOption.value;

                        const selectedRidingCandidates = candidatesByRiding.find(
                            c => c.key == districtNumber
                        );

                        setSelectedCandidates(selectedRidingCandidates?.value || []);

                        // zoom to the riding
                        if (mapRef.current?.zoomToRiding) {
                            mapRef.current.zoomToRiding(districtNumber);
                        }
                    }}
                />
            </div>
            
            <div className="row" id='mapContainer'>
                <div className="col-12 col-md-7" id='map'>  
                    <p id='mapLabel'>Click on the map to select a region.</p>
                    <ElectionMap
                        selectedElection={selectedElection}
                        electionData={resultByRiding}
                        setSelectedCandidates={setSelectedCandidates}
                        mapRef={mapRef}
                    />
                </div>
                <div id="ridingBarChart" className="col-12 col-md-4">
                    <RidingBarChart
                        candidates={selectedCandidates}
                    />
                </div>
            </div>
            <div id="ridingDetailContainer">
                <RidingTable 
                    candidates={selectedCandidates}
                />
            </div>
        </div>);
}