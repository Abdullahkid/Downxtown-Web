/**
 * /pitch-deck — serves the investor pitch deck HTML file.
 *
 * The pitch deck is a self-contained HTML file (all CSS inline, no external
 * JS dependencies) originally from Downxtown-Website. It lives at
 * public/landing/pitch-deck.html and is served here as a raw HTML response
 * so it renders identically to the standalone website version.
 *
 * noindex/nofollow is already set inside the HTML <meta> tag.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  const filePath = join(process.cwd(), 'public', 'landing', 'pitch-deck.html')
  const html = readFileSync(filePath, 'utf-8')

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Prevent indexing — the HTML already has a meta robots tag,
      // but the header is an extra layer of protection.
      'X-Robots-Tag': 'noindex, nofollow',
      // Allow caching for 1 hour; revalidate in background
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
