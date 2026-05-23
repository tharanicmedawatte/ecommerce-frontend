// app/layout.jsx
// =============================================================================
// Root layout — wraps every page.
// Sets up: Auth0 provider, global styles, Navbar, Footer.
// =============================================================================

import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'ShopName — Modern E-commerce',
  description: 'Find the best products at the best prices.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        {/* UserProvider makes useUser() hook available in all client components */}
        <UserProvider>
          <Navbar />

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">ShopName</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Quality products delivered to your door.
                    Secure payments. Fast shipping.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Shop</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/products" className="hover:text-brand-600">All Products</a></li>
                    <li><a href="/products?category=electronics" className="hover:text-brand-600">Electronics</a></li>
                    <li><a href="/products?category=clothing" className="hover:text-brand-600">Clothing</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Account</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/api/auth/login" className="hover:text-brand-600">Login / Register</a></li>
                    <li><a href="/account" className="hover:text-brand-600">My Orders</a></li>
                    <li><a href="/cart" className="hover:text-brand-600">Cart</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-100 text-center
                              text-sm text-gray-400">
                © {new Date().getFullYear()} ShopName. All rights reserved.
              </div>
            </div>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}
