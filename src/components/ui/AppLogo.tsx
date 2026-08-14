'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';

interface AppLogoProps {
  className?: string;
  onClick?: () => void;
  /** Width in px for the logo image. Defaults to 160 (desktop). */
  width?: number;
  /** Height in px for the logo image. Defaults to 40. */
  height?: number;
}

const AppLogo = memo(function AppLogo({
  className = '',
  onClick,
  width = 160,
  height = 40,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <Image
        src="/assets/logo.svg"
        alt="ULAMC.COM"
        width={width}
        height={height}
        priority
        unoptimized
        style={{ width: 'auto', height: `${height}px` }}
      />
    </div>
  );
});

export default AppLogo;
