// =============================================================================
// lib/api.js
// Central API client — all Flask backend calls live here.
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const API_V1  = `${API_URL}/api/v1`;

async function apiFetch(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return data;
}

// =============================================================================
// Auth — Developer 1's routes (/auth/*)
// =============================================================================

export async function syncUser(token) {
  return apiFetch(`${API_URL}/auth/sync`, { method: 'POST' }, token);
}

export async function getMe(token) {
  return apiFetch(`${API_URL}/auth/me`, {}, token);
}

export async function getAuthStatus(token) {
  return apiFetch(`${API_URL}/auth/status`, {}, token);
}

export async function logoutUser(token) {
  return apiFetch(`${API_URL}/auth/logout`, { method: 'POST' }, token);
}

// =============================================================================
// Products — Developer 2's routes (/api/v1/products)
// =============================================================================

export async function getProducts({ page = 1, category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (page)     params.set('page', page);
  if (category) params.set('category', category);
  if (search)   params.set('q', search);

  return apiFetch(`${API_V1}/products?${params.toString()}`);
}

export async function getProduct(id) {
  return apiFetch(`${API_V1}/products/${id}`);
}

export async function getCategories() {
  return apiFetch(`${API_V1}/products/categories`);
}

export async function searchProducts(query) {
  return apiFetch(`${API_V1}/products/search?q=${encodeURIComponent(query)}`);
}

// =============================================================================
// Cart — Developer 2's routes (/api/v1/cart)
// =============================================================================

export async function getCart(token) {
  return apiFetch(`${API_V1}/cart`, {}, token);
}

export async function addToCart(token, productId, quantity = 1) {
  return apiFetch(`${API_V1}/cart`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  }, token);
}

export async function updateCartItem(token, itemId, quantity) {
  return apiFetch(`${API_V1}/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }, token);
}

export async function removeFromCart(token, itemId) {
  return apiFetch(`${API_V1}/cart/${itemId}`, { method: 'DELETE' }, token);
}

// =============================================================================
// Orders — Developer 3's routes (/api/v1/orders)
// =============================================================================

export async function createPaymentIntent(token, shipping) {
  return apiFetch(`${API_URL}/orders/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify({ shipping }),
  }, token);
}

export async function getOrderHistory(token) {
  return apiFetch(`${API_URL}/orders/history`, {}, token);
}

export async function getOrder(token, orderId) {
  return apiFetch(`${API_URL}/orders/${orderId}`, {}, token);
}