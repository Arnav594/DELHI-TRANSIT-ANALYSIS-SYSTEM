import { useEffect, useRef } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import metroHero from "@/assets/metro-hero.jpg";

export function Hero() {
  const imgRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      const el = imgRef.current;
      if (!el) return;
      const y = window.scrollY * 0.25;
      el.style.transform = `translate3d(0, ${y}px, 0) scale(1.05)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div ref={imgRef} className="absolute inset-0 will-change-transform">
          <img
            src={metroHero}
            alt=""
            aria-hidden
            width={1600}
            height={900}
            className="h-full w-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 grid-bg opacity-15" />
      </div>

      <div className="container relative pt-24 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border/80 glass px-3 py-1 text-xs font-medium text-muted-foreground mb-6 animate-fade-in-up hover:border-primary/50 hover:text-foreground transition-colors group cursor-default"
          >
            <Sparkles className="h-3 w-3 text-primary group-hover:rotate-12 transition-transform" />
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live · Delhi Metro Network
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            Navigate Delhi like
            <br />
            <span className="text-gradient inline-block">a local.</span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "160ms" }}
          >
            A graph-powered routing engine for the Delhi Metro. Pick any two stations and
            we'll plot the fastest path — stops, interchanges and ETA, in milliseconds.
          </p>

          <div
            className="mt-8 flex items-center gap-6 text-sm text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "240ms" }}
          >
            <Metric value="285+" label="Stations" />
            <span className="h-6 w-px bg-border" />
            <Metric value="12" label="Lines" />
            <span className="h-6 w-px bg-border" />
            <Metric value="< 1s" label="Routing" />
          </div>

          <a
            href="#planner"
            className="mt-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors animate-fade-in-up group"
            style={{ animationDelay: "320ms" }}
          >
            <span className="link-underline">Start planning</span>
            <ArrowDown className="h-3.5 w-3.5 group-hover:translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="group cursor-default">
      <p className="font-display text-xl font-semibold text-foreground group-hover:text-gradient-static transition-colors">
        {value}
      </p>
      <p className="text-xs uppercase tracking-wider">{label}</p>
    </div>
  );
}
