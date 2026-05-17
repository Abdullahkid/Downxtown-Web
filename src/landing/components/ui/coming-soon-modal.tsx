"use client"

import { useState, useEffect } from "react"
import { Button } from "@/landing/components/ui/button"
import { X, Smartphone, Mail, Bell } from "lucide-react"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add email submission logic here (e.g., save to database or send to API)
    console.log("Email submitted:", email)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail("")
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-brand-black border border-brand-cyan/30 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-white/60 hover:text-brand-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-teal rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-black" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-brand-white mb-3">
            Download Coming Soon
          </h3>
          <p className="text-sm sm:text-base text-brand-white/70 leading-relaxed">
            The Downxtown app will be available on Google Play very soon. Get notified when it&apos;s ready to download!
          </p>
        </div>

        {/* Form or Success Message */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-brand-dark-gray border border-brand-cyan/30 rounded-lg text-brand-white placeholder-brand-white/50 focus:border-brand-cyan focus:outline-none transition-colors min-h-[44px]"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-semibold bg-gradient-to-r from-brand-cyan to-brand-teal hover:from-brand-cyan-light hover:to-brand-cyan text-black min-h-[48px]"
              size="lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-3">
            <div className="w-12 h-12 bg-trust-green/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-trust-green" />
            </div>
            <p className="text-trust-green font-semibold">
              Thanks! We&apos;ll notify you soon.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-brand-cyan/20 text-center">
          <p className="text-xs sm:text-sm text-brand-white/60">
            <span className="inline-block w-2 h-2 bg-trust-green rounded-full mr-2 animate-pulse"></span>
            200+ sellers already building their brands
          </p>
        </div>
      </div>
    </div>
  )
}

