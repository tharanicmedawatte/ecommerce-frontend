'use client';
// =============================================================================
// app/products/page.jsx — Product listing page
// Shows all products with search, category filter, and pagination.
// Accessible to guests — no login required to browse.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getProducts, getCategories, addToCart } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const { user }                        = useUser();
  const searchParams                    = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState('');
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(false);
  const [activeCategory, setCategory]   = useState(searchParams.get('category') || '');
  const [searchQuery, setSearch]        = useState(searchParams.get('search') || '');

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then(data => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const data = await getProducts({
        page: reset ? 1 : page,
        category: activeCategory,
        search: searchQuery,
      });
      const items = data.data?.items || data.products || [];
      setProducts(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length === 20);    // assume 20 per page
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery]);

  useEffect(() => { fetchProducts(true); }, [activeCategory, searchQuery]);
  useEffect(() => { if (page > 1) fetchProducts(); }, [page]);

  async function handleAddToCart(product) {
    if (!user) {
      window.location.href = '/api/auth/login';
      return;
    }
    try {
      const res  = await fetch('/api/token');
      const sess = await res.json();
      await addToCart(sess.accessToken, product.id, 1);
      setToast(`${product.name} added to cart!`);
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Could not add to cart.');
      setTimeout(() => setToast(''), 3000);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-brand-600 text-white
                        px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">
          {activeCategory
            ? `Browsing: ${activeCategory}`
            : searchQuery
            ? `Results for "${searchQuery}"`
            : 'Discover our full collection'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center space-x-2 mb-4">
              <SlidersHorizontal size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">Filter</h3>
            </div>

            {/* Active filter pills */}
            {(activeCategory || searchQuery) && (
              <div className="mb-4 space-y-2">
                {activeCategory && (
                  <button
                    onClick={() => setCategory('')}
                    className="flex items-center space-x-1 bg-brand-50 text-brand-700
                               text-xs px-3 py-1.5 rounded-full font-medium w-full"
                  >
                    <span className="flex-1 text-left">{activeCategory}</span>
                    <X size={12} />
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearch('')}
                    className="flex items-center space-x-1 bg-brand-50 text-brand-700
                               text-xs px-3 py-1.5 rounded-full font-medium w-full"
                  >
                    <span className="flex-1 text-left">"{searchQuery}"</span>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase
                            tracking-wider mb-2">
                Categories
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm
                                transition-colors
                                ${!activeCategory
                                  ? 'bg-brand-50 text-brand-700 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm
                                  transition-colors
                                  ${activeCategory === cat.slug
                                    ? 'bg-brand-50 text-brand-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100
                                        overflow-hidden animate-pulse">
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
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg">No products found.</p>
              <button onClick={() => { setCategory(''); setSearch(''); }}
                className="mt-4 text-brand-600 hover:underline text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="bg-white border border-gray-200 hover:border-brand-300
                               text-gray-700 font-medium px-8 py-3 rounded-full
                               transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
