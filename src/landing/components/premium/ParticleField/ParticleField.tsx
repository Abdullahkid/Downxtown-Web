"use client"

import { useCallback } from "react"
import Particles from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"
import { cn } from "@/landing/lib/utils"

interface ParticleFieldProps {
  className?: string
  density?: number
  color?: string
  opacity?: number
  speed?: number
  connections?: boolean
}

export function ParticleField({
  className,
  density = 50,
  color = "#00FFFF",
  opacity = 0.3,
  speed = 0.5,
  connections = true,
}: ParticleFieldProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      className={cn("absolute inset-0 z-0", className)}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
            resize: {
              enable: true,
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
        particles: {
          color: {
            value: color,
          },
          links: {
            color: color,
            distance: 150,
            enable: connections,
            opacity: opacity * 0.5,
            width: 1,
          },
          move: {
            enable: true,
            speed: speed,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "bounce",
            },
          },
          number: {
            density: {
              enable: true,
            },
            value: density,
          },
          opacity: {
            value: opacity,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  )
}

