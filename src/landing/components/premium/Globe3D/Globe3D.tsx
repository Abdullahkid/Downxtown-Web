"use client"

import React, { useEffect, useRef } from "react"
import createGlobe from "cobe"
import { cn } from "@/landing/lib/utils"
import { indiaSellerLocations } from './GlobeMarkers'

// Utility function to convert a hex color string to a normalized RGB array
const hexToRgbNormalized = (hex: string): [number, number, number] => {
  let r = 0, g = 0, b = 0
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    console.warn(`Invalid hex color: ${hex}. Falling back to black.`)
    return [0, 0, 0]
  }
  
  return [r / 255, g / 255, b / 255]
}

interface Globe3DProps {
  className?: string
  theta?: number
  dark?: number
  scale?: number
  diffuse?: number
  mapSamples?: number
  mapBrightness?: number
  baseColor?: [number, number, number] | string
  markerColor?: [number, number, number] | string
  glowColor?: [number, number, number] | string
}

export const Globe3D: React.FC<Globe3DProps> = ({
  className,
  theta = 0.25,
  dark = 1,
  scale = 1.1,
  diffuse = 1.2,
  mapSamples = 60000,
  mapBrightness = 10,
  baseColor = "#1a1a1a",
  markerColor = "#00FFFF",
  glowColor = "#00FFFF",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<any>(null)
  
  const phiRef = useRef(0)
  const thetaRef = useRef(theta)
  const isDragging = useRef(false)
  const lastMouseX = useRef(0)
  const lastMouseY = useRef(0)
  const autoRotateSpeed = 0.003

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resolvedBaseColor: [number, number, number] =
      typeof baseColor === "string" ? hexToRgbNormalized(baseColor) : baseColor || [0.1, 0.1, 0.1]
    
    const resolvedMarkerColor: [number, number, number] =
      typeof markerColor === "string" ? hexToRgbNormalized(markerColor) : markerColor || [0, 1, 1]
    
    const resolvedGlowColor: [number, number, number] =
      typeof glowColor === "string" ? hexToRgbNormalized(glowColor) : glowColor || [0, 1, 1]

    const initGlobe = () => {
      if (globeRef.current) {
        globeRef.current.destroy()
        globeRef.current = null
      }

      const rect = canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const devicePixelRatio = window.devicePixelRatio || 1
      const internalWidth = size * devicePixelRatio
      const internalHeight = size * devicePixelRatio

      canvas.width = internalWidth
      canvas.height = internalHeight

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: devicePixelRatio,
        width: internalWidth,
        height: internalHeight,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: dark,
        scale: scale,
        diffuse: diffuse,
        mapSamples: mapSamples,
        mapBrightness: mapBrightness,
        baseColor: resolvedBaseColor,
        markerColor: resolvedMarkerColor,
        glowColor: resolvedGlowColor,
        opacity: 1,
        offset: [0, 0],
        markers: indiaSellerLocations.map((marker) => ({
          location: marker.location,
          size: marker.size,
        })),
        onRender: (state: Record<string, any>) => {
          if (!isDragging.current) {
            phiRef.current += autoRotateSpeed
          }
          state.phi = phiRef.current
          state.theta = thetaRef.current
        },
      })
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
      canvas.style.cursor = "grabbing"
    }

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current
        const deltaY = e.clientY - lastMouseY.current
        const rotationSpeed = 0.005

        phiRef.current += deltaX * rotationSpeed
        thetaRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, thetaRef.current - deltaY * rotationSpeed)
        )

        lastMouseX.current = e.clientX
        lastMouseY.current = e.clientY
      }
    }

    const onMouseUp = () => {
      isDragging.current = false
      canvas.style.cursor = "grab"
    }

    const onMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false
        canvas.style.cursor = "grab"
      }
    }

    initGlobe()

    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("mouseleave", onMouseLeave)

    const handleResize = () => {
      initGlobe()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (canvas) {
        canvas.removeEventListener("mousedown", onMouseDown)
        canvas.removeEventListener("mousemove", onMouseMove)
        canvas.removeEventListener("mouseup", onMouseUp)
        canvas.removeEventListener("mouseleave", onMouseLeave)
      }
      if (globeRef.current) {
        globeRef.current.destroy()
        globeRef.current = null
      }
    }
  }, [theta, dark, scale, diffuse, mapSamples, mapBrightness, baseColor, markerColor, glowColor])

  return (
    <div
      className={cn("flex items-center justify-center z-[10] mx-auto", className)}
      style={{
        width: "auto",
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "20rem",
          height: "20rem",
          maxWidth: "auto",
          maxHeight: "auto",
          aspectRatio: "1",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  )
}

