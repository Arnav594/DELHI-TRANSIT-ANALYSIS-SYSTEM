import { useEffect, useState } from "react";
import { StationCombobox } from "./StationCombobox";
import { fetchStations, fetchRoute } from "@/lib/transit-api";
import type { RouteResponse } from "@/lib/transit-api";
import { RouteResults } from "./RouteResults";
import { ArrowLeftRight, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type RouteMode = "shortest" | "min_interchange";

const MODES: { id: RouteMode; label: string; desc: string; Icon: React.ElementType }[] = [
  {
    id: "shortest",
    label: "Fastest Route",
    desc: "Fewest stops · minimum travel time",
    Icon: Zap,
  },
  {
    id: "min_interchange",
    label: "Fewest Changes",
    desc: "Minimum line switches · stay comfortable",
    Icon: RefreshCw,
  },
];

export default function RoutePlanner() {
  const [stations, setStations] = useState<string[]>([]);
  const [start, setStart]       = useState("");
  const [end, setEnd]           = useState("");
  const [mode, setMode]         = useState<RouteMode>("shortest");
  const [loading, setLoading]   = useState(false);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [stationsLoading, setStationsLoading] = useState(true);

  useEffect(() => {
    fetchStations()
      .then(setStations)
      .catch((e) => console.error("Stations error:", e))
      .finally(() => setStationsLoading(false));
  }, []);

  const handleSwap = () => {
    setStart(end);
    setEnd(start);
    setRouteData(null);
    setError(null);
  };

  const handleRoute = async () => {
    if (!start || !end) return;
    if (start === end) { setError("Origin and destination must be different."); return; }
    setError(null);
    setLoading(true);
    setRouteData(null);
    try {
      const data = await fetchRoute(start, end, mode);
      if (data.error) setError(data.error);
      else setRouteData(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setStart(""); setEnd(""); setRouteData(null); setError(null);
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card/40 backdrop-blur-sm shadow-elevated p-6 sm:p-8 space-y-6">

      {/* ── Mode Selector ── */}
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(({ id, label, desc, Icon }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setRouteData(null); setError(null); }}
            className={cn(
              "group relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-all duration-200",
              mode === id
                ? "border-primary/60 bg-primary/10 shadow-glow-cyan"
                : "border-border/60 bg-secondary/30 hover:border-primary/30 hover:bg-secondary/60"
            )}
          >
            {/* active indicator dot */}
            <span className={cn(
              "absolute top-3 right-3 h-2 w-2 rounded-full transition-all",
              mode === id ? "bg-primary shadow-glow-cyan scale-100" : "bg-transparent scale-0"
            )} />
            <span className={cn(
              "flex items-center justify-center h-8 w-8 rounded-xl transition-colors",
              mode === id ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground group-hover:text-foreground"
            )}>
              <Icon className="h-4 w-4" />
            </span>
            <span className={cn(
              "font-display font-semibold text-sm leading-none",
              mode === id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {label}
            </span>
            <span className="text-[11px] text-muted-foreground leading-snug">{desc}</span>
          </button>
        ))}
      </div>

      {/* ── Station Inputs ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <StationCombobox
            value={start}
            onChange={(v) => { setStart(v); setRouteData(null); setError(null); }}
            stations={stations}
            loading={stationsLoading}
            placeholder="Choose origin station"
            accentClass="text-primary"
          />

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              title="Swap origin and destination"
              className="group flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all duration-200"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
              Swap
            </button>
          </div>

          <StationCombobox
            value={end}
            onChange={(v) => { setEnd(v); setRouteData(null); setError(null); }}
            stations={stations}
            loading={stationsLoading}
            placeholder="Choose destination station"
            accentClass="text-accent"
          />

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
              ⚠ {error}
            </p>
          )}

          {/* Action buttons */}
          <button
            onClick={handleRoute}
            disabled={!start || !end || loading}
            className={cn(
              "w-full py-3.5 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "hover:opacity-90 hover:shadow-glow-cyan hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            )}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Calculating…</span>
              : mode === "shortest" ? "Find Fastest Route →" : "Find Smoothest Route →"
            }
          </button>

          {routeData && (
            <button
              onClick={handleClear}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕ Clear results
            </button>
          )}
        </div>

        {/* ── Results ── */}
        <RouteResults
          loading={loading}
          route={routeData}
          start={start}
          end={end}
          mode={mode}
        />
      </div>
    </div>
  );
}