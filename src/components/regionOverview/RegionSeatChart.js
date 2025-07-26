import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./RegionSeatChart.css";

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const baseWidth = 600;
const baseHeight = 550;
const width = baseWidth - margin.left - margin.right;
const height = baseHeight - margin.top - margin.bottom;

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

export const RegionSeatChart = ({ fixedYDomain, selectedRegionSeats, selectedRegion, chartType}) => {
    const svgRef = useRef();

    useEffect(() => {    
        if (!selectedRegionSeats) return; // prevent rendering if data is missing
        renderChart(svgRef, fixedYDomain, selectedRegionSeats, chartType);
    }, [fixedYDomain, selectedRegionSeats, chartType]);


    function renderChart(svgRef, fixedYDomain, selectedRegionSeats, chartType) {
        if (!selectedRegionSeats || !Array.isArray(fixedYDomain)) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        if (chartType === 'barChart') {
            renderRegionBarChart(svg, fixedYDomain, selectedRegionSeats, selectedRegion);
        } else if (chartType === 'pieChart') {
            renderRegionPieChart(svg, fixedYDomain, selectedRegionSeats);
        }
    }


    function renderRegionBarChart(svg, fixedYDomain, selectedRegionSeats, selectedRegion) {
        //let selectedRegionSeats = seatsByRegion[provinceNameTable[selectedRegion]];
        let sortedSelectedRegionSeats = fixedYDomain.map(party => {
            return [party, selectedRegionSeats[party] || 0];
        }).sort((a, b) => b[1] - a[1]);  // Sort descending by seats in region


        const g = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
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

        if (selectedRegion == "Total") {
            // draw the midline
            g.append("line")
                .attr("class", "midline")
                .attr("x1", midX)
                .attr("x2", midX)
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "black")
                .attr("stroke-dasharray", "25") // dashed line
                .attr("stroke-width", 1).attr("opacity", 0.3);
            
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
    

    function renderRegionPieChart(svg, fixedYDomain, selectedRegionSeats) {
        const width = 600;
        const height = 410;
        const radius = Math.min(width, height) / 2;

        const data = fixedYDomain
            .map(party => ({ party, value: selectedRegionSeats[party] || 0 }))
            .filter(d => d.value > 0);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const outerArc = d3.arc().innerRadius(radius * 1.01).outerRadius(radius * 1.01);

        const g = svg
            .attr("width", width + 100)
            .attr("height", height + 100)
            .append("g")
            .attr("transform", `translate(${width / 2 + 20},${height / 2 + 50})`);

        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        // Add pie slices with transition
        arcs.append("path")
            .attr("fill", d => getPartyColor(d.data.party))
            .transition()
            .duration(500)
            .attrTween("d", function(d) {
                const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
                return t => arc(i(t));
            });

            
        // Polylines
        arcs.append("polyline")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("points", (d, i) => {
                const midAngle = (d.startAngle + d.endAngle) / 2;
                const side = midAngle > Math.PI ? -1 : 1;
                const innerPos = arc.centroid(d);
                const outerPos = outerArc.centroid(d);
                const labelPos = [...outerPos];

                // Adjust horizontal distance
                labelPos[0] = radius * 1.1 * side;

                // Adjust vertical staggering
                const emToPx = 11;
                const dyOffset = (i - data.length / 2) * 0.4 * side * emToPx;
                labelPos[1] += dyOffset;

                return [innerPos, outerPos, labelPos];
            });


        // Add labels
        arcs.append("text")
            .attr("transform", (d, i) => {
                const midAngle = (d.startAngle + d.endAngle) / 2;
                const side = midAngle > Math.PI ? -1 : 1;
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.2 * side;
                const emToPx = 11;
                const dyOffset = (i - data.length / 2) * 0.6 * side * emToPx;
                pos[1] += dyOffset;
                return `translate(${pos})`;
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", d => {
                const midAngle = (d.startAngle + d.endAngle) / 2;
                return midAngle > Math.PI ? "end" : "start";
            })
            .style("font-size", "14px")
            .text(d => `${d.data.party}: ${d.data.value}`);


    }

    if (!selectedRegionSeats || Object.keys(selectedRegionSeats).length === 0) {
        return <></>;
    }

    return (
        <div id="regionSeatChart" style={{ width: '100%', height: '100%', margin: '0 auto' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${baseWidth} ${baseHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "auto" }}
            />
        </div>
    );
}
