"use client"

import { Button } from "@/landing/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/landing/components/ui/card"
import { AuroraText } from "@/landing/components/premium/AuroraText/AuroraText"
import { AnimatedCounter } from "@/landing/components/premium/AnimatedCounter"
import { ScrollReveal } from "@/landing/components/premium/ScrollReveal"
import { StaggerContainer, StaggerItem } from "@/landing/components/premium/StaggerContainer"
import { CheckCircle2, Star, Zap, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function PricingSection() {
  const features = [
    {
      title: "Professional Storefront",
      description: "Complete branding & customization"
    },
    {
      title: "Unlimited Products",
      description: "No listing limits or caps"
    },
    {
      title: "Instant Payouts",
      description: "Only 2-3% payment gateway fees"
    },
    {
      title: "Customer Data Ownership",
      description: "Export anytime, 100% yours"
    },
    {
      title: "Direct Customer Chat",
      description: "Real-time messaging built-in"
    },
    {
      title: "Full Analytics",
      description: "Business intelligence dashboard"
    }
    ,
    {
      title: "Shopify Connector Support",
      description: "Onboarding help and Shopify App Store launch guidance"
    }
  ]

  return (
    <section id="pricing" className="relative py-32 px-4 bg-black overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 via-transparent to-brand-teal/5"
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <ScrollReveal direction="up" delay={0.1}>
            <motion.div
              className="inline-block bg-trust-green/10 border border-trust-green/30 px-4 py-2 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-trust-green font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                SPECIAL OFFER
              </span>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <AuroraText as="span">Free to Start</AuroraText>
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto px-4">
              Start selling on Downxtown <span className="text-trust-green font-semibold">completely free</span>.
              No hidden fees, no credit card required.
            </p>
          </ScrollReveal>
        </div>

        {/* What's Included */}
        <ScrollReveal direction="up" delay={0.4}>
          <motion.div
            className="bg-white/2 border-2 border-brand-cyan/50 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden group"
            whileHover={{ scale: 1.02, borderColor: "rgba(0, 255, 255, 0.8)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-brand-teal/10 to-brand-cyan/10 opacity-0 group-hover:opacity-100"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            />
            <div className="relative z-10 mb-8">
              <motion.div
                className="text-7xl font-extrabold text-brand-cyan mb-4"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <AnimatedCounter start={999} end={0} prefix="₹" duration={2.5} className="text-7xl font-extrabold text-brand-cyan" />
              </motion.div>
              <p className="text-2xl text-white/80">Everything included. Zero charges.</p>
            </div>

            {/* Features Grid with Stagger Animation */}
            <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-10 text-left max-w-3xl mx-auto relative z-10" staggerDelay={0.1}>
              {features.map((feature, index) => (
                <StaggerItem
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <motion.div
                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-white/5 transition-colors duration-300"
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.span
                      className="text-trust-green text-xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      ✓
                    </motion.span>
                    <div>
                      <p className="text-white font-semibold">{feature.title}</p>
                      <p className="text-white/60 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* CTA */}
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold bg-brand-cyan text-black rounded-full hover:bg-brand-cyan-light mb-6 min-h-[48px] shadow-lg hover:shadow-xl hover:shadow-brand-cyan/50 transition-all duration-300">
                Get Started Free →
              </Button>
            </motion.div>

            {/* Fine Print */}
            <div className="space-y-2 text-sm text-white/60 px-4 relative z-10">
              <p>✓ No credit card required • ✓ No hidden fees • ✓ No time limit</p>
              <p className="text-white/50 italic">
                *2-3% payment gateway fee charged by payment processor (industry standard)
              </p>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Pricing Note */}
        <ScrollReveal direction="up" delay={0.6}>
          <div className="mt-12 text-center max-w-2xl mx-auto px-4">
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              <span className="text-brand-cyan font-semibold">Why free?</span> We&apos;re building Downxtown
              with sellers, not just for them. Your feedback shapes our platform and helps us create
              the best experience for Indian retailers.
              <br />
              Downxtown Connector for Shopify is launching soon on the Shopify App Store—request early access today.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// export function PricingSection() {
//   const plans = [
//     {
//       name: "Starter",
//       price: "₹999",
//       period: "/month",
//       description: "Perfect for Shopify brands starting out",
//       features: [
//         "Professional storefront",
//         "Up to 100 products",
//         "Basic analytics",
//         "Shopify sync",
//         "3% transaction fee",
//         "Email support"
//       ],
//       cta: "Start Free Trial",
//       highlighted: false,
//       badge: null
//     },
//     {
//       name: "Growth",
//       price: "₹2,499",
//       period: "/month",
//       description: "Most popular for scaling brands",
//       features: [
//         "Everything in Starter",
//         "Unlimited products",
//         "Advanced analytics",
//         "Priority support",
//         "2% transaction fee",
//         "Shopify auto-sync",
//         "Custom branding"
//       ],
//       cta: "Claim 50% Launch Discount",
//       highlighted: true,
//       badge: "MOST POPULAR"
//     },
//     {
//       name: "Brand",
//       price: "₹4,999",
//       period: "/month",
//       description: "For multi-location retailers",
//       features: [
//         "Everything in Growth",
//         "Multiple locations",
//         "Custom branding kit",
//         "API access",
//         "1.5% transaction fee",
//         "Dedicated account manager",
//         "Priority feature requests"
//       ],
//       cta: "Schedule Demo",
//       highlighted: false,
//       badge: null
//     }
//   ]

//   return (
//     <section id="pricing" className="section-padding bg-gradient-to-b from-brand-dark-gray to-brand-black">
//       <div className="container-width">
//         {/* Section Header */}
//         <div className="text-center mb-16 stagger-children">
//           <h2 className="text-4xl md:text-6xl font-bold mb-8">
//             <span className="text-brand-white">Transparent </span>
//             <span className="text-gradient-animated">Pricing</span>
//           </h2>
//           <p className="text-xl text-brand-white/80 max-w-3xl mx-auto mb-6">
//             No hidden fees. No surprises. Just honest pricing that helps you grow.
//           </p>
//           <p className="text-lg text-brand-white/70 max-w-2xl mx-auto">
//             <span className="text-urgency-orange font-semibold">Launch Special:</span> First 100 sellers get 50% off for 6 months
//           </p>
//         </div>

//         {/* Pricing Cards */}
//         <div className="grid md:grid-cols-3 gap-8 mb-16">
//           {plans.map((plan, index) => (
//             <Card
//               key={index}
//               className={`relative ${
//                 plan.highlighted
//                   ? 'border-seller-primary/60 bg-gradient-to-br from-seller-primary/10 to-brand-dark-gray shadow-2xl shadow-seller-primary/20 scale-105'
//                   : 'border-brand-cyan/30 bg-gradient-to-br from-brand-dark-gray/80 to-brand-medium-gray/80'
//               } hover-glow transition-all duration-500`}
//             >
//               {plan.badge && (
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                   <div className="bg-seller-primary text-brand-black text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
//                     <Star className="w-3 h-3" />
//                     {plan.badge}
//                   </div>
//                 </div>
//               )}

//               <CardHeader className="text-center pb-4">
//                 <CardTitle className="text-2xl text-brand-white mb-2">{plan.name}</CardTitle>
//                 <div className="mb-4">
//                   <span className="text-4xl md:text-5xl font-bold text-brand-cyan">{plan.price}</span>
//                   <span className="text-brand-white/60">{plan.period}</span>
//                 </div>
//                 <CardDescription className="text-brand-white/70">{plan.description}</CardDescription>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 <ul className="space-y-3 mb-6">
//                   {plan.features.map((feature, idx) => (
//                     <li key={idx} className="flex items-start gap-2 text-brand-white/80">
//                       <CheckCircle2 className={`w-5 h-5 ${plan.highlighted ? 'text-seller-primary' : 'text-trust-green'} flex-shrink-0 mt-0.5`} />
//                       <span className="text-sm">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <Button
//                   size="lg"
//                   className={`w-full font-semibold ${
//                     plan.highlighted
//                       ? 'bg-gradient-to-r from-seller-primary to-brand-teal hover:from-brand-cyan-light hover:to-seller-primary shadow-lg hover:shadow-seller-primary/40'
//                       : 'bg-brand-dark-gray border-2 border-brand-cyan/50 hover:border-brand-cyan hover:bg-brand-cyan/10'
//                   }`}
//                   variant={plan.highlighted ? 'default' : 'outline'}
//                 >
//                   {plan.cta}
//                 </Button>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Comparison Footer */}
//         <div className="glass-morphism border border-brand-cyan/30 rounded-2xl p-8 md:p-12 text-center">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <Zap className="w-8 h-8 text-urgency-orange" />
//             <h3 className="text-2xl md:text-3xl font-bold text-brand-white">
//               Compare: Traditional Marketplaces
//             </h3>
//           </div>

//           <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
//             <div className="text-left">
//               <p className="text-red-400 font-semibold mb-2">❌ Traditional Marketplaces:</p>
//               <ul className="text-sm text-brand-white/70 space-y-1">
//                 <li>• 20-30% commission per sale</li>
//                 <li>• Mandatory ad spend for visibility</li>
//                 <li>• 7-15 day payment delays</li>
//                 <li>• Hidden fees and charges</li>
//               </ul>
//             </div>

//             <div className="text-left">
//               <p className="text-trust-green font-semibold mb-2">✅ Downxtown:</p>
//               <ul className="text-sm text-brand-white/90 space-y-1">
//                 <li>• 1.5-3% transaction fee</li>
//                 <li>• Organic discovery (no forced ads)</li>
//                 <li>• Instant payouts</li>
//                 <li>• Transparent subscription pricing</li>
//               </ul>
//             </div>
//           </div>

//           <p className="text-brand-white/80">
//             <span className="text-seller-primary font-semibold">Save up to ₹50,000/month</span> compared to marketplace fees
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }
