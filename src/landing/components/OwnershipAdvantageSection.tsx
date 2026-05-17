"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const advantages = [
    {
        icon: "💬",
        title: "Pre-Purchase Conversation",
        body: "Customers ask about sizing, custom orders, restocks directly — no third-party wall, no delay."
    },
    {
        icon: "🎁",
        title: "Post-Purchase Loyalty",
        body: "Brands share exclusive offers, loyalty codes, and follow-up messages directly to buyers after purchase."
    },
    {
        icon: "📊",
        title: "Owned Customer Data",
        body: "Data doesn't sit behind a platform wall. Brands understand exactly who is engaging with them."
    }
]

export function OwnershipAdvantageSection() {
    return (
        <section id="ownership" className="py-24 md:py-32 px-6 bg-ink relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">

                    {/* Left Content (Text) */}
                    <div className="flex flex-col justify-center order-2 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4 border border-blue/30 bg-blue/5 px-4 py-2 w-fit font-medium">
                                The Ownership Advantage
                            </div>
                            <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white tracking-wide">
                                The Channel <br />
                                <em className="font-serif italic text-blue font-normal">Brands Own.</em>
                            </h2>

                            <div className="w-12 h-[2px] bg-blue my-8" />

                            <div className="text-[17px] text-white/80 leading-[1.7] mb-12">
                                <p className="mb-4">
                                    <strong>Direct messaging.</strong>
                                </p>
                                <p>
                                    On traditional marketplaces, the platform owns the customer. On Downxtown, the brand does. Every brand profile has direct messaging — making every purchase the beginning of a relationship, not the end of a transaction.
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-8">
                            {advantages.map((adv, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1 * idx }}
                                    className="flex gap-4 items-start"
                                >
                                    <div className="text-2xl mt-1 shrink-0">{adv.icon}</div>
                                    <div>
                                        <h3 className="font-bebas text-xl tracking-[1.5px] text-white mb-2">
                                            {adv.title}
                                        </h3>
                                        <p className="text-[14px] leading-relaxed text-white/50">
                                            {adv.body}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-12 p-6 border-l-2 border-blue bg-blue/5"
                        >
                            <p className="font-serif italic text-lg text-white/90 leading-[1.5]">
                                &quot;Marketplace brands are anonymous suppliers. <br />
                                <span className="text-white font-sans font-medium tracking-wide not-italic mt-2 inline-block">Downxtown brands are independent businesses.&quot;</span>
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Image (Sticky on Desktop) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full relative flex justify-center lg:justify-center order-1 lg:order-1 lg:sticky lg:top-32"
                    >
                        <div className="relative w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(10,186,181,0.1)] overflow-hidden">
                            <Image
                                src="/landing/ownership-advantage.png"
                                alt="Downxtown Ownership Advantage"
                                width={600}
                                height={600}
                                className="w-full h-auto object-cover"
                                sizes="(max-width: 1024px) 70vw, 340px"
                            />
                        </div>
                        {/* Soft background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue/10 blur-[100px] pointer-events-none -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
