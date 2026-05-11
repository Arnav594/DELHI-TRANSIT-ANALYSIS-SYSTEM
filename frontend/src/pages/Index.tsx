import { useState } from "react";
import { SiteHeader } from "@/components/transit/SiteHeader";
import { Hero } from "@/components/transit/Hero";
import RoutePlanner from "@/components/transit/RoutePlanner";
import BusPlanner from "@/components/transit/BusPlanner";
import { FeatureGrid } from "@/components/transit/FeatureGrid";
import { Reveal } from "@/components/transit/Reveal";
import { AuroraBackground } from "@/components/transit/AuroraBackground";
import { CursorGlow } from "@/components/transit/CursorGlow";
import { ScrollProgress } from "@/components/transit/ScrollProgress";
import MetroMap from "@/components/transit/MetroMap";
import type { RouteResponse } from "@/lib/transit-api";
import { TrainFront, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

type TransitMode = "metro" | "bus";

const Index = () => {
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [transitMode, setTransitMode] = useState<TransitMode>("metro");

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AuroraBackground />
      <CursorGlow />
      <ScrollProgress />
      <SiteHeader />

      <main className="relative">
        <Hero />

        <section id="planner" className="container -mt-4 sm:-mt-8 pb-20 sm:pb-28">
          <Reveal variant="fade-up" duration={800}>

            {/* ── Transit Mode Toggle ── */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-2xl border border-border/60 bg-secondary/30 p-1.5 gap-1">
                {([
                  { id: "metro" as TransitMode, label: "Metro", Icon: TrainFront, desc: "Delhi Metro Network" },
                  { id: "bus"   as TransitMode, label: "Bus",   Icon: Bus,        desc: "DTC Bus Network" },
                ] as const).map(({ id, label, Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setTransitMode(id);
                      setActiveRoute(null);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-6 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200",
                      transitMode === id
                        ? "bg-primary text-primary-foreground shadow-glow-cyan"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <span className={cn(
                      "text-[10px] font-normal hidden sm:inline",
                      transitMode === id ? "text-primary-foreground/70" : "text-muted-foreground/60"
                    )}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Planner Panel ── */}
            {transitMode === "metro" ? (
              <RoutePlanner onRouteFound={setActiveRoute} />
            ) : (
              <BusPlanner />
            )}

          </Reveal>
        </section>

        {/* ── Network Map — only for Metro ── */}
        {transitMode === "metro" && (
          <section id="network" className="border-t border-border/60">
            <FeatureGrid />
            <div className="container pb-20 pt-4">
              <Reveal variant="fade-up">
                <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold mb-2">
                      Delhi Metro{" "}
                      <span className="text-gradient">Network Map</span>
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      All lines · 285+ stations · Scroll to zoom · Drag to pan ·
                      Search a route above to highlight it on the map
                    </p>
                  </div>
                  {activeRoute?.route && (
                    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary font-semibold">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Showing: {activeRoute.start} → {activeRoute.end}
                      <button
                        onClick={() => setActiveRoute(null)}
                        className="ml-1 text-primary/60 hover:text-primary transition-colors"
                      >✕</button>
                    </div>
                  )}
                </div>
                <MetroMap highlightedRoute={activeRoute} />
              </Reveal>
            </div>
          </section>
        )}

        {/* ── Bus Network Info ── */}
        {transitMode === "bus" && (
          <section id="network" className="border-t border-border/60">
            <div className="container py-16">
              <Reveal variant="fade-up">
                <div className="rounded-3xl border border-border/60 bg-card/30 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  {[
                    { value: "3,962+", label: "Bus Stops",     icon: "🚏" },
                    { value: "2,403",  label: "Bus Routes",    icon: "🛣️" },
                    { value: "99,287", label: "Stop Records",  icon: "📊" },
                  ].map(({ value, label, icon }) => (
                    <div key={label} className="space-y-2">
                      <div className="text-3xl">{icon}</div>
                      <p className="font-display text-3xl font-bold text-gradient">{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </main>

      <Reveal as="footer" variant="fade-up" className="border-t border-border/60">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} DelhiTransit · Built on the Delhi Metro
            Analysis System.
          </p>
          <p className="font-mono shimmer-text">
            api · delhi-transit-analysis-system.onrender.com
          </p>
        </div>
      </Reveal>
    </div>
  );
};

export default Index;