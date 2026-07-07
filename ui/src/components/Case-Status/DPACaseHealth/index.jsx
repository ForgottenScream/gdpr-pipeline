import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import _service from "@netuno/service-client";

export default function DpaHealth() {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState('2000-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const svgRef = useRef(null);

    const fetchData = () => {
        setIsLoading(true);
        setError(null);
        _service({
            url: `dpa/count?start_date=${startDate}&end_date=${endDate}`,
            method: 'GET',
            success: (response) => {
                const responseData = response.json ? response.json.data : [];
                setData(Array.isArray(responseData) ? responseData : []);
            },
            fail: (err) => {
                setError(err.message || 'Failed to fetch data');
                setData([]);
            }
        });
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
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
        link.download = `dpa-health-${startDate}-to-${endDate}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 100, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X-axis: DPA names
        const x = d3.scaleBand()
            .domain(data.map(d => d.dpa_code))
            .range([0, width])
            .padding(0.2);

        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Y-axis: Case counts
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.case_count)])
            .range([height, 0]);

        chart.append("g")
            .call(d3.axisLeft(y));

        // Color scale for source_type
        const color = d3.scaleOrdinal()
            .domain(["Primary", "Secondary"])
            .range(["#1f77b4", "#ff7f0e"]);

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font-size", "14px");

        // Bars with tooltips
        chart.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.dpa_code))
            .attr("y", d => y(d.case_count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.case_count))
            .attr("fill", d => color(d.source_type))
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`
                    <strong>${d.dpa_code}</strong><br/>
                    Cases: ${d.case_count.toLocaleString()}<br/>
                    Source: ${d.source_type}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 100}, 20)`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#1f77b4");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 13)
            .text("Primary Source")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#ff7f0e");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 33)
            .text("Secondary Source")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        // Title with date range
        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Case Count by DPA (${startDate} to ${endDate})`);

    }, [data, startDate, endDate]);

    return (
        <>
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <h3>Case Count by DPA</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="start_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
                    <input
                        type="date"
                        id="start_date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="end_date" style={{ marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
                    <input
                        type="date"
                        id="end_date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{
                    padding: '8px 15px',
                    backgroundColor: isLoading ? '#cccccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    height: 'fit-content'
                }}>
                    {isLoading ? 'Loading...' : 'Update Graph'}
                </button>
            </form>
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
            <button onClick={downloadSVG} style={{
                marginBottom: '10px',
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>
                Download SVG
            </button>
            <svg ref={svgRef} width={800} height={500} />
        </div>
        </>
    );
}
