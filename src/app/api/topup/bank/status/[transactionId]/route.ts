/**
 * GET /api/topup/bank/status/[transactionId]
 *
 * Returns the status of a bank transfer transaction.
 * Poll this endpoint after creating a transaction to check for payment confirmation.
 *
 * TODO: When BANK_API_URL is configured, query the real payment gateway for status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isBankApiConfigured, BANK_API_URL, BANK_API_KEY } from '@/config/api';
import type { BankStatusResponse } from '@/services/bankTopup';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json<BankStatusResponse>(
        { success: false, message: 'Thiếu mã giao dịch.' },
        { status: 400 }
      );
    }

    if (isBankApiConfigured()) {
      // TODO: Adjust endpoint to match your payment gateway's status API
      const res = await fetch(`${BANK_API_URL}/transactions/${encodeURIComponent(transactionId)}`, {
        method: 'GET',
        headers: { 'X-API-Key': BANK_API_KEY },
      });

      const data = await res.json();

      return NextResponse.json<BankStatusResponse>({
        success: res.ok,
        transactionId,
        status: data.status,
        amount: data.amount,
        completedAt: data.completed_at || null,
        message: data.message,
      });
    }

    // Mock — return PENDING status when API not configured
    return NextResponse.json<BankStatusResponse>({
      success: true,
      transactionId,
      status: 'PENDING',
      message: 'Đang chờ xác nhận thanh toán.',
    });
  } catch (err) {
    console.error('[/api/topup/bank/status]', err);
    return NextResponse.json<BankStatusResponse>(
      { success: false, message: 'Lỗi máy chủ.' },
      { status: 500 }
    );
  }
}
