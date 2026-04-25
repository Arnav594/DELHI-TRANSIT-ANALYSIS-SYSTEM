import { Clock, MapPinned, TrainFront, Sparkles, RefreshCw, Zap, ArrowRight } from "lucide-react";
import type { RouteResponse, RouteStation } from "@/lib/transit-api";

// ── Delhi Metro official line colours ────────────────────────────────────────
const LINE_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Red line":          { dot: "#e53935", bg: "rgba(229,57,53,0.12)",   text: "#ff6b6b", border: "rgba(229,57,53,0.35)" },
  "Blue line":         { dot: "#1e88e5", bg: "rgba(30,136,229,0.12)",  text: "#64b3f4", border: "rgba(30,136,229,0.35)" },
  "Blue line branch":  { dot: "#42a5f5", bg: "rgba(66,165,245,0.12)",  text: "#90caf9", border: "rgba(66,165,245,0.35)" },
  "Yellow line":       { dot: "#fdd835", bg: "rgba(253,216,53,0.12)",  text: "#fff176", border: "rgba(253,216,53,0.35)" },
  "Green line":        { dot: "#43a047", bg: "rgba(67,160,71,0.12)",   text: "#81c784", border: "rgba(67,160,71,0.35)" },
  "Green line branch": { dot: "#66bb6a", bg: "rgba(102,187,106,0.12)", text: "#a5d6a7", border: "rgba(102,187,106,0.35)" },
  "Violet line":       { dot: "#8e24aa", bg: "rgba(142,36,170,0.12)",  text: "#ce93d8", border: "rgba(142,36,170,0.35)" },
  "Voilet line":       { dot: "#8e24aa", bg: "rgba(142,36,170,0.12)",  text: "#ce93d8", border: "rgba(142,36,170,0.35)" },
  "Pink line":         { dot: "#e91e8c", bg: "rgba(233,30,140,0.12)",  text: "#f48fb1", border: "rgba(233,30,140,0.35)" },
  "Magenta line":      { dot: "#ab47bc", bg: "rgba(171,71,188,0.12)",  text: "#e040fb", border: "rgba(171,71,188,0.35)" },
  "Aqua line":         { dot: "#00acc1", bg: "rgba(0,172,193,0.12)",   text: "#80deea", border: "rgba(0,172,193,0.35)" },
  "Orange line":       { dot: "#fb8c00", bg: "rgba(251,140,0,0.12)",   text: "#ffcc80", border: "rgba(251,140,0,0.35)" },
  "Gray line":         { dot: "#757575", bg: "rgba(117,117,117,0.12)", text: "#bdbdbd", border: "rgba(117,117,117,0.35)" },
  "Rapid Metro":       { dot: "#546e7a", bg: "rgba(84,110,122,0.12)",  text: "#90a4ae", border: "rgba(84,110,122,0.35)" },
};

const FALLBACK = { dot: "#6366f1", bg: "rgba(99,102,241,0.12)", text: "#a5b4fc", border: "rgba(99,102,241,0.35)" };

function lc(line: string) {
  return LINE_COLORS[line] ?? FALLBACK;
}

// ── Empty / Loading states ───────────────────────────────────────────────────

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
          Pick an origin and destination, choose your preferred routing style, and we'll
          map out your journey through the Delhi Metro network.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="relative h-full min-h-[420px] rounded-3xl border border-border/80 bg-gradient-card p-8 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-3 rounded-full border border-accent/30 border-b-accent animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
        </div>
        <p className="text-sm text-muted-foreground font-mono tracking-wide">Routing through the network…</p>
      </div>
    </div>
  );
}

// ── Line badge pill ──────────────────────────────────────────────────────────

function LineBadge({ line }: { line: string }) {
  if (!line || line === "INTERCHANGE") return null;
  const c = lc(line);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {line}
    </span>
  );
}

// ── Interchange banner — shown between two segments ──────────────────────────

function InterchangeBanner({
  stationName,
  fromLine,
  toLine,
}: {
  stationName: string;
  fromLine: string;
  toLine: string;
}) {
  const from = lc(fromLine);
  const to   = lc(toLine);

  return (
    <li className="relative flex items-stretch gap-3 pl-8 py-1 animate-fade-in-up">
      {/* spine gap — no dot, just a short connector */}
      <span className="absolute left-[11px] top-0 bottom-0 w-[2px]"
        style={{ background: `linear-gradient(to bottom, ${from.dot}, ${to.dot})` }} />

      {/* Banner card */}
      <div
        className="flex-1 flex items-center gap-3 rounded-xl px-3 py-2.5 border"
        style={{
          background: `linear-gradient(90deg, ${from.bg}, ${to.bg})`,
          borderColor: `${to.border}`,
          boxShadow: `0 0 12px ${to.dot}22`,
        }}
      >
        {/* From line dot */}
        <span
          className="h-3 w-3 rounded-full shrink-0 ring-2 ring-background"
          style={{ background: from.dot }}
        />

        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            Interchange at
          </span>
          <span className="text-[12px] font-bold text-foreground truncate">{stationName}</span>
        </div>

        {/* Arrow */}
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground mx-1" />

        {/* To line dot + label */}
        <span
          className="h-3 w-3 rounded-full shrink-0 ring-2 ring-background"
          style={{ background: to.dot }}
        />
        <span
          className="text-[11px] font-semibold whitespace-nowrap"
          style={{ color: to.text }}
        >
          Board {toLine}
        </span>
      </div>
    </li>
  );
}

