import { useEffect, useRef } from "react";

/**
 * A subtle radial spotlight that follows the cursor across the entire viewport.
 * Renders as a fixed, top-layer element with `mix-blend-mode: screen` so it
 * tints content beneath it without obscuring it.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices to keep things lean.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 200}px, ${cy - 200}px, 0)`;
      if (Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 h-[400px] w-[400px] rounded-full opacity-30 mix-blend-screen blur-3xl"
      style={{
        background:
          "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 65%)",
      }}
    />
  );
}
