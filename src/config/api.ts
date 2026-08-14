/**
 * ULAMC API Configuration
 *
 * All API URLs, keys, and settings are loaded from environment variables.
 * NEVER hard-code secrets or API keys here.
 *
 * Architecture:
 *   React Client
 *     ↓
 *   Next.js API Routes (server-side — secrets stay here)
 *     ↓
 *   Service Layer (src/services/)
 *     ↓
 *   External API / Database
 */

// ─── Public (safe to expose to client) ───────────────────────────────────────

/** Base URL for internal Next.js API routes — used by client-side code */
export const INTERNAL_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || '';

// ─── Server-side only (NEVER import these in client components) ───────────────

/** External card top-up provider base URL */
export const CARD_API_URL = process.env.CARD_API_URL || '';

/** External card top-up provider API key */
export const CARD_API_KEY = process.env.CARD_API_KEY || '';

/** External bank / payment gateway base URL */
export const BANK_API_URL = process.env.BANK_API_URL || '';

/** External bank / payment gateway API key */
export const BANK_API_KEY = process.env.BANK_API_KEY || '';

/** Secret used to verify incoming bank webhook signatures */
export const BANK_WEBHOOK_SECRET = process.env.BANK_WEBHOOK_SECRET || '';

/** External authentication / user management API base URL */
export const AUTH_API_URL = process.env.AUTH_API_URL || '';

/** External authentication API key */
export const AUTH_API_KEY = process.env.AUTH_API_KEY || '';

/** JWT / session signing secret — NEVER expose to client */
export const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || '';

/** Minecraft economy API URL (may be same as AUTH_API_URL or separate) */
export const MINECRAFT_API_URL = process.env.MINECRAFT_API_URL || AUTH_API_URL;

/** Minecraft economy API key */
export const MINECRAFT_API_KEY = process.env.MINECRAFT_API_KEY || AUTH_API_KEY;

/** External Minecraft server status API URL */
export const SERVER_STATUS_API_URL = process.env.SERVER_STATUS_API_URL || '';

/** API key for the server status endpoint (optional — only if your API requires it) */
export const SERVER_STATUS_API_KEY = process.env.SERVER_STATUS_API_KEY || '';

// ─── Internal API route paths (relative) ─────────────────────────────────────

export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',

  // Card top-up
  TOPUP_CARD: '/api/topup/card',
  TOPUP_CARD_STATUS: (transactionId: string) =>
    `/api/topup/status/${transactionId}`,

  // Bank top-up
  TOPUP_BANK: '/api/topup/bank',
  TOPUP_BANK_STATUS: (transactionId: string) =>
    `/api/topup/bank/status/${transactionId}`,

  // Webhooks
  WEBHOOK_BANK: '/api/webhooks/bank',

  // Server status
  SERVER_STATUS: '/api/server/status',
} as const;

// ─── Feature flags ────────────────────────────────────────────────────────────

/**
 * Returns true when the card top-up external API is configured.
 */
export function isCardApiConfigured(): boolean {
  return Boolean(CARD_API_URL && CARD_API_KEY);
}

/**
 * Returns true when the bank payment API is configured.
 */
export function isBankApiConfigured(): boolean {
  return Boolean(BANK_API_URL && BANK_API_KEY);
}

/**
 * Returns true when the authentication API is configured.
 */
export function isAuthApiConfigured(): boolean {
  return Boolean(AUTH_API_URL && AUTH_API_KEY);
}

/**
 * Returns true when the Minecraft economy API is configured.
 */
export function isMinecraftApiConfigured(): boolean {
  return Boolean(MINECRAFT_API_URL && MINECRAFT_API_KEY);
}

/**
 * Returns true when the server status API is configured.
 */
export function isServerStatusApiConfigured(): boolean {
  return Boolean(SERVER_STATUS_API_URL);
}
