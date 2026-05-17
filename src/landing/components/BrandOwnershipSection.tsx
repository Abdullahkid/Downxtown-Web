"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const pillars = [
    {
        icon: "🗝️",
        title: "Total Data Sovereignty",
        body: "You own 100% of your customer data—emails, phone numbers, and order history. Export it, use it in your CRM, or run your own newsletters. We never gatekeep your audience."
    },
    {
        icon: "🔌",
        title: "Direct Connection, No Middleman",
        body: "Every brand profile has a built-in direct message channel. Talk to your buyers, handle custom orders, and build loyalty directly. No platform standing in between you and your sale."
    },
    {
        icon: "🔒",
        title: "Branded Checkout Control",
        body: "No competitor ads on your checkout page. No 'suggested products' from other brands. The entire purchase journey is yours—from the first click to the final confirmation."
    },
]

export function BrandOwnershipSection() {
    return (
        <section id="ownership" className="relative overflow-hidden bg-[#050505] py-32 px-6 border-t border-white/5">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

                    {/* Left: Heading + philosophy */}
                    <div>
                        <div className="text-blue text-[10px] tracking-[5px] uppercase mb-6 font-medium">03 — Brand Ownership</div>
                        <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                            Take Back<br />
                            <em className="font-serif italic text-blue">Total Control</em><br />
                            of Your Business.
                        </h2>
                        <p className="mt-8 text-lg text-white/50 leading-relaxed max-w-[440px] font-light">
                            On marketplaces, you are a supplier to the platform. On Downxtown, you are the <strong className="text-white/80 font-medium">owner of the customer relationship</strong>. We provide the infrastructure; you provide the vision and keep the data.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-12 p-8 border-l-2 border-blue/40 bg-white/[0.02] backdrop-blur-sm"
                        >
                            <p className="font-serif italic text-xl text-white/90 leading-[1.5]">
                                &ldquo;The power shift from platforms back to brand founders is the core of everything we build.&rdquo;
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: 3 pillars + phone visual */}
                    <div className="flex flex-col gap-6">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="flex gap-5 items-start bg-white/[0.03] border border-white/10 p-8 hover:border-blue/30 transition-all duration-500 group"
                            >
                                <span className="text-3xl mt-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{p.icon}</span>
                                <div>
                                    <div className="text-white font-medium tracking-[0.5px] mb-2 group-hover:text-blue transition-colors">{p.title}</div>
                                    <p className="text-white/40 text-[14px] leading-relaxed group-hover:text-white/60 transition-colors">{p.body}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Phone mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="relative mx-auto w-full max-w-[340px] mt-8 p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl overflow-hidden"
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <Image
                                    src="/landing/app-store.png" 
                                    alt="Direct data and communication control"
                                    width={1080}
                                    height={2340}
                                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue/5 blur-[40px] -z-10" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Subtle background letter */}
            <div className="pointer-events-none absolute right-[-80px] bottom-[-80px] font-bebas text-[600px] leading-none text-white/[0.02] select-none">
                C
            </div>
        </section>
    )
}
