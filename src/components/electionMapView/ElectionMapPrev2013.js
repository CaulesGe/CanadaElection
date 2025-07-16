import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ElectionMap.css';

const partyColor = {
  conservative: "#1A4782",
  liberal: "#D71920",
  NDP: "#F37021",
  Green: "#3D9B35",
  Bloc: "#009EE0"
};

function createProjection(map) {
  return d3.geoTransform({
    point(lon, lat) {
      const pt = map.latLngToLayerPoint([lat, lon]);
      this.stream.point(pt.x, pt.y);
    }
  });
}

function initializeMap(container) {
  const map = L.map(container, { zoomSnap: 0.25 }).setView([56, -96], 3.5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap, © CARTO'
  }).addTo(map);
  L.svg().addTo(map);
  return map;
}

export const ElectionMapPrev2013 = ({
  mapRef,           // forwarded ref from parent
  electionData,    // array of candidates keyed by FEDUID
  geojsonUrl,      // GeoJSON URL or path
  setSelectedCandidates
}) => {
  const mapContainerRef = useRef();
  const d3LayerRef = useRef();
  const tooltipRef = useRef();
  const selectedFeatureRef = useRef();


console.log("rws");

  useEffect(() => {
    if (!mapContainerRef.current || !electionData.length || mapRef.current) return;

    const map = initializeMap(mapContainerRef.current);
    mapRef.current = map;

    const svg = d3.select(map.getPanes().overlayPane).select('svg');
    const g = svg.append('g').attr('class', 'ridings');
    d3LayerRef.current = { svg, g };

    tooltipRef.current = d3.select("body")
      .append("div").attr("class", "tooltip").style("display", "none");

    const projection = createProjection(map);
    const path = d3.geoPath().projection(projection);

    d3.json(geojsonUrl).then(geo => {
      const features = geo.features;
      const dataByDistrict = new Map(
        d3.group(electionData, d => d.FEDUID)
      );

      mapRef.current.zoomToRiding = id => {
        const feat = features.find(f => f.properties.FEDUID === id);
        if (!feat) return console.warn("No district geometry:", id);
        const bounds = L.geoJSON(feat).getBounds();
        map.flyToBounds(bounds, { padding: [20, 20] });
        onClickFeature(feat);
      };

      const ridings = g.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('stroke', '#666')
        .attr('stroke-width', 0.4)
        .attr('fill', d => {
          const rows = dataByDistrict.get(d.properties.FEDUID);
          if (!rows) return '#ccc';
          const candidate = rows[0]["Candidate/Candidat"];
          if (candidate.includes("Liberal")) return partyColor.liberal;
          if (candidate.includes("Conservative")) return partyColor.conservative;
          if (candidate.includes("NDP")) return partyColor.NDP;
          if (candidate.includes("Bloc")) return partyColor.Bloc;
          if (candidate.includes("Green")) return partyColor.Green;
          return '#ccc';
        })
        .attr('fill-opacity', d => {
          const rows = dataByDistrict.get(d.properties.FEDUID);
          if (!rows) return 0.3;
          const pct = rows[0]["Percentage of Votes Obtained /Pourcentage des votes obtenus"];
          return pct / 100;
        });

      map.on('zoomend moveend', () => ridings.attr('d', path));

      ridings.on('mouseover', function(event, d) {
        if (selectedFeatureRef.current) return;
        setSelectedCandidates(dataByDistrict.get(d.properties.FEDUID) || []);
        d3.select(this).attr('fill-opacity', 0.9);
        tooltipRef.current.style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 15}px`)
          .html(`<div>${d.properties.FEDNAME}</div>`)
          .transition().duration(200).style('opacity', 1);
      }).on('mouseout', function(event, d) {
        if (selectedFeatureRef.current) return;
        d3.select(this).transition().duration(300)
          .attr('fill-opacity', () => {
            const rows = dataByDistrict.get(d.properties.FEDUID) || [];
            const pct = rows[0]?.["Percentage of Votes Obtained /Pourcentage des votes obtenus"] || 0;
            return pct / 100;
          });
        tooltipRef.current.transition().duration(200).style('opacity', 0)
          .on("end", () => tooltipRef.current.style("display", "none"));
      }).on('click', (event, d) => onClickFeature(d, event));

      function onClickFeature(d, event) {
        if (selectedFeatureRef.current === d) {
          selectedFeatureRef.current = null;
        } else {
          selectedFeatureRef.current = d;
        }
        g.selectAll('path').attr('fill-opacity', fd => {
          const rows = dataByDistrict.get(fd.properties.FEDUID) || [];
          const pct = rows[0]?.["Percentage of Votes Obtained /Pourcentage des votes obtenus"] || 0;
          return fd === d ? 0.9 : pct / 100;
        });

        if (event) {
          tooltipRef.current.style('display', 'block')
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 15 + 'px')
            .html(`<div>${d.properties.FEDNAME}</div>`)
            .transition().duration(350).style('opacity', 1);
        }
        setSelectedCandidates(dataByDistrict.get(d.properties.FEDUID) || []);
      }
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
      tooltipRef.current?.remove();
    };
  }, [electionData, geojsonUrl, setSelectedCandidates, mapRef]);

  return <div id="map" ref={mapContainerRef} style={{ height: '600px', width: '100%' }} />;
};
