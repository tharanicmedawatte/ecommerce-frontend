'use client';
// =============================================================================
// components/Navbar.jsx
// Top navigation with live search suggestions and debounced API calls.
// =============================================================================

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Search, User, Menu, X, LogOut } from 'lucide-react';
import { searchProducts } from '@/lib/api';

export default function Navbar({ cartCount = 0 }) {
  const { user, isLoading }           = useUser();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [searching, setSearching]     = useState(false);
  const searchRef                     = useRef(null);
  const debounceRef                   = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    setSearching(true);
    try {
      const data = await searchProducts(q);
      const items = data.data?.items || data.products || data.items || [];
      setSuggestions(items.slice(0, 6));
      setShowDrop(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      setShowDrop(false);
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  }

  function handleSuggestionClick(product) {
    setShowDrop(false);
    setQuery('');
    window.location.href = `/products/${product.id}`;
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setShowDrop(false);
      setQuery('');
    }
  }

  // Convert Unsplash URL to WebP with small thumbnail size for suggestions
  function thumbUrl(url) {
    if (!url) return null;
    if (url.includes('unsplash.com')) {
      return url.replace(/\?.*$/, '') + '?w=80&h=80&fit=crop&auto=format&q=60';
    }
    return url;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-brand-700 tracking-tight">
              🍁 Maple & Moss
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-600 hover:text-brand-700 font-medium transition-colors">All</Link>
            <Link href="/products?category=furniture" className="text-gray-600 hover:text-brand-700 font-medium transition-colors">Furniture</Link>
            <Link href="/products?category=textiles" className="text-gray-600 hover:text-brand-700 font-medium transition-colors">Textiles</Link>
            <Link href="/products?category=kitchen" className="text-gray-600 hover:text-brand-700 font-medium transition-colors">Kitchen</Link>
            <Link href="/products?category=decor" className="text-gray-600 hover:text-brand-700 font-medium transition-colors">Decor</Link>
          </div>

          {/* Search bar with live suggestions */}
          <div className="hidden md:block relative w-64" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
              />
              {searching && (
                <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {query && !searching && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false); }}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </form>

            {/* Suggestions dropdown */}
            {showDrop && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-50">
                  Suggestions
                </div>
                {suggestions.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={thumbUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                    {product.category && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{product.category.name}</span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full px-3 py-2.5 text-sm text-brand-600 font-medium hover:bg-brand-50 transition-colors border-t border-gray-50 flex items-center space-x-2"
                >
                  <Search size={13} />
                  <span>See all results for "{query}"</span>
                </button>
              </div>
            )}

            {/* No results */}
            {showDrop && !searching && query.length >= 2 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-4 text-sm text-gray-500 z-50">
                No products found for "{query}"
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-brand-700 transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link href="/account" className="flex items-center space-x-2 text-gray-600 hover:text-brand-700 transition-colors">
                  <User size={20} />
                  <span className="hidden md:block text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </Link>
                <a href="/api/auth/logout" className="hidden md:flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut size={16} />
                  <span>Logout</span>
                </a>
              </div>
            ) : (
              <a href="/api/auth/login" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
                Login
              </a>
            )}

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mx-2">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={handleQueryChange}
                className="bg-transparent text-sm outline-none w-full"
              />
            </form>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">All Products</Link>
            <Link href="/products?category=furniture" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Furniture</Link>
            <Link href="/products?category=textiles" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Textiles</Link>
            <Link href="/products?category=kitchen" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Kitchen</Link>
            <Link href="/products?category=decor" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Decor</Link>
            {user ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">My Account</Link>
                <a href="/api/auth/logout" className="block px-4 py-2 text-red-600 hover:bg-gray-50">Logout</a>
              </>
            ) : (
              <a href="/api/auth/login" className="block px-4 py-2 text-brand-600 font-medium hover:bg-gray-50">Login / Register</a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
