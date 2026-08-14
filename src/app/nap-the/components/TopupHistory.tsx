'use client';

import React from 'react';

export default function TopupHistory() {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h2 className="text-base font-bold text-foreground tracking-tight mb-6 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        LỊCH SỬ NẠP THẺ
      </h2>

      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Chưa có giao dịch nào
        </p>
        <p className="text-xs text-muted-foreground/60">
          Lịch sử nạp thẻ sẽ hiển thị tại đây khi API được kích hoạt.
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Thành công</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Đang xử lý</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Thất bại</span>
        </div>
      </div>
    </div>
  );
}
