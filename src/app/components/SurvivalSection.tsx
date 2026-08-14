'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

const features = [
{
  icon:
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>,

  title: 'Xây Dựng',
  desc: 'Tạo nên công trình của riêng bạn trong thế giới rộng lớn.'
},
{
  icon:
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>,

  title: 'Khám Phá',
  desc: 'Hành trình qua rừng rậm, hang động và đại dương bí ẩn.'
},
{
  icon:
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,

  title: 'Cộng Đồng',
  desc: 'Kết bạn và hợp tác cùng người chơi từ khắp Việt Nam.'
},
{
  icon:
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>,

  title: 'Sinh Tồn',
  desc: 'Vượt qua thử thách mỗi đêm và trở thành người sống sót mạnh nhất.'
}];


export default function SurvivalSection() {
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
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-28 bg-secondary">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layout: 60/40 asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Text (3/5) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className={`fade-in-up ${isVisible ? 'visible' : ''}`}>
              <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-3">
                TÍNH NĂNG
              </span>
              <h2 className="text-section-title font-extrabold text-foreground mb-4 accent-underline">
                SINH TỒN
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Khám phá, xây dựng và sinh tồn trong thế giới ULAMC. Mỗi ngày là một hành trình mới, mỗi đêm là một thử thách khác biệt.
              </p>
            </div>

            {/* Feature Grid: 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features?.map((feat, index) =>
              <div
                key={feat?.title}
                className={`survival-card rounded-xl p-5 flex flex-col gap-3 fade-in-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${100 + index * 80}ms` }}>
                
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                    {feat?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1 tracking-tight">
                      {feat?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feat?.desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Image (2/5) */}
          <div
            className={`lg:col-span-2 order-1 lg:order-2 fade-in ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '200ms' }}>
            
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-black">
              <AppImage
                src="/assets/images/ulamc_join_guide_section.png"
                alt="Minecraft survival gameplay with lush forest landscape, mountains and dramatic sky in cinematic lighting"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Floating badge */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-green flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">ULAMC · Sinh Tồn</p>
                    <p className="text-xs text-muted-foreground">Java & Bedrock Edition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}