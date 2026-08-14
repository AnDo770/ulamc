/**
 * ULAMC Top-up Service — backward-compatibility re-export
 *
 * This file re-exports from the new cardTopup service.
 * Existing imports of '@/services/topup' continue to work.
 *
 * @deprecated Import directly from '@/services/cardTopup' for new code.
 */

export {
  submitCardTopup as submitTopup,
  CARD_TYPE_LABELS,
  DENOMINATION_LABELS,
} from '@/services/cardTopup';

export type {
  CardType,
  Denomination,
  CardTopupRequest as TopupPayload,
  CardTopupResponse as TopupResponse,
  CardTransaction as TopupTransaction,
} from '@/services/cardTopup';

// TopupHistoryResponse kept for backward compat
export interface TopupHistoryResponse {
  success: boolean;
  transactions?: import('@/services/cardTopup').CardTransaction[];
  message?: string;
}

export async function fetchTopupHistory(_token: string): Promise<TopupHistoryResponse> {
  // TODO: Implement history endpoint GET /api/topup/history when backend is ready
  return {
    success: false,
    message: 'Lịch sử nạp thẻ sẽ khả dụng sau khi tích hợp API.',
  };
}