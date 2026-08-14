/**
 * GET /api/server/status
 *
 * Internal API route — called by the frontend ServerStatusWidget.
 * This route runs server-side, so SERVER_STATUS_API_KEY is never exposed
 * to the browser.
 *
 * Response:
 * {
 *   "status": "online" | "maintenance" | "unknown",
 *   "playersOnline": number,
 *   "isMock": boolean,
 *   "fetchedAt": string (ISO 8601)
 * }
 */

import { NextResponse } from 'next/server';
import { getServerStatus } from '@/services/serverStatus';

export async function GET() {
  try {
    const data = await getServerStatus();
    return NextResponse?.json(data, {
      status: 200,
      headers: {
        // Allow client to cache for up to 30 seconds
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[/api/server/status] Unexpected error:', error);
    return NextResponse?.json(
      {
        status: 'unknown',
        playersOnline: 0,
        isMock: false,
        fetchedAt: new Date()?.toISOString(),
      },
      { status: 200 } // Return 200 so the widget can display "unknown" gracefully
    );
  }
}
