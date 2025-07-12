import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const provinces = ["Newfoundland and Labrador/Terre-Neuve-et-Labrador", "Prince Edward Island/Île-du-Prince-Édouard", 
        "Nova Scotia/Nouvelle-Écosse", "New Brunswick/Nouveau-Brunswick", "Quebec/Québec", "Ontario",
        "Manitoba", "Saskatchewan", "Alberta", "British Columbia/Colombie-Britannique",
        "Yukon", "Northwest Territories/Territoires du Nord-Ouest", "Nunavut", "Total"
];

const provinceNameTable = {"Total": "Total", "N.L.": "Newfoundland and Labrador/Terre-Neuve-et-Labrador", "P.E.I.": "Prince Edward Island/Île-du-Prince-Édouard",
    "N.S.": "Nova Scotia/Nouvelle-Écosse", "N.B.": "New Brunswick/Nouveau-Brunswick", "Que.": "Quebec/Québec", "Ont.": "Ontario",
    "Man.": "Manitoba", "Sask.": "Saskatchewan", "Alta.": "Alberta", "B.C.": "British Columbia/Colombie-Britannique",
    "Y.T.": "Yukon", "N.W.T.": "Northwest Territories/Territoires du Nord-Ouest", "Nun.": "Nunavut"};

const margin = { top: 70, right: 20, bottom: 200, left: 120 };
const width = 500 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function getPartyColor(candidateData) {
    if (candidateData.includes("Liberal")) return "#D71920";
    if (candidateData.includes("Conservative")) return "#1A4782";
    if (candidateData.includes("NDP")) return "#F37021";
    if (candidateData.includes("Bloc")) return "#009EE0";
    if (candidateData.includes("Green")) return "#3D9B35";
    if (candidateData.includes("People's Party")) return "#800080";
    if (candidateData.includes("Independent")) return "#808080";
    return "#808080";
}

export const RegionSeatBarChart = ({selectedRegion, resultByDistrict}) => {
    const svgRef = useRef();
    //calculate all data
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
    }, [resultByDistrict]);


    useEffect(() => {    
        renderRegionBarChart(svgRef, seatsByRegion, fixedYDomain, selectedRegion);
    }, [selectedRegion, resultByDistrict, fixedYDomain, seatsByRegion])

    
    function renderRegionBarChart(svgRef, seatsByRegion, fixedYDomain, selectedRegion) {
        let selectedRegionSeats = seatsByRegion[provinceNameTable[selectedRegion]];
        let sortedSelectedRegionSeats = fixedYDomain.map(party => {
            return [party, selectedRegionSeats[party] || 0];
        }).sort((a, b) => b[1] - a[1]);  // Sort descending by seats in region


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
    
        const x = d3.scaleLinear()
            .range([0, width]);
    
        const y = d3.scaleBand()
            .range([0, height])
            .padding(0.2);


        y.domain(sortedSelectedRegionSeats.map(d => d[0]));
        x.domain([0, selectedRegionSeats.Total]);
        
        // Axis
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(5));

        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5));

                
        // Bars with transitions
        const bars = g.selectAll(".bar")
            .data(sortedSelectedRegionSeats, d => d[0]);
    
        // ENTER
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d[0]))
            .attr("height", y.bandwidth())
            .attr("width", 0) // start width at 0
            .attr("fill", d => getPartyColor(d[0]))
            .transition().duration(500)
            .attr("width", d => x(d[1]));
    
        bars.exit()
            .remove();
        

        //title
        g.append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .style("font-size", "17px")
            .text(`Seats – ${selectedRegion}`);
        // Labels
        const labels = g.selectAll(".text")
            .data(sortedSelectedRegionSeats, d => d[0]);
    
        labels.enter()
            .append("text")
            .attr("class", "text")
            .attr("x", 0)
            .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "middle")
            .text(d => `${d[1]}`)
            .attr("fill", "black")
            .style("font-size", "12px")
            .transition().duration(500)
            .attr("x", d => x(d[1]) + 10);;
    
        labels.exit()
            .transition()
            .duration(500)
            .attr("y", height)
            .style("opacity", 0)
            .remove();
    
        //draw middle line
        let midX = x(x.domain()[1] / 2);
        g.selectAll(".midline").remove();
        g.selectAll(".midline-label").remove();

        if (selectedRegion === "Total") {
            // draw the midline
            g.append("line")
                .attr("class", "midline")
                .attr("x1", midX)
                .attr("x2", midX)
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "black")
                .attr("stroke-dasharray", "25") // dashed line
                .attr("stroke-width", 1);
            
            // label for the midline

            // add label
            g.append("text")
                .attr("class", "midline-label")
                .attr("x", midX + 5)  // small offset to the right of the line
                .attr("y", -10)       // place above the chart
                .text(`${selectedRegionSeats.Total / 2} SEATS FOR A MAJORITY`)
                .attr("text-anchor", "start")
                .attr("font-size", "12px")
                .attr("fill", "black");
      }
    }

    return (
        <>
            <svg ref={svgRef}></svg>
        </>
    );
}
