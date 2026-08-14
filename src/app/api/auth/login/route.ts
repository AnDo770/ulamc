/**
 * POST /api/auth/login
 *
 * Authenticates a Minecraft player against the game server.
 * This website has NO separate account system — login IS the Minecraft account.
 *
 * Secrets (AUTH_API_URL, AUTH_API_KEY) never leave the server.
 * Passwords are NEVER stored, logged, or returned.
 *
 * TODO: Set AUTH_API_URL and AUTH_API_KEY in .env to activate real Minecraft auth.
 *       The verifyMinecraftCredentials() function in src/services/minecraft.ts
 *       will automatically switch from mock to real API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMinecraftCredentials } from '@/services/minecraft';
import type { LoginResponse } from '@/services/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = (body.username || '').trim();
    const password: string = body.password || '';

    if (!username || !password) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: 'Tên tài khoản và mật khẩu không được để trống.' },
        { status: 400 }
      );
    }

    // Verify against Minecraft server (password is forwarded, never stored)
    const result = await verifyMinecraftCredentials(username, password);

    if (!result.success) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: result.message || 'Sai tên tài khoản hoặc mật khẩu Minecraft.',
        },
        { status: 401 }
      );
    }

    // Return only the username — no website profile, no website password
    return NextResponse.json<LoginResponse>({
      success: true,
      username: result.player?.username || username,
      token: result.serverToken,
      message: 'Đăng nhập thành công.',
    });
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return NextResponse.json<LoginResponse>(
      { success: false, message: 'Lỗi máy chủ. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
