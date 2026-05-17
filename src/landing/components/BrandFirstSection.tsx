"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const points = [
  {
    title: "Discovery through Identity",
    body:
      "Your brand isn't hidden behind a search bar or a generic product grid. Shoppers find you through your story, your vibe, and your vision.",
  },
  {
    title: "Preserved Brand Vibe",
    body:
      "A dedicated environment where your visual language is protected. From horizontal scrolls to custom feeds—every detail is built to keep your vibe intact.",
  },
  {
    title: "Contextual Momentum",
    body:
      "The discovery feed is a high-momentum stream of brand narratives. Shoppers follow your journey, and every new drop is a moment of engagement, not just an ad.",
  },
]

export function BrandFirstSection() {
  return (
    <section id="brandfirst" className="py-32 px-6 bg-ink border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Copy Content */}
          <div className="stagger-children">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">
                05 — Brand-First Feed
              </div>
              <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                Discover Brands,<br />
                Not <em className="font-serif italic text-blue non-italic">Commodities.</em>
              </h2>
              <div className="w-12 h-[2px] bg-blue my-8" />

              <div className="space-y-8">
                {points.map((point, i) => (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="flex gap-5"
                  >
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border border-blue/30 flex items-center justify-center text-[10px] text-blue font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-[13px] uppercase tracking-[2px] text-white/90 font-medium">
                        {point.title}
                      </div>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/40 font-light">
                        {point.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: The Triple Stack Visual */}
          <div className="relative h-[600px] md:h-[750px] w-full mt-12 lg:mt-0 flex items-end justify-center">
            
            {/* 1. The Past: Traditional Grid (BACK LEFT, Higher Y) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -20 }}
              whileInView={{ opacity: 0.2, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute left-[-5%] bottom-[20%] w-[45%] z-10 grayscale"
            >
              <div className="text-[8px] tracking-[3px] uppercase text-white/40 mb-2 ml-4">Commodity Grid</div>
              <div className="relative rounded-xl border border-white/5 bg-[#0f0f0f] shadow-2xl overflow-hidden">
                <Image
                  src="/landing/brandfirst/myntra.png"
                  alt="Traditional product grid"
                  width={1080}
                  height={2340}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* 2. The Discovery: Downxtown Feed (FRONT LEFT, Base height) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-0 bottom-0 w-[46%] z-20"
            >
              <div className="text-[9px] tracking-[3px] uppercase text-blue/60 mb-3 ml-4 font-medium">01. Discovery Feed</div>
              <div className="relative rounded-2xl border border-blue/20 bg-[#0f0f0f] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                <Image
                  src="/landing/brandfirst/downxtown.png"
                  alt="The Downxtown Discovery Feed"
                  width={1080}
                  height={2340}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* 3. The Identity: Brand Profile (FRONT RIGHT, Base height) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute right-0 bottom-0 w-[46%] z-30"
            >
              <div className="text-[9px] tracking-[3px] uppercase text-blue mb-3 ml-4 font-bold">02. Brand Profile</div>
              <div className="relative rounded-2xl border-2 border-blue/40 bg-[#0f0f0f] shadow-[0_50px_120px_rgba(10,186,181,0.2)] overflow-hidden">
                <Image
                  src="/landing/app-store.png" 
                  alt="The Downxtown Brand Profile"
                  width={1080}
                  height={2340}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 border-2 border-blue/20 animate-pulse rounded-2xl pointer-events-none" />
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
