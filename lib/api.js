// =============================================================================
// lib/api.js
// Central API client — all Flask backend calls live here.
//
// Every page and component imports from this file.
// When the Flask backend URL changes, only this file needs updating.
//
// Usage:
//   import { getProducts, addToCart } from '@/lib/api';
//   const products = await getProducts();
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// -----------------------------------------------------------------------------
// Base fetch helper
// Adds auth header, handles errors consistently across all calls.
// -----------------------------------------------------------------------------
async function apiFetch(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse JSON regardless of status so we can read error messages
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return data;
}

// =============================================================================
// Auth — Developer 1's routes (/auth/*)
// =============================================================================

/**
 * Sync Auth0 user to MySQL after login.
 * Call this immediately after Auth0 login succeeds.
 */
export async function syncUser(token) {
  return apiFetch('/auth/sync', { method: 'POST' }, token);
}

/**
 * Get the current user's profile from MySQL.
 */
export async function getMe(token) {
  return apiFetch('/auth/me', {}, token);
}

/**
 * Check if the current token is valid.
 * Returns { authenticated: bool, role: string, is_verified: bool }
 */
export async function getAuthStatus(token) {
  return apiFetch('/auth/status', {}, token);
}

/**
 * Record logout on the server (audit log).
 */
export async function logoutUser(token) {
  return apiFetch('/auth/logout', { method: 'POST' }, token);
}

// =============================================================================
// Products — Developer 2's routes (/products/*)
// =============================================================================

/**
 * Get paginated product list.
 * Guests and logged-in users can both call this.
 */
export async function getProducts({ page = 1, category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (page)     params.set('page', page);
  if (category) params.set('category', category);
  if (search)   params.set('q', search);

  return apiFetch(`/products?${params.toString()}`);
}

/**
 * Get a single product by ID.
 */
export async function getProduct(id) {
  return apiFetch(`/products/${id}`);
}

/**
 * Get all product categories.
 */
export async function getCategories() {
  return apiFetch('/products/categories');
}

/**
 * Search products by query string.
 */
export async function searchProducts(query) {
  return apiFetch(`/products/search?q=${encodeURIComponent(query)}`);
}

// =============================================================================
// Cart — Developer 2's routes (/cart/*)
// Requires authentication.
// =============================================================================

/**
 * Get the current user's cart.
 */
export async function getCart(token) {
  return apiFetch('/cart', {}, token);
}

/**
 * Add a product to the cart.
 */
export async function addToCart(token, productId, quantity = 1) {
  return apiFetch('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  }, token);
}

/**
 * Update quantity of a cart item.
 */
export async function updateCartItem(token, itemId, quantity) {
  return apiFetch(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }, token);
}

/**
 * Remove an item from the cart.
 */
export async function removeFromCart(token, itemId) {
  return apiFetch(`/cart/${itemId}`, { method: 'DELETE' }, token);
}

// =============================================================================
// Orders — Developer 3's routes (/orders/*)
// Requires authentication + email verification.
// =============================================================================

/**
 * Create a Stripe PaymentIntent.
 * Returns { client_secret, order_id }
 * Pass client_secret to Stripe.js to show the payment form.
 */
export async function createPaymentIntent(token) {
  return apiFetch('/orders/create-payment-intent', { method: 'POST' }, token);
}

/**
 * Get the current user's order history.
 */
export async function getOrderHistory(token) {
  return apiFetch('/orders/history', {}, token);
}

/**
 * Get details of a single order.
 */
export async function getOrder(token, orderId) {
  return apiFetch(`/orders/${orderId}`, {}, token);
}
