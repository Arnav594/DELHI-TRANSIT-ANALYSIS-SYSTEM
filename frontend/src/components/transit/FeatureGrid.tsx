import { Gauge, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/transit/Reveal";
import { TiltCard } from "@/components/transit/TiltCard";

const features = [
  {
    icon: Network,
    title: "Smarter routing",
    body: "Finds the fastest path across the network — accounting for stops, interchanges and travel time, not just distance.",
    accent: "text-primary",
    glow: "from-primary/30 to-transparent",
  },
  {
    icon: Gauge,
    title: "Sub-second responses",
    body: "Plan a journey across 285+ stations in milliseconds. No waiting, no spinners — just answers.",
    accent: "text-accent",
    glow: "from-accent/30 to-transparent",
  },
  {
    icon: ShieldCheck,
    title: "Always up-to-date",
    body: "Station and line information stays current automatically, so you're never planning around an outdated map.",
    accent: "text-foreground",
    glow: "from-foreground/20 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Built for clarity",
    body: "A clean, focused interface that puts the journey — not the chrome — front and centre.",
    accent: "text-primary",
    glow: "from-primary/30 to-transparent",
  },
];

export function FeatureGrid() {
  return (
    <section id="about" className="container py-20 sm:py-28">
      <Reveal variant="fade-up" className="max-w-2xl mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">
          Why DelhiTransit
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
          A routing engine that{" "}
          <span className="text-gradient">thinks like a commuter.</span>
        </h2>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body, accent, glow }, i) => (
          <Reveal
            key={title}
            variant="fade-up"
            delay={i * 110}
            duration={750}
          >
            <TiltCard
              max={5}
              className="group relative h-full rounded-2xl border border-border/80 bg-gradient-card p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-elevated overflow-hidden"
            >
              {/* Animated corner glow */}
              <div
                className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-radial ${glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                style={{
                  background: `radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)`,
                }}
              />

              <div
                className={`relative mb-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary/60 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${accent}`}
              >
                <Icon className="h-5 w-5" />
                <span className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition-colors" />
              </div>

              <h3 className="relative font-display font-semibold mb-2 text-lg">
                {title}
              </h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>

              {/* Bottom shimmer line */}
              <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner ticks */}
              <span className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground/40 group-hover:text-primary/70 transition-colors">
                0{i + 1}
              </span>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
