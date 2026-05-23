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
};

module.exports = nextConfig;
