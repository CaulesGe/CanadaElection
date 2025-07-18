import React, { useState } from "react";
import { RegionSeatBarChart } from "./RegionSeatBarChart";
import { RegionVoteBarChart } from "./RegionVoteBarChart";
import { DetailModal } from "./DetailModal";
import { FederalResult } from "./FederalResult";
import './Overview.css';

export const Overview = ({resultByDistrict, percentageOfVoteByRegion, numberOfVoteByRegion, selectedElection}) => {
    const [selectedRegion, setSelectedRegion] = useState(["Total"]);

    const [showDetails, setShowDetails] = useState(false);

    //calculate regional Vote
    // console.log("Selected election:", selectedElection);
    // console.log("Liberal vote row:", numberOfVoteByRegion.find(d => d["Political affiliation"] === "Liberal Party of Canada"));


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

    const { seatsByRegion, fixedYDomain } = React.useMemo(() => {
        let seatsByRegion = {};
        provinces.forEach(province => {
            seatsByRegion[province] = {
                Total: 0,
                Conservative: 0,
                Liberal: 0,
                NDP: 0,
                Bloc: 0,
                Green: 0,
                PPC: 0,
                Independent: 0
            };
        });
    
        resultByDistrict.forEach(district => {
            let province = district.Province;
            if (district["Elected Candidate"].includes("Conservative")) {
                seatsByRegion[province].Conservative++;
                seatsByRegion["Total"].Conservative++;
            } else if (district["Elected Candidate"].includes("Liberal")) {
                seatsByRegion[province].Liberal++;
                seatsByRegion["Total"].Liberal++;
            } else if (district["Elected Candidate"].includes("NDP")) {
                seatsByRegion[province].NDP++;
                seatsByRegion["Total"].NDP++;
            } else if (district["Elected Candidate"].includes("Bloc")) {
                seatsByRegion[province].Bloc++;
                seatsByRegion["Total"].Bloc++;
            } else if (district["Elected Candidate"].includes("Green")) {
                seatsByRegion[province].Green++;
                seatsByRegion["Total"].Green++;
            } else if (district["Elected Candidate"].includes("PPC")) {
                seatsByRegion[province].PPC++;
                seatsByRegion["Total"].PPC++;
            } else if (district["Elected Candidate"].includes("Independent")) {
                seatsByRegion[province].Independent++;
                seatsByRegion["Total"].Independent++;
            }
            seatsByRegion[province].Total++;
            seatsByRegion["Total"].Total++;
        });
    
        let fixedYDomain = Object.entries(seatsByRegion["Total"])
            .filter(([party, count]) => party !== "Total" && count > 0)
            .map(([party]) => party);
    
        return { seatsByRegion, fixedYDomain };
    }, [resultByDistrict]);

    let selectedProvince = provinceNameTable[selectedRegion];

    
    const { selectedRegionSeats, selectedRegionVote } = React.useMemo(() => {
        let selectedRegionSeats = seatsByRegion[selectedProvince];
        let selectedRegionVote = voteByRegion[selectedRegion];
        return {selectedRegionSeats, selectedRegionVote};
    }, [selectedRegion, seatsByRegion, voteByRegion]);

    return (
        <>  <div id="federalOverview">
                <h2 className="description">Overview of the election results</h2>
                
            </div>
            <FederalResult 
                selectedElection={selectedElection}
            />
            <div className="region-selector">
                <h4 id="regionBreakdown">Regional breakdown</h4>
                <label htmlFor="regionSelector" id="regionSelectorLabel">Select a region</label>
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
            </div>
            <div id="overviewChart">
                <RegionSeatBarChart 
                    fixedYDomain={fixedYDomain}
                    selectedRegionSeats={selectedRegionSeats}
                    selectedRegion={selectedRegion}
                />
                <RegionVoteBarChart 
                    selectedRegionVote={selectedRegionVote}
                    selectedRegion={selectedRegion}
                />
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
        </>);
}