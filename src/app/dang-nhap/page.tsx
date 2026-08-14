import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/app/dang-nhap/components/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng Nhập',
  description: 'Đăng nhập bằng tài khoản Minecraft của bạn trên server ULAMC để nạp tiền vào game.',
  openGraph: {
    title: 'Đăng Nhập | ULAMC',
    description: 'Đăng nhập bằng tài khoản Minecraft để nạp tiền vào game ULAMC.',
    images: [{ url: '/assets/images/ulamc_login_section.png', alt: 'Đăng nhập ULAMC' }],
  },
};

export default function DangNhapPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
