'use client';
// =============================================================================
// app/checkout/page.jsx — Step 1: Shipping Details
// =============================================================================

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { getCart } from '@/lib/api';
import { Truck, ShieldCheck, ArrowRight } from 'lucide-react';

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile",
  "China","Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Finland","France",
  "Georgia","Germany","Ghana","Greece","Guatemala","Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Laos","Latvia","Lebanon","Libya",
  "Lithuania","Luxembourg","Malaysia","Maldives","Mali","Malta","Mexico","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal",
  "Netherlands","New Zealand","Nicaragua","Nigeria","Norway","Oman","Pakistan","Panama",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia",
  "Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();

  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    full_name:    '',
    email:        '',
    address:      '',
    city:         '',
    postal_code:  '',
    country:      'United States',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/api/auth/login'); return; }

    // Pre-fill email from Auth0
    setForm(f => ({ ...f, email: user.email || '' }));

    // Load saved shipping from sessionStorage if user went back
    const saved = sessionStorage.getItem('maple_shipping');
    if (saved) setForm(JSON.parse(saved));

    loadCart();
  }, [user, authLoading]);

  async function loadCart() {
    try {
      const res  = await fetch('/api/token');
      const sess = await res.json();
      const data = await getCart(sess.accessToken);
      setCart(data.data || data.cart || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e = {};
    if (!form.full_name.trim())   e.full_name   = 'Full name is required';
    if (!form.email.trim())       e.email       = 'Email is required';
    if (!form.address.trim())     e.address     = 'Address is required';
    if (!form.city.trim())        e.city        = 'City is required';
    if (!form.postal_code.trim()) e.postal_code = 'Postal code is required';
    if (!form.country)            e.country     = 'Country is required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  }

  function handleContinue() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    // Save to sessionStorage so payment page can read it
    sessionStorage.setItem('maple_shipping', JSON.stringify(form));
    router.push('/checkout/payment');
  }

  const items  = cart?.items || [];
  const total  = parseFloat(cart?.total || 0);
  const shipping = total >= 50 ? 0 : 5.99;
  const grandTotal = (total + shipping).toFixed(2);

  if (authLoading || loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[...Array(6)].map(i => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Progress indicator */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
          <span className="font-semibold text-brand-700">Shipping</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <span className="text-gray-400">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
              <Truck size={18} className="text-brand-600" />
              <span>Shipping Details</span>
            </h2>

            <div className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="Jane Smith"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                    ${errors.full_name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'}`} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="jane@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                    ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input name="address" value={form.address} onChange={handleChange}
                  placeholder="123 Maple Street, Apt 4B"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                    ${errors.address ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'}`} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* City + Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="New York"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                      ${errors.city ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'}`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input name="postal_code" value={form.postal_code} onChange={handleChange}
                    placeholder="10001"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                      ${errors.postal_code ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'}`} />
                  {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white
                    ${errors.country ? 'border-red-400' : 'border-gray-200 focus:border-brand-500'}`}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button onClick={handleContinue} disabled={saving}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white
                       font-bold py-4 rounded-2xl flex items-center justify-center space-x-2
                       transition-colors shadow-lg text-lg">
            <span>{saving ? 'Saving...' : 'Continue to Payment'}</span>
            <ArrowRight size={20} />
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <ShieldCheck size={14} />
            <span>Your information is encrypted and secure</span>
          </div>
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
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Add ${(50 - total).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
