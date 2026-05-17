"use client"

import { useEffect, useRef, useState } from "react"

export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    setIsVisible(true)

    let mx = 0
    let my = 0
    let rx = 0
    let ry = 0
    let frameId = 0

    const handleMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 5}px, ${my - 5}px)`
      }
    }

    const animateRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`
      }
      frameId = requestAnimationFrame(animateRing)
    }

    window.addEventListener("mousemove", handleMove)
    frameId = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      cancelAnimationFrame(frameId)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-[10px] w-[10px] rounded-full bg-brand-cyan pointer-events-none z-[9999]"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-[36px] w-[36px] rounded-full border border-[rgba(10,186,181,0.5)] pointer-events-none z-[9998]"
        style={{ transition: "transform 0.4s ease" }}
      />
    </>
  )
}

