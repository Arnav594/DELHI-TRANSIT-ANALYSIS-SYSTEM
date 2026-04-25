import { ReactNode, ElementType, CSSProperties } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type Variant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom" | "blur";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
  /** Re-animate every time it enters the viewport (works on scroll up/down). */
  repeat?: boolean;
  threshold?: number;
}

const hiddenStyles: Record<Variant, CSSProperties> = {
  "fade-up": { opacity: 0, transform: "translate3d(0, 32px, 0)" },
  "fade-down": { opacity: 0, transform: "translate3d(0, -32px, 0)" },
  "fade-left": { opacity: 0, transform: "translate3d(-32px, 0, 0)" },
  "fade-right": { opacity: 0, transform: "translate3d(32px, 0, 0)" },
  zoom: { opacity: 0, transform: "scale(0.92)" },
  blur: { opacity: 0, filter: "blur(12px)" },
};

const visibleStyles: CSSProperties = {
  opacity: 1,
  transform: "translate3d(0, 0, 0) scale(1)",
  filter: "blur(0px)",
};

export function Reveal({
  children,
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
  duration = 700,
  className,
  repeat = true,
  threshold = 0.15,
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLElement>({ repeat, threshold });

  const style: CSSProperties = {
    transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, filter ${duration}ms ease ${delay}ms`,
    willChange: "opacity, transform, filter",
    ...(visible ? visibleStyles : hiddenStyles[variant]),
  };

  return (
    <Tag ref={ref as never} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}
