import { Clock, MapPinned, Route as RouteIcon, Sparkles, TrainFront } from "lucide-react";
import type { RouteResponse } from "@/lib/transit-api";

interface RouteResultsProps {
  loading: boolean;
  route: RouteResponse | null;
  start: string;
  end: string;
}

function EmptyState() {
  return (
    <div className="relative h-full min-h-[420px] rounded-3xl border border-dashed border-border/80 bg-card/30 p-8 grid place-items-center text-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-sm space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary animate-float-slow">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold font-display">Where to today?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pick an origin and destination, and we'll plot the fastest path through the
          Delhi Metro network — interchanges, stops and ETA included.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="relative h-full min-h-[420px] rounded-3xl border border-border/80 bg-gradient-card p-8 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-mono">Routing through the network…</p>
      </div>
    </div>
  );
}

export function RouteResults({ loading, route, start, end }: RouteResultsProps) {
  if (loading) return <LoadingState />;
  if (!route || !route.route || route.route.length === 0) return <EmptyState />;

  const stations = route.route;
  const stops = route.stops ?? Math.max(0, stations.length - 1);
  const time = route.approx_time_minutes ?? null;
  const interchanges = route.interchanges ?? 0;

  return (
    <article className="relative rounded-3xl border border-border/80 bg-gradient-card p-6 sm:p-8 shadow-elevated overflow-hidden animate-slide-in-right">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <header className="relative flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Route Found</p>
          <h3 className="text-2xl sm:text-3xl font-display font-semibold leading-tight">
            <span className="text-foreground">{start}</span>
            <span className="text-muted-foreground mx-2">→</span>
            <span className="text-gradient">{end}</span>
          </h3>
        </div>
        <div className="hidden sm:grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary shrink-0">
          <RouteIcon className="h-5 w-5" />
        </div>
      </header>

      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-3 mb-8">
        <Stat icon={<MapPinned className="h-4 w-4" />} label="Stops" value={stops.toString()} />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Est. Time"
          value={time !== null ? `${time}` : "—"}
          unit={time !== null ? "min" : undefined}
        />
        <Stat
          icon={<TrainFront className="h-4 w-4" />}
          label="Interchanges"
          value={interchanges.toString()}
        />
      </div>

      {/* Path */}
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Stations on route</p>
        <ol className="relative space-y-1 max-h-[420px] overflow-y-auto pr-2 -mr-2">
          {stations.map((station, i) => {
            const isFirst = i === 0;
            const isLast = i === stations.length - 1;
            return (
              <li
                key={`${station}-${i}`}
                className="relative flex items-center gap-4 pl-8 py-2.5 group animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}
              >
                {/* connector line */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-primary/70 to-accent/70"
                  />
                )}
                {/* dot */}
                <span
                  aria-hidden
                  className={[
                    "absolute left-1.5 top-3.5 h-3.5 w-3.5 rounded-full border-2",
                    isFirst
                      ? "bg-primary border-primary animate-pulse-dot"
                      : isLast
                      ? "bg-accent border-accent shadow-glow-magenta"
                      : "bg-background border-primary/70",
                  ].join(" ")}
                />
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                  <span
                    className={[
                      "truncate font-medium",
                      isFirst || isLast ? "text-foreground" : "text-foreground/85",
                    ].join(" ")}
                  >
                    {station.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold leading-none">
        {value}
        {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}
