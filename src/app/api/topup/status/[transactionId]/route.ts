/**
 * GET /api/topup/status/[transactionId]
 *
 * Returns the status of a card top-up transaction.
 *
 * TODO: When CARD_API_URL is configured, query the real provider for status.
 *       Until then, returns a not-implemented response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCardApiConfigured, CARD_API_URL, CARD_API_KEY } from '@/config/api';

interface CardStatusResponse {
  success: boolean;
  transactionId?: string;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  actualAmount?: number;
  completedAt?: string | null;
  message?: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json<CardStatusResponse>(
        { success: false, message: 'Thiếu mã giao dịch.' },
        { status: 400 }
      );
    }

    if (isCardApiConfigured()) {
      // TODO: Adjust endpoint to match your card provider's status API
      const res = await fetch(`${CARD_API_URL}/topup/status/${encodeURIComponent(transactionId)}`, {
        method: 'GET',
        headers: { 'X-API-Key': CARD_API_KEY },
      });

      const data = await res.json();

      return NextResponse.json<CardStatusResponse>({
        success: res.ok,
        transactionId,
        status: data.status,
        actualAmount: data.actual_amount,
        completedAt: data.completed_at || null,
        message: data.message,
      });
    }

    // Mock — API not configured
    return NextResponse.json<CardStatusResponse>(
      {
        success: false,
        transactionId,
        message: 'Hệ thống nạp thẻ chưa được kích hoạt.',
      },
      { status: 503 }
    );
  } catch (err) {
    console.error('[/api/topup/status]', err);
    return NextResponse.json<CardStatusResponse>(
      { success: false, message: 'Lỗi máy chủ.' },
      { status: 500 }
    );
  }
}
