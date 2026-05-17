"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/landing/components/ui/button"
import { ComingSoonModal } from "@/landing/components/ui/coming-soon-modal"

const stats = [
    { value: "0%", label: "Listing Fees" },
    { value: "100%", label: "Data Ownership" },
    { value: "Direct", label: "Bank Settlement" },
    { value: "Live", label: "& Growing" },
]

export function EcosystemCTA() {
    const [showModal, setShowModal] = useState(false)

    return (
        <section id="cta" className="py-32 px-6 bg-ink relative overflow-hidden">
            {/* Subtle accent grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(10,186,181,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(10,186,181,0.5) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Blue glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(10,186,181,0.07) 0%, transparent 70%)" }}
            />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center">
                    {/* Overline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-blue text-[10px] tracking-[5px] uppercase mb-6"
                    >
                        The Ecosystem
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="font-bebas text-[clamp(56px,9vw,120px)] leading-[0.88] text-white mb-8"
                    >
                        Stop Being a {" "}
                        <em className="font-serif italic text-blue non-italic">Vendor.</em>
                        <br />
                        Start Being a{" "}
                        <em className="font-serif italic text-blue non-italic">Brand.</em>
                    </motion.h2>

                    {/* Sub-copy */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="text-white/40 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto font-light mb-12"
                    >
                        Join the brands set to build their economic future — with a platform that
                        was designed to make them win.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <Button
                            onClick={() => setShowModal(true)}
                            className="bg-blue hover:bg-blue-light text-white px-12 py-7 text-sm tracking-[1.5px] uppercase font-bold rounded-none transition-all duration-300 shadow-[0_0_30px_rgba(10,186,181,0.25)] hover:shadow-[0_0_50px_rgba(10,186,181,0.4)]"
                        >
                            Claim Early Access
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(true)}
                            className="border-white/10 hover:border-blue/50 bg-transparent text-white/50 hover:text-white px-12 py-7 text-sm tracking-[1.5px] uppercase font-bold rounded-none transition-all duration-300"
                        >
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="grid grid-cols-2 sm:grid-cols-4 border border-white/10"
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className={`py-8 px-6 text-center ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}
                            >
                                <div className="font-bebas text-4xl text-blue tracking-wider mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] tracking-[3px] uppercase text-white/30">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </section>
    )
}
