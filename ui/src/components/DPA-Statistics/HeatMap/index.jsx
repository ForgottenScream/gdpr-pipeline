import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _service from "@netuno/service-client";

const EuropeFineMap = () => {
  const [fineData, setFineData] = useState({});
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    _service({
      url: `dpa/fine?start_date=${startDate}&end_date=${endDate}`,
      method: "GET",
      success: (response) => {
        const responseData = response.json || [];
        const mappedData = {};
        responseData.forEach((item) => {
          mappedData[item.country_code] = item.total_fines || 0;
        });
        setFineData(mappedData);
        setIsLoading(false);
      },
      fail: (err) => {
        setError(err.message || 'Failed to fetch data');
        setFineData({});
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetch("/public/europe.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const downloadSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `europe-dpa-fines-${startDate}-to-${endDate}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getColor = (fineAmount) => {
    if (fineAmount > 1000000000) return "#800026";
    if (fineAmount > 500000000) return "#BD0026";
    if (fineAmount > 100000000) return "#E31A1C";
    if (fineAmount > 50000000) return "#FC4E2A";
    if (fineAmount > 10000000) return "#FF7F27";
    return "#FFFFCC";
  };

  useEffect(() => {
    if (!geoJsonData || Object.keys(fineData).length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    const projection = d3.geoMercator()
      .center([10, 50])
      .scale(400)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => getColor(fineData[d.properties.ISO2] || 0))
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${height - 120})`);
    legend.append("text").attr("y", -10).text("Fines (€)").style("font-weight", "bold");
    const legendItems = [
      { color: "#800026", label: ">1B" },
      { color: "#BD0026", label: "500M–1B" },
      { color: "#E31A1C", label: "100M–500M" },
      { color: "#FC4E2A", label: "50M–100M" },
      { color: "#FF7F27", label: "10M–50M" },
      { color: "#FFFFCC", label: "<10M" },
    ];
    legendItems.forEach((item, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 15).attr("height", 15).attr("fill", item.color).attr("stroke", "#000");
      legend.append("text").attr("x", 20).attr("y", i * 20 + 12).text(item.label).style("font-size", "12px");
    });

  }, [fineData, geoJsonData]);

  if (!geoJsonData || Object.keys(fineData).length === 0) {
    return (
      <div>
        <h3>DPA Fines Map</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="start_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
            <input type="date" id="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="end_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
            <input type="date" id="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <button type="submit" disabled={isLoading} style={{ padding: '8px 15px', backgroundColor: isLoading ? '#cccccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', height: 'fit-content' }}>
            {isLoading ? 'Loading...' : 'Update Map'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h3>DPA Fines Map</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>Fines from {startDate} to {endDate}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="start_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
          <input type="date" id="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="end_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
          <input type="date" id="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '8px 15px', backgroundColor: isLoading ? '#cccccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', height: 'fit-content' }}>
          {isLoading ? 'Loading...' : 'Update Map'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
      <button onClick={downloadSVG} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Download SVG
      </button>
      <svg ref={svgRef} width={800} height={600} style={{ marginTop: '15px' }} />
    </div>
  );
};

export default EuropeFineMap;
