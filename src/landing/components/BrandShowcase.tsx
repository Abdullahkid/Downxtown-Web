"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface Brand {
    name: string
    category?: string
}

interface BrandShowcaseProps {
    title?: string
    subtitle?: string
    brands?: Brand[]
}

// Placeholder brands - these should be replaced with actual imported brand names
const defaultBrands: Brand[] = [
    { name: "Swiss Beauty", category: "Beauty" },
    { name: "Blackberrys", category: "Fashion" },
    { name: "The Man Company", category: "Grooming" },
    { name: "Boat", category: "Electronics" },
    { name: "Mamaearth", category: "Personal Care" },
    { name: "Sugar Cosmetics", category: "Beauty" },
    { name: "Bewakoof", category: "Fashion" },
    { name: "Noise", category: "Electronics" },
    { name: "WOW Skin Science", category: "Personal Care" },
    { name: "Campus", category: "Footwear" },
    { name: "Plum", category: "Beauty" },
    { name: "Urbanic", category: "Fashion" },
]

export function BrandShowcase({
    title = "Brands You'll Discover",
    subtitle = "Curated selection from top Indian D2C brands",
    brands = defaultBrands
}: BrandShowcaseProps) {
    const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true })
    const [marqueeRef, marqueeInView] = useInView({ threshold: 0.1, triggerOnce: true })

    // Double the brands for seamless infinite scroll
    const duplicatedBrands = [...brands, ...brands]

    return (
        <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-dark-navy/50 to-brand-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px]" />

            <div className="container-width relative z-10">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">{title.split(' ').slice(0, -1).join(' ')} </span>
                        <span className="text-gradient-animated">{title.split(' ').slice(-1)}</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Brand Marquee */}
                <motion.div
                    ref={marqueeRef}
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={marqueeInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />

                    {/* Scrolling Container */}
                    <div className="overflow-hidden py-4">
                        <motion.div
                            className="flex gap-6 sm:gap-8"
                            animate={{
                                x: ["0%", "-50%"]
                            }}
                            transition={{
                                x: {
                                    duration: 30,
                                    repeat: Infinity,
                                    ease: "linear"
                                }
                            }}
                        >
                            {duplicatedBrands.map((brand, index) => (
                                <motion.div
                                    key={`${brand.name}-${index}`}
                                    className="flex-shrink-0 px-6 sm:px-8 py-4 sm:py-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-brand-cyan/30 transition-all duration-300 group cursor-default"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-semibold text-white group-hover:text-brand-cyan transition-colors duration-300 whitespace-nowrap">
                                            {brand.name}
                                        </div>
                                        {brand.category && (
                                            <div className="text-xs sm:text-sm text-white/50 mt-1">
                                                {brand.category}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Second Row - Reverse Direction */}
                    <div className="overflow-hidden py-4">
                        <motion.div
                            className="flex gap-6 sm:gap-8"
                            animate={{
                                x: ["-50%", "0%"]
                            }}
                            transition={{
                                x: {
                                    duration: 35,
                                    repeat: Infinity,
                                    ease: "linear"
                                }
                            }}
                        >
                            {duplicatedBrands.reverse().map((brand, index) => (
                                <motion.div
                                    key={`${brand.name}-reverse-${index}`}
                                    className="flex-shrink-0 px-6 sm:px-8 py-4 sm:py-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-brand-cyan/30 transition-all duration-300 group cursor-default"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-semibold text-white group-hover:text-brand-cyan transition-colors duration-300 whitespace-nowrap">
                                            {brand.name}
                                        </div>
                                        {brand.category && (
                                            <div className="text-xs sm:text-sm text-white/50 mt-1">
                                                {brand.category}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Disclaimer */}
                <motion.p
                    className="text-center text-xs sm:text-sm text-white/40 mt-8 px-4"
                    initial={{ opacity: 0 }}
                    animate={marqueeInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Discover curated products from popular Indian brands • New stores added regularly
                </motion.p>
            </div>
        </section>
    )
}
