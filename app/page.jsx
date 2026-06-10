'use client';
// =============================================================================
// app/page.jsx — Homepage
// Shows: hero banner, featured products, category tiles.
// Accessible to guests (no login required).
// =============================================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { addToCart, getCart } from '@/lib/api';
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { user }              = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    getProducts({ page: 1 })
      .then(data => setProducts(data.data?.items || data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(product) {
    if (!user) {
      window.location.href = '/api/auth/login';
      return;
    }
    try {
      const res  = await fetch('/api/auth/me');
      const sess = await res.json();
      await addToCart(sess.accessToken, product.id, 1);
      setToast(`${product.name} added to cart!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Could not add to cart. Please try again.');
      setTimeout(() => setToast(''), 3000);
    }
  }

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-brand-600 text-white
                        px-5 py-3 rounded-xl shadow-lg text-sm font-medium
                        animate-fade-in">
          {toast}
        </div>
      )}

      {/* Hero section */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700
                           to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24
                        flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold
                         leading-tight mb-6">
            Shop Smarter,<br />
            <span className="text-brand-100">Live Better</span>
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl max-w-xl mb-10">
            Discover thousands of products at unbeatable prices.
            Free shipping on orders over $50.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products"
              className="bg-white text-brand-700 hover:bg-brand-50 font-bold
                         px-8 py-4 rounded-full text-lg transition-colors shadow-lg">
              Shop Now
            </Link>
            {!user && (
              <a href="/api/auth/login"
                className="border-2 border-white text-white hover:bg-white/10
                           font-bold px-8 py-4 rounded-full text-lg transition-colors">
                Create Account
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck,      label: 'Free Shipping',    sub: 'On orders over $50' },
              { icon: Shield,     label: 'Secure Payments',  sub: 'Powered by Stripe'  },
              { icon: RefreshCw,  label: 'Easy Returns',     sub: '30-day policy'      },
              { icon: ShoppingBag,label: '1000+ Products',   sub: 'New arrivals daily' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center space-x-3">
                <div className="bg-brand-50 p-3 rounded-xl">
                  <Icon size={22} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 mt-1">
              Handpicked just for you
            </p>
          </div>
          <Link href="/products"
            className="text-brand-600 hover:text-brand-700 font-semibold text-sm">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border
                                      border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* Category tiles */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Electronics', emoji: '📱', slug: 'electronics' },
              { name: 'Clothing',    emoji: '👗', slug: 'clothing'    },
              { name: 'Books',       emoji: '📚', slug: 'books'       },
              { name: 'Home',        emoji: '🏠', slug: 'home'        },
            ].map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center justify-center py-10
                           bg-gray-50 hover:bg-brand-50 border border-gray-100
                           hover:border-brand-200 rounded-2xl transition-all
                           group cursor-pointer"
              >
                <span className="text-4xl mb-3">{cat.emoji}</span>
                <span className="font-semibold text-gray-800
                                 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
