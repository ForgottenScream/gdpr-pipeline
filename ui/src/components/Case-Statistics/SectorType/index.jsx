import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _service from '@netuno/service-client';

export default function CaseAnalyticsGraph() {
  const [data, setData] = useState([]);
  const [analyticsType, setAnalyticsType] = useState('sector');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    _service({
      url: `case/statistics/${analyticsType}?start_date=${startDate}&end_date=${endDate}`,
      method: 'GET',
      success: (response) => {
        const responseData = response.json ? response.json : [];
        setData(Array.isArray(responseData) ? responseData : []);
        setIsLoading(false);
      },
      fail: (err) => {
        setError(err.message || 'Failed to fetch data');
        setData([]);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [analyticsType, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleAnalyticsChange = (e) => {
    setAnalyticsType(e.target.value);
  };

  const downloadSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `case-analytics-${analyticsType}-${startDate}-to-${endDate}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 100, bottom: 40, left: 300 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    data.sort((a, b) => b.case_count - a.case_count);

    const y = d3.scaleBand()
      .domain(data.map(d => d[analyticsType]))
      .range([0, height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.case_count)])
      .range([0, width]);

    chart.append("g").call(d3.axisLeft(y).tickSize(0));
    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "400px")
      .style("font-size", "14px");

    chart.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d[analyticsType]))
      .attr("width", d => x(d.case_count))
      .attr("height", y.bandwidth())
      .attr("fill", "#82ca9d")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${d[analyticsType]}</strong><br/>Cases: ${d.case_count.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    chart.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.case_count) + 5)
      .attr("y", d => y(d[analyticsType]) + y.bandwidth() / 2 + 4)
      .text(d => d3.format(",")(d.case_count))
      .attr("text-anchor", "start")
      .attr("fill", "#333")
      .attr("font-size", "12px");

    chart.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
      .style("text-anchor", "middle")
      .text("Number of Cases")
      .style("font-size", "14px");

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .text(analyticsType === 'sector' ? "Case Sector" : "Case Type")
      .style("font-size", "14px");

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`Cases by ${analyticsType === 'sector' ? 'Sector' : 'Type'} (${startDate} to ${endDate})`);

  }, [data, analyticsType, startDate, endDate]);

  return (
    <div style={{ width: '100%', overflowX: 'auto', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Cases by {analyticsType === 'sector' ? 'Sector' : 'Type'}</h3>
        <div>
          <select value={analyticsType} onChange={handleAnalyticsChange} style={{ padding: '8px', fontSize: '14px' }}>
            <option value="sector">Sector</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>
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
          {isLoading ? 'Loading...' : 'Update Graph'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
      <button onClick={downloadSVG} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Download SVG
      </button>
      {isLoading ? <div>Loading...</div> : <svg ref={svgRef} width={900} height={600} />}
    </div>
  );
}
