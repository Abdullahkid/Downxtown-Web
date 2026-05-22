'use client'

/**
 * StoreAbout — About tab for the store profile page.
 *
 * Matches the Android ModernAboutTabContent layout:
 *  1. About (store description)
 *  2. Contact Information (phone, WhatsApp, email, location)
 *  3. Links & Social Media (website, Instagram, Facebook, YouTube, map)
 *  4. Member since banner
 *  5. Brand Info (keywords, owner) — web-only addition for SEO visibility
 *
 * All SEO-relevant content in this tab is server-rendered via StoreProfile
 * props passed from the server component, so Googlebot sees it in HTML.
 */

import React from 'react'
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  CheckCircle,
  Star,
  Tag,
  User,
  ExternalLink,
} from 'lucide-react'
import type { StoreProfile } from '@/types/store'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatJoinDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoCard({
  icon,
  label,
  value,
  href,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  iconBg: string
  iconColor: string
}) {
  const content = (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}
        style={{ color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-900 font-medium truncate">{value}</p>
      </div>
      {href && <ExternalLink size={14} className="flex-shrink-0 text-gray-300" aria-hidden="true" />}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded-xl"
        aria-label={`${label}: ${value}`}
      >
        {content}
      </a>
    )
  }

  return <div>{content}</div>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface StoreAboutProps {
  store: StoreProfile
}

export function StoreAbout({ store }: StoreAboutProps) {
  const hasLinks =
    store.instagramUrl ||
    store.facebookUrl ||
    store.websiteUrl ||
    store.phoneNumber

  const whatsappUrl = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${store.storeName}, I'm interested in your products.`)}`
    : store.phoneNumber
    ? `https://wa.me/${store.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${store.storeName}, I'm interested in your products.`)}`
    : null

  return (
    <div className="px-4 py-5 space-y-6 bg-gray-50/60">

      {/* ─── About / Description ─── */}
      {store.description && (
        <section aria-label="About">
          <div className="flex items-center gap-3 mb-3">
            <Star size={20} className="text-brand flex-shrink-0" aria-hidden="true" />
            <h2 className="text-base font-bold text-gray-900">About</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {store.description}
          </p>
        </section>
      )}

      {/* ─── Contact Information ─── */}
      <section aria-label="Contact information">
        <div className="flex items-center gap-3 mb-3">
          <Phone size={20} className="text-brand flex-shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
        </div>
        <div className="space-y-2.5">
          {store.phoneNumber && (
            <InfoCard
              icon={<Phone size={18} />}
              label="Phone Number"
              value={store.phoneNumber}
              href={`tel:${store.phoneNumber}`}
              iconBg="bg-brand/10"
              iconColor="var(--brand-color, #6366f1)"
            />
          )}
          {whatsappUrl && (
            <InfoCard
              icon={<MessageCircle size={18} />}
              label="WhatsApp"
              value={store.whatsappNumber ?? store.phoneNumber ?? ''}
              href={whatsappUrl}
              iconBg="bg-green-50"
              iconColor="#25D366"
            />
          )}
          {store.city && (
            <InfoCard
              icon={<MapPin size={18} />}
              label="Location"
              value={[store.city, store.state].filter(Boolean).join(', ')}
              iconBg="bg-blue-50"
              iconColor="#4285F4"
            />
          )}
        </div>
      </section>

      {/* ─── Links & Social Media ─── */}
      {hasLinks && (
        <section aria-label="Links and social media">
          <div className="flex items-center gap-3 mb-3">
            <Globe size={20} className="text-brand flex-shrink-0" aria-hidden="true" />
            <h2 className="text-base font-bold text-gray-900">Links & Social Media</h2>
          </div>
          <div className="space-y-2.5">
            {store.websiteUrl && (
              <InfoCard
                icon={<Globe size={18} />}
                label="Website"
                value={store.websiteUrl.replace(/^https?:\/\//, '')}
                href={store.websiteUrl}
                iconBg="bg-brand/10"
                iconColor="var(--brand-color, #6366f1)"
              />
            )}
            {store.instagramUrl && (
              <InfoCard
                icon={<Instagram size={18} />}
                label="Instagram"
                value={store.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                href={store.instagramUrl}
                iconBg="bg-pink-50"
                iconColor="#E4405F"
              />
            )}
            {store.facebookUrl && (
              <InfoCard
                icon={<Facebook size={18} />}
                label="Facebook"
                value={store.facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '')}
                href={store.facebookUrl}
                iconBg="bg-blue-50"
                iconColor="#1877F2"
              />
            )}
          </div>
        </section>
      )}

      {/* ─── Brand Info (keywords + owner) — web-only section ─── */}
      {(store.searchKeywords?.length || store.ownerName) && (
        <section aria-label="Brand information">
          <div className="flex items-center gap-3 mb-3">
            <Tag size={20} className="text-brand flex-shrink-0" aria-hidden="true" />
            <h2 className="text-base font-bold text-gray-900">Brand Info</h2>
          </div>
          <div className="space-y-2.5">
            {store.ownerName && (
              <InfoCard
                icon={<User size={18} />}
                label="Founded by"
                value={store.ownerName}
                iconBg="bg-purple-50"
                iconColor="#7c3aed"
              />
            )}
            {store.searchKeywords && store.searchKeywords.length > 0 && (
              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-medium mb-2">Known for</p>
                <div className="flex flex-wrap gap-1.5">
                  {store.searchKeywords.slice(0, 12).map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 bg-brand/8 text-brand rounded-full text-xs font-medium capitalize"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Member since banner ─── */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-brand/10"
        aria-label={`Member since ${formatJoinDate(store.createdAt ?? Date.now())}`}
      >
        <CheckCircle size={18} className="text-brand flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-bold text-brand">
          Member since {formatJoinDate(store.createdAt ?? Date.now())}
        </span>
      </div>

    </div>
  )
}
