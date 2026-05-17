"use client"

import { motion } from 'framer-motion'

export function ShopifyConnectorStrip() {
    return (
        <div className="mt-16 border border-[#222] bg-[#0D0D0D] relative overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr]">
            {/* Subtle green glow — Shopify's brand color bleeding in */}
            <div
                className="absolute -top-[60px] -left-[60px] w-[300px] h-[200px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, rgba(149,191,71,0.06), transparent 70%)'
                }}
            />

            {/* Left */}
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#1a1a1a] flex flex-col gap-4 justify-center">
                <div className="flex items-center gap-2.5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.337 3.345a.5.5 0 0 0-.433-.08c-.06.016-1.377.41-1.377.41S12.07 2.19 11.4 2.04c-1.377-.32-2.72.56-3.42 1.84-.48.89-.67 1.8-.73 2.54L5.3 7.09s-.78.24-.81.25L2 8.07l2.18 13.87 10.91 1.91 5.91-1.27L15.337 3.345zM12.15 4.27c.46.1 1.04.56 1.52 1.27l-2.3.7c.1-.63.27-1.23.5-1.67.2-.37.42-.35.28-.3zM11.4 3.18c.13 0 .26.03.38.08-.29.15-.58.43-.84.83-.37.58-.65 1.48-.74 2.35l-1.77.54c.27-1.72 1.37-3.8 2.97-3.8z" fill="#95BF47" />
                        <path d="M14.904 3.265l-1.37 8.685-3.28-8.27 4.65-.415z" fill="#5E8E3E" />
                    </svg>
                    <span className="font-bebas text-[22px] tracking-[3px] text-[#95BF47]">Shopify</span>
                </div>
                <div className="text-[12px] text-[#444] leading-[1.6] tracking-[0.3px]">
                    <span className="inline-block text-[9px] tracking-[3px] uppercase bg-[#95BF47]/10 text-[#95BF47] border border-[#95BF47]/25 px-2 py-1 mb-2 mr-1.5">
                        Coming Soon
                    </span>
                    <br />
                    Downxtown Connector — Shopify App Store
                </div>
            </div>

            {/* Center */}
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#1a1a1a] flex items-center justify-center">
                <div className="flex items-center gap-3 w-full">
                    {/* Node Shopify */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px] bg-[#95BF47]/10 border border-[#95BF47]/20">
                            🛍️
                        </div>
                        <div className="text-[10px] tracking-[1.5px] uppercase text-[#444] text-center whitespace-nowrap">
                            Your Shopify Store
                        </div>
                    </div>

                    {/* Flow Arrow */}
                    <div className="flex-1 flex items-center gap-[5px] relative">
                        <div className="flex-1 h-px bg-[#222]" />
                        <motion.div
                            className="w-[5px] h-[5px] bg-blue rounded-full shrink-0 shadow-[0_0_6px_#0ABAB5]"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="w-[5px] h-[5px] bg-blue rounded-full shrink-0 shadow-[0_0_6px_#0ABAB5]"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                        />
                        <motion.div
                            className="w-[5px] h-[5px] bg-blue rounded-full shrink-0 shadow-[0_0_6px_#0ABAB5]"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                        />
                        <div className="flex-1 h-px bg-[#222]" />
                    </div>

                    {/* Node DX */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px] bg-blue/10 border border-blue/20">
                            ⬡
                        </div>
                        <div className="text-[10px] tracking-[1.5px] uppercase text-[#444] text-center whitespace-nowrap">
                            Downxtown
                        </div>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="p-8 md:p-10 flex flex-col gap-3.5 justify-center">
                <p className="font-bebas text-[26px] tracking-[1.5px] text-white leading-[1.1]">
                    Already on Shopify? One install. You&apos;re in.
                </p>
                <p className="text-[14px] text-[#555] leading-[1.65]">
                    Your catalogue, inventory, and orders sync automatically. Get a brand-first storefront and a new discovery channel — without rebuilding anything from scratch.
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="text-[12px] text-[#95BF47] tracking-[0.5px]">✓ Auto catalogue sync</div>
                    <div className="text-[12px] text-[#95BF47] tracking-[0.5px]">✓ Inventory managed from Shopify</div>
                    <div className="text-[12px] text-[#95BF47] tracking-[0.5px]">✓ Orders flow back to your dashboard</div>
                </div>
            </div>
        </div>
    )
}
