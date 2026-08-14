'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import OpenMinecraftButton from '@/components/ui/OpenMinecraftButton';

type TabType = 'mobile' | 'pc';

interface Step {
  num: string;
  title: string;
  desc: string;
}

const peSteps: Step[] = [
  { num: '01', title: 'Mở Minecraft', desc: 'Mở Minecraft trên điện thoại.' },
  { num: '02', title: 'Chọn Chơi', desc: 'Chọn Chơi.' },
  { num: '03', title: 'Chọn Máy chủ', desc: 'Chọn Máy chủ.' },
  { num: '04', title: 'Thêm máy chủ', desc: 'Chọn Thêm máy chủ.' },
  { num: '05', title: 'Nhập địa chỉ', desc: 'Nhập địa chỉ: ULAMC.COM' },
  { num: '06', title: 'Nhập cổng', desc: 'Nhập cổng: 19132' },
  { num: '07', title: 'Tham gia', desc: 'Lưu và tham gia ULAMC.' },
];

const pcSteps: Step[] = [
  { num: '01', title: 'Mở Minecraft', desc: 'Mở Minecraft trên máy tính.' },
  { num: '02', title: 'Chọn Chơi', desc: 'Chọn Chơi.' },
  { num: '03', title: 'Chọn Máy chủ', desc: 'Chọn Máy chủ.' },
  { num: '04', title: 'Thêm máy chủ', desc: 'Chọn Thêm máy chủ.' },
  { num: '05', title: 'Nhập địa chỉ', desc: 'Nhập địa chỉ: ULAMC.COM' },
  { num: '06', title: 'Lưu và tham gia', desc: 'Lưu máy chủ và tham gia ULAMC.' },
];

function renderDesc(text: string) {
  if (text.includes('ULAMC.COM')) {
    const parts = text.split('ULAMC.COM');
    return (
      <>
        {parts[0]}
        <span className="text-primary font-bold">ULAMC.COM</span>
        {parts[1]}
      </>
    );
  }
  if (text.includes('19132')) {
    const parts = text.split('19132');
    return (
      <>
        {parts[0]}
        <span className="text-primary font-bold">19132</span>
        {parts[1]}
      </>
    );
  }
  if (text.includes('ULAMC.')) {
    const parts = text.split('ULAMC.');
    return (
      <>
        {parts[0]}
        <span className="text-primary font-bold">ULAMC.</span>
        {parts[1]}
      </>
    );
  }
  return text;
}

export default function JoinGuideSection() {
  const [activeTab, setActiveTab] = useState<TabType>('mobile');
  const [copied, setCopied] = useState(false);
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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCopyIP = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('ULAMC.COM');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = 'ULAMC.COM';
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  const currentSteps = activeTab === 'mobile' ? peSteps : pcSteps;
  const tabTitle = activeTab === 'mobile' ? 'CÁCH THAM GIA ĐIỆN THOẠI' : 'CÁCH THAM GIA PC';
  const tabSubtitle = activeTab === 'mobile' ? '📱 Minecraft Bedrock Edition' : '🖥️ Minecraft Java Edition';

  return (
    <section
      id="cach-tham-gia"
      ref={sectionRef}
      className="relative py-20 sm:py-28 scroll-mt-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="/assets/images/ulamc_join_guide_section.png"
          alt="Cinematic Minecraft character explorer overlooking a vast survival world at sunset"
          fill
          className="object-cover object-center opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-10 fade-in-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-3">
            HƯỚNG DẪN
          </span>
          <h2 className="text-section-title font-extrabold text-foreground accent-underline">
            CÁCH THAM GIA
          </h2>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-2 mb-8 p-1 bg-muted rounded-xl w-full max-w-xs fade-in-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '80ms' }}
        >
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold tracking-widest rounded-lg transition-all duration-200 uppercase ${
              activeTab === 'mobile' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            ĐIỆN THOẠI
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold tracking-widest rounded-lg transition-all duration-200 uppercase ${
              activeTab === 'pc' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            PC
          </button>
        </div>

        {/* Steps Card */}
        <div
          className={`glass-card rounded-2xl p-6 sm:p-8 mb-6 fade-in-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '160ms' }}
        >
          {/* Tab title */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground tracking-wide uppercase">
              {tabTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{tabSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentSteps.map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="step-badge flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold">
                  {item.num}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground mb-0.5 truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words">
                    {renderDesc(item.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Info */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Địa chỉ:</span>
                <span className="font-bold text-primary text-sm">ULAMC.COM</span>
              </div>
              {activeTab === 'mobile' && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Cổng:</span>
                  <span className="font-bold text-foreground text-sm">19132</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Thể loại:</span>
                <span className="font-bold text-primary text-sm">Sinh tồn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 fade-in-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '240ms' }}
        >
          <OpenMinecraftButton size="md" />

          <button
            onClick={handleCopyIP}
            className="btn-secondary flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ĐÃ SAO CHÉP IP!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                SAO CHÉP IP
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}