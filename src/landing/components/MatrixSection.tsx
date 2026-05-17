"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const platforms = [
    { name: "Your Website", icon: "🌐" },
    { name: "Instagram", icon: "📱" },
    { name: "Marketplaces", icon: "🏪" },
    { name: "Downxtown", icon: "⚡", highlight: true },
]

const capabilities = [
    {
        label: "Brand Identity",
        sublabel: "Your story, your design, your voice",
        values: [true, false, false, true]
    },
    {
        label: "Organic Discovery",
        sublabel: "New customers find you without paid ads",
        values: [false, true, true, true]
    },
    {
        label: "You Own the Customer",
        sublabel: "Data, relationship, direct contact",
        values: [true, false, false, true]
    },
    {
        label: "Commerce Built-In",
        sublabel: "Seamless checkout, no redirect friction",
        values: [true, false, true, true]
    },
]

export function MatrixSection() {
    return (
        <section id="matrix" className="py-24 px-6 bg-ink border-t border-white/5 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">The Whole Picture at a Glance</div>
                    <h2 className="font-bebas text-[clamp(40px,5vw,72px)] leading-[0.92] text-white">
                        Every platform solves <em className="font-serif italic text-blue non-italic">part</em> of the problem.<br />
                        Downxtown solves all of it.
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="border border-white/10 overflow-hidden"
                >
                    {/* Header Row */}
                    <div className={`grid border-b border-white/10`} style={{ gridTemplateColumns: `2fr repeat(${platforms.length}, 1fr)` }}>
                        <div className="p-5 text-[10px] tracking-[4px] uppercase text-white/30">Capability</div>
                        {platforms.map((p) => (
                            <div
                                key={p.name}
                                className={`p-5 text-center border-l border-white/10 ${p.highlight ? "bg-blue text-white" : "text-white/50"}`}
                            >
                                <div className="text-xl mb-1">{p.icon}</div>
                                <div className={`text-[11px] tracking-[2px] uppercase font-medium ${p.highlight ? "text-white" : ""}`}>
                                    {p.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Data Rows */}
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={cap.label}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="grid border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors"
                            style={{ gridTemplateColumns: `2fr repeat(${platforms.length}, 1fr)` }}
                        >
                            <div className="p-5 pr-4">
                                <div className="text-white text-[14px] font-medium">{cap.label}</div>
                                <div className="text-white/50 text-[12px] mt-0.5">{cap.sublabel}</div>
                            </div>
                            {cap.values.map((val, j) => (
                                <div
                                    key={j}
                                    className={`p-5 flex items-center justify-center border-l border-white/10 ${platforms[j].highlight ? "bg-blue/5" : ""}`}
                                >
                                    {val ? (
                                        <Check
                                            size={18}
                                            className={platforms[j].highlight ? "text-blue" : "text-white/40"}
                                            strokeWidth={2.5}
                                        />
                                    ) : (
                                        <X size={16} className="text-red-500/40" strokeWidth={2} />
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-6 text-center text-[13px] text-white/30 tracking-wide"
                >
                    This is the gap Downxtown is built to close.
                </motion.p>
            </div>
        </section>
    )
}
