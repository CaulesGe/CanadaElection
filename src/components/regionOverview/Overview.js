import React, { useState } from "react";
import { RegionSeatBarChart } from "./RegionSeatBarChart";
import { RegionVoteBarChart } from "./RegionVoteBarChart";
import { DetailModal } from "./DetailModal";

export const Overview = ({selectedRegion, resultByRegion, percentageOfVoteByRegion, numberOfVoteByRegion}) => {

    const [showDetails, setShowDetails] = useState(false);

    //calculate regional Vote
    const { voteByRegion } = React.useMemo(() => {
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
            let partyName = party["Political affiliation/Appartenance politique"];
            if (!partyVoteTotalCounter[partyName]) {
                partyVoteTotalCounter[partyName] = 0;
            }
            Object.keys(party).forEach(key => {
                if (key.includes("Valid Votes/Votes valides")) {
                    partyVoteTotalCounter[partyName] += party[key];
                }
            });
        });

        percentageOfVoteByRegion.forEach(party => {
            let partyName = party["Political affiliation/Appartenance politique"];
            
            jurisdictions.forEach(jurisdiction => {
                const keyOfPercentage = Object.keys(party).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                let numberOfVotesJurisdiction = numberOfVoteByRegion.find(vote => vote["Political affiliation/Appartenance politique"] === partyName);
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
    const provinces = ["Newfoundland and Labrador/Terre-Neuve-et-Labrador", "Prince Edward Island/Île-du-Prince-Édouard", 
        "Nova Scotia/Nouvelle-Écosse", "New Brunswick/Nouveau-Brunswick", "Quebec/Québec", "Ontario",
        "Manitoba", "Saskatchewan", "Alberta", "British Columbia/Colombie-Britannique",
        "Yukon", "Northwest Territories/Territoires du Nord-Ouest", "Nunavut", "Total"
    ];
    const provinceNameTable = {"Total": "Total", "N.L.": "Newfoundland and Labrador/Terre-Neuve-et-Labrador", "P.E.I.": "Prince Edward Island/Île-du-Prince-Édouard",
        "N.S.": "Nova Scotia/Nouvelle-Écosse", "N.B.": "New Brunswick/Nouveau-Brunswick", "Que.": "Quebec/Québec", "Ont.": "Ontario",
        "Man.": "Manitoba", "Sask.": "Saskatchewan", "Alta.": "Alberta", "B.C.": "British Columbia/Colombie-Britannique",
        "Y.T.": "Yukon", "N.W.T.": "Northwest Territories/Territoires du Nord-Ouest", "Nun.": "Nunavut"};

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
    
        resultByRegion.forEach(district => {
            let province = district.Province;
            if (district["Elected Candidate/Candidat élu"].includes("Conservative")) {
                seatsByRegion[province].Conservative++;
                seatsByRegion["Total"].Conservative++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Liberal")) {
                seatsByRegion[province].Liberal++;
                seatsByRegion["Total"].Liberal++;
            } else if (district["Elected Candidate/Candidat élu"].includes("NDP")) {
                seatsByRegion[province].NDP++;
                seatsByRegion["Total"].NDP++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Bloc")) {
                seatsByRegion[province].Bloc++;
                seatsByRegion["Total"].Bloc++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Green")) {
                seatsByRegion[province].Green++;
                seatsByRegion["Total"].Green++;
            } else if (district["Elected Candidate/Candidat élu"].includes("PPC")) {
                seatsByRegion[province].PPC++;
                seatsByRegion["Total"].PPC++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Independent")) {
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
    }, [resultByRegion]);

    let selectedProvince = provinceNameTable[selectedRegion];

    const { selectedRegionSeats, selectedRegionVote } = React.useMemo(() => {
        let selectedRegionSeats = seatsByRegion[selectedProvince];
        let selectedRegionVote = voteByRegion[selectedRegion];
        return {selectedRegionSeats, selectedRegionVote};
    }, [selectedRegion, seatsByRegion, voteByRegion]);

    return (
        <>
            <div id="overview-chart">
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