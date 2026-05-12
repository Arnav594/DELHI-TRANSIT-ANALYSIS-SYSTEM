import { cn } from "@/lib/utils";

// ── Base shimmer skeleton block ───────────────────────────────────────────────
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-secondary/50",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent",
        "before:animate-[shimmer_1.8s_infinite]",
        className
      )}
    />
  );
}

// ── Skeleton for station combobox button ─────────────────────────────────────
export function StationComboboxSkeleton() {
  return (
    <SkeletonBlock className="h-14 w-full rounded-xl" />
  );
}

// ── Skeleton for the full RoutePlanner left panel inputs ─────────────────────
export function RoutePlannerSkeleton() {
  return (
    <div className="space-y-3">
      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-24 rounded-2xl" />
        <SkeletonBlock className="h-24 rounded-2xl" />
      </div>
      {/* From input */}
      <SkeletonBlock className="h-14 rounded-xl" />
      {/* Swap button */}
      <div className="flex justify-center">
        <SkeletonBlock className="h-7 w-20 rounded-full" />
      </div>
      {/* To input */}
      <SkeletonBlock className="h-14 rounded-xl" />
      {/* Find button */}
      <SkeletonBlock className="h-12 rounded-xl" />
    </div>
  );
}

// ── Skeleton for RouteResults panel ─────────────────────────────────────────
export function RouteResultsSkeleton() {
  return (
    <div className="relative h-full min-h-[420px] rounded-3xl border border-border/80 bg-card/30 p-6 space-y-5 overflow-hidden">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="h-7 w-3/4 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-2">
            <SkeletonBlock className="h-3 w-12 rounded-full" />
            <SkeletonBlock className="h-8 w-10 rounded-md" />
          </div>
        ))}
      </div>

      {/* Station list */}
      <div className="space-y-1">
        <SkeletonBlock className="h-3 w-28 rounded-full mb-3" />
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className="flex items-start gap-3 pl-6 py-2">
            <div className="absolute left-1 w-4 h-4 rounded-full bg-secondary/60 mt-1" />
            <div className="flex-1 space-y-1.5 pb-3">
              <SkeletonBlock
                className="h-4 rounded-md"
                style={{ width: `${55 + (i * 13) % 35}%` } as React.CSSProperties}
              />
              <SkeletonBlock className="h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Subtle overlay fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent pointer-events-none rounded-b-3xl" />
    </div>
  );
}

// Add shimmer keyframe to global styles via a style tag injected once
export function SkeletonStyleInjector() {
  return (
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  );
}