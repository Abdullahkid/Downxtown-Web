"use client"

import { Store, DollarSign, Link, BarChart, Zap, Database } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    id: "connector",
    icon: <Link className="w-6 h-6" />,
    num: "01",
    title: "Organic Discovery",
    description: "Your store lives inside a social feed. Customers find you naturally — no paid ads required to be seen.",
    metric: "Non-pay-to-play"
  },
  {
    id: "brand-control",
    icon: <Store className="w-6 h-6" />,
    num: "02",
    title: "Visual Brand Authority",
    description: "Fully customized storefront — your logo, your narrative, your colors. Customers know they're buying from you.",
    metric: "Fully branded"
  },
  {
    id: "analytics",
    icon: <BarChart className="w-6 h-6" />,
    num: "03",
    title: "Customer Intelligence",
    description: "Deep analytics on who your buyers are, what they want, and when they convert. Your data, not a marketplace's.",
    metric: "100% data ownership"
  },
  {
    id: "payouts",
    icon: <DollarSign className="w-6 h-6" />,
    num: "04",
    title: "Direct Bank Settlement",
    description: "Payments flow directly from buyer to seller via linked accounts. No escrow, no 15-day delays.",
    metric: "Instant link"
  },
  {
    id: "data",
    icon: <Database className="w-6 h-6" />,
    num: "05",
    title: "CRM & Relationships",
    description: "Own your customer list. Message them directly, build loyalty programs, re-engage on your terms.",
    metric: "Direct CRM access"
  },
  {
    id: "growth",
    icon: <Zap className="w-6 h-6" />,
    num: "06",
    title: "Unified Operations",
    description: "Manage orders, inventory, chat support, and payouts from one app-first dashboard designed for speed.",
    metric: "App-first design"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 bg-ink2">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">What We Built</div>
          <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
            The{" "}
            <em className="font-serif italic text-blue non-italic">Missing</em>
            {" "}Infrastructure.
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-ink2 p-10 flex flex-col gap-6 hover:bg-white/[0.02] transition-colors duration-300 group"
            >
              {/* Icon + num row */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 flex items-center justify-center border border-blue/30 text-blue group-hover:border-blue group-hover:bg-blue/10 transition-all duration-300">
                  {feature.icon}
                </div>
                <span className="font-bebas text-5xl text-white/5 group-hover:text-white/10 transition-colors">
                  {feature.num}
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-2xl tracking-[1px] text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-blue">
                <span className="w-1 h-1 bg-blue rounded-full" />
                {feature.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
