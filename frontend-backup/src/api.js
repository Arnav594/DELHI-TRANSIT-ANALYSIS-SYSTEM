const API_URL = "https://delhi-transit-analysis-system.onrender.com";

export const fetchStations = async (mode) => {
  const res = await fetch(`${API_URL}/stations?mode=${mode}`);
  return res.json();
};

export const fetchRoute = async (mode, start, end) => {
  const res = await fetch(
    `${API_URL}/route?mode=${mode}&start=${start}&end=${end}`
  );
  return res.json();
};