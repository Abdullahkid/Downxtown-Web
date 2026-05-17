"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const cards = [
  {
    num: "01",
    title: "The Follow Model",
    body:
      "Users follow brands like Burger Bae to receive updates on drops and launches. Discovery transforms into an ongoing relationship.",
  },
  {
    num: "02",
    title: "Direct Communication",
    body:
      "Message and Contact buttons built into every brand profile. Direct sales, support, and loyalty mechanics -- no platform middleman.",
  },
  {
    num: "03",
    title: "No Data Gatekeeping",
    body:
      "Brands own their customer relationships entirely. No gatekeeping of contact data. Exclusive codes, loyalty mechanics -- all yours to control.",
  },
]

export function RelationshipSection() {
  return (
    <section id="relationship" className="py-32 px-6 bg-ink2 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">
              05 - You Own the Relationship
            </div>
            <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
              Direct Access.
              <br />
              <em className="font-serif italic text-blue non-italic">Zero</em> Gatekeeping.
            </h2>

            <div className="mt-10 grid gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="border border-white/10 bg-[#0f0f0f] p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 flex items-center justify-center border border-blue/40 text-[11px] font-semibold text-blue">
                      {card.num}
                    </div>
                    <div className="text-white text-sm tracking-[2px] uppercase">
                      {card.title}
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-white/50">
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <Image
                src="/landing/app-store.png"
                alt="Brand profile interface"
                width={1080}
                height={2340}
                className="w-full h-auto object-cover"
                sizes="(max-width: 1024px) 80vw, 420px"
              />
            </div>

            <div className="absolute left-[-20px] top-[20%] hidden md:flex items-center gap-2 border border-white/10 bg-ink px-4 py-2 text-[10px] tracking-[3px] uppercase text-blue">
              Followers
            </div>
            <div className="absolute right-[-20px] top-[35%] hidden md:flex items-center gap-2 border border-blue/50 bg-blue/10 px-4 py-2 text-[10px] tracking-[3px] uppercase text-blue">
              Direct Message
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
