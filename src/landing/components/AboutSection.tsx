"use client"

import { Card, CardContent } from "@/landing/components/ui/card"
import { Button } from "@/landing/components/ui/button"
import { NetworkGraph } from "@/landing/components/premium/NetworkGraph"
import { X, CheckCircle2, Store, Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useVelocityTransforms } from "@/landing/hooks/useScrollVelocity"

export function AboutSection() {
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [comparisonRef, comparisonInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true })

  // Velocity based skew
  const { skewY } = useVelocityTransforms()

  const marketplaceIssues = [
    {
      text: "Platforms own every customer detail",
      detail: "You cannot export contacts back to Shopify or your CRM"
    },
    {
      text: "Forced ad spending for visibility",
      detail: "Pay ₹10,000s monthly just to appear in search results"
    },
    {
      text: "7-15 day payment delays",
      detail: "Your money is held hostage while bills pile up"
    },
    {
      text: "Your brand stays invisible",
      detail: "Customers remember Amazon, not your store name"
    },
    {
      text: "Platform competes with you",
      detail: "Private labels copy your products at lower prices"
    }
  ]

  const DownxtownBenefits = [
    {
      text: "You own 100% of customer data",
      detail: "Export customer records directly to Shopify or your CRM"
    },
    {
      text: "Grow organically with your brand story",
      detail: "Zero mandatory ad spend—Downxtown amplifies your Shopify audience"
    },
    {
      text: "Instant payouts in minutes",
      detail: "Money settles fast, aligned with your Shopify payout cadence"
    },
    {
      text: "Your brand front and center",
      detail: "Customers buy from YOUR storefront, not a marketplace"
    },
    {
      text: "We keep connectors lean",
      detail: "Downxtown Connector never competes—just compliments Shopify"
    }
  ]

  const bridgeFeatures = [
    {
      icon: Store,
      title: "Store-First Design",
      description: "Your storefront is the hero. Buyers discover stores first, products second. Build a brand customers remember and trust.",
      color: "text-brand-cyan",
      stat: "85% of buyers follow stores"
    },
    {
      icon: Zap,
      title: "Direct Customer Chat",
      description: "Real-time messaging built in. Answer questions, provide support, build loyalty. No middleman between you and your customers.",
      color: "text-brand-teal",
      stat: "3x higher repeat purchases"
    },
    {
      icon: TrendingUp,
      title: "Complete Autonomy",
      description: "Set your prices, choose delivery partners, design your store. Run your business your way, with zero platform interference.",
      color: "text-seller-primary",
      stat: "100% seller control"
    }
  ]

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header with Animation */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
            <motion.span style={{ skewY, display: "inline-block" }} className="text-white">The </motion.span>{" "}
            <motion.span style={{ skewY, display: "inline-block" }} className="text-gradient-animated">Bridge Model</motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-3 sm:mb-4"
          >
            We <span className="text-brand-cyan font-semibold">connect</span>, not control
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base md:text-lg text-white/70 max-w-3xl mx-auto"
          >
            Traditional marketplaces own your customers and control your business.
            Downxtown gives you the tools while you keep complete ownership.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-brand-white/60 max-w-3xl mx-auto mt-2"
          >
            Downxtown Connector for Shopify syncs orders, customers, and analytics into a branded checkout—no replatforming required.
          </motion.p>

          {/* Network Visualization */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 h-64 rounded-2xl overflow-hidden card-glass"
          >
            <NetworkGraph nodeCount={25} animated={true} />
          </motion.div> */}
        </motion.div>

        {/* Comparison Table - Animated */}
        <div ref={comparisonRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-0">
          {/* Traditional Marketplaces */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={comparisonInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white/2 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 h-full hover-lift">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-red-400 flex items-center gap-2 sm:gap-3">
                    <X className="w-6 h-6 sm:w-7 sm:h-7" />
                    Traditional Marketplaces
                  </h3>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {marketplaceIssues.map((issue, index) => (
                    <div key={index} className="group">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/90 font-medium mb-1 text-sm sm:text-base">{issue.text}</p>
                          <p className="text-white/60 text-xs sm:text-sm">{issue.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-red-500/20">
                  <p className="text-red-400 font-semibold text-center">
                    You&apos;re renting customers, not building a business
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Downxtown Bridge */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={comparisonInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-brand-cyan/5 border-2 border-brand-cyan/50 hover:border-brand-cyan/80 transition-all duration-300 relative h-full hover-lift hover-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-cyan text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  THE BETTER WAY
                </span>
              </div>

              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 mt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-cyan flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                    Downxtown Bridge
                  </h3>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {DownxtownBenefits.map((benefit, index) => (
                    <div key={index} className="group">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-trust-green flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold mb-1 text-sm sm:text-base">{benefit.text}</p>
                          <p className="text-white/70 text-xs sm:text-sm">{benefit.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-brand-cyan/20">
                  <p className="text-brand-cyan font-semibold text-center">
                    Build lasting relationships, own your destiny
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bridge Model Features */}
        <motion.div
          ref={featuresRef}
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-16 px-2 sm:px-0"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-3 sm:mb-4">
            How the Bridge Model Works
          </h3>
          <p className="text-center text-sm sm:text-base text-white/70 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4">
            Three principles that make Downxtown fundamentally different
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {bridgeFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white/2 border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/4 hover:border-brand-cyan/30 transition-all duration-300 group card-glass hover-lift"
              >
                {/* Icon with background */}
                <div className="w-16 h-16 rounded-full bg-brand-cyan/10 flex items-center justify-center mb-6 group-hover:bg-brand-cyan/20 transition-colors duration-300">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                {/* Title */}
                <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-brand-cyan transition-colors duration-300">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="text-white/70 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Stat */}
                <div className="flex items-center gap-2 text-brand-cyan font-medium text-sm">
                  <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                  {feature.stat}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quote Section with stronger CTA */}
        <div className="bg-white/2 border border-brand-cyan/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 text-center mx-2 sm:mx-0">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl text-brand-cyan mb-6 opacity-50"></div>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              We&apos;re not a marketplace.
              <br />
              We&apos;re a <span className="text-brand-cyan">bridge</span> connecting authentic retailers with conscious buyers.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-6 sm:mb-8 px-2">
              Your customers, your data, your brand. Always.
            </p>

            {/* CTA in quote section */}
            <Button className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-brand-cyan text-black rounded-full hover:bg-brand-cyan-light transition-all duration-300 min-h-[48px]">
              See How It Works →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
