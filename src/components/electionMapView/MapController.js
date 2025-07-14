import * as d3 from 'd3';
import Select from 'react-select';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ElectionMap } from './ElectionMap';
import {RidingBarChart} from './RidingBarChart';
import { RidingTable } from './RidingTable';

export const MapController = ({resultByRiding, resultByDistrict}) => {
    const mapRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
   // const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    useEffect(() => {
        if (searchQuery != "") {
            let suggestions = resultByDistrict.filter(
                r =>
                r["Electoral District Name/Nom de circonscription"].toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                r["Electoral District Number/Numéro de circonscription"].toString().startsWith(searchQuery)
            );
            //setSearchSuggestions(suggestions.slice(0, 10)); // limit to top 10
        }
    }, [searchQuery, resultByDistrict])

    const candidatesByRiding = Array.from(
        d3.group(resultByRiding, d => d["Electoral District Number/Numéro de circonscription"]),
        ([key, value]) => ({ key, value })
    );

    // All options for the Select dropdown
    const ridingOptions = useMemo(() => {
        return resultByDistrict.map(r => ({
            value: r["Electoral District Number/Numéro de circonscription"],
            label: `${r["Electoral District Number/Numéro de circonscription"]} — ${r["Electoral District Name/Nom de circonscription"]}`
        }));
    }, [resultByDistrict]);

    return (
        <>
            {/* <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                }}
                placeholder="Search by riding name or number..."
            /> */}
            {/* {searchQuery && searchSuggestions.length > 0 && (
                <ul className="search-suggestions">
                    {searchSuggestions.map(r => (
                        <li
                            key={r["Electoral District Number/Numéro de circonscription"]}
                            onClick={() => {
                                //setSelectedRiding(r);
                                const selectedRidingCandidates = candidatesByRiding.find(
                                    candidate => candidate.key == r["Electoral District Number/Numéro de circonscription"]
                                );
                                setSelectedCandidates(selectedRidingCandidates?.value || []);
                                setSearchQuery("");
                                setSearchSuggestions([]);

                                // zoom to the riding
                                if (mapRef.current?.zoomToRiding) {
                                    mapRef.current.zoomToRiding(
                                      r["Electoral District Number/Numéro de circonscription"]
                                    );
                                }
                            }}
                        >
                            {r["Electoral District Number/Numéro de circonscription"]} — {r["Electoral District Name/Nom de circonscription"]}
                        </li>
                    ))}
                </ul>
            )} */}
            <div style={{ padding: '1rem', position: 'relative', zIndex: 1000, margin: '30px' }}>
                <Select
                options={ridingOptions}
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
                <div className="col-12 col-md-8">  
                    <p className="title">Click on the map to select a region.</p>
                    <ElectionMap 
                        electionData={resultByRiding} 
                        setSelectedCandidates={setSelectedCandidates}
                        mapRef={mapRef}
                    />
                </div>
                <div id="detail" className="col-12 col-md-4">
                    <RidingBarChart
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
        </>);
}