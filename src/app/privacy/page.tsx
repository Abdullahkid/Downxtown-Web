import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Downxtown',
  description:
    'Privacy Policy for Downxtown — India\'s brand-first commerce platform.',
  alternates: {
    canonical: 'https://downxtown.com/privacy',
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-white/40 mb-10 text-sm">Last updated: December 2024</p>

        {/* Notice banner */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-10">
          <p className="text-white/80 text-sm leading-relaxed">
            This privacy policy is currently being finalised as we prepare for our public launch.
            We are committed to protecting your data and will update this page with our complete
            privacy practices before the platform goes live.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Our Commitment</h2>
            <p className="mb-4">
              At Downxtown, we believe in complete data transparency and ownership. Here are our
              core principles:
            </p>
            <ul className="space-y-3">
              {[
                ['You own your data.', 'Sellers have full ownership of their customer data and can export it anytime.'],
                ['No data selling.', 'We never sell user data to third parties.'],
                ['Minimal collection.', 'We only collect what\'s necessary to provide our services.'],
                ['Secure storage.', 'All data is encrypted and stored securely.'],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-white">{bold}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Data We Collect</h2>
            <p className="mb-4">When you use Downxtown, we may collect:</p>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>Account information (name, email, phone number)</li>
              <li>Profile details you choose to provide</li>
              <li>Order and transaction history</li>
              <li>Device and usage information for analytics</li>
              <li>Location data (only when you grant permission)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">How We Use Your Data</h2>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>To provide and improve our services</li>
              <li>To process orders and payments</li>
              <li>To send order status notifications</li>
              <li>To personalise your discovery feed</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              You can manage your data from your Profile settings or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
            <p>
              If you have any questions about our privacy practices, please contact us at{' '}
              <a
                href="mailto:hello@downxtown.com"
                className="text-brand hover:underline"
              >
                hello@downxtown.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-white/30">
          <Link href="/welcome" className="hover:text-white transition-colors">Home</Link>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Full Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Browse Feed</Link>
        </div>
      </div>
    </main>
  )
}
