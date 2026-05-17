"use client"

import { motion } from "framer-motion"

const brands = [
    { name: "Sugar Cosmetics", category: "Cosmetics", emoji: "💄" },
    { name: "Bonkers Corner", category: "Streetwear", emoji: "🧢" },
    { name: "Comet", category: "Sneakers", emoji: "👟" },
    { name: "Urban Monkey", category: "Streetwear", emoji: "🐒" },
    { name: "Burger Bae", category: "Streetwear", emoji: "👕" },
]

export function SocialProofSection() {
    return (
        <section id="brands" className="py-20 px-6 bg-ink2 border-t border-white/5">
            <div className="max-w-7xl mx-auto">

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="text-blue text-[10px] tracking-[5px] uppercase mb-4">06 — Sample Discovery Feed</div>
                    <h2 className="font-bebas text-[clamp(36px,5vw,64px)] leading-[0.95] text-white">
                        Real catalogs. <em className="font-serif italic text-blue non-italic">Integrated for discovery.</em>
                    </h2>
                    <p className="text-white/40 mt-4 text-[15px]">
                        We&apos;ve synced publicly available Shopify data to showcase a live, functional ecosystem.
                    </p>
                </motion.div>

                {/* Brand Logo Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    {brands.map((brand, i) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.07 }}
                            className="flex items-center gap-3 border border-white/10 bg-white/[0.03] hover:border-blue/40 hover:bg-blue/[0.04] px-5 py-3 transition-all duration-300 cursor-default group"
                        >
                            <span className="text-xl">{brand.emoji}</span>
                            <div>
                                <div className="text-white text-[13px] font-medium tracking-[0.5px] group-hover:text-blue transition-colors">{brand.name}</div>
                                <div className="text-white/30 text-[10px] tracking-[2px] uppercase">{brand.category}</div>
                            </div>
                        </motion.div>
                    ))}
                    <div className="flex items-center gap-2 px-5 py-3 text-white/20 text-[13px] tracking-[1px]">
                        + more being added daily
                    </div>
                </motion.div>


            </div>
        </section>
    )
}
