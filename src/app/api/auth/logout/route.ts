/**
 * POST /api/auth/logout
 *
 * Invalidates the user session server-side.
 *
 * TODO: Call external auth provider to revoke token when API is ready.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthApiConfigured, AUTH_API_URL, AUTH_API_KEY } from '@/config/api';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (isAuthApiConfigured() && token) {
      // TODO: Call external logout/revoke endpoint
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AUTH_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        // Non-critical — session cleared client-side regardless
      });
    }

    return NextResponse.json({ success: true, message: 'Đã đăng xuất.' });
  } catch (err) {
    console.error('[/api/auth/logout]', err);
    return NextResponse.json({ success: true, message: 'Đã đăng xuất.' });
  }
}
