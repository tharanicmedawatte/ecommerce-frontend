// app/api/auth/[...auth0]/route.js
// =============================================================================
// Auth0 route handler.
// This single file creates 4 API routes automatically:
//
//   GET /api/auth/login    — redirects to Auth0 Universal Login page
//   GET /api/auth/logout   — logs out + clears session cookie
//   GET /api/auth/callback — Auth0 redirects here after login
//   GET /api/auth/me       — returns current session user (Next.js session)
//
// After login, Auth0 redirects to /api/auth/callback which calls
// afterCallback to sync the user to Flask/MySQL.
// =============================================================================

import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import { syncUserToFlask } from '@/lib/auth0';

export const GET = handleAuth({
  // Custom login handler — requests the right scopes so we get
  // an access token that Flask will accept.
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,   // must match Flask AUTH0_AUDIENCE
      scope: 'openid profile email',
    },
    returnTo: '/',
  }),

  // After Auth0 login — sync the user to Flask MySQL.
  // This creates the MySQL user row on first login.
  callback: handleCallback({
    async afterCallback(req, session) {
      // session.accessToken is the JWT we send to Flask
      if (session?.accessToken) {
        await syncUserToFlask(session.accessToken);
      }
      return session;
    },
  }),
});
