"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const signals = [
  {
    title: "Brand Engagement",
    description: "Story views & profile depth",
    icon: "✨",
    angle: -90 // Top
  },
  {
    title: "Follower Activity",
    description: "Likes, saves & shares",
    icon: "💬",
    angle: -30 // Top Right
  },
  {
    title: "Growth Velocity",
    description: "New follower momentum",
    icon: "📈",
    angle: 30 // Bottom Right
  },
  {
    title: "Order Momentum",
    description: "Recent sales volume",
    icon: "🛍️",
    angle: 90 // Bottom
  },
  {
    title: "Customer Response",
    description: "Chat & support speed",
    icon: "⚡",
    angle: 150 // Bottom Left
  },
  {
    title: "Ratings & Trust",
    description: "Verified buyer satisfaction",
    icon: "⭐",
    angle: 210 // Top Left
  }
]

export function MomentumSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % signals.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="momentum" className="py-32 px-6 bg-ink border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* Left: The Signals Wheel */}
          <div className="relative flex justify-center py-20 lg:py-0">
            <div className="relative h-[340px] w-[340px] md:h-[480px] md:w-[480px]">
              
              {/* Central Core */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div 
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(10,186,181,0.1)",
                      "0 0 40px rgba(10,186,181,0.4)",
                      "0 0 20px rgba(10,186,181,0.1)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-[150px] w-[150px] rounded-full bg-black border-2 border-blue/40 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_60px_rgba(10,186,181,0.2)]"
                >
                  <div className="font-bebas text-xs tracking-[3px] text-blue/60 mb-1">MOMENTUM</div>
                  <div className="font-bebas text-3xl tracking-[4px] text-white">ENGINE</div>
                </motion.div>
              </div>

              {/* Orbital Signal Nodes */}
              {signals.map((signal, i) => {
                const isActive = activeIndex === i
                const radius = 180 // Base radius for the circle
                const rad = (signal.angle * Math.PI) / 180
                const x = Math.cos(rad) * radius
                const y = Math.sin(rad) * radius

                return (
                  <div 
                    key={signal.title} 
                    className="absolute top-1/2 left-1/2"
                    style={{ 
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        width: '160px'
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 0.9,
                        opacity: isActive ? 1 : 0.4,
                        borderColor: isActive ? "rgba(10,186,181,0.8)" : "rgba(255,255,255,0.1)",
                        backgroundColor: isActive ? "rgba(10,186,181,0.05)" : "rgba(10,10,10,0.8)"
                      }}
                      className="p-3 md:p-4 rounded-xl border bg-black text-center shadow-xl transition-all duration-500"
                    >
                      <div className="text-xl mb-1">{signal.icon}</div>
                      <h3 className={`font-bebas text-[12px] tracking-[1.5px] leading-tight ${isActive ? 'text-blue' : 'text-white/60'}`}>
                        {signal.title}
                      </h3>
                      <p className={`text-[9px] mt-1 leading-tight ${isActive ? 'text-white/70' : 'text-white/20'} hidden md:block`}>
                        {signal.description}
                      </p>
                    </motion.div>

                    {/* Laser link to core */}
                    <motion.div 
                        initial={false}
                        animate={{ 
                            opacity: isActive ? 0.6 : 0.1,
                            width: isActive ? 2 : 1,
                            background: isActive ? 'rgba(10,186,181,0.8)' : 'rgba(255,255,255,0.2)'
                        }}
                        className="absolute top-1/2 left-1/2 h-[100px] w-px origin-top -z-10"
                        style={{ 
                            transform: `rotate(${signal.angle + 90}deg) translate(0, 40px)` 
                        }}
                    />
                  </div>
                )
              })}

              {/* Background Spinners */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <motion.circle 
                  cx="50" cy="50" r="38" 
                  fill="none" stroke="rgba(10,186,181,0.1)" 
                  strokeWidth="0.5" strokeDasharray="5 10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>
          </div>

          {/* Right: Content */}
          <div className="stagger-children">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">
                07 — Discovery That Works For You
              </div>
              <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                Visibility is
                <br />
                <em className="font-serif italic text-blue non-italic">Earned,</em>
                <br />
                Not Bought.
              </h2>
              <div className="w-12 h-[2px] bg-blue my-8" />
              <p className="text-lg text-white/50 leading-relaxed font-light">
                Downxtown doesn&apos;t auction your reach to the highest bidder. Our <strong className="text-white">Momentum Engine</strong> uses six distinct signals to reward brands that actually build value.
              </p>
              
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-blue text-[10px] tracking-[3px] uppercase mb-2">Community Signals</div>
                  <ul className="space-y-3">
                    <li className="text-[13px] text-white/40 leading-relaxed">
                      <strong className="text-white/80 block">Engagement & Activity</strong>
                      How deep buyers go into your story, your drops, and your shares.
                    </li>
                    <li className="text-[13px] text-white/40 leading-relaxed">
                      <strong className="text-white/80 block">Growth Velocity</strong>
                      The rate at which new shoppers are following your brand journey.
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="text-blue text-[10px] tracking-[3px] uppercase mb-2">Operational Signals</div>
                  <ul className="space-y-3">
                    <li className="text-[13px] text-white/40 leading-relaxed">
                      <strong className="text-white/80 block">Order Momentum</strong>
                      Real-time sales signals that prove product-market fit.
                    </li>
                    <li className="text-[13px] text-white/40 leading-relaxed">
                      <strong className="text-white/80 block">Trust & Response</strong>
                      Ratings from verified buyers and your speed in answering DMs.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
