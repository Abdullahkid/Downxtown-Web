"use client"

import { useState } from "react"
import { Button } from "@/landing/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/landing/components/ui/card"
import { ScrollReveal } from "@/landing/components/premium/ScrollReveal"
import { StaggerContainer, StaggerItem } from "@/landing/components/premium/StaggerContainer"
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Store,
  Send,
  MessageSquare,
  CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"

export function ContactSection() {
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  })

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-brand-dark-gray to-brand-black relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <div className="container-width relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="text-brand-white">Get in </span>
              <span className="text-gradient">Touch</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="text-xl text-brand-white/80 max-w-4xl mx-auto leading-relaxed">
              Have questions about Downxtown? Want to partner with us? Or simply want to say hello?
              We&apos;d love to hear from you. Reach out and let&apos;s start a conversation.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-lg text-brand-white/70 max-w-4xl mx-auto leading-relaxed mt-4">
              Shopify brands can request early access to the Downxtown Connector—mention your store and we&apos;ll prioritize onboarding before the Shopify App Store listing.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Contact Information */}
          <ScrollReveal direction="left" delay={0.3}>
            <div>
              <h3 className="text-3xl font-bold text-brand-cyan mb-8">
                Let&apos;s Connect
              </h3>
              <p className="text-lg text-brand-white/70 mb-10">
                We&apos;re always excited to connect with entrepreneurs, investors, potential partners,
                and users who share our vision of transforming commerce through social connections.
              </p>

              <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                <StaggerItem
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <motion.a
                    href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                    className="flex items-center group"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-brand-cyan/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-brand-cyan/30 transition-colors"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mail className="w-6 h-6 text-brand-cyan" />
                    </motion.div>
                    <div>
                      <div className="text-brand-white font-semibold">Email Us</div>
                      <div className="text-brand-cyan group-hover:underline">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</div>
                    </div>
                  </motion.a>
                </StaggerItem>

                <StaggerItem
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <motion.a
                    href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/\s/g, '')}`}
                    className="flex items-center group"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-brand-teal/30 transition-colors"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Phone className="w-6 h-6 text-brand-teal" />
                    </motion.div>
                    <div>
                      <div className="text-brand-white font-semibold">Call Us</div>
                      <div className="text-brand-teal group-hover:underline">{process.env.NEXT_PUBLIC_CONTACT_PHONE}</div>
                    </div>
                  </motion.a>
                </StaggerItem>

                <StaggerItem
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-brand-cyan-light/20 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-brand-cyan-light" />
                    </div>
                    <div>
                      <div className="text-brand-white font-semibold">Visit Us</div>
                      <div className="text-brand-cyan-light">{process.env.NEXT_PUBLIC_CONTACT_ADDRESS}</div>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Social Links */}
              <div className="mt-10">
                <h4 className="text-xl font-semibold text-brand-white mb-4">
                  Follow Our Journey
                </h4>
                <div className="flex space-x-4">
                  {[
                    { icon: Linkedin, color: "brand-cyan" },
                    { icon: Twitter, color: "brand-teal" },
                    { icon: Store, color: "seller-primary" }
                  ].map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button size="icon" variant="outline" className="hover-glow">
                        <social.icon className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={0.3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-b from-brand-dark-gray to-brand-medium-gray border-brand-cyan/30 relative overflow-hidden">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-brand-teal/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100"
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

                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl text-brand-cyan flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-4">
                    {["firstName", "lastName"].map((field, index) => (
                      <motion.div
                        key={field}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <label className="block text-sm font-medium text-brand-white mb-2">
                          {field === "firstName" ? "First Name" : "Last Name"}
                        </label>
                        <motion.input
                          type="text"
                          className="w-full px-4 py-2 bg-brand-black/50 border border-brand-cyan/30 rounded-lg text-brand-white placeholder-brand-white/50 focus:border-brand-cyan focus:outline-none transition-all duration-300"
                          placeholder={field === "firstName" ? "John" : "Doe"}
                          onFocus={() => setFocusedField(field)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          whileFocus={{ scale: 1.02, borderColor: "rgba(0, 255, 255, 0.8)" }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-brand-white mb-2">
                      Email
                    </label>
                    <motion.input
                      type="email"
                      className="w-full px-4 py-2 bg-brand-black/50 border border-brand-cyan/30 rounded-lg text-brand-white placeholder-brand-white/50 focus:border-brand-cyan focus:outline-none transition-all duration-300"
                      placeholder="john@example.com"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      whileFocus={{ scale: 1.02, borderColor: "rgba(0, 255, 255, 0.8)" }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-brand-white mb-2">
                      Subject
                    </label>
                    <motion.select
                      className="w-full px-4 py-2 bg-brand-black/50 border border-brand-cyan/30 rounded-lg text-brand-white focus:border-brand-cyan focus:outline-none transition-all duration-300"
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      whileFocus={{ scale: 1.02, borderColor: "rgba(0, 255, 255, 0.8)" }}
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="investor">Investor Relations</option>
                      <option value="support">Technical Support</option>
                      <option value="press">Press & Media</option>
                    </motion.select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-brand-white mb-2">
                      Message
                    </label>
                    <motion.textarea
                      rows={4}
                      className="w-full px-4 py-2 bg-brand-black/50 border border-brand-cyan/30 rounded-lg text-brand-white placeholder-brand-white/50 focus:border-brand-cyan focus:outline-none resize-none transition-all duration-300"
                      placeholder="Tell us about your inquiry..."
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      whileFocus={{ scale: 1.02, borderColor: "rgba(0, 255, 255, 0.8)" }}
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button className="w-full font-semibold hover-glow shadow-lg hover:shadow-xl hover:shadow-brand-cyan/30 transition-all duration-300">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  )
}
