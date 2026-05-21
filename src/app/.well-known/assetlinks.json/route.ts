/**
 * GET /.well-known/assetlinks.json
 *
 * Required for Android App Links verification.
 * Tells Android that com.downxtown.sigma2 is authorised to handle
 * all URLs on downxtown.com, fixing the misconfigured deep links
 * reported in Google Analytics.
 *
 * The SHA-256 fingerprint is the app signing key certificate from Play Console.
 */
export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.downxtown.sigma2',
        sha256_cert_fingerprints: [
          'F2:BA:E1:4A:54:F7:68:26:04:B8:FA:A0:D8:E6:29:0B:30:11:2E:F4:01:34:F9:6E:1B:96:AB:DF:9B:B1:EA:FE',
        ],
      },
    },
  ]

  return new Response(JSON.stringify(assetLinks, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      // Cache for 24 hours — Android caches this file aggressively
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
