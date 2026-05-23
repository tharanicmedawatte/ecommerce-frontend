// =============================================================================
// lib/auth0.js
// Auth0 configuration and server-side helpers.
//
// Auth0 SDK handles:
//   - Login redirect to Auth0 Universal Login page
//   - Callback handling after login
//   - Session management (encrypted cookie)
//   - Token refresh
//   - Logout
//
// We add one extra step: after login, we sync the user to Flask/MySQL.
// =============================================================================

import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { syncUser } from './api';

/**
 * Get the current user's Auth0 session from a Server Component or Route Handler.
 * Returns null if not logged in.
 *
 * Usage in a Server Component:
 *   const session = await getAuthSession();
 *   if (!session) redirect('/api/auth/login');
 */
export async function getAuthSession() {
  try {
    return await getSession();
  } catch {
    return null;
  }
}

/**
 * Get the access token for calling the Flask API.
 * The token is included in every protected Flask API call as:
 *   Authorization: Bearer <token>
 *
 * Usage:
 *   const token = await getAccessToken();
 *   const cart = await getCart(token);
 */
export async function getAccessToken() {
  const session = await getAuthSession();
  return session?.accessToken || null;
}

/**
 * Sync the Auth0 user to the Flask MySQL database.
 * Called once after login in the Auth0 callback.
 * Creates the MySQL user row if it doesn't exist yet.
 */
export async function syncUserToFlask(accessToken) {
  try {
    const result = await syncUser(accessToken);
    return result.user;
  } catch (err) {
    console.error('[Auth0] Failed to sync user to Flask:', err.message);
    return null;
  }
}
