"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function EcosystemShowcase() {
    return (
        <section className="py-20 px-6 bg-ink relative border-t border-white/5">
            <div className="max-w-6xl mx-auto">
                <div className="text-[10px] tracking-[5px] uppercase text-white/40 mb-6 text-center">
                    The Downxtown Ecosystem
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_120px_rgba(0,0,0,0.6),0_0_80px_rgba(10,186,181,0.08)] bg-[#0A0A0A]"
                >
                    {/* Subtle vignette overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{
                        background: `linear-gradient(to bottom, rgba(37,99,235,0.04), transparent 30%, transparent 70%, rgba(10,10,10,0.5)), linear-gradient(to right, rgba(10,10,10,0.3), transparent 20%, transparent 80%, rgba(10,10,10,0.3))`
                    }} />

                    {/* The main ecosystem image */}
                    <div className="relative aspect-video w-full h-[300px] sm:h-[400px] md:h-[600px] lg:h-[800px] overflow-hidden group">
                        <Image
                            src="/landing/missing/platform-horizontal.png"
                            alt="Downxtown ecosystem interface"
                            fill
                            className="object-cover transition-transform duration-[8s] ease-out group-hover:scale-105 group-hover:-translate-y-2 opacity-50"
                        />

                        {/* Floating callout badges */}
                        <motion.div
                            className="absolute z-20 flex items-center gap-2 bg-[#0A0A0A]/85 border border-blue/35 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm top-[10%] left-[3%] sm:left-[10%] shadow-[0_0_0_0_rgba(10,186,181,0.3)] animate-pulse"
                        >
                            <div className="w-1.5 h-1.5 bg-blue rounded-full" />
                            <div className="text-[9px] sm:text-[10px] tracking-[2px] uppercase text-white/85 whitespace-nowrap">Brand Feed</div>
                        </motion.div>

                        <motion.div
                            className="absolute z-20 flex items-center gap-2 bg-[#0A0A0A]/85 border border-blue/35 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm top-[40%] left-1/2 -translate-x-1/2 shadow-[0_0_0_0_rgba(10,186,181,0.3)] animate-pulse hover:animate-none"
                        >
                            <div className="w-1.5 h-1.5 bg-blue rounded-full" />
                            <div className="text-[9px] sm:text-[10px] tracking-[2px] uppercase text-white/85 whitespace-nowrap">Full Profile</div>
                        </motion.div>

                        <motion.div
                            className="absolute z-20 flex items-center gap-2 bg-[#0A0A0A]/85 border border-blue/35 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm bottom-[12%] right-[4%] sm:right-[10%] shadow-[0_0_0_0_rgba(10,186,181,0.3)] animate-pulse"
                        >
                            <div className="w-1.5 h-1.5 bg-blue rounded-full" />
                            <div className="text-[9px] sm:text-[10px] tracking-[2px] uppercase text-white/85 whitespace-nowrap">Multi-Brand Discovery</div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-6 text-center text-xs sm:text-sm text-white/35 tracking-[0.5px] leading-[1.7] max-w-[700px] mx-auto px-4"
                >
                    Multiple brands. One feed. Each with its own identity — Nighthawk Co., Street Echo, Neon Soul, Urban Legend — all discovered without a single ad.
                </motion.div>
            </div>
        </section>
    )
}
