import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ElectionMap.css';



const ElectionMap = ({ electionData }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const d3LayerRef = useRef({});
  const tooltipRef = useRef(null);
  const selectedRidingRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !electionData || !electionData.length || mapInstanceRef.current) return;

    const partyColor = {
        conservative: "#1A4782",
        liberal: "#D71920",
        NDP: "#F37021",
        Green: "#3D9B35",
        Bloc: "#009EE0"
    };
    // Initialize map
    const map = L.map(mapContainerRef.current, { zoomSnap: 0.25 }).setView([56, -96], 3.5);
    mapInstanceRef.current = map;

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap, © CARTO'
    }).addTo(map);

    // Add SVG overlay
    L.svg().addTo(map);
    const svg = d3.select(map.getPanes().overlayPane).select('svg');
    const g = svg.append('g').attr('class', 'ridings');
    d3LayerRef.current = { svg, g };

    // Tooltip
    tooltipRef.current = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    // Projection
    const projectPoint = function (lon, lat) {
      const point = map.latLngToLayerPoint([lat, lon]);
      this.stream.point(point.x, point.y);
    };

    const projection = d3.geoTransform({ point: projectPoint });
    const path = d3.geoPath().projection(projection);

    // GeoJSON loading and rendering
    d3.json('data/CA2021/riding.geojson').then(geo => {
      const features = geo.features;
      const candidatesByRiding = Array.from(d3.group(electionData, d => d["Electoral District Number/Numéro de circonscription"]), ([key, value]) => ({key, value}));

      const ridings = g.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('class', 'leaflet-interactive')
        .attr('d', path)
        .attr('stroke', '#666')
        .attr('stroke-width', 0.4)
        .attr('fill', d => {
          const code = d.properties["fed_code"];
          const selected = candidatesByRiding.find(d => d.key == code);
          if (!selected) return '#ccc';

          const candidate = selected.value[0]["Candidate/Candidat"];
          if (candidate.includes("Liberal")) return partyColor.liberal;
          if (candidate.includes("Conservative")) return partyColor.conservative;
          if (candidate.includes("NDP")) return partyColor.NDP;
          if (candidate.includes("Bloc")) return partyColor.Bloc;
          if (candidate.includes("Green")) return partyColor.Green;
          return '#ccc';
        })
        .attr('fill-opacity', d => {
          const code = d.properties["fed_code"];
          const selected = candidatesByRiding.find(d => d.key == code);
          if (!selected) return 0.3;
          const percent = selected.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
          return percent / 100;
        });

      // Zoom/move redraw
      map.on('zoomend moveend', () => {
        ridings.attr('d', path);
      });
        // Initial hover and click events
      ridings.on('mouseover', function (event, d) {
        if (selectedRidingRef.current) return; // Skip hover if something is selected
        
        d3.select(this).attr('fill-opacity', 1);
        const tooltip = tooltipRef.current;
        tooltip.style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 15}px`)
          .html(`
            <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
              <h4 style="margin: 0; font-size: 1.2em;">${d.properties.fed_name_en}</h4>
            </div>
          `)
          .transition()
          .duration(200)
          .style("opacity", 1);
      }).on('mouseout', function (event, d) {
        if (selectedRidingRef.current) return; // Skip hover if something is selected
        
        d3.select(this).transition().duration(300).attr('fill-opacity', () => {
          const code = d.properties["fed_code"];
          const selected = candidatesByRiding.find(d => d.key == code);
          return selected.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"] / 100;
        });
        const tooltip = tooltipRef.current;
        tooltip.transition().duration(200).style("opacity", 0);
      }).on('click', function (event, d) {
        // Deselect if clicked again
        if (selectedRidingRef.current === d) {
            selectedRidingRef.current = null;
            d3.select(this).transition().duration(300).attr('fill-opacity', () => {
                const code = d.properties["fed_code"];
                const selected = candidatesByRiding.find(d => d.key == code);
                return selected.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"] / 100;
            })
            .attr('stroke-width', 0.4)
            .attr('stroke', '#666');
            const tooltip = tooltipRef.current;
            tooltip.style('display', 'none');
            return;
        }

        // Reset previous
        if (selectedRidingRef.current) {
            const prevCode = selectedRidingRef.current.properties["fed_code"];
            g.selectAll('path')
            .filter(function (prevD) {
                return prevD.properties["fed_code"] === prevCode;
            })
            .transition().duration(350)
            .attr('fill-opacity', function (prevD) {
                const selectedRidingCandidates = candidatesByRiding.find(d => d.key == prevD.properties["fed_code"]);
                let percentageOfVote = selectedRidingCandidates.value[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
                return percentageOfVote / 100;
            })
            .attr('stroke-width', 0.4)
            .attr('stroke', '#666');
        }

        selectedRidingRef.current = d;

        // Highlight selected
        d3.select(this)
            .transition()
            .duration(350)
            .attr('fill-opacity', 1)
            .attr('stroke-width', 2.5)
            .attr('stroke', '#000');

        // Update tooltip
        const tooltip = tooltipRef.current;
        tooltip.style('display', 'block')
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 15 + 'px')
            .html(`
            <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                <h4 style="margin: 0; padding: 0; font-size: 1.2em;">${d.properties.fed_name_en}</h4>
            </div>
            `)
            .transition()
            .duration(350)
            .style('opacity', 1);

    });
  });

    


    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [electionData]);

  return (
    <div id="map" ref={mapContainerRef} style={{ height: '600px', width: '100%' }} />
  );
};

export default ElectionMap;
