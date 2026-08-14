/**
 * ULAMC Authentication Service — Minecraft Account Only
 *
 * This website does NOT have its own account system.
 * Login = Minecraft username + Minecraft password verified against the game server.
 *
 * Architecture:
 *   React Component → authService.login() → POST /api/auth/login → Minecraft Server API
 *
 * Session:
 * - Only the Minecraft username is stored in sessionStorage after login.
 * - Passwords are NEVER stored, logged, or returned.
 * - No website profile, no website registration, no website password.
 *
 * TODO: When real Minecraft server API is ready, only update /api/auth/login/route.ts.
 *       This service file stays the same.
 */

import { API_ROUTES } from '@/config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minecraft player session — only the username is needed */
export interface MinecraftSession {
  /** Exact Minecraft username as verified by the game server */
  username: string;
  /** Optional server-issued token for subsequent API calls */
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  username?: string;
  token?: string;
  message?: string;
}

// Legacy aliases (kept for backward compatibility with existing API routes)
export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  createdAt?: string;
}
export type AuthUser = User;
export type AuthResponse = LoginResponse;
export interface AuthSession {
  user: User;
  token: string;
  expiresAt?: string;
}

// ─── Session storage ──────────────────────────────────────────────────────────

const SESSION_KEY = 'ulamc_mc_session';

function saveSession(session: MinecraftSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): MinecraftSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MinecraftSession;
  } catch {
    return null;
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/** Returns the token from the current session (for API Authorization headers) */
export function getToken(): string | null {
  return loadSession()?.token ?? null;
}

/** Returns true if a Minecraft session is active */
export function isAuthenticated(): boolean {
  return !!loadSession();
}

/**
 * Returns the logged-in Minecraft username from session.
 * This is the ONLY source of truth for which account receives in-game currency.
 * Never allow the user to override this value.
 */
export function getMinecraftUsername(): string | null {
  return loadSession()?.username ?? null;
}

// ─── Auth operations ──────────────────────────────────────────────────────────

/**
 * Login with Minecraft credentials.
 * Calls POST /api/auth/login which verifies against the Minecraft server.
 * On success, stores only the username + optional token in sessionStorage.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await fetch(API_ROUTES.AUTH_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password, // forwarded server-side; never stored
      }),
    });

    const data: LoginResponse = await res.json();

    if (data.success && data.username) {
      saveSession({
        username: data.username,
        token: data.token,
      });
    }

    return data;
  } catch {
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
    };
  }
}

/**
 * Logout — clears local session and notifies server to revoke token.
 */
export async function logout(): Promise<void> {
  const session = loadSession();
  clearSession();

  if (session?.token) {
    try {
      await fetch(API_ROUTES.AUTH_LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
      });
    } catch {
      // Non-critical — session already cleared locally
    }
  }
}

/**
 * Get current session info (username only — no profile fetch needed).
 * Returns null if not logged in.
 */
export function getCurrentSession(): MinecraftSession | null {
  return loadSession();
}

/**
 * Verify session is still valid by calling GET /api/auth/me.
 * Falls back to local session if server is unavailable.
 */
export async function verifySession(): Promise<MinecraftSession | null> {
  const session = loadSession();
  if (!session) return null;

  if (!session.token) return session; // no token to verify — trust local session

  try {
    const res = await fetch(API_ROUTES.AUTH_ME, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session.token}` },
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    // Network error — keep local session
    return session;
  }
}

// Legacy compat
export async function getCurrentUser(): Promise<User | null> {
  const session = loadSession();
  if (!session) return null;
  return {
    id: session.username,
    username: session.username,
    displayName: session.username,
  };
}