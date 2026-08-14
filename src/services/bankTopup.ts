/**
 * ULAMC Bank Top-up Service
 *
 * Client-side service that calls Next.js API routes for bank transfers.
 * Bank API key stays on the server — never in this file.
 *
 * Architecture:
 *   BankTopup → bankTopupService.createTransaction() → POST /api/topup/bank → Payment Gateway
 *   BankTopup → bankTopupService.getStatus()        → GET  /api/topup/bank/status/:id
 *   Gateway   → POST /api/webhooks/bank             → Update transaction status
 *
 * TODO: When switching payment gateways, only update the API routes.
 *       This service file stays the same.
 */

import { API_ROUTES } from '@/config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BankTransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

export interface BankTopupRequest {
  amount: number;
  userId?: string;
  description?: string;
}

export interface BankTopupResponse {
  success: boolean;
  transactionId?: string;
  /** Minecraft username from session — set by backend, never from client */
  username?: string;
  amount?: number;
  /** Bank name — provided by payment gateway */
  bank?: string | null;
  /** Destination account number */
  accountNumber?: string | null;
  /** Destination account holder name */
  accountName?: string | null;
  /** Transfer description = Minecraft username from session */
  transferContent?: string;
  /** QR code image URL from payment gateway */
  qrCodeUrl?: string | null;
  status?: BankTransactionStatus;
  createdAt?: string;
  completedAt?: string | null;
  message?: string;
}

export interface BankTransaction {
  transactionId: string;
  userId?: string;
  amount: number;
  bank?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  transferContent: string;
  qrCodeUrl?: string | null;
  status: BankTransactionStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface BankStatusResponse {
  success: boolean;
  transactionId?: string;
  status?: BankTransactionStatus;
  amount?: number;
  completedAt?: string | null;
  message?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Create a bank transfer transaction.
 * Returns payment details including QR code URL and transfer content.
 */
export async function createBankTransaction(
  payload: BankTopupRequest,
  token?: string
): Promise<BankTopupResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.TOPUP_BANK, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data: BankTopupResponse = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
    };
  }
}

/**
 * Poll the status of a bank transaction.
 * Call this periodically after creating a transaction to check for payment confirmation.
 */
export async function getBankTransactionStatus(
  transactionId: string,
  token?: string
): Promise<BankStatusResponse> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.TOPUP_BANK_STATUS(transactionId), {
      method: 'GET',
      headers,
    });

    const data: BankStatusResponse = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message: 'Không thể kiểm tra trạng thái giao dịch.',
    };
  }
}
