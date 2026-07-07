import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _service from '@netuno/service-client';

const CaseStatisticsGraph = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`/services/case/statistics/aggregate/get?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadSVG = () => {
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `case-statistics-${startDate}-to-${endDate}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.dpa_country_code))
      .range([0, width])
      .padding(0.1);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    chart.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("DPA Country Code");

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.case_count)])
      .range([height, 0]);

    chart.append("g")
      .call(d3.axisLeft(y));

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Cases Against 1 Controller");

    chart.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.dpa_country_code))
      .attr("y", d => y(d.case_count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.case_count))
      .attr("fill", "steelblue");

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    chart.selectAll(".bar")
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`<strong>${d.dpa_country_code}</strong><br/>${d.case_info}<br/>Cases: ${d.case_count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`DPA Case Statistics (${startDate} to ${endDate})`);

  }, [data, startDate, endDate]);

  return (
    <div className="case-statistics-container">
      <h2>DPA Case Statistics by Country</h2>
      <form onSubmit={handleSubmit} className="date-range-form">
        <div className="form-group">
          <label htmlFor="start_date">Start Date:</label>
          <input type="date" id="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="end_date">End Date:</label>
          <input type="date" id="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Update Graph'}
        </button>
      </form>
      {error && <div className="error-message">Error: {error}</div>}
      <button onClick={downloadSVG} style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Download SVG
      </button>
      <div className="graph-container">
        <svg ref={svgRef} width="800" height="500"></svg>
      </div>
      <style jsx>{`
        .case-statistics-container { max-width: 900px; padding: 20px; font-family: Arial, sans-serif; }
        .date-range-form { display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-end; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 5px; font-weight: bold; }
        .form-group input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; height: fit-content; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        .error-message { color: red; margin-bottom: 15px; }
        .graph-container { margin-top: 20px; }
        .bar:hover { fill: #1e88e5; }
        .tooltip { position: absolute; padding: 8px; background: rgba(0, 0, 0, 0.8); color: white; border-radius: 4px; pointer-events: none; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default CaseStatisticsGraph;
