import { useEffect, useState } from "react";
import "../App.css";

export default function StationSelector() {
  const [mode, setMode] = useState("metro");
  const [stations, setStations] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingStations, setLoadingStations] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch stations (ONLY once on load)
  useEffect(() => {
    setLoadingStations(true);

    fetch("http://localhost:5000/stations")
      .then((res) => res.json())
      .then((data) => {
        setStations(data.stations || []);
        setLoadingStations(false);
      })
      .catch((err) => {
        console.error("Error fetching stations:", err);
        setLoadingStations(false);
      });
  }, []); // 👈 IMPORTANT: empty dependency

  // Calculate route
  const handleCalculate = () => {
    if (!start || !end) {
      setErrorMessage("Please select both start and end stations.");
      return;
    }

    setErrorMessage("");

    fetch(
      `http://localhost:5000/route?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRouteInfo(data);
      })
      .catch((err) => console.error("Route error:", err));
  };

  return (
    <div className="selector-container">
      <h1>Delhi Transit Route Finder</h1>

      {/* Mode */}
      <div className="mode-dropdown">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setStart("");
            setEnd("");
            setRouteInfo(null);
          }}
        >
          <option value="metro">Metro</option>
        </select>
      </div>

      {/* Dropdowns */}
      <div className="dropdowns">
        <select value={start} onChange={(e) => setStart(e.target.value)}>
          <option value="">Select Start</option>
          {loadingStations ? (
            <option>Loading...</option>
          ) : (
            stations.map((station, index) => (
              <option key={index} value={station}>
                {station}
              </option>
            ))
          )}
        </select>

        <select value={end} onChange={(e) => setEnd(e.target.value)}>
          <option value="">Select End</option>
          {loadingStations ? (
            <option>Loading...</option>
          ) : (
            stations.map((station, index) => (
              <option key={index + "-end"} value={station}>
                {station}
              </option>
            ))
          )}
        </select>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button className="calculate-btn" onClick={handleCalculate}>
        Calculate Route
      </button>

      {/* Result */}
      {routeInfo && routeInfo.route && (
        <div className="result-box">
          <p><strong>Start:</strong> {routeInfo.start}</p>
          <p><strong>End:</strong> {routeInfo.end}</p>
          <p><strong>Stops:</strong> {routeInfo.stops}</p>
          <p>
            <strong>Estimated Time:</strong>{" "}
            {routeInfo.approx_time_minutes} mins
          </p>

          <hr />

          <h3>Route:</h3>
          <ol>
            {routeInfo.route.map((station, index) => (
              <li key={index}>{station}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}