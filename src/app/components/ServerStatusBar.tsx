'use client';

import React from 'react';
import ServerStatusWidget from './ServerStatusWidget';

/**
 * ServerStatusBar — slim full-width strip displayed immediately below the Header.
 * Shows only: server status (online / maintenance / unknown) + players online.
 * Auto-refreshes every 30 s via ServerStatusWidget.
 */
export default function ServerStatusBar() {
  return (
    <div className="w-full bg-background/95 border-b border-border/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center sm:justify-start">
        <ServerStatusWidget />
      </div>
    </div>
  );
}
