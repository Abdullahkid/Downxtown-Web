'use client'

import { motion } from 'framer-motion'

const buyerShifts = [
    {
        icon: "🧠",
        title: "From Browsing to Understanding",
        desc: "Shoppers don't just see a price tag; they see your origin, your craft, and your 'why.' They don't just buy a product—they buy into your world."
    },
    {
        icon: "🤝",
        title: "From Customer to Community",
        desc: "The 'platform wall' is gone. Buyers talk to you, ask questions, and become part of your brand's inner circle before they even hit checkout."
    },
    {
        icon: "💎",
        title: "The Pride of Discovery",
        desc: "There is status in being first. Downxtown buyers take pride in discovering independent brands and 'flexing' their finds to their own circles."
    },
    {
        icon: "🔥",
        title: "Advocacy Over Transactions",
        desc: "Every follow is a vote of confidence. Your brand becomes part of their digital identity, turning a one-time buyer into a lifetime advocate."
    }
]

export function ShoppersSection() {
    const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.downxtown.sigma2&pcampaignid=web_share"

    const handleCTA = () => {
        window.open(PLAYSTORE_URL, "_blank")
    }

    return (
        <section id="shoppers" className="bg-[#F8F7F4] py-24 md:py-32 px-6 md:px-12 relative overflow-hidden text-ink">
            <div className="max-w-[1200px] mx-auto relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-[800px] mb-20"
                >
                    <div className="text-[10px] tracking-[3px] uppercase text-blue border border-blue/30 bg-blue/5 px-4 py-2 w-fit mb-8 font-medium">
                        09 — The Buyer Shift
                    </div>
                    <h2 className="font-bebas text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] text-ink mb-8">
                        Where Shoppers Become<br />
                        <em className="font-serif italic text-blue">Advocates.</em>
                    </h2>
                    <p className="text-[19px] text-[#444] leading-[1.6] font-light max-w-[640px]">
                        Downxtown wasn&apos;t designed for the bargain hunter—it was designed for the conscious shopper. The one who buys on <strong className="text-ink">trust, story, and status</strong> rather than just a discount code.
                    </p>
                </motion.div>

                {/* The 4 Shift Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                    {buyerShifts.map((shift, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white border border-[#EBE9E1] p-10 flex flex-col gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 group"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{shift.icon}</span>
                            <div>
                                <div className="font-bebas text-2xl tracking-[1px] text-ink mb-3">{shift.title}</div>
                                <p className="text-[15px] text-[#666] leading-relaxed">
                                    {shift.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Final Shift Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-12 py-12 border-t border-[#EBE9E1]"
                >
                    <div className="max-w-[520px]">
                        <h3 className="font-bebas text-3xl text-ink mb-4">Every purchase is a badge of honor.</h3>
                        <p className="text-[16px] text-[#777] leading-relaxed">
                            When a buyer shares your brand on Downxtown, they aren&apos;t just sharing a product—they are flexing their taste. They become a **growth multiplier** because they actually care about your success.
                        </p>
                    </div>
                    <button 
                        onClick={handleCTA}
                        className="bg-ink hover:bg-blue text-white px-12 py-5 font-bebas text-lg tracking-[2px] transition-all duration-300 shadow-xl hover:shadow-blue/20"
                    >
                        DOWNLOAD THE APP →
                    </button>
                </motion.div>
            </div>
        </section>
    )
}
