"use client"

import { useState } from "react"
import Link from "next/link"
import { ComingSoonModal } from "@/landing/components/ui/coming-soon-modal"
import { motion } from "framer-motion"
import { Mail, MapPin, Smartphone } from "lucide-react"

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const footerLinks = {
  Platform: [
    { name: "For Brands", href: "#brandfirst" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#brandfirst" },
    { name: "Compare", href: "#compare" },
  ],
  Resources: [
    { name: "Sample Discovery", href: "#brands" },
    { name: "Contact Us", href: "#contact" },
  ],
  Company: [
    { name: "Pitch Deck", href: "/pitch-deck" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Return & Refund Policy", href: "/return-policy" },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [showModal, setShowModal] = useState(false)

  return (
    <footer className="bg-ink border-t border-white/5 relative">
      {/* Subtle top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">

          {/* Brand col — wider */}
          <div className="lg:col-span-2">
            <Link href="/welcom" className="inline-block mb-6">
              <span className="font-bebas text-3xl tracking-wider">
                <span className="text-white">Down</span>
                <span className="text-blue">x</span>
                <span className="text-white">town</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs mb-8">
              The brand-first brand commerce blueprint. We give retailers the infrastructure
              to own their brand, their customers, and their scale.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4 mb-10">
              {[
                { icon: <TwitterIcon className="w-4 h-4" />, label: "Twitter" },
                { icon: <LinkedInIcon className="w-4 h-4" />, label: "LinkedIn" },
                { icon: <Mail className="w-4 h-4" />, label: "Email" },
              ].map(({ icon, label }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/40 hover:text-blue hover:border-blue transition-all duration-300"
                  aria-label={label}
                >
                  {icon}
                </motion.button>
              ))}
            </div>

            <div className="space-y-3 text-[13px] text-white/30">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                  className="flex items-center gap-2 hover:text-blue transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue/60 flex-shrink-0" />
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>
              )}
              {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 hover:text-blue transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue/60 flex-shrink-0" />
                  {process.env.NEXT_PUBLIC_CONTACT_PHONE}
                </a>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue/60 flex-shrink-0" />
                Lucknow, U.P., India
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-[10px] tracking-[4px] uppercase text-blue/80 mb-6">
                {category}
              </div>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.href.includes(".html") ? "_blank" : "_self"}
                      rel={link.href.includes(".html") ? "noopener noreferrer" : ""}
                      className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/20">
            © {currentYear} Downxtown. Made in India, for Indian Retailers.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-white/20">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white/50 transition-colors">Cookies</Link>
            <Link href="/return-policy" className="hover:text-white/50 transition-colors">Returns</Link>
          </div>
        </div>
      </div>

      <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </footer>
  )
}
