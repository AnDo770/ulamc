/**
 * ULAMC Minecraft Services
 *
 * Two service interfaces for connecting to the Minecraft game server:
 *
 * 1. MinecraftAuthService  — verifies Minecraft username + password against the game server
 * 2. MinecraftEconomyService — adds/checks in-game currency for a Minecraft account
 *
 * Architecture:
 *   Next.js API Routes (server-side)
 *     ↓
 *   MinecraftAuthService / MinecraftEconomyService
 *     ↓
 *   Minecraft Server API (set AUTH_API_URL + AUTH_API_KEY in .env to activate)
 *
 * IMPORTANT:
 * - These services run SERVER-SIDE ONLY (inside /api/* routes).
 * - Never import this file in client components.
 * - Passwords are NEVER logged, stored, or returned.
 *
 * TODO: When real Minecraft server API is ready:
 *   1. Set AUTH_API_URL and AUTH_API_KEY in .env
 *   2. Optionally set MINECRAFT_API_URL and MINECRAFT_API_KEY if economy API is separate
 *   3. Adjust endpoint paths in each function to match your server's API spec
 */

import {
  AUTH_API_URL,
  AUTH_API_KEY,
  MINECRAFT_API_URL,
  MINECRAFT_API_KEY,
  isAuthApiConfigured,
  isMinecraftApiConfigured,
} from '@/config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MinecraftPlayer {
  /** Exact Minecraft username as registered on the game server */
  username: string;
  /** UUID from the Minecraft server (if available) */
  uuid?: string;
  /** Whether the player is currently online */
  online?: boolean;
}

export interface MinecraftAuthResult {
  success: boolean;
  player?: MinecraftPlayer;
  /** Short-lived session token issued by the game server (optional) */
  serverToken?: string;
  message?: string;
}

export interface MinecraftBalanceResult {
  success: boolean;
  username?: string;
  balance?: number;
  currency?: string;
  message?: string;
}

export interface MinecraftAddMoneyResult {
  success: boolean;
  username?: string;
  amountAdded?: number;
  newBalance?: number;
  transactionId?: string;
  message?: string;
}

export interface MinecraftPlayerCheckResult {
  success: boolean;
  exists: boolean;
  player?: MinecraftPlayer;
  message?: string;
}

// ─── MinecraftAuthService ─────────────────────────────────────────────────────

/**
 * Verify a Minecraft username + password against the game server.
 *
 * TODO: When AUTH_API_URL and AUTH_API_KEY are set in .env, this will call
 *       the real Minecraft server authentication endpoint automatically.
 *
 * Password security:
 * - Password is forwarded over HTTPS to the game server only.
 * - It is NEVER stored, logged, or returned by this service.
 */
