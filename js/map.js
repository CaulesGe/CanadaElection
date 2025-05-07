/*  ElectionMap.js  */
export default class ElectionMap {
    constructor(parentElement, electionData) {
      this.parentElement= parentElement;
      this.electionData = electionData;
      this.ridingColor = {
        conservative: "#1A4782",
        liberal: "#D71920",
        NDP: "#F37021",
        Green: "#3D9B35",
        Bloc: "#009EE0"
      }
      this.initVis();
    }
  
    /* ------------------------------------------------------------------ */
    initVis() {
      const vis = this;
  
      /* 1 ▸ create a Leaflet map in the container ---------------------- */
      vis.map = L.map(vis.parentElement, { zoomSnap: 0.25 })
               .setView([56, -96], 3.5);                 // Canada-wide view
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '© OpenStreetMap, © CARTO'
      }).addTo(vis.map);
  
      /* 2 ▸ ask Leaflet for an <svg> overlay we can draw into ---------- */
      L.svg().addTo(vis.map);                            // puts <svg> in overlayPane
      vis.svg = d3.select(vis.map.getPanes().overlayPane).select('svg');
      vis.g   = vis.svg.append('g').attr('class', 'ridings');
  
      /* 3 ▸ build a D3 projection that re-uses Leaflet’s own projection */
      const projectPoint = function (lon, lat) {
        const pt = vis.map.latLngToLayerPoint([lat, lon]);  // EPSG:3857
        this.stream.point(pt.x, pt.y);
      };
      vis.projection = d3.geoTransform({ point: projectPoint });
      vis.path       = d3.geoPath().projection(vis.projection);
      
      // create tooltip
      vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')
  
      /* 4 ▸ load the GeoJSON and draw once, then redraw after every zoom */
      d3.json('data/riding.geojson').then(geo => {
        vis.features = geo.features;
  
        vis.ridings = vis.g
          .selectAll('path')
          .data(vis.features)
          .enter()
          .append('path')
          .attr('class', 'leaflet-interactive')   // ← **crucial** for pointer events
          .attr("d", vis.path)
          .attr('fill',  '#d3d3d3')
          .attr('fill-opacity', 0.5)
          .attr('stroke','#666')
          .attr('stroke-width', 0.4)
      

        vis.updateVis(); // draw the map for the first time
        vis.map.on('zoomend moveend', () => vis.updateVis()); // redraw on every move
        vis.wrangleData();
      });

    }

    wrangleData() {
      let vis = this;
      vis.candidatesByRiding = Array.from(d3.group(vis.electionData, d => d["Electoral District Number/Numéro de circonscription"]), ([key, value]) => ({key, value}))
      console.log(vis.candidatesByRiding)

      vis.updateVis(); // redraw the map with new data
    }
  
    /* ------------------------------------------------------------------ */
    updateVis() {
      let vis = this;
  
      // Re-select paths cleanly
      vis.ridings = vis.g.selectAll('path')
      
      // Update path data (recalculate position)
      vis.ridings.attr('d', vis.path);
  
      // (Re)bind event listeners
      vis.ridings
        .on('mouseover', function (e, d) {
          this.parentNode.appendChild(this); // Bring to front

          const code = d.properties["fed_code"];
          const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);
          vis.showDetail(d, selectedRidingCandidates); // detailed page
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', () => {
              console.log(selectedRidingCandidates)
              let winningParty = selectedRidingCandidates.value[0]["Candidate/Candidat"]
             
              console.log(winningParty);

              if (winningParty.includes("Liberal")) {
                return vis.ridingColor.liberal;
              } else if (winningParty.includes("Conservative")) {
                return vis.ridingColor.conservative;
              } else if (winningParty.includes("NDP")){
                return vis.ridingColor.NDP;
              } else if (winningParty.includes("Bloc")) {
                return vis.ridingColor.Bloc;
              }
            })   
            .attr('fill-opacity', () => {
              let percentageOfVote = selectedRidingCandidates.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
              return percentageOfVote / 100;
            });

          // tooltip
          vis.tooltip.style('display', 'block')
                .style('left', e.pageX + 10 + 'px')
                .style('top', e.pageY - 15 + 'px')
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                        <h4 style="margin: 0; padding: 0; font-size: 1.2em;">${d.properties.fed_name_en}</h4>
                    </div>
                    `).transition().duration(350).style('opacity', 1);
        })
        .on('mouseout', function () {
          vis.tooltip.style('display', 'none');
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', '#d3d3d3')
            .attr('fill-opacity', 0.5);
        });
  }

  showDetail(d, selectedRidingCandidates) {
  
    const ridings = d.properties;
    //console.log(ridings);
    const name = ridings.fed_name_en;
    const province = ridings.prov_name_en;
    

    d3.select("#province").style("opacity", 1).html(province);
  
    d3.select("#ridingName")
      .style("opacity", 1)
      .html(name)

    // search for corresponding data
    
    //console.log(selectedRidingCandidates);

    // clear old data
    d3.select("#detail").selectAll("p").remove();
    
    d3.select("#detail").selectAll("p").data(selectedRidingCandidates.value).enter().append("p").text(d => `${d["Candidate/Candidat"]}: ${d["Percentage of Votes Obtained /Pourcentage des votes obtenus"]}%`);
  }


}
  