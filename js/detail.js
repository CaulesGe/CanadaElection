export default class Detail {
    constructor(data, selectedRidingCandidates) {
        this.data = data;
        this.selectedRidingCandidates = selectedRidingCandidates;
    }

    initVis() {
       
        //console.log(ridings);
        if (this.data, this.selectedRidingCandidates) {
            const ridings = this.data.properties;
            const name = ridings.fed_name_en;
            const province = ridings.prov_name_en;
            

            d3.select("#province").style("opacity", 1).html(province);
        
            d3.select("#ridingName")
            .style("opacity", 1)
            .html(name)


            // clear old data
            d3.select("#detail").selectAll("p").remove();
            
            d3.select("#detail").selectAll("p").data(this.selectedRidingCandidates.value).enter().append("p").text(d => `${d["Candidate/Candidat"]}: ${d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]}%`);
        } else {
            d3.select("#detail").append("div").html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                        <h4>test</h4>
                    </div>
                `)
        }
        
    }

    onChange(){

    }
}