export async function verifyMinecraftCredentials(
  username: string,
  password: string
): Promise<MinecraftAuthResult> {
  if (!username?.trim() || !password?.trim()) {
    return { success: false, message: 'Tên tài khoản và mật khẩu không được để trống.' };
  }

  // ── REAL API (activated when AUTH_API_URL + AUTH_API_KEY are set) ──────────
  if (isAuthApiConfigured()) {
    try {
      // TODO: Adjust endpoint path to match your Minecraft server auth API
      const res = await fetch(`${AUTH_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AUTH_API_KEY,
        },
        body: JSON.stringify({
          username: username.trim(),
          password, // forwarded over HTTPS; never stored
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Sai tên tài khoản hoặc mật khẩu Minecraft.',
        };
      }

      return {
        success: true,
        player: {
          username: data.player?.username || username.trim(),
          uuid: data.player?.uuid,
          online: data.player?.online,
        },
        serverToken: data.token,
        message: 'Xác thực thành công.',
      };
    } catch (err) {
      console.error('[MinecraftAuthService] verifyCredentials error:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ Minecraft.' };
    }
  }

  // ── MOCK (remove when AUTH_API_URL is configured) ─────────────────────────
  // TODO: Remove this block once AUTH_API_URL + AUTH_API_KEY are set in .env
  return {
    success: false,
    message:
      'Hệ thống xác thực Minecraft chưa được kích hoạt. Vui lòng cấu hình AUTH_API_URL trong .env.',
  };
  // ── END MOCK ──────────────────────────────────────────────────────────────
}

// ─── MinecraftEconomyService ──────────────────────────────────────────────────

/**
 * Check whether a Minecraft player exists on the server.
 *
 * TODO: Adjust endpoint path to match your server economy plugin API.
 */
export async function checkPlayer(username: string): Promise<MinecraftPlayerCheckResult> {
  if (!username?.trim()) {
    return { success: false, exists: false, message: 'Tên tài khoản không hợp lệ.' };
  }

  if (isMinecraftApiConfigured()) {
    try {
      // TODO: Adjust endpoint to match your server API
      const res = await fetch(`${MINECRAFT_API_URL}/player/${encodeURIComponent(username.trim())}`, {
        method: 'GET',
        headers: { 'X-API-Key': MINECRAFT_API_KEY },
      });

      const data = await res.json();

      return {
        success: true,
        exists: res.ok && data.exists !== false,
        player: data.player,
        message: data.message,
      };
    } catch (err) {
      console.error('[MinecraftEconomyService] checkPlayer error:', err);
      return { success: false, exists: false, message: 'Không thể kiểm tra tài khoản Minecraft.' };
    }
  }

  // ── MOCK ──────────────────────────────────────────────────────────────────
  // TODO: Remove when MINECRAFT_API_URL is configured
  return {
    success: false,
    exists: false,
    message: 'Economy service chưa được kích hoạt. Cấu hình MINECRAFT_API_URL trong .env.',
  };
}

/**
 * Get the in-game balance of a Minecraft player.
 *
 * TODO: Adjust endpoint to match your server economy plugin API.
 */
export async function getBalance(username: string): Promise<MinecraftBalanceResult> {
  if (!username?.trim()) {
    return { success: false, message: 'Tên tài khoản không hợp lệ.' };
  }

  if (isMinecraftApiConfigured()) {
    try {
      // TODO: Adjust endpoint to match your server economy API
      const res = await fetch(
        `${MINECRAFT_API_URL}/economy/balance/${encodeURIComponent(username.trim())}`,
        {
          method: 'GET',
          headers: { 'X-API-Key': MINECRAFT_API_KEY },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Không thể lấy số dư.' };
      }

      return {
        success: true,
        username: username.trim(),
        balance: data.balance,
        currency: data.currency || 'xu',
      };
    } catch (err) {
      console.error('[MinecraftEconomyService] getBalance error:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ Minecraft.' };
    }
  }

  // ── MOCK ──────────────────────────────────────────────────────────────────
  // TODO: Remove when MINECRAFT_API_URL is configured
  return {
    success: false,
    message: 'Economy service chưa được kích hoạt. Cấu hình MINECRAFT_API_URL trong .env.',
  };
}

/**
 * Add in-game currency to a Minecraft player's account.
 *
 * This is called AFTER a successful payment is confirmed.
 * The username is always taken from the verified session — never from user input.
 *
 * SECURITY: username must come from server-side session, NOT from client request body.
 *
 * TODO: Adjust endpoint to match your server economy plugin API.
 */
export async function addMoney(
  username: string,
  amount: number,
  transactionId: string
): Promise<MinecraftAddMoneyResult> {
  if (!username?.trim()) {
    return { success: false, message: 'Tên tài khoản không hợp lệ.' };
  }
  if (!amount || amount <= 0) {
    return { success: false, message: 'Số tiền không hợp lệ.' };
  }
  if (!transactionId?.trim()) {
    return { success: false, message: 'Mã giao dịch không hợp lệ.' };
  }

  if (isMinecraftApiConfigured()) {
    try {
      // TODO: Adjust endpoint to match your server economy API
      const res = await fetch(`${MINECRAFT_API_URL}/economy/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': MINECRAFT_API_KEY,
        },
        body: JSON.stringify({
          username: username.trim(),
          amount,
          transactionId: transactionId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Không thể cộng tiền vào tài khoản Minecraft.',
        };
      }

      return {
        success: true,
        username: username.trim(),
        amountAdded: amount,
        newBalance: data.newBalance,
        transactionId: transactionId.trim(),
        message: data.message || `Đã cộng ${amount.toLocaleString('vi-VN')}đ vào tài khoản ${username}.`,
      };
    } catch (err) {
      console.error('[MinecraftEconomyService] addMoney error:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ Minecraft.' };
    }
  }

  // ── MOCK ──────────────────────────────────────────────────────────────────
  // TODO: Remove when MINECRAFT_API_URL is configured
  // NOTE: This does NOT actually add money — it's a placeholder only.
  console.warn(
    `[MinecraftEconomyService] MOCK: addMoney called for ${username} amount=${amount} txId=${transactionId}. ` +
    'Configure MINECRAFT_API_URL in .env to activate real economy integration.'
  );
  return {
    success: false,
    message:
      'Economy service chưa được kích hoạt. Tiền CHƯA được cộng vào tài khoản Minecraft. ' + 'Cấu hình MINECRAFT_API_URL trong .env để kích hoạt.',
  };
  // ── END MOCK ──────────────────────────────────────────────────────────────
}
