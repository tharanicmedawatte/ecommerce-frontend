'use client';
// =============================================================================
// app/checkout/payment/page.jsx — Step 2: Payment
// =============================================================================

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, getCart } from '@/lib/api';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Inner payment form
function PaymentForm({ orderId, total, shipping }) {
  const stripe     = useStripe();
  const elements   = useElements();
  const router     = useRouter();
  const [error, setError]           = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account?order=${orderId}`,
        shipping: {
          name:    shipping.full_name,
          address: {
            line1:       shipping.address,
            city:        shipping.city,
            postal_code: shipping.postal_code,
            country:     shipping.country,
          },
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <div onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Lock size={18} className="text-brand-600" />
          <span>Payment Details</span>
        </h2>
        <p className="text-sm text-gray-500 mb-5">All transactions are secure and encrypted.</p>
        <PaymentElement />
      </div>

      {/* Shipping summary */}
      {shipping && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">Shipping to</p>
          <p>{shipping.full_name}</p>
          <p>{shipping.address}, {shipping.city} {shipping.postal_code}</p>
          <p>{shipping.country}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
        <span className="text-gray-600 font-medium">Total due today</span>
        <span className="text-2xl font-extrabold text-gray-900">${total}</span>
      </div>

      <button onClick={handleSubmit}
        disabled={!stripe || processing}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300
                   text-white font-bold py-4 rounded-2xl text-lg transition-colors
                   shadow-lg flex items-center justify-center space-x-2">
        <ShieldCheck size={20} />
        <span>{processing ? 'Processing payment…' : `Pay $${total}`}</span>
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
        <Lock size={11} />
        <span>Secured by Stripe. Your card details are never stored on our servers.</span>
      </p>
    </div>
  );
}

// Payment page
export default function PaymentPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId]           = useState('');
  const [total, setTotal]               = useState('');
  const [cart, setCart]                 = useState(null);
  const [shipping, setShipping]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/api/auth/login'); return; }

    // Load shipping from sessionStorage
    const saved = sessionStorage.getItem('maple_shipping');
    if (!saved) { router.push('/checkout'); return; }
    const shippingData = JSON.parse(saved);
    setShipping(shippingData);

    initPayment(shippingData);
  }, [user, authLoading]);

  async function initPayment(shippingData) {
    try {
      const res  = await fetch('/api/token');
      const sess = await res.json();

      // Load cart for summary
      const cartData = await getCart(sess.accessToken);
      setCart(cartData.data || cartData.cart || cartData);

      // Create PaymentIntent with real shipping data
      const data = await createPaymentIntent(sess.accessToken, {
        name:        shippingData.full_name,
        address_line1: shippingData.address,
        city:        shippingData.city,
        postal_code: shippingData.postal_code,
        country:     shippingData.country,
      });

      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
      setTotal(data.total || '0.00');
    } catch (err) {
      setError(err.message || 'Could not start checkout. Is your cart empty?');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[...Array(3)].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-8">
        <h2 className="text-lg font-bold mb-2">Checkout unavailable</h2>
        <p className="text-sm">{error}</p>
        <a href="/cart" className="mt-5 inline-block text-brand-600 hover:underline text-sm">← Back to cart</a>
      </div>
    </div>
  );

  const items    = cart?.items || [];
  const subtotal = parseFloat(cart?.total || 0);
  const shipCost = subtotal >= 50 ? 0 : 5.99;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Progress indicator */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">✓</div>
          <span className="text-brand-600 font-medium">Shipping</span>
        </div>
        <div className="flex-1 h-px bg-brand-200" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <span className="font-semibold text-brand-700">Payment</span>
        </div>
      </div>

      <button onClick={() => router.push('/checkout')}
        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to shipping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payment form */}
        <div className="lg:col-span-3">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#16a34a', borderRadius: '12px' } },
            }}>
              <PaymentForm orderId={orderId} total={total} shipping={shipping} />
            </Elements>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product?.image_url
                      ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${item.subtotal}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipCost === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipCost === 0 ? 'Free' : `$${shipCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${(subtotal + shipCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
