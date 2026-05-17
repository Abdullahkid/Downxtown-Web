"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/landing/components/ui/card"
import Image from 'next/image'
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function AppScreensSection() {
  const appScreens = [
    {
      title: "Brand Dashboard",
      tagline: "Monitor Shopify + Downxtown orders, analytics, and payouts in one place",
      imageSrc: "/app-mockups/feed-screen/feed-screen.png",
      highlights: [
        "Instant Shopify order sync",
        "Payout tracking & status",
        "Invite-only brand updates"
      ]
    },
    {
      title: "Shopify Order Feed",
      tagline: "See every Shop sync update, fulfillment step, and customer note",
      imageSrc: "/app-mockups/store-profile/store-profile.png",
      highlights: [
        "Product-level inventory sync",
        "Fulfillment & tracking links",
        "Order reconciliation tools"
      ]
    },
    {
      title: "Customer Conversations",
      tagline: "Chat with buyers, answer questions, and keep loyalty high",
      imageSrc: "/app-mockups/chat-screen/chat-screen.png",
      highlights: [
        "Share product links / upsells",
        "Save templates for FAQs",
        "Log Shopify order references"
      ]
    },
    {
      title: "Growth Insights",
      tagline: "Understand organic demand, repeat customers, and campaign lift",
      imageSrc: "/app-mockups/location-feed/location-feed.png",
      highlights: [
        "Location & Shopify traffic trends",
        "Repeat customer cohorts",
        "Connector health & signal quality"
      ]
    }
  ]

  return (
    <section id="app-screens" className="section-padding relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-dark-navy to-brand-black" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="container-width relative z-10">
        <div className="text-center mb-20 stagger-children">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">App </span>
            <span className="text-gradient-animated">Features</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Experience the brand commerce control center that sits on top of Shopify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 stagger-children">
          {appScreens.map((screen, index) => (
            <Card
              key={index}
              className={`
                ${index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5'}
                card-glass border-white/5 hover:border-brand-cyan/30 transition-all duration-500 group overflow-hidden
              `}
            >
              <div className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-brand-cyan transition-colors duration-300">
                    {screen.title}
                  </CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    {screen.tagline}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow flex flex-col lg:flex-row items-center gap-8 pt-6">
                  {/* Phone Mockup Frame with 3D Tilt */}
                  <motion.div
                    className="relative w-[240px] flex-shrink-0"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    whileHover={{
                      scale: 1.08,
                      rotateY: 8,
                      rotateX: -5,
                      z: 50
                    }}
                    style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
                  >
                    <div className="absolute inset-0 bg-brand-cyan/20 blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="relative rounded-[2.5rem] border-[8px] border-brand-dark-gray bg-brand-black overflow-hidden shadow-2xl">
                      <Image
                        src={screen.imageSrc}
                        alt={`${screen.title} - Downxtown App`}
                        width={288}
                        height={600}
                        className="w-full h-auto"
                      />
                    </div>
                  </motion.div>

                  {/* Highlights List */}
                  <div className="flex-grow w-full lg:w-auto">
                    <ul className="space-y-4">
                      {screen.highlights.map((highlight, highlightIndex) => (
                        <li key={highlightIndex} className="flex items-start gap-3 group/item">
                          <div className="w-6 h-6 rounded-full bg-brand-cyan/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-cyan/20 transition-colors">
                            <div className="w-2 h-2 bg-brand-cyan rounded-full" />
                          </div>
                          <span className="text-white/80 text-sm font-medium pt-0.5">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
