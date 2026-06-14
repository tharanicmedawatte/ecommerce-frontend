// app/api/token/route.js
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.accessToken) {
      return Response.json({ accessToken: null }, { status: 401 });
    }
    return Response.json({ accessToken: session.accessToken });
  } catch (err) {
    console.error('Token error:', err.message);
    return Response.json({ accessToken: null }, { status: 401 });
  }
}