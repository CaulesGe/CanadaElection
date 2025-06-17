export default class Overview {
    constructor(parentElement, percentageOfVoteByRegion, numberOfVoteByRegion, resultByDistrict) {
        this.parentElement = parentElement;
        this.percentageOfVoteByRegion = percentageOfVoteByRegion;
        this.numberOfVoteByRegion = numberOfVoteByRegion;
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
        vis.margin = { top: 70, right: 20, bottom: 100, left: 120 };
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

        // create tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip").attr('id', 'overviewTooltip');
            

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        // create a new object to hold the results by jurisdiction
        const jurisdictions = [
            "N.L.", "P.E.I.", "N.S.", "N.B.", "Que.", "Ont.",
            "Man.", "Sask.", "Alta.", "B.C.", "Y.T.", "N.W.T.", "Nun.",
            "Total"
        ];
        
        vis.jurisdictionResult = {};
        jurisdictions.forEach(jurisdiction => {
            vis.jurisdictionResult[jurisdiction] = [];
        });

        //calculate the total vote for each party
        let totalCounter = {};
        vis.numberOfVoteByRegion.forEach(party => {
            let partyName = party["Political affiliation/Appartenance politique"];
            if (!totalCounter[partyName]) {
                totalCounter[partyName] = 0;
            }
            Object.keys(party).forEach(key => {
                if (key.includes("Valid Votes/Votes valides")) {
                    totalCounter[partyName] += party[key];
                }
            });
        });
      //  console.log(totalCounter);


        vis.percentageOfVoteByRegion.forEach(party => {
            let partyName = party["Political affiliation/Appartenance politique"];
         
            jurisdictions.forEach(jurisdiction => {
                const keyOfPercentage = Object.keys(party).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                let numberOfVotesJurisdiction = vis.numberOfVoteByRegion.find(vote => vote["Political affiliation/Appartenance politique"] === partyName);
                const keyOfNumberOfVotes = Object.keys(numberOfVotesJurisdiction).find(k => k.startsWith(jurisdiction)); // Find the key that starts with the jurisdiction name
                if (jurisdiction !== "Total") {
                    
                    vis.jurisdictionResult[jurisdiction].push({
                        party: partyName,
                        percentageOfVote: party[keyOfPercentage],
                        numberOfVote: numberOfVotesJurisdiction[keyOfNumberOfVotes] || 0 // Find the number of votes for the party in the jurisdiction
                    })  
                } else {
                    vis.jurisdictionResult[jurisdiction].push({
                        party: partyName,
                        percentageOfVote: party[keyOfPercentage],
                        numberOfVote: totalCounter[partyName] 
                    });
                }
            });
        });

        Object.keys(vis.jurisdictionResult).forEach(jurisdiction => {
            vis.jurisdictionResult[jurisdiction].sort((a, b) => b.numberOfVote - a.numberOfVote); // Sort by percentage
        });

        //console.log(vis.jurisdictionResult);
      
        this.updateVis();
    }

    updateVis() {
        let vis = this;
        // draw federal level bar chart
        let filteredPartyData = vis.jurisdictionResult[vis.selectedRegion].filter((d, i) => i < 6 && d.percentageOfVote > 1); // filter out parties with less than 1% of the vote and limit to top 6 parties
        vis.x.domain(filteredPartyData.map(d => d.party));
        vis.y.domain([0, d3.max(filteredPartyData, d => d.percentageOfVote)]);
        // remove old bars
        vis.g.selectAll(".bar").remove();
        vis.g.selectAll(".label").remove();

        // axis

        //remove old axis
        vis.g.selectAll(".x-axis").remove();
        vis.g.selectAll(".y-axis").remove();

        vis.g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height})`)
        .call(d3.axisBottom(vis.x).tickFormat(d => vis.getPartyName(d)))
        .selectAll("text")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");

        vis.g.append("g")
        .attr("class", "x-axis")
        .call(d3.axisLeft(vis.y).ticks(5).tickFormat(d => d + "%"));

        // bars
        let bars = vis.g.selectAll(".bar")
            .data(filteredPartyData);

        // ENTER
        let barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.party))
            .attr("width", vis.x.bandwidth())
            .attr("y", vis.height)
            .attr("height", 0)
            .attr("fill", d => vis.getPartyColor(d.party));

        // MERGE (actual bars, no transition yet!)
        let barsMerged = barsEnter.merge(bars);

        // TRANSITION
        barsMerged.transition()
            .duration(750)
            .attr("x", d => vis.x(d.party))
            .attr("y", d => vis.y(d.percentageOfVote))
            .attr("height", d => vis.height - vis.y(+d.percentageOfVote))
            .attr("fill", d => vis.getPartyColor(d.party));

        // EXIT
        bars.exit().remove();

        // TOOLTIP — attach to real DOM elements, NOT the transition
        barsMerged
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#FF8C00"); // highlight the bar
                vis.tooltip.style('display', 'block')
                    .style('opacity', 1)
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 15 + 'px')
                    .html(`<div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                        <h4 style="margin: 0; padding: 0; font-size: 1.2em;">${d.numberOfVote}</h4>
                    </div>`);
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("fill", vis.getPartyColor(d.party));
                vis.tooltip.style("display", "none");
            });

        //title
        vis.g.selectAll(".title").remove(); // clear previous title
        vis.g.append("text")
            .attr("class", "title")
            .attr("x", vis.width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .style("font-size", "17px")
            .text(`Popular Vote – ${vis.selectedRegion}`);


        //labels
        let labels = vis.g.selectAll(".text")
            .data(filteredPartyData);

        labels.enter()
            .append("text")
            .attr("class", "text")
            .attr("x", d => vis.x(d.party) + vis.x.bandwidth() / 2)
            .attr("y", vis.height) // start from bottom
            .attr("text-anchor", "middle")
            .text(d => d["Percentage of Votes Obtained /Pourcentage des votes obtenus"] + "%")
            .merge(labels)
            .transition()
            .duration(750)
            .attr("x", d => vis.x(d.party) + vis.x.bandwidth() / 2)
            .attr("y", d => vis.y(d.percentageOfVote) - 5)
            .text(d => d.percentageOfVote + "%");

        labels.exit().remove();
    }

    getPartyName(party) {
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

    getPartyColor(party) {
        let vis = this;
        if (party.includes("Liberal")) {
            return vis.partyColor.liberal;
        } else if (party.includes("Conservative")) {
            return vis.partyColor.conservative;
        } else if (party.includes("New Democratic Party")){
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
};