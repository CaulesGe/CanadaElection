export default class SeatOverview {
    constructor(parentElement, resultByDistrict) {
        this.parentElement = parentElement;
        this.resultByDistrict = resultByDistrict; 
        this.partyColor = {
            conservative: "#1A4782",
            liberal: "#D71920",
            NDP: "#F37021",
            Green: "#3D9B35",
            Bloc: "#009EE0",
            PPC: "#800080",
            IND: "#808080", 
        }
        this.selectedRegion = "Total";
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 70, right: 120, bottom: 40, left: 120 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.y = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.2);


        vis.x = d3.scaleLinear()
        .range([0, vis.width]);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        // calculate the seats in each jurisdiction
        const provinces = ["Newfoundland and Labrador/Terre-Neuve-et-Labrador", "Prince Edward Island/Île-du-Prince-Édouard", 
            "Nova Scotia/Nouvelle-Écosse", "New Brunswick/Nouveau-Brunswick", "Quebec/Québec", "Ontario",
            "Manitoba", "Saskatchewan", "Alberta", "British Columbia/Colombie-Britannique",
            "Yukon", "Northwest Territories/Territoires du Nord-Ouest", "Nunavut", "Total"
        ];

        vis.seatsByJurisdiction = {};
        provinces.forEach(province => {
            vis.seatsByJurisdiction[province] = {
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

        vis.resultByDistrict.forEach(district => {
            let province = district.Province;
            if (district["Elected Candidate/Candidat élu"].includes("Conservative")) {
                vis.seatsByJurisdiction[province].Conservative++;
                vis.seatsByJurisdiction["Total"].Conservative++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Liberal")) {
                vis.seatsByJurisdiction[province].Liberal++;
                vis.seatsByJurisdiction["Total"].Liberal++;
            } else if (district["Elected Candidate/Candidat élu"].includes("NDP")) {
                vis.seatsByJurisdiction[province].NDP++;
                vis.seatsByJurisdiction["Total"].NDP++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Bloc")) {
                vis.seatsByJurisdiction[province].Bloc++;
                vis.seatsByJurisdiction["Total"].Bloc++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Green")) {
                vis.seatsByJurisdiction[province].Green++;
                vis.seatsByJurisdiction["Total"].Green++;
            } else if (district["Elected Candidate/Candidat élu"].includes("PPC")) {
                vis.seatsByJurisdiction[province].PPC++;
                vis.seatsByJurisdiction["Total"].PPC++;
            } else if (district["Elected Candidate/Candidat élu"].includes("Independent")) {
                vis.seatsByJurisdiction[province].Independent++;
                vis.seatsByJurisdiction["Total"].Independent++;
            }
            vis.seatsByJurisdiction[province].Total++;
            vis.seatsByJurisdiction["Total"].Total++;
        });

        // Fixed y-domain: Parties with at least one federal seat
        vis.fixedYDomain = Object.entries(vis.seatsByJurisdiction["Total"])
            .filter(([party, count]) => party !== "Total" && count > 0)
            .map(([party]) => party);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        let province = {"Total": "Total", "N.L.": "Newfoundland and Labrador/Terre-Neuve-et-Labrador", "P.E.I.": "Prince Edward Island/Île-du-Prince-Édouard",
            "N.S.": "Nova Scotia/Nouvelle-Écosse", "N.B.": "New Brunswick/Nouveau-Brunswick", "Que.": "Quebec/Québec", "Ont.": "Ontario",
            "Man.": "Manitoba", "Sask.": "Saskatchewan", "Alta.": "Alberta", "B.C.": "British Columbia/Colombie-Britannique",
            "Y.T.": "Yukon", "N.W.T.": "Northwest Territories/Territoires du Nord-Ouest", "Nun.": "Nunavut"};
        let filteredSeatData = vis.seatsByJurisdiction[province[vis.selectedRegion]];
        let fixedParties = vis.fixedYDomain;

        //  Map each to its seat count in selected region
        let sortedData = fixedParties.map(party => {
            return [party, filteredSeatData[party] || 0];
        }).sort((a, b) => b[1] - a[1]);  // Sort descending by seats in region
        
        let totalSeats = filteredSeatData.Total;

        vis.y.domain(sortedData.map(d => d[0]));
        vis.x.domain([0, totalSeats]);

        // remove old bars
        vis.g.selectAll(".bar").remove();
        vis.g.selectAll(".label").remove();
        
        //remove old axis
        vis.g.selectAll(".x-axis").remove();
        vis.g.selectAll(".y-axis").remove();

        vis.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(d3.axisBottom(vis.x).ticks(5));
        
        vis.g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.y).ticks(5));

        let bars = vis.g.selectAll(".bar")
            .data(sortedData, d => d[0]); // use key function to bind data correctly

        // ENTER
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => vis.y(d[0]))
            .attr("height", vis.y.bandwidth())
            .attr("width", 0) // start width at 0
            .attr("fill", d => vis.getPartyColor(d[0]))
            .transition().duration(500)
            .attr("width", d => vis.x(d[1]));

        // EXIT
        bars.exit().remove();

        // add labels
        vis.labels = vis.g.selectAll(".label")
            .data(sortedData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => vis.x(d[1]) + 5)
            .attr("y", d => vis.y(d[0]) + vis.y.bandwidth() / 2 + 4)
            .text(d => `${d[1]}`)
            .attr("fill", "black")
            .style("font-size", "12px");
            
        vis.labels.exit().remove();
        //draw middle line
        let midX = vis.x(vis.x.domain()[1] / 2);
        vis.g.selectAll(".midline").remove();
        vis.g.selectAll(".midline-label").remove();

        if (vis.selectedRegion === "Total") {
            // draw the midline
            vis.g.append("line")
                .attr("class", "midline")
                .attr("x1", midX)
                .attr("x2", midX)
                .attr("y1", 0)
                .attr("y2", vis.height)
                .attr("stroke", "black")
                .attr("stroke-dasharray", "25") // dashed line
                .attr("stroke-width", 1);
            
            // label for the midline
                    // remove previous midline label
            vis.g.selectAll(".midline-label").remove();

            // add label
            vis.g.append("text")
                .attr("class", "midline-label")
                .attr("x", midX + 5)  // small offset to the right of the line
                .attr("y", -10)       // place above the chart
                .text(`${totalSeats / 2} SEATS FOR A MAJORITY`)
                .attr("text-anchor", "start")
                .attr("font-size", "12px")
                .attr("fill", "black");
        }
        
    }

    getPartyColor(party) {
    
        let vis = this;
        if (party.includes("Liberal")) {
            return vis.partyColor.liberal;
        } else if (party.includes("Conservative")) {
            return vis.partyColor.conservative;
        } else if (party.includes("NDP")){
            return vis.partyColor.NDP;
        } else if (party.includes("Bloc")) {
            return vis.partyColor.Bloc;
        } else if (party.includes("Green")) {
            return vis.partyColor.Green;
        } else if (party.includes("Independent")) {
            return vis.partyColor.IND;
        } else if (party.includes("People's Party")) {
            return vis.partyColor.PPC;
        } else {
            return "#808080"; // default color for other parties
        }
    }

    updateRegion(newRegion) {
        this.selectedRegion = newRegion;
        this.updateVis();
    }
}