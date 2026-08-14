'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="/assets/images/ulamc_server_section.png"
          alt="Cinematic Minecraft survival world with forests, mountains, and adventure atmosphere in warm cinematic lighting"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Layered overlays for cinematic effect */}
      <div className="absolute inset-0 z-[1] hero-overlay" />
      <div className="absolute inset-0 z-[2] hero-vignette" />

      {/* Subtle top gradient to blend with nav */}
      <div className="absolute top-0 left-0 right-0 h-32 z-[3] bg-gradient-to-b from-background/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        {/* Category Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full step-badge mb-8 text-xs font-bold tracking-widest uppercase"
          style={{ animationDelay: '0ms', animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0ms forwards', opacity: 0 }}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-green" />
          JAVA · BEDROCK · SINH TỒN
        </div>

        {/* Main Title */}
        <h1
          className="text-hero-xl font-extrabold text-foreground tracking-tight mb-4"
          style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 100ms forwards', opacity: 0 }}>
          <span className="text-primary ip-glow">ULAMC</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-base sm:text-lg font-medium text-muted-foreground tracking-wide uppercase mb-10"
          style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms forwards', opacity: 0 }}>
          BƯỚC VÀO THẾ GIỚI ULAMC
        </p>

        {/* IP Display Card */}
        <div
          className="glass-card rounded-2xl mx-auto w-full max-w-sm sm:max-w-md"
          style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 300ms forwards', opacity: 0 }}>
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
              ĐỊA CHỈ MÁY CHỦ
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-primary ip-glow leading-none mb-3 break-all">
              ULAMC.COM
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                CỔNG: <span className="text-foreground font-bold">19132</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-sm font-bold tracking-widest text-primary uppercase">
                SINH TỒN
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
