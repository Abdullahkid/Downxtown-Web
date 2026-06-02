"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const painStories = [
    {
        num: "01",
        channel: "Your Website",
        image: "/triad/triad-website.png",
        imageAlt: "Website storefront interface",
        imageFit: "cover",
        imageBg: "bg-[#0a0f1a]",
        story: "You spent ₹2 lakh on ads.\nTraffic came. Orders came.\nThen you paused the campaigns.\nEverything stopped.\n\nWithout ads, your store becomes invisible.\nYour growth is rented.",
        realityCTA: "Ad Dependency",
        poison: "Ad Dependency",
        badgeClass: "bg-white/10 text-white/70 border border-white/20",
        gradient: "linear-gradient(to right, rgba(10,10,10,0.15), rgba(10,10,10,0.5))"
    },
    {
        num: "02",
        channel: "Instagram / Reels",
        image: "/triad/triad-social.png",
        imageAlt: "Social media feed interface",
        imageFit: "contain",
        imageBg: "bg-[#0a0a0a]",
        story: "Your reel hit 200K views.\nComments flooded in:\n\"Where can I buy this?\"\n\nYou replied: \"Link in bio.\"\nMost never clicked. The rest disappeared before checkout.\n\nAttention came. Intent didn't survive.",
        realityCTA: "Discovery exists. Conversion doesn't.",
        poison: "Intent Decay",
        badgeClass: "bg-[#5b2cb6]/20 text-[#c084fc] border border-[#c084fc]/30",
        gradient: "linear-gradient(to left, rgba(10,10,10,0.15), rgba(10,10,10,0.5))",
        reverse: true
    },
    {
        num: "03",
        channel: "Flipkart / Myntra / Amazon",
        image: "/triad/triad-marketplaces.png",
        imageAlt: "Marketplace product grid interface",
        imageFit: "cover",
        imageBg: "bg-[#0a0d0a]",
        story: "You sold 300 units.\nBut the marketplace owns:\nthe customer\nthe data\nthe relationship\n\nYou get payouts.\nNot brand loyalty.",
        realityCTA: "The platform owns the customer. You own the inventory.",
        poison: "Identity Loss",
        badgeClass: "bg-[#c8641e]/20 text-[#fb923c] border border-[#fb923c]/30",
        gradient: "linear-gradient(to right, rgba(10,10,10,0.15), rgba(10,10,10,0.5))"
    }
]

export function TriadSection() {
    return (
        <section id="triad" className="py-32 px-6 bg-ink2 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-[600px] mb-20">
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">01 — The Problem</div>
                    <h2 className="font-bebas text-[clamp(48px,6vw,90px)] leading-[0.92] text-white">
                        Each channel<br />
                        solves one problem.<br />
                        <em className="font-serif italic text-blue non-italic">None solves the business.</em>
                    </h2>
                    <div className="w-12 h-[2px] bg-blue my-8" />
                    <p className="text-white/40 text-lg leading-relaxed font-light">
                        Every growing D2C brand is already on three channels.<br />
                        And each one breaks in a different way.
                    </p>
                </div>

                <div className="flex flex-col gap-[3px]">
                    {painStories.map((item, i) => (
                        <motion.div
                            key={item.num}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: i * 0.1 }}
                            className={`group overflow-hidden border border-white/10 bg-[#111] md:flex ${item.reverse ? "md:flex-row-reverse" : "md:flex-row"}`}
                        >
                            <div className={`relative flex-1 min-h-[240px] md:min-h-[340px] ${item.imageBg} flex items-center justify-center overflow-hidden`}>
                                <Image
                                    src={item.image}
                                    alt={item.imageAlt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className={`transition-transform duration-500 ease-out group-hover:scale-[1.04] ${item.imageFit === "contain" ? "object-contain p-5 bg-[#111]" : "object-cover object-top"}`}
                                />
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{ background: item.gradient }}
                                />
                                <div className={`absolute left-5 top-5 z-10 rounded-[2px] px-3 py-1 text-[10px] tracking-[3px] uppercase font-medium ${item.badgeClass}`}>
                                    {item.channel}
                                </div>
                            </div>

                            <div className={`relative flex-1 bg-[#111] px-10 py-12 md:px-14 md:py-14 flex flex-col justify-between ${item.reverse ? "md:border-r md:border-white/10" : "md:border-l md:border-white/10"}`}>
                                <div className="pointer-events-none absolute right-9 top-6 font-bebas text-[100px] leading-none text-white/5">
                                    {item.num}
                                </div>

                                {/* The story — first person, experiential */}
                                <div>
                                    <p className="text-[16px] leading-[1.75] text-white/65 max-w-[400px] whitespace-pre-line">
                                        {item.story}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    {/* The hard truth */}
                                    <div className="border-l-2 border-red-500/40 pl-5 mb-6">
                                        <p className="text-[14px] italic text-red-400/80 leading-relaxed font-medium">
                                            {item.realityCTA}
                                        </p>
                                    </div>

                                    <div className="inline-flex items-center gap-2 border border-red-500/25 bg-red-500/5 px-4 py-2 text-[11px] uppercase tracking-[2px] text-red-500/90">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        {item.poison}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bridge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-16 border border-white/10 bg-white/[0.02] p-10 md:p-14 text-center max-w-4xl mx-auto"
                >
                    <p className="text-white/70 text-xl md:text-2xl leading-relaxed font-light mb-6">
                        The real problem is <em className="font-serif italic text-blue non-italic">fragmentation.</em>
                    </p>
                    <p className="text-white/40 text-base md:text-lg leading-relaxed font-light mb-8">
                        Discovery happens in one place. Trust-building in another. Transactions somewhere else. Community nowhere.<br className="hidden md:block" />
                        <br />
                        Brands are forced to stitch together disconnected platforms just to simulate what should feel like one ecosystem.<br className="hidden md:block" />
                        And the bigger they grow, the more fragmented everything becomes.
                    </p>
                    <p className="text-white/50 text-lg md:text-xl leading-relaxed font-light">
                        Every founder is trying to make all three work together.<br className="hidden md:block" />
                        And burning out doing it.
                    </p>
                    <p className="mt-4 font-bebas text-[clamp(22px,3vw,36px)] text-white tracking-[1px]">
                        Until <em className="font-serif italic text-blue non-italic">now.</em>
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
