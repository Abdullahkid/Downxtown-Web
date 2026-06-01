import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, MessageCircle, ShieldCheck, Truck, Store } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Downxtown',
  description:
    'Return and Refund Policy for Downxtown — India\'s brand-first commerce platform operated by Alhikma Technologies.',
  alternates: {
    canonical: 'https://downxtown.com/return-policy',
  },
  robots: { index: true, follow: true },
}

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/welcome"
          className="inline-flex items-center gap-2 text-brand hover:text-brand-light transition-colors mb-10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
          Return &amp; Refund Policy
        </h1>
        <p className="text-white/40 mb-2 text-sm">Platform: Downxtown (operated by Alhikma Technologies)</p>
        <p className="text-white/40 mb-10 text-sm">Effective Date: June 2025</p>

        {/* Notice banner */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-10 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm leading-relaxed">
            Downxtown is a brand commerce platform. We connect buyers with independent D2C brands —
            we do not sell products directly. Returns and refunds are managed by each brand individually.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-white/70 text-sm leading-relaxed">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">1. Platform Role</h2>
            </div>
            <p className="mb-4">
              Downxtown is a brand commerce platform that connects buyers directly with independent
              D2C brands. Downxtown does not sell products directly and is not a party to the
              transaction between buyers and brands.
            </p>
            <p>
              All purchases made on Downxtown are fulfilled by the respective brand. Accordingly,
              returns, refunds, and exchange requests are governed by each brand&apos;s individual
              policy, not a single platform-wide policy.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">2. Brand-Managed Returns</h2>
            </div>
            <p className="mb-4">
              Each brand listed on Downxtown is an independent business and is solely responsible for:
            </p>
            <ul className="space-y-3">
              {[
                'Defining and publishing their own return and exchange policy',
                'Accepting or rejecting return requests based on their stated terms',
                'Processing refunds directly to the buyer',
                'Coordinating return logistics and replacement shipments',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-brand mt-0.5 shrink-0">•</span>
                  <span className="text-white/60">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Before purchasing, buyers are encouraged to review the selling brand&apos;s return
              policy, which is displayed on their brand profile.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">3. How to Initiate a Return</h2>
            </div>
            <p className="mb-4">
              If you wish to return a product, the process is entirely between you and the brand:
            </p>
            <ol className="space-y-3 list-none">
              {[
                'Navigate to the brand\'s profile on Downxtown',
                'Use the Message or Contact option to reach the brand directly',
                'Share your order details, reason for return, and any supporting media (photos/videos) if applicable',
                'The brand will respond with their return instructions, including the return address and any conditions that apply',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-brand font-bold shrink-0">{i + 1}.</span>
                  <span className="text-white/60">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-white/50 italic">
              Downxtown does not mediate return disputes or handle return logistics.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">4. Delivery &amp; Tracking</h2>
            </div>
            <p className="mb-4">
              Delivery is managed independently by each brand through their third-party logistics
              partner of choice. Brands provide a tracking URL from their delivery partner once an
              order is shipped.
            </p>
            <p className="mb-4">
              For delivery issues — delays, damaged goods, or missing shipments — contact the brand
              directly via the messaging feature on their profile.
            </p>
            <p className="text-white/50 italic">
              Downxtown does not have visibility into or control over individual shipments.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">5. Platform-Level Buyer Protections</h2>
            </div>
            <p className="mb-4">
              While returns are brand-managed, Downxtown maintains the following baseline
              protections for buyers:
            </p>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-2">Misrepresentation</h3>
                <p className="text-white/60">
                  If a product received is materially different from what was listed on the platform
                  (wrong item, significantly inaccurate description), you may report this to
                  Downxtown support at{' '}
                  <a href="mailto:support@downxtown.com" className="text-brand hover:underline">
                    support@downxtown.com
                  </a>
                  . Downxtown reserves the right to review such cases and take appropriate action
                  against the brand, including listing suspension.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-2">Fraudulent Brands</h3>
                <p className="text-white/60">
                  If a brand fails to fulfill an order entirely and is unresponsive, contact
                  Downxtown support. We will investigate and may escalate or remove the brand from
                  the platform.
                </p>
              </div>
            </div>
            <p className="mt-4 text-white/50 italic">
              These protections exist to maintain platform integrity — they do not constitute a
              direct return or refund guarantee by Downxtown.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-5 h-5 text-brand shrink-0" />
              <h2 className="text-xl font-bold text-white">6. For Brands — Policy Transparency Requirements</h2>
            </div>
            <p className="mb-4">All brands listed on Downxtown are required to:</p>
            <ul className="space-y-3">
              {[
                'Clearly publish their return and exchange policy on their brand profile',
                'Honor the policy they publicly state',
                'Respond to buyer return requests within a reasonable timeframe',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-brand mt-0.5 shrink-0">•</span>
                  <span className="text-white/60">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Failure to maintain transparent and fair return practices may result in brand
              suspension or removal from the platform. Downxtown reserves the right to enforce
              this in the interest of buyer trust.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Contact</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Platform-level concerns</p>
                <p className="text-white/70 mb-1">
                  Email:{' '}
                  <a href="mailto:support@downxtown.com" className="text-brand hover:underline">
                    support@downxtown.com
                  </a>
                </p>
                <p className="text-white/70">
                  Website:{' '}
                  <a href="https://downxtown.com" className="text-brand hover:underline">
                    downxtown.com
                  </a>
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Product-specific returns</p>
                <p className="text-white/70">
                  Contact the brand directly through the app via their profile page.
                </p>
              </div>
            </div>
            <p className="mt-6 text-white/40 text-xs">
              This policy may be updated periodically. The latest version will always be available on the platform.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-white/30">
          <Link href="/welcome" className="hover:text-white transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Browse Feed</Link>
        </div>
      </div>
    </main>
  )
}
