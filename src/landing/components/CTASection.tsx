"use client"

import { motion } from "framer-motion"
import { Button } from "@/landing/components/ui/button"

export function CTASection() {
  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.downxtown.sigma2&pcampaignid=web_share"

  const handleCTA = () => {
    window.open(PLAYSTORE_URL, "_blank")
  }

  return (
    <section id="cta" className="relative overflow-hidden bg-ink py-28 px-6">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(10,186,181,0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(10,186,181,0.15), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-blue text-[10px] tracking-[5px] uppercase mb-6"
        >
          10 — Early Access
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-bebas text-[clamp(56px,10vw,120px)] leading-[0.88] text-white mb-6"
        >
          List Your Brand.
          <br />
          <em className="font-serif italic text-blue non-italic">Own Your Market.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto mb-10"
        >
          No catalogue rebuilds. No platform gatekeeping. No giving up your customer data.
          Downxtown is onboarding early brands now — limited spots.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            onClick={handleCTA}
            className="px-10 py-6 rounded-none uppercase tracking-[2px] text-xs"
          >
            List Your Brand Free
          </Button>
          <div className="text-[11px] tracking-[3px] uppercase text-white/30">
            Already live with Sugar Cosmetics, Bonkers Corner &amp; more
          </div>
        </motion.div>

        <div className="mt-10 text-[11px] tracking-[3px] uppercase text-white/20">
          Downxtown — Where Brands Exist
        </div>
      </div>
    </section>
  )
}
