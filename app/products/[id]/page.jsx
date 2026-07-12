'use client';
// =============================================================================
// app/products/[id]/page.jsx — Product detail page
// Shows: image, description, price, stock, add to cart button.
// =============================================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import Link from 'next/link';
import { getProduct, addToCart } from '@/lib/api';
import { ShoppingCart, ArrowLeft, Minus, Plus, CheckCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const { id }              = useParams();
  const router              = useRouter();
  const { user }            = useUser();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then(data => setProduct(data.product || data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      router.push('/api/auth/login');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const res  = await fetch('/api/token');
      const sess = await res.json();
      await addToCart(sess.accessToken, product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      setError(err.message || 'Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-5xl mx-auto px-4 py-24 text-center text-gray-400">
      <p className="text-lg">Product not found.</p>
      <Link href="/products" className="mt-4 text-brand-600 hover:underline text-sm block">
        ← Back to products
      </Link>
    </div>
  );

  const inStock  = product.stock > 0;
  const maxQty   = Math.min(product.stock, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Link href="/products"
        className="inline-flex items-center space-x-2 text-sm text-gray-500
                   hover:text-brand-600 mb-8 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to products</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50
                        border border-gray-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center
                            text-gray-300 text-8xl">
              🛍️
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`}
              className="text-brand-600 text-sm font-medium hover:underline mb-2">
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
            {product.name}
          </h1>

          <div className="text-3xl font-extrabold text-gray-900 mb-4">
            ${parseFloat(product.price).toFixed(2)}
          </div>

          {/* Stock status */}
          <div className={`inline-flex items-center space-x-2 text-sm font-medium
                           mb-5 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full
                              ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
            <span>
              {inStock ? `In stock (${product.stock} available)` : 'Out of stock'}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400 mb-6">SKU: {product.sku}</p>
          )}

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl
                              overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} className="text-gray-600" />
                </button>
                <span className="px-4 py-2 text-gray-900 font-semibold min-w-[3rem]
                                 text-center border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`flex items-center justify-center space-x-3 py-4 px-8
                        rounded-2xl text-base font-bold transition-all
                        ${added
                          ? 'bg-green-500 text-white'
                          : inStock
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {added ? (
              <>
                <CheckCircle size={20} />
                <span>Added to cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                <span>{inStock ? (adding ? 'Adding...' : 'Add to cart') : 'Out of stock'}</span>
              </>
            )}
          </button>

          {/* Checkout prompt */}
          {added && (
            <Link href="/cart"
              className="mt-3 text-center text-sm text-brand-600 hover:underline">
              View cart & checkout →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
