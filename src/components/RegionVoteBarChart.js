import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


const margin = { top: 70, right: 20, bottom: 200, left: 120 };
const width = 500 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function getPartyColor(candidateData) {
    if (candidateData.includes("Liberal")) return "#D71920";
    if (candidateData.includes("Conservative")) return "#1A4782";
    if (candidateData.includes("New Democratic Party")) return "#F37021";
    if (candidateData.includes("Bloc")) return "#009EE0";
    if (candidateData.includes("Green")) return "#3D9B35";
    if (candidateData.includes("People's Party")) return "#800080";
    if (candidateData.includes("Independent")) return "#808080";
    return "#808080";
}

function getPartyName(party) {
    if (party.includes("Liberal")) {
        return "LIB"
    } else if (party.includes("Conservative")) {
        return "CON"
    } else if (party.includes("New Democratic Party")) {
        return "NDP"
    } else if (party.includes("Bloc")) {
        return "BLOC"
    } else if (party.includes("Green")) {
        return "GREEN"
    } else if (party.includes("Independent")) {
        return "IND"
    } else if (party.includes("People's Party")) {
        return "PPC"
    } else {
        return party;
    }
}

export const RegionVoteBarChart = ({selectedRegion, percentageOfVoteByRegion, numberOfVoteByRegion}) => {
    const svgRef = useRef();
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


    useEffect(() => {    
        let filteredPartyData = resultByRegion[selectedRegion].filter((d, i) => i < 6 && d.percentageOfVote > 1); // filter out parties with less than 1% of the vote and limit to top 6 parties
        renderRegionBarChart(svgRef, filteredPartyData);
    }, [selectedRegion, percentageOfVoteByRegion, numberOfVoteByRegion, resultByRegion])

    
    function renderRegionBarChart(svgRef, filteredPartyData) {
        const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

        let g = svg.select("g.chart-container");
        if (g.empty()) {
            g = svg.append("g")
            .attr("class", "chart-container")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        } else {
            g.selectAll("*").remove();
        }

        const x = d3.scaleBand()
            .domain(filteredPartyData.map(d => d.party))
            .range([0, width]).padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredPartyData, d => d.percentageOfVote)])
            .range([height, 0]);
        
        // Axis
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d => getPartyName(d)))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

        // bars
        let bars = g.selectAll(".bar")
            .data(filteredPartyData);

        // ENTER
        let barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.party))
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .attr("fill", d => getPartyColor(d.party));

        // MERGE (actual bars, no transition yet!)
        let barsMerged = barsEnter.merge(bars);

        // TRANSITION
        barsMerged.transition()
            .duration(750)
            .attr("x", d => x(d.party))
            .attr("y", d => y(d.percentageOfVote))
            .attr("height", d => height - y(+d.percentageOfVote))
            .attr("fill", d => getPartyColor(d.party));

        // EXIT
        bars.exit().remove();

        // create tooltip
        let tooltip = d3.select("#overviewTooltip");
        if (tooltip.empty()) {
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "overviewTooltip")
            .style("position", "absolute")
            .style("display", "none")
            .style("pointer-events", "none");
        }
        

        // TOOLTIP — attach to real DOM elements, NOT the transition
        barsMerged.on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#808080"); // highlight the bar
            tooltip.style('display', 'block')
                .style('opacity', 1)
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 15 + 'px')
                .html(`<div>
                    ${d.numberOfVote}
                </div>`);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", getPartyColor(d.party));
            tooltip.style("display", "none");
        });

        //title
        g.append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .style("font-size", "17px")
            .text(`Popular Vote – ${selectedRegion}`);
        
        //labels
        let labels = g.selectAll(".text")
            .data(filteredPartyData);

        labels.enter()
            .append("text")
            .attr("class", "text")
            .attr("x", d => x(d.party) + x.bandwidth() / 2)
            .attr("y", height) // start from bottom
            .attr("text-anchor", "middle")
            .text(d => d["Percentage of Votes Obtained /Pourcentage des votes obtenus"] + "%")
            .merge(labels)
            .transition()
            .duration(750)
            .attr("x", d => x(d.party) + x.bandwidth() / 2)
            .attr("y", d => y(d.percentageOfVote) - 5)
            .text(d => d.percentageOfVote + "%");

        labels.exit().remove();

    }

    return (
        <>
            <svg ref={svgRef}></svg>
        </>
    );
}
