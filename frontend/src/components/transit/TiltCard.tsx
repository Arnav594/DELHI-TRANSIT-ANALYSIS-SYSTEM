import { useRef, ReactNode, MouseEvent, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees */
  max?: number;
  /** Show cursor-following spotlight */
  spotlight?: boolean;
  style?: CSSProperties;
}

/**
 * Subtle 3D tilt that follows the cursor + an optional radial spotlight.
 * Pure CSS variables — no re-renders.
 */
export function TiltCard({
  children,
  className,
  max = 6,
  spotlight = true,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "relative transition-transform duration-300 ease-out will-change-transform",
        "[transform:perspective(1000px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))]",
        className,
      )}
      style={style}
    >
      {children}
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.15), transparent 40%)",
          }}
        />
      )}
    </div>
  );
}
