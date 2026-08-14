'use client';

import React from 'react';
import { useMinecraftLauncher } from '@/hooks/useMinecraftLauncher';

interface OpenMinecraftButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function OpenMinecraftButton({ className = '', size = 'md' }: OpenMinecraftButtonProps) {
  const { launch, reset, launchState, deviceType, javaServer, bedrockServer, bedrockPort } =
    useMinecraftLauncher();

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const isAttempting = launchState === 'attempting';

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={launch}
        disabled={isAttempting}
        className={`btn-primary flex items-center justify-center gap-2.5 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 w-full sm:w-auto ${sizeClasses[size]} ${
          isAttempting ? 'opacity-70 cursor-wait' : ''
        } ${className}`}
        aria-label="Mở Minecraft"
      >
        {isAttempting ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            ĐANG MỞ...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12l4 6-10 13L2 9z" />
              <path d="M11 3L8 9l4 13 4-13-3-6" />
              <path d="M2 9h20" />
            </svg>
            🎮 MỞ MINECRAFT
          </>
        )}
      </button>

      {/* Fallback message */}
      {launchState === 'fallback' && (
        <div className="p-4 rounded-xl bg-muted border border-border animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-2">
                ⚠️ Không thể tự động mở Minecraft
              </p>
              {deviceType === 'pc' ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hãy mở Minecraft Launcher và nhập địa chỉ máy chủ:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">IP:</span>
                    <span className="text-sm font-bold text-primary">{javaServer}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (🖥️ Minecraft Java Edition)
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hãy mở Minecraft và thêm máy chủ thủ công:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">IP:</span>
                    <span className="text-sm font-bold text-primary">{bedrockServer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Port:</span>
                    <span className="text-sm font-bold text-foreground">{bedrockPort}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (📱 Minecraft Bedrock Edition)
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={reset}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
              aria-label="Đóng thông báo"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
