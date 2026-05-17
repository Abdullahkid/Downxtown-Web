"use client"

import React, { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"
import { cn } from "@/landing/lib/utils"

interface Arc {
  from: [number, number]
  to: [number, number]
  progress: number
}

interface GlobeWithArcsProps {
  className?: string
  showArcs?: boolean
  arcColor?: string
  markerColor?: string
}

export function GlobeWithArcs({
  className,
  showArcs = true,
  arcColor = "#00FFFF",
  markerColor = "#00FFFF",
}: GlobeWithArcsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<any>(null)
  const phiRef = useRef(1.35) // Start at India's longitude (~77°E)
  const [arcs, setArcs] = useState<Arc[]>([])

  // Sample order flow data (India-centric with global destinations)
  const orderFlows: Array<{ from: [number, number], to: [number, number] }> = [
    { from: [26.8467, 80.9462], to: [19.0760, 72.8777] }, // Delhi to Mumbai
    { from: [12.9716, 77.5946], to: [13.0827, 80.2707] }, // Bangalore to Chennai
    { from: [22.5726, 88.3639], to: [23.0225, 72.5714] }, // Kolkata to Ahmedabad
    { from: [19.0760, 72.8777], to: [40.7128, -74.0060] }, // Mumbai to New York
    { from: [26.8467, 80.9462], to: [51.5074, -0.1278] }, // Delhi to London
    { from: [12.9716, 77.5946], to: [1.3521, 103.8198] }, // Bangalore to Singapore
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const initGlobe = () => {
      if (globeRef.current) {
        globeRef.current.destroy()
      }

      const rect = canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const devicePixelRatio = window.devicePixelRatio || 1

      canvas.width = size * devicePixelRatio
      canvas.height = size * devicePixelRatio

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio,
        width: size * devicePixelRatio,
        height: size * devicePixelRatio,
        phi: phiRef.current || 1.35, // Initialize to show India (longitude ~77°E converted to radians)
        theta: 0.4, // Latitude adjustment to center India
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.1],
        markerColor: [0, 1, 1],
        glowColor: [0, 1, 1],
        markers: orderFlows.flatMap(flow => [
          { location: flow.from, size: 0.03 },
          { location: flow.to, size: 0.03 },
        ]),
        onRender: (state) => {
          phiRef.current += 0.002
          state.phi = phiRef.current
        },
      })
    }

    initGlobe()
    window.addEventListener("resize", initGlobe)

    // Animate arcs
    if (showArcs) {
      const interval = setInterval(() => {
        setArcs(prev => {
          const newArcs = [...prev]

          // Update existing arcs
          for (let i = 0; i < newArcs.length; i++) {
            newArcs[i].progress += 0.02
            if (newArcs[i].progress > 1) {
              newArcs.splice(i, 1)
              i--
            }
          }

          // Add new arc randomly
          if (Math.random() > 0.7 && newArcs.length < 3) {
            const flow = orderFlows[Math.floor(Math.random() * orderFlows.length)]
            newArcs.push({
              from: flow.from,
              to: flow.to,
              progress: 0,
            })
          }

          return newArcs
        })
      }, 100)

      return () => {
        clearInterval(interval)
        window.removeEventListener("resize", initGlobe)
        if (globeRef.current) {
          globeRef.current.destroy()
        }
      }
    }

    return () => {
      window.removeEventListener("resize", initGlobe)
      if (globeRef.current) {
        globeRef.current.destroy()
      }
    }
  }, [showArcs])

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "600px",
          maxHeight: "600px",
          aspectRatio: "1",
        }}
      />

      {/* Arc visualization overlay */}
      {showArcs && arcs.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {arcs.map((arc, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: arcColor,
                boxShadow: `0 0 10px ${arcColor}`,
                opacity: 1 - arc.progress,
                transition: "all 0.1s linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

