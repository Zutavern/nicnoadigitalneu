"use client";

import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  borderWidth?: number;
  glowColor?: string;
  glowColorSecondary?: string;
  useGradient?: boolean;
}

const GlowingEffect = memo(function GlowingEffect({
  blur = 4,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 20,
  variant = "default",
  glow = true,
  className,
  disabled = false,
  borderWidth = 2,
  glowColor,
  glowColorSecondary,
  useGradient = true,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const parent = container.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within proximity
      const isWithinBounds =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      if (!isWithinBounds) {
        setOpacity(0);
        return;
      }

      // Calculate opacity based on distance from center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDistance = Math.sqrt(
        Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2)
      );
      const normalizedDistance = distanceFromCenter / maxDistance;

      if (normalizedDistance < inactiveZone) {
        setOpacity(0);
        return;
      }

      const newOpacity = glow
        ? Math.min(1, (normalizedDistance - inactiveZone) / (1 - inactiveZone))
        : 0;

      // Convert to percentage for background-position
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      setPosition({ x: xPercent, y: yPercent });
      setOpacity(newOpacity);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, glow, proximity, inactiveZone]);

  if (disabled) return null;

  // Determine glow colors
  let primaryColor: string;
  let secondaryColor: string;

  if (glowColor) {
    primaryColor = glowColor;
    secondaryColor = glowColorSecondary || glowColor;
  } else if (variant === "white") {
    primaryColor = "rgba(255, 255, 255, 0.9)";
    secondaryColor = "rgba(200, 200, 200, 0.7)";
  } else {
    primaryColor = "hsl(var(--glow-primary, var(--primary)))";
    secondaryColor = "hsl(var(--glow-secondary, var(--accent)))";
  }

  const gradientSize = spread * 3;
  const gradientColors = useGradient
    ? `${primaryColor}, ${secondaryColor}, transparent`
    : `${primaryColor}, transparent`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={{
        opacity: opacity * 0.95,
        transition: "opacity 200ms ease-out",
        padding: borderWidth,
        background: `radial-gradient(${gradientSize}% ${gradientSize}% at ${position.x}% ${position.y}%, ${gradientColors})`,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    />
  );
});

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
export type { GlowingEffectProps };



