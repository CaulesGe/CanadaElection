import React, { useState } from "react";
import { RegionSeatChart } from "./RegionSeatChart";
import { RegionVoteChart } from "./RegionVoteChart";
import { DetailModal } from "./DetailModal";
import { FederalResult } from "./FederalResult";
import { HistoricalSeats } from "./HistoricalSeats";
import { Helmet } from 'react-helmet';
import './Overview.css';

export const Overview = ({allResultsByDistrict , percentageOfVoteByRegion, numberOfVoteByRegion, selectedElection}) => {
    const [selectedRegion, setSelectedRegion] = useState("Total");
    const [showDetails, setShowDetails] = useState(false);
    const [chartType, setChartType] = useState("barChart");
    const resultByDistrict = allResultsByDistrict[selectedElection];

    //calculate regional Vote
    // console.log("Selected election:", selectedElection);
    // console.log("Liberal vote row:", numberOfVoteByRegion.find(d => d["Political affiliation"] === "Liberal Party of Canada"));
    //console.log(allResultsByDistrict);

    const { voteByRegion } = React.useMemo(() => {
        if (!numberOfVoteByRegion.length || !percentageOfVoteByRegion.length) {
            return { voteByRegion: {} };
        }
        
        let voteByRegion = {};
        let partyVoteTotalCounter = {};
        const jurisdictions = [
            "N.L.", "P.E.I.", "N.S.", "N.B.", "Que.", "Ont.",
            "Man.", "Sask.", "Alta.", "B.C.", "Y.T.", "N.W.T.", "Nun.",
            "Total"
        ];

        jurisdictions.forEach(jurisdiction => {
            voteByRegion[jurisdiction] = [];
        });

        //calculate the total vote for each party
        
        numberOfVoteByRegion.forEach(party => {
            let partyName = party["Political affiliation"];
            if (!partyVoteTotalCounter[partyName]) {
                partyVoteTotalCounter[partyName] = 0;
            }
            Object.keys(party).forEach(key => {
                if (key.includes("Valid Votes")) {
                    partyVoteTotalCounter[partyName] += party[key];
                }
            });
        });

        percentageOfVoteByRegion.forEach(party => {
            let partyName = party["Political affiliation"];
            
            jurisdictions.forEach(jurisdiction => {
                const keyOfPercentage = Object.keys(party).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                let numberOfVotesJurisdiction = numberOfVoteByRegion.find(vote => vote["Political affiliation"] === partyName);
                // 🛑 Fix starts here
                if (!numberOfVotesJurisdiction) return;
                const keyOfNumberOfVotes = Object.keys(numberOfVotesJurisdiction).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                const numberOfVotes = numberOfVotesJurisdiction[keyOfNumberOfVotes];
                if (jurisdiction !== "Total") {
                    // ✅ Skip parties with 0 or undefined votes
                    if (numberOfVotes > 0) {
                        voteByRegion[jurisdiction].push({
                            party: partyName,
                            percentageOfVote: party[keyOfPercentage],
                            numberOfVote: numberOfVotes
                        });
                    }
                } else {
                    if (partyVoteTotalCounter[partyName] > 0) {
                        voteByRegion[jurisdiction].push({
                            party: partyName,
                            percentageOfVote: party[keyOfPercentage],
                            numberOfVote: partyVoteTotalCounter[partyName] 
                        });
                    }
                }
            });
        });

        Object.keys(voteByRegion).forEach(jurisdiction => {
            voteByRegion[jurisdiction].sort((a, b) => b.numberOfVote - a.numberOfVote); // Sort by percentage
        });
        return {voteByRegion};
    }, [numberOfVoteByRegion, percentageOfVoteByRegion]);
    
    
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

    // const { seatsByRegion, fixedYDomain } = React.useMemo(() => {
    //     let seatsByRegion = {};
    //     provinces.forEach(province => {
    //         seatsByRegion[province] = {
    //             Total: 0,
    //             Conservative: 0,
    //             Liberal: 0,
    //             NDP: 0,
    //             Bloc: 0,
    //             Green: 0,
    //             PPC: 0,
    //             Independent: 0
    //         };
    //     });
    
    //     resultByDistrict.forEach(district => {
    //         let province = district.Province;
    //         if (district["Elected Candidate"].includes("Conservative")) {
    //             seatsByRegion[province].Conservative++;
    //             seatsByRegion["Total"].Conservative++;
    //         } else if (district["Elected Candidate"].includes("Liberal")) {
    //             seatsByRegion[province].Liberal++;
    //             seatsByRegion["Total"].Liberal++;
    //         } else if (district["Elected Candidate"].includes("NDP")) {
    //             seatsByRegion[province].NDP++;
    //             seatsByRegion["Total"].NDP++;
    //         } else if (district["Elected Candidate"].includes("Bloc")) {
    //             seatsByRegion[province].Bloc++;
    //             seatsByRegion["Total"].Bloc++;
    //         } else if (district["Elected Candidate"].includes("Green")) {
    //             seatsByRegion[province].Green++;
    //             seatsByRegion["Total"].Green++;
    //         } else if (district["Elected Candidate"].includes("PPC")) {
    //             seatsByRegion[province].PPC++;
    //             seatsByRegion["Total"].PPC++;
    //         } else if (district["Elected Candidate"].includes("Independent")) {
    //             seatsByRegion[province].Independent++;
    //             seatsByRegion["Total"].Independent++;
    //         }
    //         seatsByRegion[province].Total++;
    //         seatsByRegion["Total"].Total++;
    //     });
    
    //     let fixedYDomain = Object.entries(seatsByRegion["Total"])
    //         .filter(([party, count]) => party !== "Total" && count > 0)
    //         .map(([party]) => party);
    
    //     return { seatsByRegion, fixedYDomain };
    // }, [resultByDistrict]);

    let selectedProvince = provinceNameTable[selectedRegion];

    
    const {selectedRegionVote } = React.useMemo(() => {
        //let selectedRegionSeats = seatsByRegion[selectedProvince];
        let selectedRegionVote = voteByRegion[selectedRegion];
        //console.log(selectedRegionSeats)
        return {selectedRegionVote};
    }, [selectedRegion, voteByRegion]);


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

    let selectedSeats = seatsByRegionOverTime[selectedProvince][selectedElection];
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

    const formattedData = transformSeatData(seatsByRegionOverTime[selectedProvince]);


    function chartButtonHandler() {
        setChartType(prev => prev === "barChart" ? "pieChart" : "barChart");
    }

    const isDataReady = resultByDistrict.length > 0 && numberOfVoteByRegion.length > 0 && percentageOfVoteByRegion.length > 0 && Object.keys(allResultsByDistrict).length > 0;


    if (!isDataReady) {
    return <p>Loading...</p>;
    }

    return (
        <>  
            {/* <Helmet>
                <title> Regional Election Results</title>
                <meta name="description" content={`View election results by region with pieChart and barChart, including vote shares and seats.`} />
            </Helmet> */}
            <p className="description" id="overviewTitle">Overview of the election result</p> 
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
                <div id="chartTitleRow">
                    <h5>Seats – {selectedRegion}</h5>
                    <h5>Popular Vote – {selectedRegion}</h5>
                </div>
                <div id="overviewChart">
                    <RegionSeatChart 
                        fixedYDomain={fixedYDomain}
                        selectedRegion={selectedRegion}
                        selectedRegionSeats={selectedSeats}
                        chartType={chartType}
                    />
                    <RegionVoteChart 
                        selectedRegionVote={selectedRegionVote}
                        chartType={chartType}
                    />
                </div>
            </div>
            {showDetails &&
                <DetailModal 
                    selectedRegionVote={selectedRegionVote}
                    selectedRegion={selectedProvince}
                />
            } 
            <button onClick={() => setShowDetails(!showDetails)} style={{ marginTop: "20px" }}>
              {showDetails ? "Less Details": "More Details"}
            </button>
            <div>
                <HistoricalSeats
                    data={formattedData}
                />
            </div>
            
        </>);
}