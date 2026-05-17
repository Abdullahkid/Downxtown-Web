"use client"

import { motion } from "framer-motion"

const steps = [
    {
        num: "01",
        title: "List Your Brand",
        desc: "Set up your Downxtown brand profile in minutes. Connect your Shopify store or upload your catalogue directly — no rebuilding, no duplication.",
        tag: "Free to start",
        tagColor: "text-blue border-blue/30 bg-blue/5"
    },
    {
        num: "02",
        title: "Your Brand Goes Live",
        desc: "Your full catalogue, your brand identity, your story — all in one dedicated profile. Buyers browse your products the way you actually want them presented.",
        tag: "Full brand control",
        tagColor: "text-blue border-blue/30 bg-blue/5"
    },
    {
        num: "03",
        title: "Organic Discovery Begins",
        desc: "Buyers discover your brand through the feed — not because you paid for an ad, but because someone engaged, followed, or bought. The algorithm rewards real momentum.",
        tag: "No ad required",
        tagColor: "text-green-400 border-green-400/30 bg-green-400/5"
    }
]

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-32 px-6 bg-ink border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-[560px] mb-20"
                >
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">04 — How It Works</div>
                    <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                        Three steps.<br />
                        <em className="font-serif italic text-blue non-italic">Zero compromise.</em>
                    </h2>
                    <div className="w-12 h-[2px] bg-blue my-8" />
                    <p className="text-white/40 text-lg leading-relaxed font-light">
                        Getting your brand on Downxtown is the easiest thing you&apos;ll do this week. Growing it organically is the point of everything after.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className="relative border border-white/10 bg-[#0f0f0f] p-10 flex flex-col gap-6 group hover:border-blue/30 transition-colors duration-400"
                        >
                            {/* Step connector line */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-4 h-[1px] bg-blue/30" />
                                </div>
                            )}

                            <div className="font-bebas text-[80px] leading-none text-white/5 absolute right-6 top-4 select-none">
                                {step.num}
                            </div>

                            <div>
                                <div className="font-bebas text-[13px] tracking-[3px] text-blue/50 mb-3">{step.num}</div>
                                <h3 className="font-bebas text-[28px] tracking-[1.5px] text-white leading-none">{step.title}</h3>
                            </div>

                            <p className="text-[14px] text-white/40 leading-relaxed flex-1">
                                {step.desc}
                            </p>

                            <div className={`inline-flex items-center gap-1.5 border text-[10px] tracking-[2px] uppercase px-3 py-1.5 w-fit font-medium ${step.tagColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {step.tag}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
