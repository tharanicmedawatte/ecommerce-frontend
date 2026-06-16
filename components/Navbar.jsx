'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Search, User, Menu, X, LogOut } from 'lucide-react';

export default function Navbar({ cartCount = 0 }) {
  const { user, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
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

          {/* Search bar */}
          <form onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-56">
            <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </form>

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
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mx-2">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search products..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
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
