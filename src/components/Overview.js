import React, { useEffect, useRef } from "react";
import { RegionSeatBarChart } from "./RegionSeatBarChart";
import { RegionVoteBarChart } from "./RegionVoteBarChart";

export const Overview = ({selectedRegion, resultByDistrict, percentageOfVoteByRegion, numberOfVoteByRegion}) => {

    //calculate all data
    const { resultByRegion} = React.useMemo(() => {
        let resultByRegion = {};
        let partyVoteTotalCounter = {};
        const jurisdictions = [
            "N.L.", "P.E.I.", "N.S.", "N.B.", "Que.", "Ont.",
            "Man.", "Sask.", "Alta.", "B.C.", "Y.T.", "N.W.T.", "Nun.",
            "Total"
        ];

        jurisdictions.forEach(jurisdiction => {
            resultByRegion[jurisdiction] = [];
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
                if (jurisdiction !== "Total") {
                    
                    resultByRegion[jurisdiction].push({
                        party: partyName,
                        percentageOfVote: party[keyOfPercentage],
                        numberOfVote: numberOfVotesJurisdiction[keyOfNumberOfVotes] || 0 // Find the number of votes for the party in the jurisdiction
                    })  
                } else {
                    resultByRegion[jurisdiction].push({
                        party: partyName,
                        percentageOfVote: party[keyOfPercentage],
                        numberOfVote: partyVoteTotalCounter[partyName] 
                    });
                }
            });
        });

        Object.keys(resultByRegion).forEach(jurisdiction => {
            resultByRegion[jurisdiction].sort((a, b) => b.numberOfVote - a.numberOfVote); // Sort by percentage
        });

        return {resultByRegion};
    }, [numberOfVoteByRegion, percentageOfVoteByRegion]);

    return (
        <>
            <RegionSeatBarChart 
                selectedRegion={selectedRegion}
                resultByDistrict={resultByRegion} 
            />
            <RegionVoteBarChart />
        </>);
}