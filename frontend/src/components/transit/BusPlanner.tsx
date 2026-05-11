import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Zap, RefreshCw, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:5000";

type BusMode = "shortest" | "min_interchange";

const MODES: { id: BusMode; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: "shortest",        label: "Fastest Route",   desc: "Fewest stops · minimum travel time",      Icon: Zap },
  { id: "min_interchange", label: "Fewest Changes",  desc: "Minimum bus changes · stay comfortable",  Icon: RefreshCw },
];

interface BusStop   { stop: string; route_number: string; is_change: boolean }
interface BusResult {
  start?: string; end?: string;
  route?: BusStop[];
  stops?: number; changes?: number; approx_time_minutes?: number;
  error?: string;
}

// ── Searchable stop combobox ──────────────────────────────────────────────────
function StopCombobox({
  value, onChange, placeholder, accentClass,
}: { value: string; onChange: (v: string) => void; placeholder: string; accentClass: string }) {
  const [query,   setQuery]   = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside → close
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Fetch stops on query change (debounced)
  useEffect(() => {
    if (!open) return;
    if (query.length < 2) { setOptions([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/bus/stops?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        setOptions(d.stops ?? []);
      } catch { setOptions([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  return (
    <div ref={ref} className="relative">
      <input
        className={cn(
          "w-full rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm",
          "text-foreground placeholder:text-muted-foreground outline-none",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all",
          value && accentClass
        )}
        placeholder={placeholder}
        value={open ? query : value}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={e => setQuery(e.target.value)}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border/60 rounded-xl shadow-elevated max-h-56 overflow-y-auto">
          {loading && <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>}
          {!loading && query.length < 2 && <p className="px-4 py-3 text-xs text-muted-foreground">Type at least 2 characters to search</p>}
          {!loading && query.length >= 2 && options.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No stops found for "{query}"</p>
          )}
          {options.map(stop => (
            <button key={stop}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 text-foreground transition-colors border-b border-border/30 last:border-0"
              onMouseDown={() => { onChange(stop); setQuery(stop); setOpen(false); }}
            >
              <Bus className="inline h-3 w-3 mr-2 text-muted-foreground" />
              {stop}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Route result ──────────────────────────────────────────────────────────────
function BusRouteResult({ result, loading, mode }: { result: BusResult | null; loading: boolean; mode: BusMode }) {
  if (loading) return (
    <div className="flex-1 rounded-3xl border border-border/80 bg-card/40 p-8 grid place-items-center min-h-[300px]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Finding bus route…</p>
      </div>
    </div>
  );

  if (!result) return (
    <div className="flex-1 rounded-3xl border border-dashed border-border/60 bg-card/20 p-8 grid place-items-center min-h-[300px]">
      <div className="text-center space-y-3">
        <Bus className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Select origin and destination to find a bus route</p>
      </div>
    </div>
  );

  if (result.error) return (
    <div className="flex-1 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 flex items-center gap-3 min-h-[120px]">
      <span className="text-destructive text-xl">⚠</span>
      <p className="text-sm text-destructive">{result.error}</p>
    </div>
  );

  if (!result.route) return null;

  const ModeIcon = mode === "shortest" ? Zap : RefreshCw;

  return (
    <div className="flex-1 rounded-3xl border border-border/80 bg-card/40 p-6 space-y-5 animate-slide-in-right max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-1">Bus Route Found</p>
          <h3 className="font-display font-semibold text-lg leading-tight">
            <span className="text-foreground">{result.start}</span>
            <span className="text-muted-foreground mx-2">→</span>
            <span className="text-gradient">{result.end}</span>
          </h3>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <ModeIcon className="h-3 w-3" />
          {mode === "shortest" ? "Fastest" : "Fewest Changes"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Stops",   value: result.stops ?? 0 },
          { label: "Est. Time", value: result.approx_time_minutes ?? 0, unit: "min" },
          { label: "Changes", value: result.changes ?? 0 },
        ].map(({ label, value, unit }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-secondary/30 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <p className="font-display text-2xl font-semibold">
              {value}
              {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Stop timeline */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Stops on route</p>
        <ol className="space-y-0">
          {result.route.map((s, i) => {
            const isFirst = i === 0;
            const isLast  = i === result.route!.length - 1;
            return (
              <li key={i} className="relative flex items-stretch gap-3 pl-6 group animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 30, 500)}ms` }}>
                {/* Spine */}
                {!isLast && (
                  <span className="absolute left-[9px] top-5 bottom-0 w-[2px] bg-border/60" />
                )}
                {/* Dot */}
                <span className={cn(
                  "absolute left-0.5 top-2 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all",
                  isFirst || isLast ? "bg-primary border-primary w-5 h-5 -left-0.5 shadow-glow-cyan" :
                  s.is_change ? "bg-orange-400 border-orange-400" : "bg-muted-foreground/40 border-border"
                )} />
                {/* Content */}
                <div className="pb-4 pt-1 flex-1 min-w-0">
                  <p className={cn("text-sm leading-snug", isFirst || isLast ? "font-semibold text-foreground" : "text-foreground/80")}>
                    {s.stop}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {s.route_number && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Bus className="h-2.5 w-2.5" /> Route {s.route_number}
                      </span>
                    )}
                    {s.is_change && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20 font-semibold">
                        ⇄ change bus
                      </span>
                    )}
                  </div>
                </div>
                {/* Index */}
                <span className="font-mono text-[10px] text-muted-foreground/30 pt-2 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ── Main BusPlanner component ─────────────────────────────────────────────────
export default function BusPlanner() {
  const [start,   setStart]   = useState("");
  const [end,     setEnd]     = useState("");
  const [mode,    setMode]    = useState<BusMode>("shortest");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<BusResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const handleSwap = () => { setStart(end); setEnd(start); setResult(null); setError(null); };

  const handleFind = async () => {
    if (!start || !end) return;
    if (start === end) { setError("Origin and destination must be different."); return; }
    setError(null); setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API_BASE}/bus/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&mode=${mode}`);
      const d = await r.json();
      setResult(d);
    } catch {
      setError("Failed to connect to the backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setStart(""); setEnd(""); setResult(null); setError(null); };

  return (
    <div className="rounded-3xl border border-border/70 bg-card/40 backdrop-blur-sm shadow-elevated p-6 sm:p-8 space-y-6">

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(({ id, label, desc, Icon }) => (
          <button key={id}
            onClick={() => { setMode(id); setResult(null); setError(null); }}
            className={cn(
              "group relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-all duration-200",
              mode === id ? "border-primary/60 bg-primary/10 shadow-glow-cyan"
                         : "border-border/60 bg-secondary/30 hover:border-primary/30 hover:bg-secondary/60"
            )}>
            <span className={cn("absolute top-3 right-3 h-2 w-2 rounded-full transition-all",
              mode === id ? "bg-primary scale-100" : "scale-0")} />
            <span className={cn("flex items-center justify-center h-8 w-8 rounded-xl transition-colors",
              mode === id ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground group-hover:text-foreground")}>
              <Icon className="h-4 w-4" />
            </span>
            <span className={cn("font-display font-semibold text-sm",
              mode === id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{label}</span>
            <span className="text-[11px] text-muted-foreground">{desc}</span>
          </button>
        ))}
      </div>

      {/* Inputs + results */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <StopCombobox value={start} onChange={v => { setStart(v); setResult(null); }}
            placeholder="Search origin bus stop…" accentClass="text-primary" />

          <div className="flex justify-center">
            <button onClick={handleSwap}
              className="group flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
              <ArrowLeftRight className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
              Swap
            </button>
          </div>

          <StopCombobox value={end} onChange={v => { setEnd(v); setResult(null); }}
            placeholder="Search destination bus stop…" accentClass="text-accent" />

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">⚠ {error}</p>
          )}

          <button onClick={handleFind} disabled={!start || !end || loading}
            className={cn(
              "w-full py-3.5 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "hover:opacity-90 hover:shadow-glow-cyan hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            )}>
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding route…
                </span>
              : mode === "shortest" ? "Find Fastest Bus Route →" : "Find Smoothest Bus Route →"
            }
          </button>

          {result && !result.error && (
            <button onClick={handleClear}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              ✕ Clear
            </button>
          )}
        </div>

        <BusRouteResult result={result} loading={loading} mode={mode} />
      </div>
    </div>
  );
}