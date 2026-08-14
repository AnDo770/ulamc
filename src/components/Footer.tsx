import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: Logo + Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Left: Logo + Tagline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <AppLogo height={32} className="w-[130px]" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Minecraft Server Sinh Tồn
            </p>
            <p className="text-xs text-muted-foreground">
              Địa chỉ: <span className="text-primary font-semibold">ULAMC.COM</span> · Cổng: <span className="font-semibold text-foreground">19132</span> · Thể loại: <span className="font-semibold text-foreground">Sinh tồn</span>
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Trang Chủ
            </Link>
            <Link href="/#cach-tham-gia" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Cách Tham Gia
            </Link>
            <Link href="/nap-the" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Nạp Thẻ
            </Link>
            <Link href="/nap-bank" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Nạp Bank
            </Link>
            <a
              href="https://discord.com/invite/b5GAx4baHR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Discord
            </a>
            <Link href="/dang-nhap" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Đăng Nhập
            </Link>
          </div>
        </div>

        {/* Bottom row: Copyright + Publisher */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 ULAMC. Bảo lưu mọi quyền.
          </p>
          <p className="text-xs text-muted-foreground">
            Phát hành bởi{' '}
            <span className="text-foreground font-medium">Đỗ An</span>
            {' '}
            <span className="text-primary font-semibold">(KINZ)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}