import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Downxtown',
  description:
    'Cookie Policy for Downxtown — India\'s brand-first commerce platform.',
  robots: { index: true, follow: true },
}

export default function CookiesPage() {
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
          Cookie Policy
        </h1>
        <p className="text-white/40 mb-10 text-sm">Last updated: December 2024</p>

        {/* Notice banner */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-10">
          <p className="text-white/80 text-sm leading-relaxed">
            This cookie policy is currently being finalised. We will update this page with
            comprehensive information about cookies and tracking technologies before public launch.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit websites. They help
              websites remember your preferences and improve your experience across sessions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">How We Use Cookies</h2>
            <p className="mb-4">Downxtown uses cookies for:</p>
            <ul className="space-y-3">
              {[
                ['Essential Cookies:', 'Required for the platform to function properly. Cannot be disabled.'],
                ['Authentication:', 'Keeping you logged in to your account securely.'],
                ['Preferences:', 'Remembering your settings, filters, and preferences.'],
                ['Analytics:', 'Understanding how visitors use our website so we can improve it.'],
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
            <h2 className="text-xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="mb-4">
              We use the following third-party services that may set cookies:
            </p>
            <ul className="space-y-2 list-disc list-inside text-white/60">
              <li>Firebase (authentication and analytics)</li>
              <li>Google Analytics (usage analytics)</li>
              <li>Razorpay (payment processing)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Your Choices</h2>
            <p>
              You can control cookies through your browser settings. However, disabling certain
              cookies — particularly essential and authentication cookies — may affect the
              functionality of our platform and prevent you from staying logged in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
            <p>
              For any questions about our cookie policy, please contact us at{' '}
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
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Browse Feed</Link>
        </div>
      </div>
    </main>
  )
}
