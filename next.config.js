/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow product images from any HTTPS source
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Expose publishable Stripe key to the browser
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Security headers — fixes DAST findings:
  //   Finding 1: Content Security Policy (CSP) Header Not Set
  //   Finding 2: Missing Anti-Clickjacking Header
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' http://127.0.0.1:5000 https://api.stripe.com https://*.auth0.com",
              "frame-src https://js.stripe.com https://*.auth0.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
