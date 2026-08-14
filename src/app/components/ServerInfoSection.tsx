'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import ServerStatusWidget from '@/app/components/ServerStatusWidget';

const serverData = [
  {
    label: 'TÊN MÁY CHỦ',
    value: 'ULAMC',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    highlight: true,
    span: 1,
  },
  {
    label: 'ĐỊA CHỈ MÁY CHỦ',
    value: 'ULAMC.COM',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    highlight: true,
    span: 1,
  },
  {
    label: 'CỔNG KẾT NỐI',
    value: '19132',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
    highlight: false,
    span: 1,
  },
  {
    label: 'THỂ LOẠI',
    value: 'SINH TỒN',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    highlight: true,
    span: 1,
  },
];

export default function ServerInfoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      id="may-chu"
      ref={sectionRef}
      className="relative py-20 sm:py-28 scroll-mt-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="/assets/images/ulamc_server_section.png"
          alt="Cinematic Minecraft survival server spawn area with grand stone castle and lush forests"
          fill
          className="object-cover object-center opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`mb-12 fade-in-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-3">
            THÔNG TIN
          </span>
          <h2 className="text-section-title font-extrabold text-foreground accent-underline">
            MÁY CHỦ
          </h2>
        </div>

        {/* Server Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {serverData?.map((item, index) => (
            <div
              key={item?.label}
              className={`server-info-card rounded-2xl p-6 flex flex-col gap-3 fade-in-up ${
                isVisible ? 'visible' : ''
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${
                item?.highlight
                  ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {item?.icon}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1.5">
                  {item?.label}
                </p>
                <p className={`text-xl font-bold tracking-tight ${
                  item?.highlight ? 'text-primary' : 'text-foreground'
                }`}>
                  {item?.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Card — full width, two platforms clearly listed */}
        <div
          className={`server-info-card rounded-2xl p-6 fade-in-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '320ms' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              NỀN TẢNG
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">🖥️ PC</p>
                <p className="text-sm font-bold text-foreground">Minecraft Java Edition</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">📱 Điện thoại</p>
                <p className="text-sm font-bold text-foreground">Minecraft Bedrock Edition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Server Status Widget */}
        <div
          className={`server-info-card rounded-2xl p-6 fade-in-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              TRẠNG THÁI SERVER
            </p>
          </div>
          <ServerStatusWidget />
        </div>
      </div>
    </section>
  );
}