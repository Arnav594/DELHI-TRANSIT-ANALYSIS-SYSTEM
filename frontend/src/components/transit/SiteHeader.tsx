import { Github, TramFront } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow-cyan group-hover:shadow-glow-magenta transition-shadow">
            <TramFront className="h-5 w-5" />
          </span>
          <span className="font-display font-semibold tracking-tight">
            Delhi<span className="text-primary">Transit</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#planner" className="hover:text-foreground transition-colors">Planner</a>
          <a href="#network" className="hover:text-foreground transition-colors">Network</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/Arnav594/DELHI-TRANSIT-ANALYSIS-SYSTEM"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </header>
  );
}
