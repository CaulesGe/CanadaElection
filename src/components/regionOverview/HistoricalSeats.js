import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalSeatsTable } from './HistoricalSeatsTable';
import './HistoricalSeats.css';

const margin = { top: 40, right: 120, bottom: 50, left: 60 };
const width = 1000 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Color mapping for parties
const partyColor = {
  Liberal: "#D71920",
  Conservative: "#1A4782",
  NDP: "#F37021",
  Bloc: "#009EE0",
  Green: "#3D9B35"
};



export const HistoricalSeats = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [selectedElectionData, setSelectedElectionData] = useState(null);
  const [year, setYear] = useState(null);
  const [parties, setParties] = useState(null);


  useEffect(() => {
    if (!tooltipRef.current) {
      const d3Tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "historicalSeatTooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("display", "none")
        .style("z-index", 1000);
      tooltipRef.current = d3Tooltip.node(); // store the DOM node
    } 
    drawLineChart();
  }, [data]);


  const drawLineChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

   // console.log(data);
    const parties = Object.keys(data[0]).filter(key => key !== "election");
   // console.log(data[0])
    setParties(parties);

    const x = d3
      .scalePoint()
      .domain(data.map(d => d.election))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, d => d3.max(parties, party => d[party])) || 200
      ])
      .nice()
      .range([height, 0]);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y-axis
    g.append("g").call(d3.axisLeft(y));

    // Line generator
    const line = d3
      .line()
      .x(d => x(d.election))
      .y(d => y(d.value));

    // Draw one line per party
    parties.forEach(party => {
      const partyData = data.map(d => ({ election: d.election, value: d[party] }));

      g.append("path")
        .datum(partyData)
        .attr("fill", "none")
        .attr("stroke", partyColor[party] || "gray")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add points
      g.selectAll(`.dot-${party}`)
        .data(partyData)
        .enter()
        .append("circle")
        .attr("class", `dot-${party}`)
        .attr("cx", d => x(d.election))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", partyColor[party]);
    });

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 10}, ${margin.top})`);

    parties.forEach((party, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", partyColor[party]);

      legendRow
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(party);
    })


    //tooltip
    // Tooltip div
    const tooltip = d3.select(tooltipRef.current);


    //focus Line
    const focus = g.append("g").style("display", "none");

    focus.append("line")
      .attr("class", "focus-line")
      .attr("stroke", "gray")
      .attr("stroke-width", 2)
      .attr("y1", 0)
      .attr("y2", height);
  
    const focusCircles = parties.map(party =>
      focus.append("circle")
        .attr("r", 4)
        .attr("fill", partyColor[party])
        .style("pointer-events", "none")
    );


    g.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => focus.style("display", "block"))
      .on("mouseout", () => {
        focus.style("display", "none");
        tooltip.style("display", "none");
      })
      .on("mousemove", onMouseMove);
    

    function onMouseMove(event) {
      const [xm] = d3.pointer(event);
      const xDomain = x.domain();
      const xRange = x.range();
      const step = x.step(); // for scalePoint
      const index = Math.round((xm - xRange[0]) / step);
      const i = Math.max(0, Math.min(index, xDomain.length - 1));
      const election = xDomain[i];
      const dx = x(election);

      setYear(election);

      // Move focus line
      focus.select(".focus-line").attr("x1", dx).attr("x2", dx);

      // Move and enlarge circles
      parties.forEach((party, j) => {
        const d = data[i];
        focusCircles[j]
          .attr("cx", dx)
          .attr("cy", y(d[party]));
      });

      setSelectedElectionData(data[i]);

      // Show tooltip
      const [mouseX, mouseY] = d3.pointer(event, document.body);

      tooltip
        .html(
          ` <strong>${election}111</strong><br>` +
          parties.map(party => `${party}: ${data[i][party]}`).join("<br>")
        )
        .style("left", mouseX + 10 + "px")
        .style("top", mouseY - 40 + "px")
        .style("display", "block");
    }
  };

  return (
    <div id='historicalChart' style={{width:'100%', height:'100%'}}>
      <svg ref={svgRef} />
      { year && parties &&
        <HistoricalSeatsTable
          selectedElectionData={selectedElectionData}
          year={year}
          parties={parties}
        />
      }
    </div>);
};


