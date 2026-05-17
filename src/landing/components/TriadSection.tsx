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
        story: "You ran ads for 6 months. You spent ₹2 lakh. Your website looked beautiful. But the moment you paused the campaigns — traffic stopped. You realised you don't know who your customers are, where they came from, or if they'll ever come back.",
        realityCTA: "Organic traffic without ads is near-impossible.",
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
        story: "Your reel hit 200K views. People loved it. Comments were full of \"where can I buy this?\". You replied \"link in bio\" 47 times. Three people actually clicked through. One bought. The rest forgot you existed by the next morning.",
        realityCTA: "Intent dies at every redirect.",
        poison: "Intent Decay",
        badgeClass: "bg-[#5b2cb6]/20 text-[#c084fc] border border-[#c084fc]/30",
        gradient: "linear-gradient(to left, rgba(10,10,10,0.15), rgba(10,10,10,0.5))",
        reverse: true
    },
    {
        num: "03",
        channel: "Flipkart / Myntra / Meesho",
        image: "/triad/triad-marketplaces.png",
        imageAlt: "Marketplace product grid interface",
        imageFit: "cover",
        imageBg: "bg-[#0a0d0a]",
        story: "You sold 300 units in February. You still don't know who bought them. The platform has their email, their phone number, their order history. You have a payout. You can't run a follow-up campaign. You can't offer a loyalty code. You're a supplier, not a brand.",
        realityCTA: "The platform owns your customer. You own the stock.",
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
                        does one thing.<br />
                        <em className="font-serif italic text-blue non-italic">None do enough.</em>
                    </h2>
                    <div className="w-12 h-[2px] bg-blue my-8" />
                    <p className="text-white/40 text-lg leading-relaxed font-light">
                        A growing D2C brand is already on three channels simultaneously — and each one fails them in a different, compounding way. Recognize any of these?
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
                                    <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-5 font-medium">Does this sound familiar?</div>
                                    <p className="text-[16px] leading-[1.75] text-white/65 max-w-[400px]">
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
                    <p className="text-white/50 text-lg md:text-xl leading-relaxed font-light">
                        Every founder we&apos;ve spoken to is running all three of these channels simultaneously.<br className="hidden md:block" />
                        And burning out doing it. There&apos;s a reason no one solved this —
                    </p>
                    <p className="mt-4 font-bebas text-[clamp(22px,3vw,36px)] text-white tracking-[1px]">
                        Until <em className="font-serif italic text-blue non-italic">now.</em>
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
