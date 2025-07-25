import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./RegionVoteChart.css";


const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const baseWidth = 600;
const baseHeight = 550;
const width = baseWidth - margin.left - margin.right;
const height = baseHeight - margin.top - margin.bottom;

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

export const RegionVoteChart = ({selectedRegionVote, chartType}) => {
    const svgRef = useRef();
   // console.log(selectedRegionVote)
    useEffect(() => {    
        if (!selectedRegionVote ) return;

        // Ensure tooltip exists
        let tooltip = d3.select("#overviewTooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body")
                .append("div")
                .attr("id", "overviewTooltip")
                .style("position", "absolute")
                .style("z-index", 9999)
                .style("background", "white")
                .style("padding", "6px 10px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "4px")
                .style("box-shadow", "0 0 6px rgba(0,0,0,0.2)")
                .style("pointer-events", "none")
                .style("display", "none");
        }

        let filteredPartyData = Object.values(selectedRegionVote)
            .filter(d => d.percentageOfVote > 1)
            .sort((a, b) => b.percentageOfVote - a.percentageOfVote)
            .slice(0, 6); // filter out parties with less than 1% of the vote and limit to top 6 parties

        //console.log(filteredPartyData)
        renderChart(svgRef, filteredPartyData);
    }, [selectedRegionVote, chartType]);

    function renderChart(svgRef, filteredPartyData) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        if (chartType === 'barChart') {
            renderRegionBarChart(svg, filteredPartyData);
        } else if (chartType === 'pieChart') {
            renderRegionPieChart(svg, filteredPartyData);
        }
    }

    function renderRegionBarChart(svg, filteredPartyData) {
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

        // TOOLTIP — attach to real DOM elements, NOT the transition
        barsMerged.on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#808080"); // highlight the bar
            d3.select(this).attr("fill", "#808080");
            d3.select("#overviewTooltip")
                .style("display", "block")
                .style("opacity", 1)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .html(`<div>${d.numberOfVote}</div>`);
                })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", getPartyColor(d.party));
            d3.select("#overviewTooltip").style("display", "none");
        });
        
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

    function renderRegionPieChart(svg, filteredPartyData) {
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
            .attr("transform", `translate(${width / 2},${height / 2 + 50})`);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);


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

        arcs.select("path")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "white").attr("stroke-width", 2);
                const tooltip = d3.select("#overviewTooltip");
                tooltip
                    .style("display", "block")
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .html(`
                        <div>
                            <strong>${d.data.party}</strong>: ${d.data.value}% </br> 
                                ${d.data.numberOfVote}
                            </div>`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", null);
                const tooltip = d3.select("#overviewTooltip");
                tooltip.style("display", "none");
            });

    }


    return (
        <div id="regionVoteChart" style={{ width: '100%', height: '100%', margin: '0 auto' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "auto" }}
            />
        </div>
    );
}
