/**
 * POST /api/auth/register
 *
 * ULAMC does NOT have a website registration system.
 * Accounts are Minecraft server accounts only.
 * This route exists only to return a clear error if called.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse?.json(
    {
      success: false,
      message:
        'Website ULAMC không có hệ thống đăng ký tài khoản riêng. ' + 'Vui lòng đăng ký tài khoản trực tiếp trên server Minecraft ULAMC.COM.',
    },
    { status: 404 }
  );
}
