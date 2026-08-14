import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import ScrollToTop from '../components/ui/ScrollToTop';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ULAMC - Minecraft Server Sinh Tồn',
    template: '%s | ULAMC',
  },
  description: 'Tham gia ULAMC - Minecraft server sinh tồn. Địa chỉ: ULAMC.COM, cổng: 19132. Khám phá, xây dựng và sinh tồn trong thế giới ULAMC.',
  keywords: ['ULAMC', 'Minecraft', 'server sinh tồn', 'Minecraft Java Edition', 'Minecraft Bedrock Edition', 'ULAMC.COM'],
  openGraph: {
    title: 'ULAMC - Minecraft Server Sinh Tồn',
    description: 'Tham gia ULAMC - Minecraft server sinh tồn. Địa chỉ: ULAMC.COM, cổng: 19132.',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'ULAMC Minecraft Server',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ULAMC - Minecraft Server Sinh Tồn',
    description: 'Tham gia ULAMC - Minecraft server sinh tồn hỗ trợ Java & Bedrock Edition. IP: ULAMC.COM, Port: 19132.',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        {children}
        <ScrollToTop />
</body>
    </html>
  );
}