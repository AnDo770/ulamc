/**
 * POST /api/topup/bank
 *
 * Creates a bank transfer transaction and returns payment details + QR data.
 * Bank API key is kept server-side.
 *
 * SECURITY:
 * - Minecraft username is extracted from the session token (Authorization header).
 * - transferContent is always set to the session username — never from client body.
 * - Client cannot override the username or transferContent.
 *
 * TODO: Set BANK_API_URL and BANK_API_KEY in .env, then update the
 *       integration block below with your payment gateway's endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isBankApiConfigured, BANK_API_URL, BANK_API_KEY, isAuthApiConfigured, AUTH_API_URL, AUTH_API_KEY } from '@/config/api';
import type { BankTopupRequest, BankTopupResponse } from '@/services/bankTopup';

function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ULAMC';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Extract Minecraft username from the Bearer token in the Authorization header.
 * Returns null if token is missing or invalid.
 *
 * When AUTH_API_URL is configured: verifies token against the real auth server.
 * When not configured (mock mode): decodes the mock token (base64 username).
 */
async function getUsernameFromToken(token: string): Promise<string | null> {
  if (!token) return null;

  // ── REAL AUTH VERIFICATION ────────────────────────────────────────────────
  if (isAuthApiConfigured()) {
    try {
      const res = await fetch(`${AUTH_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'X-API-Key': AUTH_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user?.username || data.username || null;
    } catch {
      return null;
    }
  }

  // ── MOCK TOKEN DECODE ─────────────────────────────────────────────────────
  // Mock login route returns token = btoa(username) — decode it here.
  // TODO: Remove this block when AUTH_API_URL is configured.
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    // Validate it looks like a Minecraft username (3-16 alphanumeric + underscore)
    if (/^[a-zA-Z0-9_]{3,16}$/.test(decoded)) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── AUTHENTICATION: Extract username from session token ───────────────────
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    const sessionUsername = await getUsernameFromToken(token);

    if (!sessionUsername) {
      return NextResponse.json<BankTopupResponse>(
        { success: false, message: 'Bạn cần đăng nhập bằng tài khoản Minecraft trước khi nạp tiền.' },
        { status: 401 }
      );
    }

    // ── AMOUNT VALIDATION (from body — amount is safe to accept from client) ──
    const body: BankTopupRequest = await req.json();

    if (!body.amount || body.amount < 10000) {
      return NextResponse.json<BankTopupResponse>(
        { success: false, message: 'Số tiền tối thiểu là 10.000đ.' },
        { status: 400 }
      );
    }

    if (body.amount > 50000000) {
      return NextResponse.json<BankTopupResponse>(
        { success: false, message: 'Số tiền tối đa là 50.000.000đ.' },
        { status: 400 }
      );
    }

    // transferContent is ALWAYS the session username — never from client
    const transferContent = sessionUsername;

    // ── REAL API INTEGRATION ──────────────────────────────────────────────────
    if (isBankApiConfigured()) {
      /**
       * TODO: Map to your payment gateway's create-transaction endpoint.
       * Common providers: VietQR, MoMo Business, ZaloPay, PayOS, etc.
       * Update field names to match the provider's API spec.
       */
      const externalRes = await fetch(`${BANK_API_URL}/transactions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': BANK_API_KEY,
        },
        body: JSON.stringify({
          // TODO: Map to provider's field names
          amount: body.amount,
          description: transferContent, // transferContent = Minecraft username
          user_id: sessionUsername,     // always from session, never from client
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/bank`,
        }),
      });

      const data = await externalRes.json();

      if (!externalRes.ok) {
        return NextResponse.json<BankTopupResponse>(
          { success: false, message: data.message || 'Không thể tạo giao dịch.' },
          { status: externalRes.status }
        );
      }

      return NextResponse.json<BankTopupResponse>({
        success: true,
        // TODO: Map provider response fields
        transactionId: data.transaction_id || data.id,
        username: sessionUsername,
        amount: body.amount,
        bank: data.bank_name,
        accountNumber: data.account_number,
        accountName: data.account_name,
        transferContent: transferContent, // always session username
        qrCodeUrl: data.qr_url || data.qr_code,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        message: 'Giao dịch đã được tạo. Vui lòng chuyển khoản đúng nội dung.',
      });
    }

    // ── MOCK SERVICE (remove when real API is ready) ──────────────────────────
    // TODO: Remove this block once BANK_API_URL and BANK_API_KEY are set.
    const transactionId = generateTransactionId();

    return NextResponse.json<BankTopupResponse>({
      success: true,
      transactionId,
      username: sessionUsername,
      amount: body.amount,
      // Bank info will be populated by real API — placeholders shown in UI
      bank: null,
      accountNumber: null,
      accountName: null,
      transferContent: transferContent, // = sessionUsername
      qrCodeUrl: null, // Real QR URL from payment gateway
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      message: 'Giao dịch đã được tạo. Thông tin ngân hàng sẽ hiển thị sau khi tích hợp API.',
    });
    // ── END MOCK ──────────────────────────────────────────────────────────────
  } catch (err) {
    console.error('[/api/topup/bank]', err);
    return NextResponse.json<BankTopupResponse>(
      { success: false, message: 'Lỗi máy chủ. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
