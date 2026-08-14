/**
 * ULAMC Server Status Service
 *
 * Architecture:
 *   Frontend (ServerStatusWidget)
 *     ↓
 *   GET /api/server/status  (Next.js API route — server-side)
 *     ↓
 *   serverStatus.ts (this file — fetches from real API or returns mock)
 *     ↓
 *   External Minecraft Status API (configured via SERVER_STATUS_API_URL)
 *
 * ─── HOW TO CONNECT REAL API ─────────────────────────────────────────────────
 * 1. Set SERVER_STATUS_API_URL in your .env file
 * 2. (Optional) Set SERVER_STATUS_API_KEY if your API requires authentication
 * 3. Replace the body of fetchRealServerStatus() below with your actual API call
 * 4. Ensure your API returns at minimum: { status, playersOnline }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Server operational status */
export type ServerStatus = 'online' | 'maintenance' | 'unknown';

/** Minimal response shape returned by GET /api/server/status */
export interface ServerStatusResponse {
  /** "online" = server is running, "maintenance" = under maintenance, "unknown" = API unreachable */
  status: ServerStatus;
  /** Number of players currently online. 0 when maintenance or unknown. */
  playersOnline: number;
  /** Whether this data comes from mock (true) or a real API (false) */
  isMock: boolean;
  /** ISO timestamp of when this data was fetched */
  fetchedAt: string;
}

// ─── Environment config (server-side only) ────────────────────────────────────

const SERVER_STATUS_API_URL = process.env.SERVER_STATUS_API_URL || '';
const SERVER_STATUS_API_KEY = process.env.SERVER_STATUS_API_KEY || '';

// ─── Mock data ────────────────────────────────────────────────────────────────

/**
 * ⚠️  MOCK DATA — NOT REAL SERVER DATA
 *
 * This is placeholder data used while SERVER_STATUS_API_URL is not configured.
 * The number of players shown here is FAKE and does NOT reflect the actual
 * number of players on the ULAMC server.
 *
 * Replace this by configuring SERVER_STATUS_API_URL in your .env file.
 */
const MOCK_SERVER_STATUS: Omit<ServerStatusResponse, 'fetchedAt'> = {
  status: 'online',
  playersOnline: 0, // ← MOCK VALUE — not real player count
  isMock: true,
};

// ─── Real API fetcher (implement when API is ready) ───────────────────────────

/**
 * Fetches server status from the real external API.
 *
 * TODO: Implement this function when SERVER_STATUS_API_URL is configured.
 *
 * Expected response from your API:
 * {
 *   "status": "online" | "maintenance",
 *   "playersOnline": number
 * }
 */
async function fetchRealServerStatus(): Promise<ServerStatusResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if API key is configured
  if (SERVER_STATUS_API_KEY) {
    headers['Authorization'] = `Bearer ${SERVER_STATUS_API_KEY}`;
    // Or use: headers['X-API-Key'] = SERVER_STATUS_API_KEY;
    // Adjust to match your API's authentication scheme.
  }

  const response = await fetch(SERVER_STATUS_API_URL, {
    method: 'GET',
    headers,
    // Cache for 30 seconds to avoid hammering the API
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Server status API responded with HTTP ${response.status}`);
  }

  const data = await response.json();

  // Map your API's response shape to ServerStatusResponse
  // Adjust field names below to match your actual API response
  return {
    status: data.status === 'online' ? 'online' : 'maintenance',
    playersOnline: typeof data.playersOnline === 'number' ? data.playersOnline : 0,
    isMock: false,
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the current server status.
 *
 * - If SERVER_STATUS_API_URL is configured → calls the real API (server-side only)
 * - If not configured → returns clearly-labeled MOCK data
 * - If the real API fails → returns status "unknown" (never fakes "online")
 */
export async function getServerStatus(): Promise<ServerStatusResponse> {
  const fetchedAt = new Date().toISOString();

  // Return mock data when real API is not configured
  if (!SERVER_STATUS_API_URL) {
    return { ...MOCK_SERVER_STATUS, fetchedAt };
  }

  try {
    return await fetchRealServerStatus();
  } catch (error) {
    // ⚠️  API unreachable — return "unknown", NEVER fake "online"
    console.error('[serverStatus] Failed to fetch real server status:', error);
    return {
      status: 'unknown',
      playersOnline: 0,
      isMock: false,
      fetchedAt,
    };
  }
}

/**
 * Returns true when the real server status API is configured.
 */
export function isServerStatusApiConfigured(): boolean {
  return Boolean(SERVER_STATUS_API_URL);
}
