'use client';
// =============================================================================
// components/ProductCard.jsx
// Reusable product card with optimised WebP images.
// =============================================================================

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

// Convert any Unsplash URL to WebP with optimised dimensions
function optimiseImage(url, width = 400) {
  if (!url) return null;
  if (url.includes('unsplash.com')) {
    // Strip existing params and add WebP + size params
    const base = url.split('?')[0];
    return `${base}?w=${width}&h=${width}&fit=crop&auto=format&fm=webp&q=70`;
  }
  return url;
}

export default function ProductCard({ product, onAddToCart }) {
  const inStock  = product.stock > 0;
  const imageUrl = optimiseImage(product.image_url, 400);

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100
                    hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">

      {/* Product image */}
      <Link href={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-gray-50 block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🛍️
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {product.category.name}
            </span>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug
                         hover:text-brand-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${parseFloat(product.price).toFixed(2)}
          </span>

          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={!inStock}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl
                        text-sm font-medium transition-colors
                        ${inStock
                          ? 'bg-brand-600 hover:bg-brand-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingCart size={15} />
            <span>{inStock ? 'Add' : 'Sold out'}</span>
          </button>
        </div>

        {/* Low stock warning */}
        {inStock && product.stock <= 5 && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Only {product.stock} left in stock
          </p>
        )}
      </div>
    </div>
  );
}
