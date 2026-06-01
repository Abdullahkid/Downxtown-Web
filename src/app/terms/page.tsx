import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Downxtown',
  description:
    'Terms of Service for Downxtown — India\'s brand-first commerce platform.',
  alternates: {
    canonical: 'https://downxtown.com/terms',
  },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-white/40 mb-10 text-sm">Last updated: December 2024</p>

        {/* Notice banner */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-10">
          <p className="text-white/80 text-sm leading-relaxed">
            Our Terms of Service are currently being finalised by our legal team as we prepare for
            public launch. This page will be updated with complete terms before the platform goes
            live.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Platform Overview</h2>
            <p className="mb-4">
              Downxtown is a bridge model e-commerce platform connecting sellers with buyers. Key
              aspects of our service include:
            </p>
            <ul className="space-y-3">
              {[
                ['For Sellers:', 'A platform to showcase products, manage orders, and connect with customers directly.'],
                ['For Buyers:', 'A curated marketplace to discover and purchase from authentic sellers.'],
                ['Bridge Model:', 'We facilitate connections; payments flow directly between buyer and seller.'],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-start gap-3">
                  <span className="text-brand mt-0.5">•</span>
                  <span>
                    <strong className="text-white">{bold}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">User Responsibilities</h2>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>Provide accurate information when creating your account</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Respect other users and sellers on the platform</li>
              <li>Not attempt to circumvent platform security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Seller Guidelines</h2>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>List only genuine products with accurate descriptions</li>
              <li>Fulfil orders in a timely manner</li>
              <li>Maintain honest communication with buyers</li>
              <li>Comply with all applicable Indian laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="mb-4">Complete terms covering:</p>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>Payment processing terms</li>
              <li>Intellectual property rights</li>
              <li>Dispute resolution process</li>
              <li>Limitation of liability</li>
              <li>Governing law (India)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
            <p>
              For any questions regarding our terms, please contact us at{' '}
              <a href="mailto:hello@downxtown.com" className="text-brand hover:underline">
                hello@downxtown.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-white/30">
          <Link href="/welcome" className="hover:text-white transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Browse Feed</Link>
        </div>
      </div>
    </main>
  )
}
