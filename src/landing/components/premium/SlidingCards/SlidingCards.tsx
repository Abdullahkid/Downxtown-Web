"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/landing/lib/utils"

export type CardContent = {
  id: string | number
  title?: string
  description?: string
  icon?: React.ReactNode
  bgClass?: string
  metric?: string
}

type SlidingCardsProps = {
  cards: CardContent[]
  className?: string
  cardSize?: string
  centerIcon?: React.ReactNode
  visibleRange?: number
  onCardClick?: (index: number) => void
}

const SlidingCards: React.FC<SlidingCardsProps> = ({
  cards,
  className = "",
  cardSize = "w-24 h-24",
  onCardClick,
}) => {
  const cardStackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const cardStack = cardStackRef.current
    if (!cardStack) return

    cardsRef.current = Array.from(cardStack.querySelectorAll(".card"))

    let isSwiping = false
    let startX = 0
    let currentX = 0
    let animationFrameId: number | null = null

    const getDuration = () => 300

    const getActiveCard = () => cardsRef.current[0]

    const updatePositions = () => {
      cardsRef.current.forEach((card, i) => {
        const offset = i + 1
        card.style.zIndex = `${100 - offset}`
        card.style.transform = `perspective(700px) translateZ(${-12 * offset}px) translateY(${7 * offset}px) translateX(0px) rotateY(0deg)`
        card.style.opacity = `1`
      })
    }

    const applySwipeStyles = (deltaX: number) => {
      const card = getActiveCard()
      if (!card) return

      const rotate = deltaX * 0.2
      const opacity = 1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75

      card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(${deltaX}px) rotateY(${rotate}deg)`
      card.style.opacity = `${opacity}`
    }

    const handleStart = (clientX: number) => {
      if (isSwiping) return
      isSwiping = true
      startX = currentX = clientX
      const card = getActiveCard()
      card && (card.style.transition = "none")
    }

    const handleMove = (clientX: number) => {
      if (!isSwiping) return
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        currentX = clientX
        const deltaX = currentX - startX
        applySwipeStyles(deltaX)
        if (Math.abs(deltaX) > 50) handleEnd()
      })
    }

    const handleEnd = () => {
      if (!isSwiping) return
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      const deltaX = currentX - startX
      const threshold = 50
      const duration = getDuration()
      const card = getActiveCard()

      if (card) {
        card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`

        if (Math.abs(deltaX) > threshold) {
          const direction = Math.sign(deltaX)
          card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(${direction * 300}px) rotateY(${direction * 20}deg)`

          setTimeout(() => {
            card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(${direction * 300}px) rotateY(${-direction * 20}deg)`
          }, duration / 2)

          setTimeout(() => {
            cardsRef.current = [...cardsRef.current.slice(1), card]
            updatePositions()
          }, duration)
        } else {
          applySwipeStyles(0)
        }
      }

      isSwiping = false
      startX = currentX = 0
    }

    cardStack.addEventListener("pointerdown", (e) => handleStart(e.clientX))
    cardStack.addEventListener("pointermove", (e) => handleMove(e.clientX))
    cardStack.addEventListener("pointerup", handleEnd)

    updatePositions()

    return () => {
      cardStack.removeEventListener("pointerdown", (e) => handleStart(e.clientX))
      cardStack.removeEventListener("pointermove", (e) => handleMove(e.clientX))
      cardStack.removeEventListener("pointerup", handleEnd)
    }
  }, [])

  return (
    <section
      ref={cardStackRef}
      className={cn(
        "relative w-full max-w-md mx-auto h-[28rem] grid place-content-center touch-none select-none",
        className
      )}
    >
      {cards.map(({ id, icon, title, description, metric, bgClass = "bg-black/95 backdrop-blur-sm" }, index) => (
        <article
          key={id}
          onClick={() => onCardClick?.(index)}
          className={cn(
            "card absolute inset-4 rounded-2xl border border-white/10 shadow-xl cursor-grab transition-transform ease-in-out p-8",
            bgClass
          )}
        >
          <div className="flex flex-col h-full">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-brand-cyan/10 flex items-center justify-center mb-6">
              {icon || (
                <svg
                  className="w-7 h-7 fill-brand-cyan"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                >
                  <circle cx="8" cy="8" r="6" />
                </svg>
              )}
            </div>

            {/* Title */}
            {title && (
              <h3 className="text-xl font-semibold text-white mb-3">
                {title}
              </h3>
            )}

            {/* Description */}
            {description && (
              <p className="text-white/70 leading-relaxed mb-4 flex-grow">
                {description}
              </p>
            )}

            {/* Metric */}
            {metric && (
              <div className="text-sm font-medium text-brand-cyan flex items-center gap-2 mt-auto">
                <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                {metric}
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  )
}

export default SlidingCards

