import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Don't fail production build on TS errors — those are caught locally.
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * Redirect www → non-www (permanent 301).
   *
   * Google crawls both https://www.downxtown.com/* and https://downxtown.com/*
   * and treats them as duplicate pages when no canonical is declared on the
   * www version. This redirect ensures the www variant always returns a 301
   * to the canonical non-www URL, eliminating the "Duplicate without
   * user-selected canonical" issue in Google Search Console.
   *
   * The :path* wildcard preserves the full path and query string so deep
   * links (product pages, store pages, etc.) redirect correctly.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.downxtown.com' }],
        destination: 'https://downxtown.com/:path*',
        permanent: true, // 301 — tells Google to update its index
      },
    ]
  },

  /**
   * Rewrite /api-proxy/* → https://api.downxtown.com/* during local dev.
   *
   * This proxy runs on the Next.js Node.js server, so the request to the
   * backend is server-to-server (no CORS restriction). The browser only
   * ever talks to localhost:3000, which is same-origin.
   *
   * In production the rewrite is still registered but unused — apiClient
   * points directly to https://api.downxtown.com when NEXT_PUBLIC_API_BASE_URL
   * is set (which it is in the production deployment environment).
   */
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://api.downxtown.com/:path*',
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.downxtown.com",
        pathname: "/**",
      },
      {
        // Allow any HTTPS hostname for externally-imported images (CSV imports)
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://checkout.razorpay.com https://apis.google.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://api.downxtown.com https://*.googleusercontent.com https:",
              "connect-src 'self' https://api.downxtown.com wss://api.downxtown.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
              "frame-src 'self' https://*.firebaseapp.com https://api.razorpay.com",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  // Custom service worker additions (FCM background handler, background sync)
  // @ducanh2912/next-pwa looks for `<customWorkerSrc>/index.{js,ts}`
  customWorkerSrc: "src/service-worker",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.downxtown\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          networkTimeoutSeconds: 30,
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
})(nextConfig);
