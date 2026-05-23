'use client';
// =============================================================================
// app/cart/page.jsx — Shopping cart page
// Requires login. Shows cart items, totals, and checkout button.
// =============================================================================

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { user, isLoading: authLoading } = useUser();
  const router                           = useRouter();
  const [cart, setCart]                  = useState(null);
  const [loading, setLoading]            = useState(true);
  const [updating, setUpdating]          = useState(null);  // itemId being updated

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/api/auth/login'); return; }
    loadCart();
  }, [user, authLoading]);

  async function loadCart() {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/me');
      const sess = await res.json();
      const data = await getCart(sess.accessToken);
      setCart(data.cart || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(itemId, quantity) {
    setUpdating(itemId);
    try {
      const res  = await fetch('/api/auth/me');
      const sess = await res.json();
      if (quantity < 1) {
        await removeFromCart(sess.accessToken, itemId);
      } else {
        await updateCartItem(sess.accessToken, itemId, quantity);
      }
      await loadCart();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const items = cart?.items || [];
  const total = cart?.total || '0.00';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag size={56} className="mx-auto text-gray-300 mb-5" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some products to get started.</p>
          <Link href="/products"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold
                       px-8 py-3 rounded-full transition-colors">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4
                           flex items-center space-x-4">
                {/* Product image */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl
                                overflow-hidden bg-gray-50">
                  {item.product?.image_url ? (
                    <Image src={item.product.image_url} alt={item.product.name}
                      fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center
                                    text-2xl">🛍️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product?.id}`}
                    className="font-semibold text-gray-900 text-sm hover:text-brand-700
                               line-clamp-1 transition-colors">
                    {item.product?.name || 'Product'}
                  </Link>
                  <p className="text-brand-600 font-bold mt-1">
                    ${parseFloat(item.product?.price || 0).toFixed(2)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                    className="p-1.5 rounded-lg border border-gray-200
                               hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Minus size={14} className="text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                    {updating === item.id ? '…' : item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                    className="p-1.5 rounded-lg border border-gray-200
                               hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Plus size={14} className="text-gray-600" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[4rem]">
                  <p className="font-bold text-gray-900 text-sm">
                    ${item.subtotal}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleUpdate(item.id, 0)}
                  disabled={updating === item.id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors
                             disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart?.item_count || 0} items)</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {parseFloat(total) >= 50 ? 'Free' : '$5.99'}
                  </span>
                </div>
                {parseFloat(total) < 50 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    Add ${(50 - parseFloat(total)).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between
                                font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>
                    ${(parseFloat(total) + (parseFloat(total) < 50 ? 5.99 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout"
                className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white
                           font-bold py-4 rounded-2xl flex items-center justify-center
                           space-x-2 transition-colors shadow-lg">
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>

              <Link href="/products"
                className="mt-3 w-full text-center text-sm text-gray-500
                           hover:text-brand-600 block transition-colors">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
