import { useState } from "react";
import { SiteHeader } from "@/components/transit/SiteHeader";
import { Hero } from "@/components/transit/Hero";
import RoutePlanner from "@/components/transit/RoutePlanner";
import { FeatureGrid } from "@/components/transit/FeatureGrid";
import { Reveal } from "@/components/transit/Reveal";
import { AuroraBackground } from "@/components/transit/AuroraBackground";
import { CursorGlow } from "@/components/transit/CursorGlow";
import { ScrollProgress } from "@/components/transit/ScrollProgress";
import MetroMap from "@/components/transit/MetroMap";
import type { RouteResponse } from "@/lib/transit-api";

const Index = () => {
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);

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
            <RoutePlanner onRouteFound={setActiveRoute} />
          </Reveal>
        </section>

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