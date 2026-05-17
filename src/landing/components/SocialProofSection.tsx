"use client"

import { Card, CardContent } from "@/landing/components/ui/card"
import { Quote, TrendingUp, Star } from "lucide-react"
import { AnimatedCounter } from "@/landing/components/premium/AnimatedCounter"

export function SocialProofSection() {
  const testimonials = [
    {
      quote: "I was juggling Shopify orders and customer messages. Downxtown Connector gave me branded checkout and instant payouts.",
      author: "Priya Sharma",
      business: "Fashion Boutique, Mumbai",
      metricValue: 85000,
      metricSuffix: "",
      metricPrefix: "₹",
      metricLabel: "first month",
      rating: 5
    },
    {
      quote: "Marketplace fees were eating 20% of my margins. Now I keep 98% of what I earn. Finally, a platform that values sellers.",
      author: "Rahul Verma",
      business: "Electronics Store, Bangalore",
      metricValue: 3,
      metricSuffix: "x",
      metricPrefix: "",
      metricLabel: "profit margins",
      rating: 5
    },
    {
      quote: "I was lost in Amazon listings. Downxtown helped me build a brand my customers actually remember and follow.",
      author: "Anjali Patel",
      business: "Cosmetics & Beauty, Pune",
      metricValue: 2500,
      metricSuffix: "",
      metricPrefix: "",
      metricLabel: "loyal followers",
      rating: 5
    }
  ]

  return (
    <section className="section-padding bg-brand-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[100px]" />

      <div className="container-width relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 stagger-children">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="text-white">Trusted by </span>
            <span className="text-gradient-animated">Shopify Brands</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Stories from brands that connected Shopify to Downxtown for owned checkout and payouts
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="card-glass border-white/5 hover:border-brand-cyan/30 hover:-translate-y-2 transition-all duration-500 group"
            >
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6 flex-grow">
                  <Quote className="w-10 h-10 text-brand-cyan/40 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-urgency-orange text-urgency-orange" />
                    ))}
                  </div>
                  <p className="text-white/90 leading-relaxed mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mt-auto">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-brand-cyan font-bold text-lg mb-1">{testimonial.author}</p>
                      <p className="text-white/60 text-sm">{testimonial.business}</p>
                    </div>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl px-4 py-2 w-full">
                    <div className="p-1.5 bg-brand-cyan/10 rounded-full">
                      <TrendingUp className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <div>
                      <div className="text-brand-cyan font-bold text-lg leading-none flex items-center">
                        {testimonial.metricPrefix}
                        <AnimatedCounter end={testimonial.metricValue} suffix={testimonial.metricSuffix} />
                      </div>
                      <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{testimonial.metricLabel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
