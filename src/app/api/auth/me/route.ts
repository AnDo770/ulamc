/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile.
 * Validates the Bearer token server-side.
 *
 * TODO: Replace mock with real token verification when AUTH_API_URL is set.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthApiConfigured, AUTH_API_URL, AUTH_API_KEY } from '@/config/api';
import type { AuthUser } from '@/services/auth';

interface MeResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json<MeResponse>(
        { success: false, message: 'Chưa đăng nhập.' },
        { status: 401 }
      );
    }

    if (isAuthApiConfigured()) {
      // TODO: Replace with actual token verification endpoint
      const externalRes = await fetch(`${AUTH_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'X-API-Key': AUTH_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!externalRes.ok) {
        return NextResponse.json<MeResponse>(
          { success: false, message: 'Phiên đăng nhập hết hạn.' },
          { status: 401 }
        );
      }

      const data = await externalRes.json();
      return NextResponse.json<MeResponse>({ success: true, user: data.user });
    }

    // ── MOCK ──────────────────────────────────────────────────────────────────
    // TODO: Remove this block when AUTH_API_URL is configured.
    return NextResponse.json<MeResponse>(
      { success: false, message: 'Hệ thống xác thực chưa được kích hoạt.' },
      { status: 503 }
    );
  } catch (err) {
    console.error('[/api/auth/me]', err);
    return NextResponse.json<MeResponse>(
      { success: false, message: 'Lỗi máy chủ.' },
      { status: 500 }
    );
  }
}
