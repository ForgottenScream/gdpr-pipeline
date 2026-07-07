import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import _service from "@netuno/service-client";

const EuropeFineMap = () => {
  const [fineData, setFineData] = useState({});
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch DPA fine data from Netuno
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

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch GeoJSON for Europe
  useEffect(() => {
    fetch("/public/europe.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Color gradient function
  const getColor = (fineAmount) => {
    if (fineAmount > 1000000000) return "#800026"; // >1B (Ireland)
    if (fineAmount > 500000000) return "#BD0026"; // >500M (France, Netherlands, Italy, UK, Spain)
    if (fineAmount > 100000000) return "#E31A1C"; // >100M (Germany, Greece, Poland, Portugal)
    if (fineAmount > 50000000) return "#FC4E2A";  // >50M (Austria, Croatia, Czech Republic, Finland)
    if (fineAmount > 10000000) return "#FF7F27";  // >10M (Belgium, Bulgaria, Denmark, Estonia, Lithuania, Norway, Sweden)
    return "#FFFFCC"; // <10M (Cyprus, Hungary, Iceland, Isle of Man, Liechtenstein, Luxembourg, Malta, Romania, Slovakia, Slovenia)
  };

  // GeoJSON style function
  const getGeoJsonStyle = (feature) => {
    const countryCode = feature.properties.ISO2;
    const fineAmount = fineData[countryCode] || 0;
    return {
      fillColor: getColor(fineAmount),
      fillOpacity: 0.7,
      color: "#000",
      weight: 1,
    };
  };

  // Skip rendering until data is loaded
  if (!geoJsonData || Object.keys(fineData).length === 0) {
    return (
      <div>
        <h3>DPA Fines Map</h3>
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
      <p style={{ fontSize: '14px', color: '#666' }}>
        Fines from {startDate} to {endDate}
      </p>
      
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
          {isLoading ? 'Loading...' : 'Update Map'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}

      <MapContainer
        center={[50, 10]}
        zoom={4}
        style={{ height: "600px", width: "100%", marginTop: '15px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {geoJsonData && <GeoJSON data={geoJsonData} style={getGeoJsonStyle} />}
        <Legend />
      </MapContainer>
    </div>
  );
};

// Legend component
const Legend = () => (
  <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 1000, background: "white", padding: 10 }}>
    <h4>Fines (€)</h4>
    <div><span style={{ background: "#800026", width: 20, height: 20, display: "inline-block" }}></span> &gt;1B</div>
    <div><span style={{ background: "#BD0026", width: 20, height: 20, display: "inline-block" }}></span> 500M–1B</div>
    <div><span style={{ background: "#E31A1C", width: 20, height: 20, display: "inline-block" }}></span> 100M–500M</div>
    <div><span style={{ background: "#FC4E2A", width: 20, height: 20, display: "inline-block" }}></span> 50M–100M</div>
    <div><span style={{ background: "#FF7F27", width: 20, height: 20, display: "inline-block" }}></span> 10M–50M</div>
    <div><span style={{ background: "#FFFFCC", width: 20, height: 20, display: "inline-block" }}></span> &lt;10M</div>
  </div>
);

export default EuropeFineMap;

