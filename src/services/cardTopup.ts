/**
 * ULAMC Card Top-up Service
 *
 * Client-side service that calls POST /api/topup/card (server-side route).
 * The card provider API key stays on the server — never in this file.
 *
 * Architecture:
 *   TopupForm → cardTopupService.submit() → POST /api/topup/card → Card Provider API
 *
 * TODO: When switching providers, only update /api/topup/card/route.ts.
 *       This service file stays the same.
 */

import { API_ROUTES } from '@/config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardType = 'VIETTEL' | 'VINAPHONE' | 'MOBIFONE';
export type Denomination = 10000 | 20000 | 50000 | 100000 | 200000 | 500000;
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface CardTopupRequest {
  cardType: CardType;
  denomination: Denomination;
  cardCode: string;
  serialNumber: string;
  /** Auto-generated client-side idempotency key */
  requestId?: string;
}

export interface CardTopupResponse {
  success: boolean;
  transactionId?: string;
  status?: TransactionStatus;
  /** Actual credited amount (may differ from face value after fees) */
  actualAmount?: number;
  message?: string;
  errorCode?: string;
  createdAt?: string;
}

export interface CardTransaction {
  id: string;
  cardType: CardType;
  denomination: Denomination;
  actualAmount?: number;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
  message?: string;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  VIETTEL: 'Viettel',
  VINAPHONE: 'Vinaphone',
  MOBIFONE: 'Mobifone',
};

export const DENOMINATION_LABELS: Record<Denomination, string> = {
  10000: '10.000đ',
  20000: '20.000đ',
  50000: '50.000đ',
  100000: '100.000đ',
  200000: '200.000đ',
  500000: '500.000đ',
};

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Submit a phone card top-up.
 * Calls the server-side API route which handles the external provider.
 */
export async function submitCardTopup(
  payload: CardTopupRequest,
  token?: string
): Promise<CardTopupResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.TOPUP_CARD, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data: CardTopupResponse = await res.json();
    return data;
  } catch {
    return {
      success: false,
      status: 'FAILED',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
    };
  }
}

// ─── Backward-compatible alias ────────────────────────────────────────────────

/** @deprecated Use submitCardTopup() */
export async function submitTopup(
  payload: { cardType: CardType; denomination: Denomination; cardCode: string; serialNumber: string },
  token: string
): Promise<CardTopupResponse> {
  return submitCardTopup(payload, token);
}
