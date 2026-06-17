'use client';
// =============================================================================
// app/account/page.jsx — User account & order history
// Requires login. Shows profile info and past orders.
// =============================================================================

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe, getOrderHistory } from '@/lib/api';
import { Package, CheckCircle, Clock, XCircle, Truck, User } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    paid:      { color: 'bg-green-100 text-green-700',  icon: CheckCircle, label: 'Paid'      },
    pending:   { color: 'bg-yellow-100 text-yellow-700',icon: Clock,        label: 'Pending'   },
    failed:    { color: 'bg-red-100 text-red-700',      icon: XCircle,      label: 'Failed'    },
    shipped:   { color: 'bg-blue-100 text-blue-700',    icon: Truck,        label: 'Shipped'   },
    delivered: { color: 'bg-green-100 text-green-800',  icon: CheckCircle,  label: 'Delivered' },
    cancelled: { color: 'bg-gray-100 text-gray-600',    icon: XCircle,      label: 'Cancelled' },
  };
  const cfg  = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold
                      px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon size={12} />
      <span>{cfg.label}</span>
    </span>
  );
}

function AccountPageInner() {
  const { user: auth0User, isLoading: authLoading } = useUser();
  const router                                       = useRouter();
  const searchParams                                 = useSearchParams();
  const [profile, setProfile]   = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const justOrdered             = searchParams.get('order');

  useEffect(() => {
    if (authLoading) return;
    if (!auth0User) { router.push('/api/auth/login'); return; }
    loadData();
  }, [auth0User, authLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const res  = await fetch('/api/token');
      const sess = await res.json();
      const token = sess.accessToken;

      const [profileData, ordersData] = await Promise.all([
        getMe(token),
        getOrderHistory(token),
      ]);
      setProfile(profileData.user || profileData);
      setOrders(ordersData.orders || ordersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="bg-white rounded-2xl h-28 border border-gray-100" />
      <div className="bg-white rounded-2xl h-48 border border-gray-100" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Account</h1>

      {/* Payment success banner */}
      {justOrdered && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4
                        flex items-center space-x-3">
          <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Payment successful!</p>
            <p className="text-sm text-green-700">
              Your order has been placed. A confirmation email is on its way.
            </p>
          </div>
        </div>
      )}

      {/* Profile card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-brand-100 p-4 rounded-2xl">
              <User size={28} className="text-brand-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                                  ${profile.is_verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'}`}>
                  {profile.is_verified ? '✓ Verified' : 'Unverified'}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>
      )}

      {/* Order history */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center
                       space-x-2">
          <Package size={20} className="text-brand-600" />
          <span>Order History</span>
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10
                          text-center">
            <Package size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Your order history will appear here.
            </p>
            <a href="/products"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold
                         px-6 py-3 rounded-full text-sm transition-colors">
              Start shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id}
                className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                    {order.items.map(item => (
                      <div key={item.id}
                        className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name}
                          <span className="text-gray-400 ml-1">× {item.quantity}</span>
                        </span>
                        <span className="text-gray-600 font-medium">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-gray-100">
        <a href="/api/auth/logout"
          className="text-sm text-gray-500 hover:text-red-600 transition-colors">
          Sign out of my account
        </a>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4" /></div>}>
      <AccountPageInner />
    </Suspense>
  );
}
