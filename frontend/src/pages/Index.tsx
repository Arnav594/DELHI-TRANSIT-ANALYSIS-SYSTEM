import { SiteHeader } from "@/components/transit/SiteHeader";
import { Hero } from "@/components/transit/Hero";
import RoutePlanner from "@/components/transit/RoutePlanner";
import { FeatureGrid } from "@/components/transit/FeatureGrid";
import { Reveal } from "@/components/transit/Reveal";
import { AuroraBackground } from "@/components/transit/AuroraBackground";
import { CursorGlow } from "@/components/transit/CursorGlow";
import { ScrollProgress } from "@/components/transit/ScrollProgress";

const Index = () => {
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
            <RoutePlanner />
          </Reveal>
        </section>

        <section id="network" className="border-t border-border/60">
          <FeatureGrid />
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
