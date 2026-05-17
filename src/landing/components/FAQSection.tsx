"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the Shopify connector work?",
      answer:
        "Install the Downxtown Connector from the Shopify app store, grant the requested permissions, and your catalog, stock, and customer data sync instantly.\n\nOrders land in Downxtown with Shopify references so you can fulfill from the same systems you already use."
    },
    {
      question: "Do I have to migrate away from Shopify?",
      answer:
        "No migration required. Shopify stays the source of truth for your products and inventory. Downxtown layers on top for owned checkout, analytics, and payout control."
    },
    {
      question: "What if I already sell on Amazon/Flipkart?",
      answer:
        "Brands can run Downxtown alongside marketplaces. The key difference: Downxtown gives you an owned storefront, instant payouts, and direct customer relationships even while you keep using Amazon/Flipkart for discovery."
    },
    {
      question: "How long does onboarding take?",
      answer:
        "Connector setup typically takes 5-10 minutes. We walk you through the Shopify onboarding, product sync, and branding checklist during live support sessions."
    },
    {
      question: "What about delivery?",
      answer:
        "You choose your favorite delivery partners (Delhivery, Dunzo, your local courier) and share tracking links with customers. Downxtown never controls logistics—your brand stays in charge."
    },
    {
      question: "What are the transaction fees?",
      answer:
        "Downxtown uses a transparent subscription model that grows as your brand grows. There are no hidden fees or forced advertising costs, and payouts happen as soon as payments clear."
    },
    {
      question: "Can I export my customer data?",
      answer:
        "Absolutely. 100% of customer details, order history, and chat transcripts are exportable. Use the data wherever you want—Shopify, CRM, newsletters—your brand owns it."
    },
    {
      question: "Will Downxtown compete with my Shopify store?",
      answer:
        "No. The Downxtown Connector is designed to complement Shopify by powering branded checkout, chats, and analytics while leaving pricing, delivery, and marketing decisions in your hands."
    },
    {
      question: "When will the Shopify app store listing go live?",
      answer:
        "We are polishing the Downxtown Connector and expect to submit it to the Shopify App Store soon. Request early access and we will onboard your brand ahead of the listing."
    },
    {
      question: "Do I need GST to sell on Downxtown?",
      answer:
        "If your annual turnover is under ₹40 Lakhs, you can continue with an Enrollment ID (PAN-based, intra-state selling). For larger brands, GST registration keeps you compliant across India. We help you understand the right path."
    }
  ]

  return (
    <section id="faq" className="section-padding bg-gradient-to-b from-brand-dark-gray to-brand-black">
      <div className="container-width">
        {/* Section Header */}
        <div className="text-center mb-16 stagger-children">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-10 h-10 text-brand-cyan" />
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-brand-white">Questions? </span>
              <span className="text-gradient-animated">We&apos;ve Got Answers</span>
            </h2>
          </div>
          <p className="text-xl text-brand-white/80 max-w-3xl mx-auto">
            Everything Shopify brands need to know about connecting Downxtown to their storefront
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-morphism border border-brand-cyan/30 rounded-xl overflow-hidden hover:border-brand-cyan/60 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-brand-cyan/5 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-brand-white mb-1">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-brand-cyan flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
              >
                <div className="px-6 pb-6 pt-2 space-y-3">
                  {faq.answer.split('\\n\\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-brand-white/80 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-16 text-center">
          <div className="glass-morphism border border-brand-cyan/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-brand-white mb-4">
              Still have questions?
            </h3>
            <p className="text-brand-white/70 mb-6">
              Chat with our team on WhatsApp or schedule a demo call
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-trust-green hover:bg-trust-green/90 text-white font-semibold rounded-lg transition-colors duration-200">
                WhatsApp Us
              </button>
              <button className="px-6 py-3 bg-transparent border-2 border-brand-cyan hover:bg-brand-cyan/10 text-brand-cyan font-semibold rounded-lg transition-all duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
