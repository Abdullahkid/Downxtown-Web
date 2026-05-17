"use client"

import { useState, useEffect } from "react"
import { ComingSoonModal } from "@/landing/components/ui/coming-soon-modal"
import { ScrollProgress } from "@/landing/components/premium/ScrollProgress"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "For Brands", href: "#ownership" },
    { name: "Features", href: "#brandfirst" },
    { name: "Discovery", href: "#brands" },
    { name: "Contact", href: "mailto:hello@downxtown.com" }
  ]

  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.downxtown.sigma2&pcampaignid=web_share"

  const handleCTA = () => {
    window.open(PLAYSTORE_URL, "_blank")
  }

  return (
    <>
      <ScrollProgress />
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-ink/80 backdrop-blur-md py-4 border-b border-white/5" : "bg-transparent py-8"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/welcom" className="flex items-center gap-4 group">
            <div className="w-16 h-16 relative flex items-center justify-center border border-white/10 rounded-xl bg-white/[0.03] group-hover:border-blue/30 group-hover:bg-white/[0.05] transition-all duration-300">
              <div className="w-14 h-14 relative">
                <Image src="/landing/logo.png" alt="Downxtown logo" fill className="object-contain" />
              </div>
            </div>
            <span className="font-bebas text-2xl tracking-[2px] text-white group-hover:text-blue transition-colors">Downxtown</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] tracking-[3px] uppercase text-white/50 hover:text-blue transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <button
              onClick={handleCTA}
              className="text-[11px] tracking-[3px] uppercase text-white font-bold hover:text-blue transition-colors bg-blue/10 hover:bg-blue/20 border border-blue/30 px-4 py-2"
            >
              List Your Brand
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-ink border-b border-white/5 p-8 flex flex-col gap-6 md:hidden"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[14px] tracking-[4px] uppercase text-white/70"
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => { setIsMenuOpen(false); handleCTA(); }}
                className="text-[14px] tracking-[4px] uppercase text-blue font-bold text-left"
              >
                List Your Brand Free →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
