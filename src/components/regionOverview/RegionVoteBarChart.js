import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


const margin = { top: 70, right: 20, bottom: 100, left: 120 };
const width = 600 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

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

export const RegionVoteBarChart = ({selectedRegionVote, selectedRegion, chartType}) => {
    const svgRef = useRef();

    useEffect(() => {    
        if (!selectedRegionVote || !Array.isArray(selectedRegionVote)) return;

        let filteredPartyData = [...selectedRegionVote]
            .filter(d => d.percentageOfVote > 1)
            .sort((a, b) => b.percentageOfVote - a.percentageOfVote)
            .slice(0, 6); // filter out parties with less than 1% of the vote and limit to top 6 parties
        renderChart(svgRef, filteredPartyData, selectedRegion);
    }, [selectedRegionVote, selectedRegion, chartType]);

    function renderChart(svgRef, filteredPartyData, selectedRegion) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        if (chartType === 'barChart') {
            renderRegionBarChart(svg, filteredPartyData, selectedRegion);
        } else if (chartType === 'pieChart') {
            renderRegionPieChart(svg, filteredPartyData, selectedRegion);
        }
    }

    function renderRegionBarChart(svg, filteredPartyData, selectedRegion) {
        const g = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

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
            .data(filteredPartyData, d => d.party);

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
            .data(filteredPartyData, d => d.party);

        labels.enter()
            .append("text")
            .attr("class", "text")
            .attr("x", d => x(d.party) + x.bandwidth() / 2)
            .attr("y", height) // start from bottom
            .attr("text-anchor", "middle")
            .text(d => d["Percentage of Votes Obtained"] + "%")
            .merge(labels)
            .transition()
            .duration(750)
            .attr("x", d => x(d.party) + x.bandwidth() / 2)
            .attr("y", d => y(d.percentageOfVote) - 5)
            .text(d => d.percentageOfVote + "%");

        labels.exit().remove();

    }

    function renderRegionPieChart(svg, filteredPartyData, selectedRegion) {
        const width = 600;
        const height = 360;
        const radius = Math.min(width, height) / 2;

        // Preprocess data: map to required value field
        const data = filteredPartyData.map(d => ({
            party: d.party,
            value: d.percentageOfVote,
            numberOfVote: d.numberOfVote
        }));

        const g = svg
            .attr("width", width)
            .attr("height", height + 140)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2 + 80})`);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const outerArc = d3.arc().innerRadius(radius * 1.01).outerRadius(radius * 1.01);

        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        // Pie slices
        arcs.append("path")
            .attr("fill", d => getPartyColor(d.data.party))
            .transition()
            .duration(500)
            .attrTween("d", function(d) {
                const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
                return t => arc(i(t));
            });

        // Tooltip
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

        arcs.select("path")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "white").attr("stroke-width", 2);
                tooltip
                    .style("display", "block")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 10 + "px")
                    .html(`
                        <div>
                            <strong>${d.data.party}</strong>: ${d.data.value}% </br> 
                                ${d.data.numberOfVote}
                            </div>`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", null);
                tooltip.style("display", "none");
            });

        // Title
        g.append("text")
            .attr("class", "title")
            .attr("y", -radius - 40)
            .attr("text-anchor", "middle")
            .style("font-size", "17px")
            .text(`Popular Vote – ${selectedRegion}`);
    }


    return (
        <>
            <svg ref={svgRef}></svg>
        </>
    );
}
