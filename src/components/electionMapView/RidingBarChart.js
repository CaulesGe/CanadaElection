import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const margin = { top: 70, right: 20, bottom: 180, left: 120 };
const width = 600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Helpers
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

function getPartyName(candidateData) {
  if (candidateData.includes("Liberal")) return "LIB";
  if (candidateData.includes("Conservative")) return "CON";
  if (candidateData.includes("NDP")) return "NDP";
  if (candidateData.includes("Bloc")) return "BLOC";
  if (candidateData.includes("Green")) return "GREEN";
  if (candidateData.includes("People's Party")) return "PPC";
  if (candidateData.includes("Independent")) return "IND";
  return candidateData;
}

function renderBarChart(svgRef, candidates) {
  const top5 = candidates.slice(0, 5);

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
    .domain(top5.map(d => d["Candidate"]))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(top5, d => +d["Percentage of Votes Obtained"])])
    .nice()
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(getPartyName))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  g.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

  // create tooltip
  let tooltip = d3.select("#ridingTooltip");
  if (tooltip.empty()) {
  tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "ridingTooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("pointer-events", "none");
  }

  // Bars with transitions
  const bars = g.selectAll(".bar")
    .data(top5, d => d["Candidate"]);

  bars.enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d["Candidate"]))
  .attr("width", x.bandwidth())
  .attr("y", height)
  .attr("height", 0)
  .attr("fill", d => getPartyColor(d["Candidate"]))
  .merge(bars) // 🔗 Combine new + existing bars
  .transition()
  .duration(750)
  .attr("x", d => x(d["Candidate"]))
  .attr("y", d => y(+d["Percentage of Votes Obtained"]))
  .attr("height", d => height - y(+d["Percentage of Votes Obtained"]))
  .attr("fill", d => getPartyColor(d["Candidate"]));
  
  bars.exit().remove();

  // ✅ Attach tooltip handlers to barsMerged
  g.selectAll(".bar")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#808080");
      tooltip.style("display", "block")
        .style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 15 + "px")
        .html(`<div>${d["Votes Obtained"]}</div>`);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("fill", getPartyColor(d["Candidate"]));
      tooltip.style("display", "none");
    });


  // Labels
  const labels = g.selectAll(".text")
  .data(top5, d => d["Candidate"]);

  labels.enter()
    .append("text")
    .attr("class", "text")
    .attr("x", d => x(d["Candidate"]) + x.bandwidth() / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .text(d => d["Percentage of Votes Obtained"] + "%")
    .merge(labels)
    .transition()
    .duration(750)
    .attr("x", d => x(d["Candidate"]) + x.bandwidth() / 2)
    .attr("y", d => y(+d["Percentage of Votes Obtained"]) - 5)
    .text(d => d["Percentage of Votes Obtained"] + "%");

  labels.exit()
    .transition()
    .duration(500)
    .attr("y", height)
    .style("opacity", 0)
    .remove();


  //title
  g.append("text")
    .attr("x", 0)
    .attr("y", -30)
    .attr("text-anchor", "start")
    .style("font-size", "17px")
    .text("Popular Vote");
}


// component
export const RidingBarChart = ({ candidates }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (candidates.length > 0) {
      renderBarChart(svgRef, candidates);
    }
  }, [candidates]);

  return (
    <div>
      {candidates.length > 0 && (
        <>
          <h4>Province: {candidates[0]["Province"]}</h4>
          <h4>Riding: {candidates[0]["Electoral District Name"]}</h4>
          <h4>Code: {candidates[0]["Electoral District Number"]}</h4>
        </>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};


                