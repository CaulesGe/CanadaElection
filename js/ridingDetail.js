export default class RidingDetail {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
        this.partyColor = {
            conservative: "#1A4782",
            liberal: "#D71920",
            NDP: "#F37021",
            Green: "#3D9B35",
            Bloc: "#009EE0",
            PPC: "#800080",
            IND: "#808080", 
        }

    }

    initVis() {
        let vis = this;
        vis.margin = { top: 70, right: 20, bottom: 200, left: 120 };
        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.2);


        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
        
    }

    render(data, selectedRidingCandidates) {
        let vis = this;
    
        //console.log(ridings);
        
        const ridings = data.properties;
        const name = ridings.fed_name_en;
        const province = ridings.prov_name_en;
            

        d3.select("#province")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1)
            .text(`Province: ${province}`);

        d3.select("#ridingName")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1)
            .text(`Riding: ${name}`);


        //     // clear old data
        // d3.select("#detail").selectAll("p").remove();
            
        // d3.select("#detail").selectAll("p").data(selectedRidingCandidates.value).enter().append("p").text(d => `${d["Candidate/Candidat"]}: ${d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]}%`);
        this.renderDetailTable(selectedRidingCandidates.value)

        // draw bar chart
        const dataArr = selectedRidingCandidates.value.filter((d, i) => i < 5);     //filter only top 5 parties
        //console.log(dataArr);
       // console.log(dataArr);
        vis.x.domain(dataArr.map(d => d["Candidate/Candidat"]));
        vis.y.domain([0, d3.max(dataArr, d => +d["Percentage of Votes Obtained /Pourcentage des votes obtenus"])])
        // remove old bars
        vis.g.selectAll("*").remove();


        // axis
        vis.g.append("g")
        .attr("transform", `translate(0, ${vis.height})`)
        .call(d3.axisBottom(vis.x).tickFormat(d => vis.getPartyName(d)))
        .selectAll("text")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");

        vis.g.append("g")
        .call(d3.axisLeft(vis.y).ticks(5).tickFormat(d => d + "%"));

        // bars
        let bars = vis.g.selectAll(".bar")
            .data(dataArr, d => d["Candidate/Candidat"]);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d["Candidate/Candidat"]))
            .attr("width", vis.x.bandwidth())
            .attr("y", vis.height) // start from bottom
            .attr("height", 0)     // start with height 0
            .attr("fill", d => vis.getPartyColor(d["Candidate/Candidat"]))
            .merge(bars)
            .transition()
            .duration(750)
            .attr("x", d => vis.x(d["Candidate/Candidat"]))
            .attr("y", d => vis.y(+d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]))
            .attr("height", d => vis.height - vis.y(+d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]))
            .attr("fill", d => vis.getPartyColor(d["Candidate/Candidat"]));

            bars.exit().remove();


        // chart title
        vis.g.append("text")
            .attr("x", 0)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .style("font-size", "17px")
            .text("Popular Vote");

        let labels = vis.g.selectAll(".text")
            .data(dataArr, d => d["Candidate/Candidat"]);

        labels.enter()
            .append("text")
            .attr("class", "text")
            .attr("x", d => vis.x(d["Candidate/Candidat"]) + vis.x.bandwidth() / 2)
            .attr("y", vis.height) // start from bottom
            .attr("text-anchor", "middle")
            .text(d => d["Percentage of Votes Obtained /Pourcentage des votes obtenus"] + "%")
            .merge(labels)
            .transition()
            .duration(750)
            .attr("x", d => vis.x(d["Candidate/Candidat"]) + vis.x.bandwidth() / 2)
            .attr("y", d => vis.y(+d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]) - 5)
            .text(d => d["Percentage of Votes Obtained /Pourcentage des votes obtenus"] + "%");

        labels.exit().remove();
        
    }

    getPartyColor(candidateData) {
        let vis = this;
        if (candidateData.includes("Liberal")) {
            return vis.partyColor.liberal;
        } else if (candidateData.includes("Conservative")) {
            return vis.partyColor.conservative;
        } else if (candidateData.includes("NDP")){
            return vis.partyColor.NDP;
        } else if (candidateData.includes("Bloc")) {
            return vis.partyColor.Bloc;
        } else if (candidateData.includes("Green")) {
            return vis.partyColor.Green;
        } else if (candidateData.includes("Independent")) {
            return vis.partyColor.IND;
        } else if (candidateData.includes("People's Party")) {
            return vis.partyColor.PPC;
        } else {
            return "#808080"; // default color for other parties
        }
    }

    getPartyName(candidateData){
        if (candidateData.includes("Liberal")) {
            return "LIB"
        } else if (candidateData.includes("Conservative")) {
            return "CON"
        } else if (candidateData.includes("NDP")){
            return "NDP"
        } else if (candidateData.includes("Bloc")) {
            return "BLOC"
        } else if (candidateData.includes("Green")) {
            return "GREEN"
        } else if (candidateData.includes("Independent")) {
            return "IND"
        } else if (candidateData.includes("People's Party")) {
            return "PPC"
        } else {
            return candidateData;
        }
    }

    renderDetailTable(d) {
        // Clear existing table rows (except header)
        d3.select("#ridingDetailTable tbody").selectAll("tr").remove();

        // Append new rows with candidate data
        d3.select("#ridingDetailTable tbody")
            .selectAll("tr")
            .data(d)
            .enter()
            .append("tr")
            .html(d => `
                <td>${d["Candidate/Candidat"]}</td>
                <td>${this.getPartyName(d["Candidate/Candidat"])}</td>
                <td>${d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]}%</td>
                <td>${d["Votes Obtained/Votes obtenus"]}</td>
            `);
    }
}