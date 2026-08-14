'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ServerStatusData {
  status: 'online' | 'maintenance' | 'unknown';
  playersOnline: number;
  isMock: boolean;
  fetchedAt: string;
}

/** Auto-refresh interval in milliseconds (30 seconds) */
const REFRESH_INTERVAL_MS = 30_000;

export default function ServerStatusWidget() {
  const [data, setData] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/server/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('API error');
      const json: ServerStatusData = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 30 seconds — no page reload needed
  useEffect(() => {
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50 border border-border animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <div className="h-3 w-28 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  // ─── API error / unknown state ─────────────────────────────────────────────
  if (error || !data || data.status === 'unknown') {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border">
        <span className="text-base leading-none flex-shrink-0" aria-hidden="true">⚪</span>
        <span className="text-xs font-semibold text-muted-foreground">
          Không thể kiểm tra trạng thái server
        </span>
      </div>
    );
  }

  // ─── Online state ──────────────────────────────────────────────────────────
  if (data.status === 'online') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/25">
          <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">🟢</span>
          <span className="text-xs font-bold text-green-400 whitespace-nowrap">
            Server đang hoạt động
          </span>
          {data.isMock && (
            <span className="text-[10px] font-semibold text-muted-foreground/60 ml-1 hidden sm:inline">
              [MOCK]
            </span>
          )}
        </div>

        {/* Players badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">👥</span>
          <span className="text-xs font-bold text-primary whitespace-nowrap">
            {data.isMock
              ? 'Đang cập nhật...'
              : `${data.playersOnline} người đang online`}
          </span>
        </div>
      </div>
    );
  }

  // ─── Maintenance state ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      {/* Status badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/25">
        <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">🟠</span>
        <span className="text-xs font-bold text-orange-400 whitespace-nowrap">
          Server đang bảo trì
        </span>
        {data.isMock && (
          <span className="text-[10px] font-semibold text-muted-foreground/60 ml-1 hidden sm:inline">
            [MOCK]
          </span>
        )}
      </div>

      {/* Players badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
        <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">👥</span>
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
          0 người đang online
        </span>
      </div>
    </div>
  );
}
