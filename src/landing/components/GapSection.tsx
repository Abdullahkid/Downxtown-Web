"use client"

import { motion } from "framer-motion"

const shifts = [
    {
        from: "A tenant on someone else's platform",
        to: "Total independence on your own infrastructure",
        icon: "→"
    },
    {
        from: "Growth that resets when ad spend stops",
        to: "Sustained momentum that belongs to you",
        icon: "→"
    },
    {
        from: "A brand trapped at a growth ceiling",
        to: "A business built to compound organically",
        icon: "→"
    }
]

export function GapSection() {
    return (
        <section id="gap" className="py-32 px-6 bg-ink">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-[700px] mb-16">
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">02 — The Shift</div>
                    <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                        From Platform Tenant<br />
                        to <em className="font-serif italic text-blue non-italic">Independent Brand.</em>
                    </h2>
                    <div className="w-12 h-[2px] bg-blue my-8" />
                    <p className="text-white/40 text-lg leading-relaxed font-light">
                        Downxtown isn&apos;t just another channel to manage. It&apos;s the moment you stop renting 
                        your future from marketplaces and start building your own territory. 
                        True independence begins when your growth is no longer a variable of your ad spend.
                    </p>
                </div>

                <div className="flex flex-col gap-[2px]">
                    {shifts.map((shift, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            className="grid grid-cols-1 md:grid-cols-[1fr_64px_1fr] items-center border border-white/10 bg-white/[0.02] group hover:bg-white/[0.04] transition-colors duration-300"
                        >
                            <div className="p-8 md:p-10">
                                <div className="text-[10px] tracking-[3px] uppercase text-red-500/60 mb-3 font-medium">The Old Way</div>
                                <p className="text-white/40 text-[15px] leading-relaxed">{shift.from}</p>
                            </div>
                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-blue text-2xl group-hover:scale-125 transition-transform duration-300">
                                    {shift.icon}
                                </div>
                            </div>
                            <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-white/10 bg-blue/[0.03]">
                                <div className="text-[10px] tracking-[3px] uppercase text-blue/70 mb-3 font-medium">The Downxtown Shift</div>
                                <p className="text-white text-[15px] leading-relaxed font-medium">{shift.to}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 p-12 border border-white/10 text-center relative"
                >
                    <div className="font-serif italic text-[clamp(20px,3vw,32px)] text-off leading-relaxed">
                        &quot;Independence isn&apos;t just having a website. It&apos;s having a home where your identity lives and your audience compounds.&quot;
                    </div>
                    <div className="font-serif text-[120px] absolute top-[-40px] left-10 text-blue/10 pointer-events-none select-none">&quot;</div>
                </motion.div>
            </div>
        </section>
    )
}
