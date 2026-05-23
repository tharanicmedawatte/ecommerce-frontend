'use client';
// =============================================================================
// components/ProductCard.jsx
// Reusable card shown in product listing and homepage featured section.
// =============================================================================

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const inStock = product.stock > 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100
                    hover:shadow-md transition-all duration-200 overflow-hidden flex
                    flex-col">
      {/* Product image */}
      <Link href={`/products/${product.id}`} className="relative aspect-square
                                                          overflow-hidden bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform
                       duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-gray-300 text-4xl">
            🛍️
          </div>
        )}
        {/* Out of stock badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center
                          justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold
                             px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* Category badge */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 text-gray-700 text-xs font-medium
                             px-2 py-1 rounded-full backdrop-blur-sm">
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
