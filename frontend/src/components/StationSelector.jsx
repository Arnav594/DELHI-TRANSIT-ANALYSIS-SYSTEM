import { useEffect, useState } from "react";
import "../App.css";

const API_URL = "https://delhi-transit-analysis-system.onrender.com";

export default function StationSelector() {
  const [mode, setMode] = useState("metro");
  const [stations, setStations] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingStations, setLoadingStations] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch stations on load
  useEffect(() => {
    setLoadingStations(true);
    fetch(`${API_URL}/stations?mode=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        setStations(data.stations || []);
        setLoadingStations(false);
      })
      .catch((err) => {
        console.error("Error fetching stations:", err);
        setLoadingStations(false);
      });
  }, [mode]);

  const handleCalculate = () => {
    if (!start || !end) {
      setErrorMessage("Please select both start and end stations.");
      return;
    }
    setErrorMessage("");
    fetch(
      `${API_URL}/route?mode=${mode}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    )
      .then((res) => res.json())
      .then((data) => setRouteInfo(data))
      .catch((err) => console.error("Route error:", err));
  };

  const handleReset = () => {
    setRouteInfo(null);
    setStart("");
    setEnd("");
  };

  return (
    <div className={`layout-wrapper ${routeInfo ? "active-results" : ""}`}>
      
      {/* LEFT SIDE: Search Card */}
      <div className="station-container">
        <h2>Delhi Transit</h2>
        <div className="mode-dropdown">
          <label className="black-text">Transport Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="metro">Metro</option>
          </select>
        </div>

        <div className="dropdowns">
          <div className="input-group">
            <label className="black-text">From</label>
            <select value={start} onChange={(e) => setStart(e.target.value)}>
              <option value="">Select Start</option>
              {loadingStations ? <option>Loading...</option> : 
                stations.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="black-text">To</label>
            <select value={end} onChange={(e) => setEnd(e.target.value)}>
              <option value="">Select End</option>
              {loadingStations ? <option>Loading...</option> : 
                stations.map((s, i) => <option key={i + "-end"} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <button className="calculate-btn" onClick={handleCalculate}>
          Calculate Route
        </button>
        
        {routeInfo && (
          <button className="reset-btn" onClick={handleReset}>
            Clear Search
          </button>
        )}
      </div>

      {/* RIGHT SIDE: Results Card */}
      {routeInfo && routeInfo.route && (
        <div className="result-side-container">
          <div className="result-header">
            <h3>Route Details</h3>
            <div className="stats-row">
              <div className="stat-card">
                <span>Stops</span>
                <strong>{routeInfo.stops}</strong>
              </div>
              <div className="stat-card">
                <span>Time</span>
                <strong>{routeInfo.approx_time_minutes} min</strong>
              </div>
            </div>
          </div>
          
          <div className="route-path">
            <h4>Stations List</h4>
            <ul className="station-ul">
              {routeInfo.route.map((station, index) => (
                <li key={index}>
                  <span className="dot"></span>
                  {station}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}