import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import { syncUserToFlask } from '@/lib/auth0';

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/',
  }),

  callback: handleCallback({
    async afterCallback(req, session) {
      if (session?.accessToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await res.json();
          console.log('[Auth0 Callback] Sync response:', res.status, data);
        } catch (err) {
          console.error('[Auth0 Callback] Sync failed:', err.message);
        }
      } else {
        console.warn('[Auth0 Callback] No accessToken in session');
      }
      return session;
    },
  }),
});