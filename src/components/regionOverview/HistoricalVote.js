import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalVoteTable } from './HistoricalVoteTable';
import './HistoricalSeats.css'

const margin = { top: 40, right: 220, bottom: 50, left: 60 };
const width = 1100 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


function getPartyColor(party) {
  if (party.includes("Liberal")) return "#D71920";
  if (party.includes("Conservative")) return "#1A4782";
  if (party.includes("New Democratic Party")) return "#F37021";
  if (party.includes("Bloc")) return "#009EE0";
  if (party.includes("Green")) return "#3D9B35";
  if (party.includes("People's Party")) return "#800080";
  if (party.includes("Independent")) return "#808080";
  return "#888"; // fallback gray
}

export const HistoricalVote = ({ data }) => {
  //console.log(data)
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [selectedElectionData, setSelectedElectionData] = useState(null);
  const [year, setYear] = useState(null);
  const [parties, setParties] = useState(null);

  //console.log(data)

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

  

    const parties = ["Bloc Québécois", "Conservative Party of Canada", "Green Party of Canada",
      "Liberal Party of Canada", "New Democratic Party", "People's Party of Canada", "Independent"
    ];
    setParties(parties);

    const x = d3
      .scalePoint()
      .domain(Object.keys(data))
      .range([0, width]);
    

    const allVotes = Object.values(data).flatMap(yearData =>
      Object.values(yearData)
    );
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(allVotes, d => +d.numberOfVote)
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
      const partyData = Object.entries(data).map(([election, yearData]) => {
        if (party in yearData) {
          const partyEntry = yearData[party];
          return {
            election,
            value: partyEntry ? +partyEntry.numberOfVote : 0
          };
        }  
        return null;
      }).filter(d => d !== null);

      g.append("path")
        .datum(partyData)
        .attr("fill", "none")
        .attr("stroke", getPartyColor(party) || "gray")
        .attr("stroke-width", 2)
        .attr("d", line);

      function sanitizeClassName(name) {
        return name.replace(/[^a-z0-9]/gi, '-');
      }

      const safePartyClass = sanitizeClassName(party);
      // Add points
      g.selectAll(`.dot-${safePartyClass}`)
        .data(partyData)
        .enter()
        .append("circle")
        .attr("class", `dot-${party}`)
        .attr("cx", d => x(d.election))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", getPartyColor(party));
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
        .attr("fill", getPartyColor(party));

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
    

    // const focusCircles = parties.map(party =>
    //   focus.append("circle")
    //     .attr("r", 4)
    //     .attr("fill", partyColor[party])
    //     .style("pointer-events", "none")
    // );

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

      // parties.forEach((party, j) => {
      //   const d = data[i];
      //   focusCircles[j]
      //     .attr("cx", dx)
      //     .attr("cy", y(d[party]));
      // });
      
      setSelectedElectionData(Object.values(data)[i]);

      // Show tooltip
    //   const [mouseX, mouseY] = d3.pointer(event, document.body);

    //   tooltip
    //     .html(
    //       ` <strong>${election}111</strong><br>` +
    //       parties.map(party => `${party}: ${data[i][party]}`).join("<br>")
    //     )
    //     .style("left", mouseX + 10 + "px")
    //     .style("top", mouseY - 40 + "px")
    //     .style("display", "block");
    }
  };

  return (
    <>
      <svg ref={svgRef} />
      { year && parties &&
        <HistoricalVoteTable
          selectedElectionData={selectedElectionData}
          year={year}
          parties={parties}
        />
      }
    </>);
};


