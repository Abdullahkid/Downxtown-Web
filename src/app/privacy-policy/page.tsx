import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Scale, Database, Share2, Clock, Lock, Baby, UserCheck, Cookie, MessageSquareWarning, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Downxtown',
  description:
    'Privacy Policy for Downxtown — brand commerce platform operated by Alhikma Technologies. Learn how we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://downxtown.com/privacy-policy',
  },
  robots: { index: true, follow: true },
}

function Section({ icon, number, title, children }: {
  icon: React.ReactNode
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-brand/60 text-xs font-mono">{number}</span>
        <span className="text-brand shrink-0">{icon}</span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="pl-10 space-y-3 text-white/70 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-brand mt-1 shrink-0">•</span>
          <span className="text-white/60">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-3">
      <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  )
}

export default function PrivacyPolicyPage() {
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
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-white/40 text-sm mb-10">
          <span>Platform: Downxtown</span>
          <span>Operated by: Alhikma Technologies</span>
          <span>Effective: 1st June 2026</span>
          <span>Last Updated: 1st June 2026</span>
        </div>

        {/* Notice banner */}
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-12 flex items-start gap-4">
          <Shield className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm leading-relaxed">
            This Privacy Policy is drafted in compliance with Indian law including the IT Act 2000,
            SPDI Rules 2011, and the Digital Personal Data Protection Act 2023. By using Downxtown,
            you acknowledge that you have read and understood this policy.
          </p>
        </div>

        <div className="space-y-12">

          {/* Section 1 */}
          <Section icon={<Shield className="w-5 h-5" />} number="01" title="Introduction">
            <p>
              Downxtown ("Platform", "we", "us", "our") is a brand commerce platform operated by
              Alhikma Technologies, a company registered under the laws of India. We connect buyers
              ("Users") with independent D2C brands and retail businesses ("Brands", "Sellers")
              through our Android application and web storefront.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect
              information about you when you access or use Downxtown. It applies to all users —
              buyers, brands, and visitors — across all surfaces including the Android app and
              website.
            </p>
            <p>
              By creating an account or using the Platform, you acknowledge that you have read and
              understood this Privacy Policy and consent to the practices described herein. If you
              do not agree with this policy, please discontinue use of the Platform.
            </p>
          </Section>

          {/* Section 2 */}
          <Section icon={<Scale className="w-5 h-5" />} number="02" title="Applicable Law & Regulatory Framework">
            <p>This Privacy Policy is drafted in compliance with the following Indian laws:</p>
            <Bullet items={[
              'Information Technology Act, 2000 ("IT Act")',
              'Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules")',
              'Digital Personal Data Protection Act, 2023 ("DPDP Act") — to the extent notified and in force',
              'Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020',
              'Payment and Settlement Systems Act, 2007 (relevant to payment processing)',
            ]} />
            <p className="mt-3 text-white/50 italic">
              Where applicable, this policy also acknowledges the principles of the GDPR for users
              accessing the Platform from the European Union, though Downxtown&apos;s primary legal
              compliance framework is Indian law.
            </p>
          </Section>

          {/* Section 3 */}
          <Section icon={<Database className="w-5 h-5" />} number="03" title="Information We Collect">
            <SubSection title="3.1 Information You Provide Directly">
              <div className="space-y-4">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">For Buyers</p>
                  <Bullet items={[
                    'Full name, email address, mobile number',
                    'Delivery address(es)',
                    'Profile photo (optional)',
                    'Payment-related information (processed through Razorpay — see Section 6)',
                    'Messages sent to brands via in-app messaging',
                    'Reviews and ratings submitted on the Platform',
                  ]} />
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">For Brands / Sellers</p>
                  <Bullet items={[
                    'Business name, brand identity, authorized representative name and contact details',
                    'Business email address and phone number',
                    'GST Identification Number (GSTIN), where applicable',
                    'Bank account details for payment settlement (processed via Razorpay Route API)',
                    'Product catalogue information including descriptions, images, and pricing',
                    'Physical store addresses (if listed on the Platform)',
                    'Brand story and profile content',
                  ]} />
                </div>
              </div>
            </SubSection>
            <SubSection title="3.2 Information Collected Automatically">
              <p className="mb-2">When you use the Platform, we automatically collect:</p>
              <Bullet items={[
                'Device type, model, and operating system version; app version',
                'IP address and approximate geographic location (city/region level)',
                'Session data — pages viewed, features accessed, time spent',
                'Crash logs and error reports via Firebase Crashlytics',
                'Search queries and browsing behavior within the Platform',
              ]} />
              <p className="mt-2 text-white/50 italic">
                This does not include precise GPS location unless you explicitly grant permission for
                the Nearby Store Discovery feature.
              </p>
            </SubSection>
            <SubSection title="3.3 Location Data">
              <p className="mb-2">The Nearby Store Discovery feature requires device location access. Location access is:</p>
              <Bullet items={[
                'Optional — core platform use is unaffected without it',
                'Requested at runtime — you will be asked for permission before any location data is accessed',
                'Used only for discovery — not stored persistently on our servers or shared with third parties beyond proximity results',
              ]} />
              <p className="mt-2">You may revoke location permission at any time through your device settings.</p>
            </SubSection>
            <SubSection title="3.4 Information from Third-Party Integrations">
              <p>
                If you connect your Shopify store via the Shopify Connector, we receive access to
                your product catalogue data (names, descriptions, images, variants, pricing,
                inventory status) as authorized through the Shopify Partner API. We do not access
                Shopify customer data, order history, or payment information.
              </p>
            </SubSection>
          </Section>

          {/* Section 4 */}
          <Section icon={<UserCheck className="w-5 h-5" />} number="04" title="How We Use Your Information">
            <SubSection title="Account & Platform Operations">
              <Bullet items={[
                'Creating and managing your account',
                'Enabling brand discovery, product browsing, and the follow model',
                'Facilitating in-app direct messaging between buyers and brands',
                'Processing purchase redirects to brand-managed checkout flows',
                'Displaying brand profiles, product catalogues, and reviews',
              ]} />
            </SubSection>
            <SubSection title="Personalization & Discovery">
              <Bullet items={[
                'Curating your brand feed based on follow activity, browsing behavior, and category preferences',
                'Surfacing relevant brands and products based on engagement signals',
                'Enabling the Nearby Store Discovery feature using location data',
              ]} />
            </SubSection>
            <SubSection title="Communications">
              <Bullet items={[
                'Sending transactional notifications (order redirects, follow confirmations, messages received)',
                'Delivering platform updates, policy changes, and security alerts',
                'Sending marketing communications where you have consented — you may opt out at any time',
              ]} />
            </SubSection>
            <SubSection title="Safety, Security & Compliance">
              <Bullet items={[
                'Detecting and preventing fraudulent activity, spam, and abuse',
                'Investigating complaints and enforcing our Terms of Service',
                'Complying with legal obligations, court orders, and government requests under applicable Indian law',
                'Maintaining records as required under the IT Act and SPDI Rules',
              ]} />
            </SubSection>
            <SubSection title="Analytics & Platform Improvement">
              <Bullet items={[
                'Understanding how users interact with the Platform',
                'Identifying bugs, crashes, and performance issues',
                'Informing product development decisions',
              ]} />
            </SubSection>
            <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 mt-4">
              <p className="text-white/70 text-sm">
                <strong className="text-white">Future Revenue Products:</strong> Aggregated,
                anonymized behavioral data may inform a future Premium Analytics product offered to
                brands. This will use non-personally-identifiable data only. Any change will be
                communicated to users with an opportunity to opt out.
              </p>
            </div>
          </Section>

          {/* Section 5 */}
          <Section icon={<Lock className="w-5 h-5" />} number="05" title="Sensitive Personal Data or Information (SPDI)">
            <p>
              Under the IT (SPDI) Rules 2011, financial information is classified as Sensitive
              Personal Data and requires heightened protection. Downxtown collects financial
              information in the following limited contexts:
            </p>
            <div className="space-y-3 mt-3">
              <InfoCard title="Buyers">
                <p className="text-white/60 text-sm">
                  Payment card or UPI details are entered and processed directly by Razorpay.
                  Downxtown does not store, process, or have access to raw payment credentials at
                  any point.
                </p>
              </InfoCard>
              <InfoCard title="Brands">
                <p className="text-white/60 text-sm">
                  Bank account details for settlement are transmitted to and managed by Razorpay
                  Route API. Downxtown maintains only the reference identifiers necessary for
                  settlement reconciliation.
                </p>
              </InfoCard>
            </div>
            <p className="mt-3 text-white/50 italic">
              We do not collect passwords, biometric data, health data, sexual orientation, or
              religious beliefs as part of platform operations.
            </p>
          </Section>

          {/* Section 6 */}
          <Section icon={<Lock className="w-5 h-5" />} number="06" title="Payment Processing & Third-Party Transactions">
            <div className="space-y-3">
              <InfoCard title="Redirect Purchases">
                <p className="text-white/60 text-sm">
                  When a buyer taps a product and is redirected to the brand&apos;s own website or
                  Shopify checkout, the transaction is completed entirely outside the Downxtown
                  platform. Downxtown does not receive, process, or store any payment or order data
                  from these transactions. The brand&apos;s own privacy policy governs that
                  interaction.
                </p>
              </InfoCard>
              <InfoCard title="In-Platform Payments (where applicable)">
                <p className="text-white/60 text-sm">
                  Any in-platform payment processing is handled exclusively by Razorpay, a
                  PCI-DSS compliant payment gateway regulated under the Payment and Settlement
                  Systems Act, 2007. Razorpay&apos;s privacy policy governs their handling of
                  payment data and is available at{' '}
                  <a href="https://razorpay.com/privacy" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                    razorpay.com
                  </a>.
                </p>
              </InfoCard>
            </div>
            <p className="mt-3 text-white/50 italic">
              Downxtown is not a party to the commercial transaction between buyer and brand. We
              expressly disclaim liability for any disputes arising from transactions completed on
              external brand websites or checkout flows.
            </p>
          </Section>

          {/* Section 7 */}
          <Section icon={<Share2 className="w-5 h-5" />} number="07" title="Third-Party Services & Data Processors">
            <p>Downxtown uses the following third-party services. Each acts as a data processor bound by applicable data protection obligations:</p>
            <div className="space-y-3 mt-3">
              {[
                {
                  name: 'Firebase (Google LLC)',
                  purpose: 'Authentication, push notifications, crash reporting (Crashlytics), analytics',
                  data: 'Device identifiers, app usage events, crash logs',
                  governed: "Google's Privacy Policy and Data Processing Terms",
                },
                {
                  name: 'Razorpay Software Private Limited',
                  purpose: 'Payment gateway and settlement infrastructure',
                  data: 'Transaction reference data; raw financial credentials are not passed through Downxtown',
                  governed: "Razorpay's Privacy Policy",
                },
                {
                  name: 'MongoDB Atlas (MongoDB, Inc.)',
                  purpose: 'Primary database infrastructure for platform data storage',
                  data: 'All platform data stored in the database',
                  governed: "MongoDB's Data Processing Agreement",
                },
                {
                  name: 'Shopify Inc.',
                  purpose: 'Catalogue sync via Shopify Connector (brand-side integration)',
                  data: 'Product catalogue data as authorized by the brand',
                  governed: "Shopify's Partner API Terms",
                },
              ].map((p) => (
                <div key={p.name} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white font-semibold text-sm mb-2">{p.name}</p>
                  <div className="space-y-1 text-xs text-white/50">
                    <p><span className="text-white/30">Purpose:</span> {p.purpose}</p>
                    <p><span className="text-white/30">Data shared:</span> {p.data}</p>
                    <p><span className="text-white/30">Governed by:</span> {p.governed}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 font-medium text-white/80">
              We do not sell, rent, or trade your personal information to any third party for their
              independent marketing purposes.
            </p>
          </Section>

          {/* Section 8 */}
          <Section icon={<Share2 className="w-5 h-5" />} number="08" title="Data Sharing">
            <p>We share your data only in the following circumstances:</p>
            <div className="space-y-3 mt-3">
              {[
                {
                  title: 'With Brands (for buyer-brand interaction)',
                  body: "When you message or follow a brand, your profile information (display name, profile photo if set) is visible to that brand. Brands do not receive your contact details, address, or payment data through Downxtown's interface unless you voluntarily share this in a message.",
                },
                {
                  title: 'With Other Users',
                  body: 'Your public profile — display name and profile photo — is visible to other users. Your follow activity may be visible depending on your privacy settings.',
                },
                {
                  title: 'For Legal Compliance',
                  body: 'We may disclose your information to law enforcement agencies, courts, government authorities, or regulatory bodies in India when required by law, court order, or in response to a lawful request under the IT Act. We will notify affected users where legally permissible.',
                },
                {
                  title: 'Business Transfers',
                  body: 'In the event of a merger, acquisition, restructuring, or sale of assets of Alhikma Technologies, user data may be transferred to the acquiring entity. Users will be notified and given the opportunity to delete their accounts if they do not consent.',
                },
                {
                  title: 'With Your Explicit Consent',
                  body: 'For any other purpose not described in this policy, we will seek your explicit consent before sharing your data.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-white/60 text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 9 */}
          <Section icon={<Clock className="w-5 h-5" />} number="09" title="Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as necessary to
              provide services, comply with legal obligations, resolve disputes, and enforce our
              agreements.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-4 py-3 text-white/50 font-medium text-xs uppercase tracking-wider">Data Type</th>
                    <th className="text-left px-4 py-3 text-white/50 font-medium text-xs uppercase tracking-wider">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Account data', '3 years after account deletion'],
                    ['Transaction reference data', '8 years (accounting & tax law)'],
                    ['Messages', 'Duration of conversation thread'],
                    ['Analytics data', 'Anonymized after 12 months'],
                    ['Location data', 'Not retained beyond active session'],
                  ].map(([type, period]) => (
                    <tr key={type}>
                      <td className="px-4 py-3 text-white/70">{type}</td>
                      <td className="px-4 py-3 text-white/50">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Upon account deletion, personally identifiable data is deleted or anonymized within
              30 days, except where retention is required by law.
            </p>
          </Section>

          {/* Section 10 */}
          <Section icon={<Lock className="w-5 h-5" />} number="10" title="Data Security">
            <p>
              Alhikma Technologies implements reasonable security practices and procedures as
              required under the IT (SPDI) Rules, 2011, including:
            </p>
            <Bullet items={[
              'Encrypted data transmission using HTTPS/TLS across all platform surfaces',
              'Secure storage of credentials using industry-standard hashing protocols',
              'Access controls limiting employee access to personal data on a need-to-know basis',
              'Regular security assessments and code reviews',
              'Firebase Authentication for secure identity management',
              "Razorpay's PCI-DSS infrastructure for all payment flows",
            ]} />
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
              <p className="text-white/60 text-sm">
                While we implement these measures, no system is completely secure. In the event of
                a data breach likely to result in significant harm, we will notify affected users
                and relevant authorities in accordance with applicable law within a reasonable
                timeframe.
              </p>
            </div>
            <p className="mt-3 text-white/50 italic">
              Users are responsible for maintaining the confidentiality of their account
              credentials. Do not share your login details with anyone.
            </p>
          </Section>

          {/* Section 11 */}
          <Section icon={<Baby className="w-5 h-5" />} number="11" title="Children's Privacy">
            <p>
              Downxtown is not directed at individuals under the age of 18. We do not knowingly
              collect personal data from minors. If we become aware that a user is under 18 and has
              provided personal information without verifiable parental consent, we will delete that
              data promptly.
            </p>
            <p>
              If you believe a minor has registered on our platform, please contact us at the
              address provided in Section 15.
            </p>
          </Section>

          {/* Section 12 */}
          <Section icon={<UserCheck className="w-5 h-5" />} number="12" title="Your Rights as a Data Principal">
            <p>
              Under the Digital Personal Data Protection Act, 2023 (to the extent in force), and
              consistent with the IT Act framework, you have the following rights:
            </p>
            <div className="space-y-3 mt-3">
              {[
                ['Right to Access', 'Request a summary of the personal data we hold about you and how it is being processed.'],
                ['Right to Correction', 'Request correction of inaccurate or incomplete personal data.'],
                ['Right to Erasure', 'Request deletion of your personal data. We will comply except where retention is legally required. Account deletion can be initiated from within the app.'],
                ['Right to Grievance Redressal', 'File a complaint if you believe your data has been mishandled. See Section 14 for the grievance mechanism.'],
                ['Right to Withdraw Consent', 'Where processing is based on your consent (e.g., marketing communications, location access), you may withdraw consent at any time without affecting the lawfulness of prior processing.'],
                ['Right to Data Portability', 'Upon request, we will provide your account data in a machine-readable format where technically feasible.'],
              ].map(([right, desc]) => (
                <div key={right} className="flex items-start gap-3">
                  <span className="text-brand mt-1 shrink-0">•</span>
                  <span className="text-white/60"><strong className="text-white">{right}:</strong> {desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">
              To exercise any of these rights, contact us at the details in Section 15. We will
              respond within 30 days of receiving a valid request.
            </p>
          </Section>

          {/* Section 13 */}
          <Section icon={<Cookie className="w-5 h-5" />} number="13" title="Cookies & Tracking Technologies">
            <p>
              The Downxtown Android application does not use browser cookies. The web storefront
              (downxtown.com) may use the following:
            </p>
            <div className="space-y-3 mt-3">
              {[
                {
                  title: 'Strictly necessary cookies',
                  desc: 'Required for platform functionality (authentication sessions, preferences). These cannot be disabled.',
                },
                {
                  title: 'Analytics cookies',
                  desc: 'Used to understand how visitors interact with the web storefront (via Firebase Analytics). You may opt out by adjusting browser settings.',
                },
                {
                  title: 'No advertising cookies',
                  desc: 'We do not use third-party advertising cookies or retargeting pixels on our platform.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-brand mt-1 shrink-0">•</span>
                  <span className="text-white/60"><strong className="text-white">{item.title}:</strong> {item.desc}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 14 */}
          <Section icon={<MessageSquareWarning className="w-5 h-5" />} number="14" title="Grievance Redressal">
            <p>
              In accordance with the Information Technology Act, 2000 and the Consumer Protection
              (E-Commerce) Rules, 2020, a Grievance Officer has been designated to address
              privacy-related concerns.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-3 space-y-2 text-sm">
              <p><span className="text-white/40">Name:</span> <span className="text-white">Abdullah Ahmad Kidwai</span></p>
              <p><span className="text-white/40">Designation:</span> <span className="text-white/70">Founder &amp; CEO, Alhikma Technologies</span></p>
              <p>
                <span className="text-white/40">Email:</span>{' '}
                <a href="mailto:grievance@downxtown.com" className="text-brand hover:underline">
                  grievance@downxtown.com
                </a>
              </p>
              <p><span className="text-white/40">Address:</span> <span className="text-white/70">Lucknow, Uttar Pradesh, India</span></p>
              <p><span className="text-white/40">Response Time:</span> <span className="text-white/70">Within 30 days of receipt of complaint</span></p>
            </div>
            <p className="mt-3 text-white/50 italic">
              If you are not satisfied with our response, you may escalate your complaint to the
              relevant authorities under the IT Act or, once fully notified, the Data Protection
              Board of India under the DPDP Act, 2023.
            </p>
          </Section>

          {/* Section 15 */}
          <Section icon={<Mail className="w-5 h-5" />} number="15" title="Contact Us">
            <p>For all privacy-related inquiries, data requests, or concerns:</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-3 space-y-2 text-sm">
              <p className="text-white font-semibold">Alhikma Technologies</p>
              <p>
                <span className="text-white/40">Email:</span>{' '}
                <a href="mailto:privacy@downxtown.com" className="text-brand hover:underline">
                  privacy@downxtown.com
                </a>
              </p>
              <p>
                <span className="text-white/40">Website:</span>{' '}
                <a href="https://downxtown.com" className="text-brand hover:underline">
                  downxtown.com
                </a>
              </p>
              <p><span className="text-white/40">Address:</span> <span className="text-white/70">Lucknow, Uttar Pradesh, India</span></p>
            </div>
          </Section>

          {/* Section 16 */}
          <Section icon={<Shield className="w-5 h-5" />} number="16" title="Updates to This Policy">
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices,
              technology, legal requirements, or platform features. When we make material changes,
              we will:
            </p>
            <Bullet items={[
              'Update the "Last Updated" date at the top of this policy',
              'Send an in-app notification to registered users',
              'For significant changes, request fresh consent where required by law',
            ]} />
            <p className="mt-3">
              Continued use of the Platform after notification of changes constitutes acceptance of
              the revised policy. If you do not agree with the changes, you may delete your account
              before the changes take effect.
            </p>
            <p className="mt-3 text-white/50 italic">
              This Privacy Policy is governed by and construed in accordance with the laws of India.
              Any disputes arising in connection with this policy shall be subject to the exclusive
              jurisdiction of the courts located in Lucknow, Uttar Pradesh.
            </p>
          </Section>

        </div>{/* end sections */}

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-white/30">
          <Link href="/welcome" className="hover:text-white transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Browse Feed</Link>
        </div>

      </div>
    </main>
  )
}
