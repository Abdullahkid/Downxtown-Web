"use client"

import { Button } from "@/landing/components/ui/button"

export function ProblemSolutionSection() {
  const comparisons = [
    {
      problem: "Fragile Shopify + marketplace workflows",
      solution: "Unified order management across Downxtown + Shopify"
    },
    {
      problem: "Sending payment links or QR codes manually",
      solution: "Integrated branded checkout with instant payouts"
    },
    {
      problem: "No customer journey history",
      solution: "Complete analytics and order dashboard"
    },
    {
      problem: "Brand visibility buried behind marketplaces",
      solution: "Your own storefront that customers remember"
    }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 bg-black">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
            Why Shopify Brands Are Switching
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 px-4">
            From DM chaos to professional e-commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Fragmented Commerce */}
          <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white/50 mb-4 sm:mb-6">
            Fragmented Commerce
          </h3>
            <div className="space-y-3 sm:space-y-4">
              {comparisons.map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-red-500 text-lg sm:text-xl flex-shrink-0">✕</span>
                  <p className="text-sm sm:text-base text-white/70">{item.problem}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Downxtown Way */}
          <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-brand-cyan mb-4 sm:mb-6">
            Downxtown Brand Layer
          </h3>
            <div className="space-y-3 sm:space-y-4">
              {comparisons.map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg">
                  <span className="text-trust-green text-lg sm:text-xl flex-shrink-0">✓</span>
                  <p className="text-sm sm:text-base text-white/90">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