// ── Single station row ───────────────────────────────────────────────────────

function StationRow({
  station,
  index,
  isFirst,
  isLast,
  nextStation,
}: {
  station: RouteStation;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  nextStation?: RouteStation;
}) {
  const c        = lc(station.line);
  const nextC    = nextStation ? lc(nextStation.line) : c;
  const dotSize  = isFirst || isLast ? "h-4 w-4" : "h-2.5 w-2.5";
  const glow     = isFirst || isLast
    ? `0 0 0 3px ${c.dot}33, 0 0 10px ${c.dot}55`
    : "none";

  return (
    <li
      className="relative flex items-start gap-3 pl-8 py-1.5 group animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
    >
      {/* Connector line to next */}
      {!isLast && (
        <span
          className="absolute left-[11px] top-6 bottom-0 w-[2px]"
          style={{
            background: `linear-gradient(to bottom, ${c.dot}, ${nextC.dot})`,
            opacity: 0.55,
          }}
        />
      )}

      {/* Dot */}
      <span
        className={`absolute left-1 top-2.5 flex items-center justify-center w-5 h-5`}
      >
        <span
          className={`shrink-0 ${dotSize} rounded-full transition-transform group-hover:scale-110`}
          style={{ background: c.dot, boxShadow: glow }}
        />
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={[
          "font-medium leading-snug",
          isFirst || isLast ? "text-foreground font-semibold" : "text-foreground/85",
          "text-sm",
        ].join(" ")}>
          {station.name}
        </span>
        <LineBadge line={station.line} />
      </div>

      {/* Index */}
      <span className="font-mono text-[10px] text-muted-foreground/40 shrink-0 pt-1">
        {String(index + 1).padStart(2, "0")}
      </span>
    </li>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

function Stat({ icon, label, value, unit }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/40 p-3 sm:p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-xl sm:text-2xl font-semibold leading-none">
        {value}
        {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  loading: boolean;
  route: RouteResponse | null;
  start: string;
  end: string;
  mode: "shortest" | "min_interchange";
}

export function RouteResults({ loading, route, start, end, mode }: Props) {
  if (loading) return <LoadingState />;
  if (!route || !route.route || route.route.length === 0) return <EmptyState />;

  const stations     = route.route;
  const stops        = route.stops ?? Math.max(0, stations.length - 1);
  const time         = route.approx_time_minutes ?? null;
  const interchanges = route.interchanges ?? 0;
  const ModeIcon     = mode === "shortest" ? Zap : RefreshCw;
  const modeLabel    = mode === "shortest" ? "Fastest Route" : "Fewest Changes";

  // Build rows — inject InterchangeBanner between segments
  const rows: React.ReactNode[] = [];
  stations.forEach((station, i) => {
    const isFirst = i === 0;
    const isLast  = i === stations.length - 1;
    const next    = stations[i + 1];

    rows.push(
      <StationRow
        key={`station-${i}`}
        station={station}
        index={i}
        isFirst={isFirst}
        isLast={isLast}
        nextStation={next}
      />
    );

    // After this station, if next station is on a different line → show banner
    if (next && station.line && next.line && station.line !== next.line) {
      rows.push(
        <InterchangeBanner
          key={`ic-${i}`}
          stationName={next.name}
          fromLine={station.line}
          toLine={next.line}
        />
      );
    }
  });

  return (
    <article className="relative rounded-3xl border border-border/80 bg-gradient-card p-6 sm:p-8 shadow-elevated overflow-hidden animate-slide-in-right">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Route Found</p>
          <h3 className="text-xl sm:text-2xl font-display font-semibold leading-tight">
            <span className="text-foreground">{start}</span>
            <span className="text-muted-foreground mx-2">→</span>
            <span className="text-gradient">{end}</span>
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground">
          <ModeIcon className="h-3.5 w-3.5" />
          {modeLabel}
        </div>
      </header>

      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-3 mb-6">
        <Stat icon={<MapPinned className="h-4 w-4" />}  label="Stops"        value={stops.toString()} />
        <Stat icon={<Clock className="h-4 w-4" />}       label="Est. Time"    value={time !== null ? `${time}` : "—"} unit={time !== null ? "min" : undefined} />
        <Stat icon={<TrainFront className="h-4 w-4" />}  label="Interchanges" value={interchanges.toString()} />
      </div>

      {/* Timeline */}
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Stations on route</p>
        <ol className="relative space-y-0 max-h-[420px] overflow-y-auto pr-2 -mr-2">
          {rows}
        </ol>
      </div>
    </article>
  );
}