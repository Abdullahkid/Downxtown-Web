"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/landing/lib/utils"

interface MeshGradientProps {
  className?: string
  colors?: string[]
  speed?: number
}

export function MeshGradient({
  className,
  colors = ["#00FFFF", "#008080", "#0a0e1a"],
  speed = 0.001,
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(undefined)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      timeRef.current += speed

      // Create gradient background
      ctx.clearRect(0, 0, width, height)

      // Create multiple overlapping radial gradients
      for (let i = 0; i < 3; i++) {
        const x = width * (0.5 + 0.3 * Math.sin(timeRef.current + i * 2))
        const y = height * (0.5 + 0.3 * Math.cos(timeRef.current + i * 1.5))
        const radius = Math.min(width, height) * 0.5

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `${colors[i % colors.length]}33`)
        gradient.addColorStop(0.5, `${colors[i % colors.length]}11`)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [colors, speed])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 z-0", className)}
      style={{ width: "100%", height: "100%" }}
    />
  )
}

