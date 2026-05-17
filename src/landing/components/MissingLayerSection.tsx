"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function MissingLayerSection() {
    return (
        <section id="missing" className="relative overflow-hidden bg-blue py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="text-[10px] tracking-[5px] uppercase text-white/70 mb-5">03 — The Platform That Gives Back</div>
                        <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                            What Marketplaces<br />
                            <em className="font-serif italic text-white border-b-4 border-white/40">Took From You</em><br />
                            — Restored.
                        </h2>
                        <p className="mt-8 text-lg text-white/80 leading-relaxed max-w-[440px]">
                            Traditional marketplaces gave you traffic and took your identity, your customer data, and your pricing power in return. Downxtown is built on the opposite principle: you keep everything, and the platform earns its place by earning you organic discovery instead.
                        </p>
                        <div className="mt-10 grid grid-cols-1 gap-5">
                            {[
                                { icon: "🏷️", text: "Your brand identity stays intact — no competitor ads on your profile" },
                                { icon: "👤", text: "Your customer data belongs to you — contact info, purchase history, all of it" },
                                { icon: "💬", text: "Direct messaging with every buyer — the relationship doesn&apos;t end at checkout" },
                                { icon: "📈", text: "Organic visibility earned through engagement — not bought through ad spend" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                                    <span className="text-white/80 text-[15px] leading-relaxed">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="mt-16">
                            <div className="text-center text-[10px] tracking-[5px] uppercase text-white/60 mb-6">
                                The Downxtown Ecosystem — Live
                            </div>
                            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_80px_rgba(10,186,181,0.08)]">
                                <Image
                                    src="/landing/missing/platform-horizontal.png"
                                    alt="Downxtown ecosystem interface"
                                    width={1600}
                                    height={900}
                                    className="w-full h-auto transition-transform duration-[8000ms] ease-out group-hover:scale-[1.03] group-hover:-translate-y-[2%]"
                                    priority
                                />
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        background:
                                            "radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 100%), linear-gradient(to bottom, rgba(10,10,10,0.1), transparent 30%, transparent 70%, rgba(10,10,10,0.45))",
                                    }}
                                />
                                <div className="eco-float absolute left-[6%] top-[22%] hidden md:flex items-center gap-2 rounded-[2px] border border-blue/40 bg-black/70 px-3 py-2 text-[10px] tracking-[2px] uppercase text-white/80">
                                    <span className="eco-pulse h-2 w-2 rounded-full bg-blue" />
                                    Brand Feed
                                </div>
                                <div className="absolute left-1/2 top-[40%] hidden -translate-x-1/2 md:block">
                                    <div
                                        className="eco-float flex items-center gap-2 rounded-[2px] border border-blue/40 bg-black/70 px-3 py-2 text-[10px] tracking-[2px] uppercase text-white/80"
                                        style={{ animationDelay: "0.8s" }}
                                    >
                                        <span className="eco-pulse h-2 w-2 rounded-full bg-blue" />
                                        Full Profile
                                    </div>
                                </div>
                                <div
                                    className="eco-float absolute right-[4%] bottom-[12%] hidden md:flex items-center gap-2 rounded-[2px] border border-blue/40 bg-black/70 px-3 py-2 text-[10px] tracking-[2px] uppercase text-white/80"
                                    style={{ animationDelay: "1.6s" }}
                                >
                                    <span className="eco-pulse h-2 w-2 rounded-full bg-blue" />
                                    Multi-Brand Discovery
                                </div>
                            </div>
                            <div className="mt-6 text-center text-[13px] text-white/70">
                                Multiple brands. One feed. Each with its own identity — all discovered without a single ad.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute right-[-80px] bottom-[-80px] font-bebas text-[600px] leading-none text-black/10 select-none">
                D
            </div>
        </section>
    )
}
