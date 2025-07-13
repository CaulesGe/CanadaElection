import React, { useState, useEffect, useRef } from 'react';
import { ElectionMap } from './ElectionMap';
import {RidingBarChart} from './RidingBarChart';
import { RidingTable } from './RidingTable';

export const MapController = ({resultByRiding, setSelectedRiding, setSelectedCandidates, selectedRiding, selectedCandidates}) => {
    const mapRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);


    return (
        <>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.length > 1) {
                        const suggestions = resultByRiding.filter(
                            r =>
                            r["Electoral District Name/Nom de circonscription"].toLowerCase().includes(query.toLowerCase()) ||
                            r["Electoral District Number/Numéro de circonscription"].toString().includes(query)
                        );
                        setSearchSuggestions(suggestions.slice(0, 10)); // limit to top 10
                    } else {
                        setSearchSuggestions([]);
                    }
                }}
                placeholder="Search by riding name or number..."
            />
            <ul className="search-suggestions">
                {searchSuggestions.map(r => (
                    <li
                    key={r["Constituency Number/Numéro de circonscription"]}
                    onClick={() => {
                        setSelectedRiding(r); // update sidebar
                        setSelectedCandidates(/* logic to get candidates for this riding */);
                        setSearchQuery(""); // clear search
                        setSearchSuggestions([]);

                        // zoom to riding
                        if (mapRef.current && r.geometry) {
                            const bounds = L.geoJSON(r.geometry).getBounds();
                            mapRef.current.fitBounds(bounds);
                        }
                    }}
                    >
                    {r["Constituency Number/Numéro de circonscription"]} — {r["Constituency Name/Nom de circonscription"]}
                    </li>
                ))}
            </ul>
            <div className="row" id='mapContainer'>
                <div className="col-12 col-md-8">  
                    <p className="title">Click on the map to select a region.</p>
                    <ElectionMap 
                        electionData={resultByRiding} 
                        setSelectedRiding={setSelectedRiding} 
                        setSelectedCandidates={setSelectedCandidates}
                        mapRef={mapRef}
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
        </>);
}