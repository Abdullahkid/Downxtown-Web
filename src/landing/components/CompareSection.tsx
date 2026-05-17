"use client"

import { motion } from "framer-motion"

const comparisons = [
    {
        metric: "Environment",
        old: "○ Disconnected touchpoints",
        new: "● Unified operating system",
    },
    {
        metric: "Product Discovery",
        old: "○ Intent-based (SEO)",
        new: "● Contextual brand discovery",
    },
    {
        metric: "Purchase Driver",
        old: "○ Price-driven decisions",
        new: "● Value-driven decisions",
    },
    {
        metric: "Visibility Mechanism",
        old: "○ Spend-driven",
        new: "● Momentum-driven",
    },
    {
        metric: "Customer Ownership",
        old: "○ Platform controls customer",
        new: "● Brand owns relationship",
    }
]

export function CompareSection() {
    return (
        <section id="compare" className="py-32 px-6 bg-ink border-t border-white/5">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">08 — The Verdict</div>
                    <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                        Every platform made a choice.<br />
                        <em className="font-serif italic text-blue non-italic">Ours chose the seller.</em>
                    </h2>
                    <div className="w-12 h-[2px] bg-blue mx-auto my-8" />
                </div>

                <div className="border border-white/10 overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr] bg-ink2 border-b border-white/10">
                        <div className="p-6 text-[10px] tracking-[4px] uppercase text-white/40">Capability</div>
                        <div className="p-6 text-[10px] tracking-[4px] uppercase text-white/40 border-l border-white/10">Status Quo</div>
                        <div className="p-6 text-[10px] tracking-[4px] uppercase text-white bg-blue border-l border-white/10">Downxtown</div>
                    </div>

                    {/* Rows */}
                    {comparisons.map((row, i) => (
                        <motion.div
                            key={row.metric}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="grid grid-cols-[2fr_1.5fr_1.5fr] border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="p-6">
                                <div className="text-white font-medium">{row.metric}</div>
                            </div>
                            <div className="p-6 text-white/40 border-l border-white/10 flex items-center">
                                {row.old}
                            </div>
                            <div className="p-6 text-blue font-bold border-l border-white/10 flex items-center bg-blue/5">
                                {row.new}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
