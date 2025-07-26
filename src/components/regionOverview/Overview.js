import React, { useEffect, useMemo, useRef, useState } from "react";
import { RegionSeatChart } from "./RegionSeatChart";
import { RegionVoteChart } from "./RegionVoteChart";
import { DetailModal } from "./DetailModal";
import { FederalResult } from "./FederalResult";
import { HistoricalSeats } from "./HistoricalSeats";
import { HistoricalVote } from "./HistoricalVote";
import './Overview.css';

export const Overview = ({allResultsByDistrict, allPercentageOfVoteByRegion, allNumberOfVoteByRegion, percentageOfVoteByRegion, numberOfVoteByRegion, selectedElection}) => {
    const [selectedRegion, setSelectedRegion] = useState("Total");
    const [showDetails, setShowDetails] = useState(false);
    const [chartType, setChartType] = useState("barChart");
    const [seatOrVote, setSeatOrVote] = useState("seat");
    const resultByDistrict = allResultsByDistrict[selectedElection];


    //calculate regional Seats
    const provinces = ["Newfoundland and Labrador", "Prince Edward Island", 
        "Nova Scotia", "New Brunswick", "Quebec", "Ontario",
        "Manitoba", "Saskatchewan", "Alberta", "British Columbia",
        "Yukon", "Northwest Territories", "Nunavut", "Total"
    ];
    const provinceNameTable = {"Total": "Total", "N.L.": "Newfoundland and Labrador", "P.E.I.": "Prince Edward Island",
        "N.S.": "Nova Scotia", "N.B.": "New Brunswick", "Que.": "Quebec", "Ont.": "Ontario",
        "Man.": "Manitoba", "Sask.": "Saskatchewan", "Alta.": "Alberta", "B.C.": "British Columbia",
        "Y.T.": "Yukon", "N.W.T.": "Northwest Territories", "Nun.": "Nunavut"};

    let selectedProvince = provinceNameTable[selectedRegion];

    //calculate regional Vote/Seats overtime
    const { voteByRegionOvertime } = React.useMemo(() => {
        if (!allNumberOfVoteByRegion || !allPercentageOfVoteByRegion ||
            !Object.keys(allNumberOfVoteByRegion).length ||
            !Object.keys(allPercentageOfVoteByRegion).length) {
            return { voteByRegionOvertime: {} };
        }

        let voteByRegionOvertime = {};
        // Initialize result structure
        const jurisdictions = [
            "N.L.", "P.E.I.", "N.S.", "N.B.", "Que.", "Ont.",
            "Man.", "Sask.", "Alta.", "B.C.", "Y.T.", "N.W.T.", "Nun.",
            "Total"
        ];

        jurisdictions.forEach(jurisdiction => {
            voteByRegionOvertime[jurisdiction] = {};
        });

        //calculate the total vote for each party
        let partyVoteTotalCounter = {};

        Object.entries(allNumberOfVoteByRegion).forEach(([year, numberOfVoteByRegion]) => {
            
            partyVoteTotalCounter[year] = {};
            numberOfVoteByRegion.forEach(party => {
                let partyName = party["Political affiliation"];
                if (!partyVoteTotalCounter[year][partyName]) {
                    partyVoteTotalCounter[year][partyName] = 0;
                }
                Object.keys(party).forEach(key => {
                    if (key.includes("Valid Votes")) {
                        partyVoteTotalCounter[year][partyName] += party[key];
                    }
                });
            });
            
            
            allPercentageOfVoteByRegion[year].forEach(party => {
                let partyName = party["Political affiliation"];
                
                jurisdictions.forEach(jurisdiction => {
                    const keyOfPercentage = Object.keys(party).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                    let numberOfVotesJurisdiction = allNumberOfVoteByRegion[year].find(vote => vote["Political affiliation"] === partyName);
                    // 🛑 Fix starts here
                    if (!numberOfVotesJurisdiction) return;
                    const keyOfNumberOfVotes = Object.keys(numberOfVotesJurisdiction).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                    const numberOfVotes = numberOfVotesJurisdiction[keyOfNumberOfVotes];
                    if (jurisdiction !== "Total") {
                        // ✅ Skip parties with 0 or undefined votes
                        if (numberOfVotes > 0) {
                            if (!voteByRegionOvertime[jurisdiction][year]) {
                                voteByRegionOvertime[jurisdiction][year] = {};
                            }
                            voteByRegionOvertime[jurisdiction][year][partyName] = {
                                party: partyName,
                                percentageOfVote: party[keyOfPercentage],
                                numberOfVote: numberOfVotes
                            };
                        }
                    } else {    // if total, filter out parties with 0 seat
                        if (partyVoteTotalCounter[year][partyName] && partyVoteTotalCounter[year][partyName] > 0) {
                            if (!voteByRegionOvertime[jurisdiction][year]) {
                                voteByRegionOvertime[jurisdiction][year] = {};
                            }
                            voteByRegionOvertime[jurisdiction][year][partyName] = {
                                party: partyName,
                                percentageOfVote: party[keyOfPercentage],
                                numberOfVote: partyVoteTotalCounter[year][partyName] 
                            };
                        }
                    }
                });
            });
            
        }) 
        return {voteByRegionOvertime};
    }, [allNumberOfVoteByRegion, allPercentageOfVoteByRegion])


    

    
    const {selectedRegionVote } = React.useMemo(() => {
        //let selectedRegionSeats = seatsByRegion[selectedProvince];
        const selectedRegionVote = voteByRegionOvertime[selectedRegion]?.[selectedElection] ?? {};

        //console.log(selectedRegionSeats)
        return {selectedRegionVote};
    }, [selectedRegion, voteByRegionOvertime, selectedElection]);


    // Calculate historical Seat Results
    const seatsByRegionOverTime = React.useMemo(() => {
        const result = {};

        // Initialize result structure
        provinces.forEach(prov => result[prov] = {});

        Object.entries(allResultsByDistrict).forEach(([year, districtResults]) => {

            // Initialize each province for this year
            provinces.forEach(prov => {
            result[prov][year] = {
                Conservative: 0,
                Liberal: 0,
                NDP: 0,
                Bloc: 0,
                Green: 0,
                Independent: 0,
                Total: 0
            };
            });

            districtResults.forEach(d => {
                const prov = d.Province;
                const elected = d["Elected Candidate"];
                let partyKey = null;

                if (elected.includes("Conservative")) partyKey = "Conservative";
                else if (elected.includes("Liberal")) partyKey = "Liberal";
                else if (elected.includes("NDP")) partyKey = "NDP";
                else if (elected.includes("Bloc")) partyKey = "Bloc";
                else if (elected.includes("Green")) partyKey = "Green";
                else if (elected.includes("Independent")) partyKey = "Independent";

                if (partyKey && result[prov][year]) {
                    result[prov][year][partyKey]++;
                    result[prov][year].Total++;
                    result["Total"][year][partyKey]++;
                    result["Total"][year].Total++;
                }
            });
        });

        return result;
    }, [allResultsByDistrict]);

    let selectedRegionSeats = seatsByRegionOverTime[selectedProvince]?.[selectedElection] ?? {};
    let fixedYDomain = Object.entries(seatsByRegionOverTime["Total"][selectedElection])
            .filter(([party, count]) => party !== "Total" && count > 0)
            .map(([party]) => party);
    

    const transformSeatData = (rawData) => {
        return Object.entries(rawData).map(([year, parties]) => {
            const entry = { election: year };
            for (const party in parties) {
            if (party !== "Total") {
                entry[party] = parties[party];
            }
            }
            return entry;
        });
    };



    const formattedHistoricalSeatData = useMemo(() => {
        return transformSeatData(seatsByRegionOverTime[selectedProvince]);
    }, [seatsByRegionOverTime, selectedProvince]);

   // console.log(voteByRegionOvertime);
   // console.log(voteByRegionOvertime[selectedRegion])
    


    function chartButtonHandler() {
        setChartType(prev => prev === "barChart" ? "pieChart" : "barChart");
    }

   const isDataReady = Array.isArray(resultByDistrict) &&
    resultByDistrict.length > 0 &&
    Object.keys(allNumberOfVoteByRegion ?? {}).length > 0 &&
    Object.keys(allPercentageOfVoteByRegion ?? {}).length > 0 &&
    Object.keys(allResultsByDistrict ?? {}).length > 0;



    if (!isDataReady) {
    return <p>Loading...</p>;
    }

    return (
        <div id="overview">  
            {/* <p className="description" id="overviewTitle">Overview of the election result</p>  */}
            <div id="federalOverview">
                <FederalResult 
                    selectedElection={selectedElection}
                />
            </div>
            <div className="region-selector">
                <h4 id="regionBreakdown">Regional breakdown</h4>
                    <label htmlFor="regionSelector" id="regionSelectorLabel">Select a region</label>
                <div id="selectorRow">
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
                    <button id="chartButton" onClick={chartButtonHandler}>
                        Switch to {chartType === "barChart" ? "Pie Chart" : "Bar Chart"}
                    </button>
                </div>
            </div>
            <div id="regionalView">
                <div id="overviewChart" className="row">
                    <div className="col-12 col-md-6">
                        <label className="chartLabel">Seats – {selectedRegion}</label><br/>
                        <RegionSeatChart 
                            fixedYDomain={fixedYDomain}
                            selectedRegion={selectedRegion}
                            selectedRegionSeats={selectedRegionSeats}
                            chartType={chartType}
                        />
                    </div>
                    <div className="col-12 col-md-6"> 
                        <label className="chartLabel">Popular Vote – {selectedRegion}</label><br/>
                        <RegionVoteChart 
                            selectedRegionVote={selectedRegionVote}
                            chartType={chartType}
                        />
                    </div>
                </div>
            </div>
            {showDetails &&
                <DetailModal 
                    selectedRegionVote={selectedRegionVote}
                    selectedRegion={selectedProvince}
                />
            } 
            <button onClick={() => setShowDetails(!showDetails)} id="detailButton">
              {showDetails ? "Less Details": "More Details"}
            </button>
            
            <div id="historicalResult">
                <h5 id="historicalTitle">Historical Result</h5>
                <div className="toggle-container">
                    <span className={`toggle-label-left ${seatOrVote === "seat" ? "active" : ""}`}>Seat</span>
                    <label className="switch">
                        <input
                        type="checkbox"
                        checked={seatOrVote === "vote"}
                        onChange={() => setSeatOrVote(seatOrVote === "seat" ? "vote" : "seat")}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className={`toggle-label-right ${seatOrVote === "vote" ? "active" : ""}`}>Vote</span>
                </div>
                <div id="historicalChart">
                    {seatOrVote === "seat" ?
                        <HistoricalSeats
                            data={formattedHistoricalSeatData}
                        /> :   
                        <HistoricalVote
                            data={voteByRegionOvertime[selectedRegion]}
                        />
                    }   
                </div>     
            </div>
        </div>);
}