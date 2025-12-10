"use client"

import { memo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface GlowingEffectProps {
  /** Blur/spread radius of the glow */
  spread?: number
  /** Enable/disable the glow effect */
  glow?: boolean
  /** Disable all effects */
  disabled?: boolean
  /** How close the mouse needs to be to trigger the effect */
  proximity?: number
  /** Zone in the center where the effect is inactive (0-1) */
  inactiveZone?: number
  /** Border width of the glow effect */
  borderWidth?: number
  /** Custom class name */
  className?: string
  /** Glow color - if not provided, uses CSS variables from design system */
  glowColor?: string
  /** Secondary glow color for gradient effect */
  glowColorSecondary?: string
  /** Use gradient glow instead of single color */
  useGradient?: boolean
  /** Variant for different glow styles */
  variant?: "default" | "white"
}

const GlowingEffect = memo(function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 2,
  className,
  glowColor,
  glowColorSecondary,
  useGradient = true,
  variant = "default",
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPosition = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>(0)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || disabled) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if mouse is within proximity
      const isWithinBounds =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity

      if (!isWithinBounds) {
        containerRef.current.style.setProperty("--glow-opacity", "0")
        return
      }

      // Calculate distance from center
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      )
      const maxDistance = Math.sqrt(
        Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2)
      )
      const normalizedDistance = distanceFromCenter / maxDistance

      // Apply inactive zone
      if (normalizedDistance < inactiveZone) {
        containerRef.current.style.setProperty("--glow-opacity", "0")
        return
      }

      // Smooth animation
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return

        const opacity = Math.min(1, (normalizedDistance - inactiveZone) / (1 - inactiveZone))

        containerRef.current.style.setProperty("--glow-x", `${x}px`)
        containerRef.current.style.setProperty("--glow-y", `${y}px`)
        containerRef.current.style.setProperty("--glow-opacity", glow ? String(opacity * 0.8) : "0")

        lastPosition.current = { x, y }
      })
    },
    [disabled, glow, proximity, inactiveZone]
  )

  const handleMouseLeave = useCallback(() => {
    if (!containerRef.current) return
    containerRef.current.style.setProperty("--glow-opacity", "0")
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    // Listen on document for better tracking
    document.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [handleMouseMove, handleMouseLeave, disabled])

  if (disabled) return null

  // Determine glow colors
  const primaryGlow = glowColor || "hsl(var(--glow-primary))"
  const secondaryGlow = glowColorSecondary || "hsl(var(--glow-secondary))"
  
  const gradientStyle = useGradient
    ? `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), ${primaryGlow}, ${secondaryGlow}, transparent ${spread}%)`
    : `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), ${primaryGlow}, transparent ${spread}%)`

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300",
        className
      )}
      style={{
        opacity: "var(--glow-opacity, 0)",
        background: gradientStyle,
        maskImage: `
          linear-gradient(black, black),
          linear-gradient(black, black)
        `,
        maskSize: `
          calc(100% - ${borderWidth * 2}px) calc(100% - ${borderWidth * 2}px),
          100% 100%
        `,
        maskPosition: `${borderWidth}px ${borderWidth}px, 0 0`,
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
      }}
    />
  )
})

GlowingEffect.displayName = "GlowingEffect"

export { GlowingEffect }
export type { GlowingEffectProps }
