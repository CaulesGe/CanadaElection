import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ElectionMap.css';

// Party color constant
const partyColor = {
  conservative: "#1A4782",
  liberal: "#D71920",
  NDP: "#F37021",
  Green: "#3D9B35",
  Bloc: "#009EE0"
};

// Create D3 projection
function createProjection(map) {
    const projectPoint = function (lon, lat) {
        const point = map.latLngToLayerPoint([lat, lon]);
        this.stream.point(point.x, point.y);
    };
    return d3.geoTransform({ point: projectPoint });
}

// Initialize Leaflet map
function initializeMap(container) {
    const map = L.map(container, { zoomSnap: 0.25 }).setView([56, -96], 3.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap, © CARTO'
    }).addTo(map);
    L.svg().addTo(map);
    return map;
}

export const ElectionMap = ({ mapRef, selectedElection , electionData, setSelectedCandidates }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const d3LayerRef = useRef({});
    const tooltipRef = useRef(null);
    const selectedRidingRef = useRef(null);
    const [geoData, setGeoData] = useState(null);
    const [federalName, setFederalName] = useState("fed_name_en");
    const [federalCode, setFederalCode] = useState("fed_code");
    const [geoData20022012, setGeoData20022012] = useState(null);
    const [geoData20132023, setGeoData20132023] = useState(null);

    const electionsAfter2013 = new Set(["42ndCA2015", "43rdCA2019", "44thCA2021"]);
    const electionsBefore2013 = new Set(["39thCA2006", "40thCA2008", "41thCA2011"]);

    const candidatesByRiding = useMemo(() => {
        return Array.from(
            d3.group(electionData, d => d["Electoral District Number"]),
            ([key, value]) => ({ key, value })
        );
    }, [electionData]);
   // console.log(electionData);
  //  console.log(candidatesByRiding);
    

    // cache geojson
    useEffect(() => {
        const loadGeoData = async () => {
            const [data20132023, data20022012] = await Promise.all([
            d3.json("data/44thCA2021/riding.geojson"),
            d3.json("data/41stCA2011/riding.geojson")
            ]);
            setGeoData20132023(data20132023);
            setGeoData20022012(data20022012);
        };
        loadGeoData();
    }, []);

    // Election configuration
    const electionMapConfig = useMemo(() => ({
      after2013: {
        match: electionsAfter2013,
        geoData: geoData20132023,
        nameField: "fed_name_en",
        codeField: "fed_code"
      },
      before2013: {
        match: electionsBefore2013,
        geoData: geoData20022012,
        nameField: "FEDNAME",
        codeField: "FEDUID"
      }
    }), [geoData20132023, geoData20022012]);

    useEffect(() => {
      if (!geoData20132023 || !geoData20022012) return;

      const config = electionsAfter2013.has(selectedElection)
        ? electionMapConfig.after2013
        : electionMapConfig.before2013;

      setGeoData(prev => (prev !== config.geoData ? config.geoData : prev));
      setFederalName(prev => (prev !== config.nameField ? config.nameField : prev));
      setFederalCode(prev => (prev !== config.codeField ? config.codeField : prev));
    }, [selectedElection, electionMapConfig]);


    useEffect(() => {
        if (!mapContainerRef.current || !geoData || !electionData || !electionData.length || mapInstanceRef.current) return;
        
        renderRidings(geoData);
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
        
    }, [electionData, setSelectedCandidates, mapRef, geoData]);

    function renderRidings(geoData) {
        // Initialize map
        const map = initializeMap(mapContainerRef.current);
        mapInstanceRef.current = map;
        if (mapRef && mapRef.current === null) {
          mapRef.current = map;
        }
    
        const svg = d3.select(map.getPanes().overlayPane).select('svg');
        const g = svg.append('g').attr('class', 'ridings');
        d3LayerRef.current = { svg, g };
    
        // Tooltip
        tooltipRef.current = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("display", "none");
    
        const projection = createProjection(map);
        const path = d3.geoPath().projection(projection);
    
        // GeoJSON loading and rendering
        
        const features = geoData.features;
        mapRef.current = {
          map,
          zoomToRiding: (districtNumber) => {
            const match = features.find(f => f.properties[federalCode] == districtNumber);
            if (match) {
              const bounds = L.geoJSON(match.geometry).getBounds();
              map.flyToBounds(bounds, { padding: [20, 20] });
              handleRidingClick(match); // simulate click
            } else {
              console.warn("No geometry found for district:", districtNumber);
            }
          }
        };
    
        const ridings = g.selectAll('path')
          .data(features, d => d.properties[federalCode])
          .enter()
          .append('path')
          .attr('class', 'leaflet-interactive')
          .attr('d', path)
          .attr('stroke', '#666')
          .attr('stroke-width', 0.4)
          .attr('fill', d => {
            const code = d.properties[federalCode];
            const selected = candidatesByRiding.find(d => d.key == code);
            if (!selected) return '#ccc';
            const candidate = selected.value[0]["Candidate"];
            if (candidate.includes("Liberal")) return partyColor.liberal;
            if (candidate.includes("Conservative")) return partyColor.conservative;
            if (candidate.includes("NDP")) return partyColor.NDP;
            if (candidate.includes("Bloc")) return partyColor.Bloc;
            if (candidate.includes("Green")) return partyColor.Green;
            return '#ccc';
          })
          .attr('fill-opacity', d => {
            const code = d.properties[federalCode];
            const selected = candidatesByRiding.find(d => d.key == code);
            if (!selected) return 0.3;
            const percent = selected.value[0]["Percentage of Votes Obtained"];
            return percent / 100;
          });
    
        // Zoom/move redraw
        // let moveTimer;
        // map.on('moveend', () => {
        //     clearTimeout(moveTimer);
        //     moveTimer = setTimeout(() => ridings.attr('d', path), 0);
        // });
        // Zoom/move redraw
        map.on('zoomend moveend', () => {
        ridings.attr('d', path);
        });
    
        // Initial hover and click events
        ridings.on('mouseover', function (event, d) {
          if (selectedRidingRef.current) return;
          const selectedRidingCandidates = candidatesByRiding.find(r => r.key == d.properties[federalCode]);
          setSelectedCandidates(selectedRidingCandidates?.value || []);
          d3.select(this).attr('fill-opacity', 0.9);
          tooltipRef.current.style("display", "block")
            .style("opacity", 0)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 15}px`)
            .html(`<div>${d.properties[federalName]}</div>`)
            .transition().duration(200).style("opacity", 1);

        }).on('mouseout', function (event, d) {
          if (selectedRidingRef.current) return;
          d3.select(this).transition().duration(300).attr('fill-opacity', () => {
            const code = d.properties[federalCode];
            //const selected = candidatesByRiding.find(d => d.key == code);
            const selected = candidatesByRiding.find(d => d.key == code);
            return selected.value[0]["Percentage of Votes Obtained"] / 100;
          });
          tooltipRef.current.transition().duration(200).style("opacity", 0)
            .on("end", () => tooltipRef.current.style("display", "none"));

        }).on('click', function (event, d) {
          handleRidingClick(d, event);
        });
    
        function handleRidingClick(d, event = null) {
          if (selectedRidingRef.current === d) {
            selectedRidingRef.current = null;
            g.selectAll('path').filter(pathD => pathD === d)
              .transition().duration(300)
              .attr('fill-opacity', () => {
                const code = d.properties[federalCode];
                const selected = candidatesByRiding.find(c => c.key == code);
                return selected?.value[0]["Percentage of Votes Obtained"] / 100;
              });
            tooltipRef.current.style('display', 'none');
            return;
          }
    
          if (selectedRidingRef.current) {
            const prevCode = selectedRidingRef.current.properties[federalCode];
            g.selectAll('path')
              .filter(prevD => prevD.properties[federalCode] === prevCode)
              .transition().duration(350)
              .attr('fill-opacity', () => {
                const prev = candidatesByRiding.find(c => c.key == prevCode);
                return prev?.value[0]["Percentage of Votes Obtained"] / 100;
              });
          }
    
          selectedRidingRef.current = d;
          g.selectAll('path').filter(pathD => pathD === d)
            .transition().duration(350).attr('fill-opacity', 0.9);
    
          if (event) {
            tooltipRef.current.style('display', 'block')
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 15 + 'px')
              .html(`<div>${d.properties[federalName]}</div>`)
              .transition().duration(350).style('opacity', 1);
          }
    
          const selectedRidingCandidates = candidatesByRiding.find(r => r.key == d.properties[federalCode]);
          setSelectedCandidates(selectedRidingCandidates?.value || []);
        }
      
    }
    
    if (!geoData || !electionData.length) {
        return <div>Loading map...</div>;
    }

    return (
        <div id="map" ref={mapContainerRef} style={{ height: '600px', width: '100%' }} />
    );
};