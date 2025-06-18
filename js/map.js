/*  ElectionMap.js  */
import ridingDetail from './ridingDetail.js';

export default class ElectionMap {
    constructor(parentElement, electionData) {
      this.parentElement= parentElement;
      this.electionData = electionData;
      this.partyColor = {
        conservative: "#1A4782",
        liberal: "#D71920",
        NDP: "#F37021",
        Green: "#3D9B35",
        Bloc: "#009EE0"
      }

      this.detailPage = new ridingDetail("detail");
      this.selectedRiding = null;
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
          //.attr('fill',  '#d3d3d3')
          .attr('stroke','#666')
          .attr('stroke-width', 0.4)
      
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

      //color the map by winning party
      
      vis.ridings.attr('fill', (d) => {
        const code = d.properties["fed_code"];
        const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);
        let winningParty = selectedRidingCandidates.value[0]["Candidate/Candidat"]
        
        if (winningParty.includes("Liberal")) {
          return vis.partyColor.liberal;
        } else if (winningParty.includes("Conservative")) {
            return vis.partyColor.conservative;
        } else if (winningParty.includes("NDP")){
            return vis.partyColor.NDP;
        } else if (winningParty.includes("Bloc")) {
            return vis.partyColor.Bloc;
        }
      }).attr('fill-opacity', (d) => {
        if (vis.selectedRiding && vis.selectedRiding === d) return 1;
        const code = d.properties["fed_code"];
        const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);
        let percentageOfVote = selectedRidingCandidates.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
              return percentageOfVote / 100;
      }).attr('stroke-width', d => vis.selectedRiding === d ? 2.5 : 0.4) // Thicker border for selected
      .attr('stroke', d => vis.selectedRiding === d ? '#000' : '#666');
    

      
  
      // (Re)bind event listeners
      vis.ridings.on('mouseover', function (e, d) {
          if (vis.selectedRiding) return; // Skip hover if something is selected

          this.parentNode.appendChild(this); // Bring to front

          const code = d.properties["fed_code"];
          const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);
         
          vis.detailPage.render(d, selectedRidingCandidates); // detailed page
          d3.select(this).transition().duration(350).
            attr('fill-opacity', 1);

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
          if (vis.selectedRiding) return; // Skip hover if something is selected
          d3.select(this).transition().duration(350).
          attr('fill-opacity', (d) => {
              const code = d.properties["fed_code"];
              const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);
              let percentageOfVote = selectedRidingCandidates.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
                    return percentageOfVote / 100;
            })
        }).on('click', function (e, d) {
            if (vis.selectedRiding === d) {
              vis.selectedRiding = null;
              vis.tooltip.style('display', 'none');
            
              vis.updateVis(); // Reset fill-opacity
              return;
            }

            // Reset the previous selected riding
            if (vis.selectedRiding) {
                // Get previous riding's code
                const prevCode = vis.selectedRiding.properties["fed_code"];
                // Reset fill-opacity for previously selected riding
                vis.g.selectAll('path').filter(function (prevD) {
                    return prevD.properties["fed_code"] === prevCode;
                }).transition().duration(350)
                  .attr('fill-opacity', function (prevD) {
                      const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == prevD.properties["fed_code"]);
                      let percentageOfVote = selectedRidingCandidates.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
                      return percentageOfVote / 100;
                  })
                  .attr('stroke-width', 0.4)  // Reset border width
                  .attr('stroke', '#666');  // Reset border color
            }

            vis.selectedRiding = d;


            const code = d.properties["fed_code"];
            const selectedRidingCandidates = vis.candidatesByRiding.find(d => d.key == code);

            vis.detailPage.render(d, selectedRidingCandidates); // render detail page

            // Center the map on clicked riding
            // const centroid = vis.path.centroid(d);
            // const point = vis.map.layerPointToLatLng(L.point(...centroid));
            // vis.map.flyTo(point, Math.max(vis.map.getZoom(), 5), {
            //     animate: true,
            //     duration: 1
            // });

            d3.select(this)
                .transition()
                .duration(350)
                .attr('fill-opacity', 1);

            vis.tooltip.style('display', 'block')
                .style('left', e.pageX + 10 + 'px')
                .style('top', e.pageY - 15 + 'px')
                .html(`
                    <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                        <h4 style="margin: 0; padding: 0; font-size: 1.2em;">${d.properties.fed_name_en}</h4>
                    </div>
                `)
                .transition()
                .duration(350)
                .style('opacity', 1);
        });
  }

}
  