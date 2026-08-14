/**
 * POST /api/topup/card
 *
 * Submits a phone card top-up request to the external card provider.
 * API key is kept server-side and never exposed to the client.
 *
 * Request body: CardTopupRequest
 * Response:     CardTopupResponse
 *
 * TODO: Set CARD_API_URL and CARD_API_KEY in .env, then update the
 *       integration block below with the real provider's endpoint and
 *       request/response mapping.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCardApiConfigured, CARD_API_URL, CARD_API_KEY } from '@/config/api';
import type { CardTopupRequest, CardTopupResponse } from '@/services/cardTopup';

export async function POST(req: NextRequest) {
  try {
    const body: CardTopupRequest = await req.json();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!body.cardType || !body.denomination || !body.cardCode?.trim() || !body.serialNumber?.trim()) {
      return NextResponse.json<CardTopupResponse>(
        {
          success: false,
          status: 'FAILED',
          message: 'Thiếu thông tin thẻ. Vui lòng điền đầy đủ.',
        },
        { status: 400 }
      );
    }

    // ── REAL API INTEGRATION ──────────────────────────────────────────────────
    if (isCardApiConfigured()) {
      /**
       * TODO: Map ULAMC request fields to your card provider's API format.
       * Common providers: Trumthe, Thesieure, Napthenhanh, etc.
       * Each has a different request/response schema — update the mapping below.
       */
      const externalRes = await fetch(`${CARD_API_URL}/topup/card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CARD_API_KEY,
        },
        body: JSON.stringify({
          // TODO: Map to provider's field names
          card_type: body.cardType,
          amount: body.denomination,
          card_code: body.cardCode.trim(),
          serial: body.serialNumber.trim(),
          request_id: body.requestId,
        }),
      });

      const data = await externalRes.json();

      if (!externalRes.ok) {
        return NextResponse.json<CardTopupResponse>(
          {
            success: false,
            status: 'FAILED',
            // TODO: Map provider error codes to Vietnamese messages
            message: data.message || 'Nạp thẻ thất bại. Vui lòng thử lại.',
            errorCode: data.error_code,
          },
          { status: externalRes.status }
        );
      }

      return NextResponse.json<CardTopupResponse>({
        success: true,
        // TODO: Map provider response fields
        transactionId: data.transaction_id || data.id,
        status: data.status === 'success' ? 'SUCCESS' : 'PENDING',
        actualAmount: data.actual_amount ?? body.denomination,
        message: data.message || 'Thẻ đang được xử lý.',
        createdAt: new Date().toISOString(),
      });
    }

    // ── MOCK SERVICE (remove when real API is ready) ──────────────────────────
    // TODO: Remove this entire block once CARD_API_URL and CARD_API_KEY are set.
    return NextResponse.json<CardTopupResponse>(
      {
        success: false,
        status: 'FAILED',
        message: 'Hệ thống nạp thẻ chưa được kích hoạt. Vui lòng thử lại sau.',
      },
      { status: 503 }
    );
    // ── END MOCK ──────────────────────────────────────────────────────────────
  } catch (err) {
    console.error('[/api/topup/card]', err);
    return NextResponse.json<CardTopupResponse>(
      {
        success: false,
        status: 'FAILED',
        message: 'Lỗi máy chủ. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
