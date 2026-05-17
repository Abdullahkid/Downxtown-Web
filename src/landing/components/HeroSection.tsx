"use client"

import { useState } from "react"
import { Button } from "@/landing/components/ui/button"
import { ComingSoonModal } from "@/landing/components/ui/coming-soon-modal"
import { PhoneCluster } from "@/landing/components/premium/PhoneCluster"
import { GridBackground } from "@/landing/components/premium/GridBackground"
import { motion } from "framer-motion"

const trustedBrands = [
  { name: "Sugar Cosmetics", icon: "💄" },
  { name: "Bonkers Corner", icon: "🧢" },
  { name: "Comet", icon: "👟" },
  { name: "Urban Monkey", icon: "🐒" },
  { name: "Burger Bae", icon: "🍔" },
]

export function HeroSection() {
  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.downxtown.sigma2&pcampaignid=web_share"

  const handleCTA = () => {
    window.open(PLAYSTORE_URL, "_blank")
  }

  return (
    <section
      id="hero"
      className="relative min-h-[100vh] flex items-center pt-32 pb-20 px-6 sm:px-12 bg-ink overflow-hidden"
    >
      <GridBackground />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left: Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-blue text-[11px] tracking-[4px] uppercase font-medium"
            >
              The Brand Commerce Operating Layer for Indian D2C
            </motion.div>

            <h2 className="sr-only">
              Brand Commerce Platform India - D2C Operating System for Identity, Ownership, and Growth
            </h2>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="font-bebas text-[clamp(64px,9vw,110px)] leading-[0.9] text-white"
            >
              Your Brand.<br />
              Your Customers.<br />
              <em className="font-serif italic text-blue non-italic">Your Market.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-[480px] mx-auto lg:mx-0 font-light"
            >
              Stop renting buyers from marketplaces and buying traffic from Instagram.
              <span className="block mt-2 text-blue/70 text-base">Downxtown is the permanent home for your D2C brand—where your audience compounds, your identity thrives, and your customers actually belong to you.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start"
            >
              <Button
                onClick={handleCTA}
                className="bg-blue hover:bg-blue-light text-white px-10 py-7 text-sm tracking-[1.5px] uppercase font-bold rounded-none transition-all duration-300 shadow-[0_0_20px_rgba(10,186,181,0.2)]"
              >
                List Your Brand Free
              </Button>
              <Button
                variant="outline"
                onClick={handleCTA}
                className="border-white/10 hover:border-blue bg-transparent text-white/60 hover:text-white px-10 py-7 text-sm tracking-[1.5px] uppercase font-bold rounded-none transition-all duration-300"
              >
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.3 }}
              className="pt-4"
            >
              <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-4 text-center lg:text-left">
                Integrated with catalogs from
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                {trustedBrands.map((brand) => (
                  <div
                    key={brand.name}
                    className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] tracking-[1px] text-white/60 hover:border-blue/40 hover:text-white/80 transition-all duration-300"
                  >
                    <span className="text-base">{brand.icon}</span>
                    {brand.name}
                  </div>
                ))}
                <div className="text-[11px] text-white/25 tracking-[1px] pl-1">
                  & more →
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Phone Cluster */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex-shrink-0 w-full lg:w-[520px] mt-4 sm:mt-8 lg:mt-0 flex justify-center"
          >
            <div className="scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-top h-[340px] sm:h-[400px] md:h-[480px] lg:h-auto w-full flex justify-center">
              <PhoneCluster
                mainImage="/app-feed.png"
                leftImage="/app-store.png"
                rightImage="/app-feed2.png"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
