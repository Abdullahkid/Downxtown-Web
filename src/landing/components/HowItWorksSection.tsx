"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/landing/components/ui/card"
import { Store, TrendingUp, CheckCircle2, Clock, Link } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function HowItWorksSection() {
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [stepsRef, stepsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll-based progress for timeline drawing
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"]
  })

  // Timeline line height based on scroll
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const smoothLineHeight = useSpring(lineHeight, { stiffness: 100, damping: 30 })

  const steps = [
    {
      number: "01",
      icon: Link,
      title: "Connect Shopify Store",
      description: "Install the Downxtown Connector, grant access, and sync your catalog plus customers automatically.",
      time: "5 minutes",
      color: "text-brand-cyan",
      benefits: [
        "Install the Shopify app",
        "Grant read/write access",
        "Import catalog & customers",
        "Connector health dashboard"
      ]
    },
    {
      number: "02",
      icon: Store,
      title: "Design Your Brand Checkout",
      description: "Customize the storefront, policies, and messaging so every Downxtown sale feels like your Shopify store.",
      time: "10 minutes",
      color: "text-brand-teal",
      benefits: [
        "Brand colors & imagery",
        "Delivery & payment choices",
        "Story-driven product pages",
        "Branded checkout flows"
      ]
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Own Customers & Payouts",
      description: "Chat with buyers, manage Shopify + Downxtown orders, and get instant brand payouts after each sale.",
      time: "Ongoing",
      color: "text-seller-primary",
      benefits: [
        "Direct customer chat",
        "Unified Shopify order view",
        "Instant payouts",
        "Actionable analytics"
      ]
    }
  ]

  return (
    <section ref={sectionRef} id="how-it-works" className="section-padding relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container-width relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="text-white">Connect Shopify to </span>
            <span className="text-gradient-animated">Owned Brand Commerce</span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/80 max-w-3xl mx-auto mb-4"
          >
            In 3 simple steps
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-white/70"
          >
            <span className="text-trust-green font-semibold">Connector setup:</span> 5 minutes • Free onboarding support included
          </motion.p>
        </motion.div>

        {/* Steps Timeline - Animated */}
        <div ref={stepsRef} className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={stepsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              className="relative"
            >
              <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start pb-12">
                {/* Step Number & Icon - Animated */}
                <div className="flex flex-col items-center gap-4 relative">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-black border-2 border-brand-cyan/30 flex items-center justify-center relative z-20"
                    whileHover={{ scale: 1.1 }}
                    animate={{
                      boxShadow: stepsInView
                        ? [
                          "0 0 0px rgba(0, 255, 255, 0)",
                          "0 0 20px rgba(0, 255, 255, 0.3)",
                          "0 0 0px rgba(0, 255, 255, 0)",
                        ]
                        : "0 0 0px rgba(0, 255, 255, 0)",
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      },
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-brand-cyan/10 flex items-center justify-center">
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                  </motion.div>

                  {/* Animated Connection Line */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[4rem] bottom-[-3rem] w-0.5 bg-gradient-to-b from-brand-cyan via-brand-teal to-seller-primary opacity-30 z-0"
                      initial={{ scaleY: 0 }}
                      animate={stepsInView ? { scaleY: 1 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.3 + 0.4 }}
                      style={{ transformOrigin: "top" }}
                    />
                  )}
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full z-20 relative bg-black">
                    <Clock className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-xs text-white/60 font-medium">{step.time}</span>
                  </div>
                </div>

                {/* Step Content - Animated */}
                <Card className="bg-white/2 border border-white/10 hover:border-brand-cyan/30 transition-all duration-300 card-glass hover-lift">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-brand-cyan/60 text-sm font-bold mb-2">STEP {step.number}</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-white/80 text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Benefits List */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {step.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-trust-green flex-shrink-0" />
                          <span className="text-white/70 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result Section - Animated */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="inline-block bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-8 max-w-3xl card-glass">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              The Result?
            </h3>

            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-brand-cyan">Professional</div>
                <p className="text-white/70">Branded storefront</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-trust-green">Instant</div>
                <p className="text-white/70">Payments on every sale</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-brand-teal">100%</div>
                <p className="text-white/70">Data ownership</p>
              </div>
            </div>

            <p className="text-lg text-white/80">
              Stop juggling DMs. Start building your brand.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
