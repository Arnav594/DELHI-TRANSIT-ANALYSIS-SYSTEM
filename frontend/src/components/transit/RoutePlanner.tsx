import { useEffect, useState } from "react";
import { StationCombobox } from "./StationCombobox";
import { fetchStations, fetchRoute } from "@/lib/transit-api";
import { RouteResults } from "./RouteResults";

export default function RoutePlanner() {
  const [stations, setStations] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [stationsLoading, setStationsLoading] = useState(true);

  // Load stations
  useEffect(() => {
    fetchStations()
      .then((data) => {
        setStations(data);
      })
      .catch((err) => {
        console.error("Error loading stations:", err);
      })
      .finally(() => {
        setStationsLoading(false);
      });
  }, []);

  // Handle route fetch
  const handleRoute = async () => {
    if (!start || !end) return;

    try {
      setLoading(true);
      const data = await fetchRoute("metro", start, end);
      setRouteData(data);
    } catch (err) {
      console.error("Route error:", err);
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      
      {/* LEFT SIDE */}
      <div className="space-y-4">

        <StationCombobox
          value={start}
          onChange={setStart}
          stations={stations}
          loading={stationsLoading}
          placeholder="Choose origin station"
        />

        <StationCombobox
          value={end}
          onChange={setEnd}
          stations={stations}
          loading={stationsLoading}
          placeholder="Choose destination station"
        />

        <button
          onClick={handleRoute}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-medium"
        >
          Find Fastest Route
        </button>

        <button
          onClick={() => {
            setStart("");
            setEnd("");
            setRouteData(null);
          }}
          className="w-full py-2 text-sm text-muted-foreground"
        >
          Clear
        </button>
      </div>

      {/* RIGHT SIDE */}
      <RouteResults
        loading={loading}
        route={routeData}
        start={start}
        end={end}
      />
    </div>
  );
}