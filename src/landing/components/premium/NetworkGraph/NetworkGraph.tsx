"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/landing/lib/utils"

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: "seller" | "buyer" | "platform"
}

interface NetworkGraphProps {
  className?: string
  nodeCount?: number
  connectionColor?: string
  animated?: boolean
}

export function NetworkGraph({
  className,
  nodeCount = 30,
  connectionColor = "#00FFFF",
  animated = true,
}: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationFrameRef = useRef<number>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize nodes
    const nodes: Node[] = []
    for (let i = 0; i < nodeCount; i++) {
      const type = i % 3 === 0 ? "seller" : i % 3 === 1 ? "buyer" : "platform"
      nodes.push({
        id: `node-${i}`,
        x: Math.random() * canvas.width / window.devicePixelRatio,
        y: Math.random() * canvas.height / window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: type === "platform" ? 8 : type === "seller" ? 5 : 3,
        type,
      })
    }
    nodesRef.current = nodes

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, width, height)

      // Update node positions
      if (animated) {
        nodes.forEach((node) => {
          node.x += node.vx
          node.y += node.vy

          if (node.x < 0 || node.x > width) node.vx *= -1
          if (node.y < 0 || node.y > height) node.vy *= -1
        })
      }

      // Draw connections
      ctx.strokeStyle = connectionColor
      ctx.lineWidth = 0.5
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.globalAlpha = (1 - distance / 150) * 0.3
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)

        // Color by type
        if (node.type === "seller") {
          ctx.fillStyle = "#00FFFF"
        } else if (node.type === "buyer") {
          ctx.fillStyle = "#4DCCCC"
        } else {
          ctx.fillStyle = "#FFFFFF"
        }

        ctx.fill()

        // Glow effect
        ctx.globalAlpha = 0.3
        ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2)
        ctx.fill()
      })

      if (animated) {
        animationFrameRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nodeCount, connectionColor, animated])

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      style={{ width: "100%", height: "100%" }}
    />
  )
}

