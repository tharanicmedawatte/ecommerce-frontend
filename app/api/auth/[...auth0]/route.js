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
      console.log('[Auth0 Callback] Session keys:', Object.keys(session || {}));
      console.log('[Auth0 Callback] Has accessToken:', !!session?.accessToken);
      if (session?.accessToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          const text = await res.text();
          console.log('[Auth0 Callback] Sync status:', res.status, 'body:', text);
        } catch (err) {
          console.error('[Auth0 Callback] Sync failed:', err.message);
        }
      } else {
        console.warn('[Auth0 Callback] No accessToken in session — skipping sync');
      }
      return session;
    },
  }),
});