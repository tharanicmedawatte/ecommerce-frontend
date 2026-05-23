'use client';
// =============================================================================
// app/checkout/page.jsx — Stripe checkout page
// Requires login + verified email.
// Flow: create PaymentIntent → show Stripe card form → confirm payment.
// =============================================================================

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/api';
import { Lock, ShieldCheck } from 'lucide-react';

// Load Stripe — done outside the component so it's only loaded once
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// =============================================================================
// Inner payment form — uses Stripe hooks (must be inside <Elements>)
// =============================================================================
function PaymentForm({ orderId, total }) {
  const stripe       = useStripe();
  const elements     = useElements();
  const router       = useRouter();
  const [error, setError]       = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // After payment, Stripe redirects here
        return_url: `${window.location.origin}/account?order=${orderId}`,
      },
    });

    // If we reach here, payment failed (success = redirect)
    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element — renders card, Apple Pay, Google Pay etc. */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center
                       space-x-2">
          <Lock size={18} className="text-brand-600" />
          <span>Payment Details</span>
        </h2>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                        px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Order total recap */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex
                      items-center justify-between">
        <span className="text-gray-600 font-medium">Total due today</span>
        <span className="text-2xl font-extrabold text-gray-900">${total}</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300
                   text-white font-bold py-4 rounded-2xl text-lg transition-colors
                   shadow-lg flex items-center justify-center space-x-2"
      >
        <ShieldCheck size={20} />
        <span>{processing ? 'Processing payment…' : `Pay $${total}`}</span>
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center
                    justify-center space-x-1">
        <Lock size={11} />
        <span>Secured by Stripe. Your card details are never stored on our servers.</span>
      </p>
    </form>
  );
}

// =============================================================================
// Checkout page — fetches PaymentIntent, then renders Stripe Elements
// =============================================================================
export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useUser();
  const router                           = useRouter();
  const [clientSecret, setClientSecret]  = useState('');
  const [orderId, setOrderId]            = useState('');
  const [total, setTotal]                = useState('');
  const [loading, setLoading]            = useState(true);
  const [error, setError]                = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/api/auth/login'); return; }
    initCheckout();
  }, [user, authLoading]);

  async function initCheckout() {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/me');
      const sess = await res.json();

      // Ask Flask to create a Stripe PaymentIntent
      // Flask recalculates total from DB — we never trust a client-sent amount
      const data = await createPaymentIntent(sess.accessToken);
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
    <div className="max-w-xl mx-auto px-4 py-16 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-12 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl
                      px-6 py-8">
        <h2 className="text-lg font-bold mb-2">Checkout unavailable</h2>
        <p className="text-sm">{error}</p>
        <a href="/cart"
          className="mt-5 inline-block text-brand-600 hover:underline text-sm">
          ← Back to cart
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Stripe Elements wraps the payment form */}
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0284c7',
                borderRadius: '12px',
              },
            },
          }}
        >
          <PaymentForm orderId={orderId} total={total} />
        </Elements>
      )}
    </div>
  );
}
