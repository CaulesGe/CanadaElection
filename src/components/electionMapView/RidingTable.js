import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './RidingTable.css';

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

export const RidingTable = ({candidates}) => {
    const tableRef = useRef();

    useEffect(() => {
        // Render detail table
        const tbody = d3.select(tableRef.current).select("tbody");
        tbody.selectAll("tr").remove();
    
        tbody.selectAll("tr")
          .data(candidates)
          .enter()
          .append("tr")
          .html(d => `
            <td>${d["Candidate"]}</td>
            <td>${getPartyName(d["Candidate"])}</td>
            <td>${d["Percentage of Votes Obtained"]}%</td>
            <td>${d["Votes Obtained"]}</td>
          `);
    }, [candidates]);
    

    return (
        <div>
            <h2 className="title" id="ridingDetailTableTitle">Riding Results</h2>
            <table ref={tableRef}  id="ridingDetailTable">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Party</th>
                        <th>Share</th>
                        <th>Votes</th>
                    </tr>
                </thead>
                <tbody></tbody>
        </table>
        </div>);
}