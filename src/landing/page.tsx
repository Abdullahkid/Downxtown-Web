import { Header } from '@/landing/components/Header'
import { HeroSection } from '@/landing/components/HeroSection'
import { MatrixSection } from '@/landing/components/MatrixSection'
import { TriadSection } from '@/landing/components/TriadSection'
import { GapSection } from '@/landing/components/GapSection'
import { BrandOwnershipSection } from '@/landing/components/BrandOwnershipSection'
import { HowItWorksSection } from '@/landing/components/HowItWorksSellerSection'
import { BrandFirstSection } from '@/landing/components/BrandFirstSection'
import { ShopifyConnectorStrip } from '@/landing/components/ShopifyConnectorStrip'
import { SocialProofSection } from '@/landing/components/BrandProofSection'
import { MomentumSection } from '@/landing/components/MomentumSection'
import { CompareSection } from '@/landing/components/CompareSection'
import { ShoppersSection } from '@/landing/components/ShoppersSection'
import { CTASection } from '@/landing/components/CTASection'
import { Footer } from '@/landing/components/Footer'
import { CursorGlow } from '@/landing/components/premium/CursorGlow'

export default function Home() {
  return (
    <div className="landing-page">
      <CursorGlow />
      <Header />

      {/* HERO — What is it, who is it for, proof signal */}
      <HeroSection />

      {/* 01 — PAIN: Three seller stories. Makes them feel recognized. */}
      <TriadSection />

      {/* MATRIX — The positioning table. Whole story in 3 seconds. */}
      <MatrixSection />

      {/* 02 — THE SHIFT: Before → After. Bridge problem to solution. */}
      <GapSection />

      {/* 03 — BRAND OWNERSHIP: Data, messaging, identity. All in one. */}
      <BrandOwnershipSection />

      {/* 05 — BRAND-FIRST FEED: Discovery vs. commodity grid */}
      <BrandFirstSection />

      {/* 07 — DISCOVERY ENGINE: Visibility earned, not bought */}
      <MomentumSection />

      {/* 04 — HOW IT WORKS: 3 steps: List → Live → Discover */}
      <HowItWorksSection />

      {/* Shopify Integration Strip (The Shortcut for Step 01) */}
      <div className="bg-ink border-t border-white/5 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <ShopifyConnectorStrip />
        </div>
      </div>

      {/* 06 — BRANDS ALREADY LIVE: Social proof, real brands, seller quote */}
      <SocialProofSection />

      {/* 08 — THE VERDICT: Every platform made a choice. Ours chose the seller. */}
      <CompareSection />

      {/* 09 — THE BUYER EXPERIENCE: Compact. Framed as seller benefit. */}
      <ShoppersSection />

      {/* 10 — EARLY ACCESS CTA */}
      <CTASection />

      <Footer />
    </div>
  )
}



