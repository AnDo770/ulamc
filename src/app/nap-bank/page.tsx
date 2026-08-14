import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BankTopup from '@/app/nap-bank/components/BankTopup';

export const metadata: Metadata = {
  title: 'Nạp Bank',
  description: 'Nạp tiền trực tiếp qua ngân hàng để nhận xu trong game ULAMC - Minecraft Server Sinh Tồn.',
  openGraph: {
    title: 'Nạp Bank | ULAMC',
    description: 'Nạp tiền qua ngân hàng để nhận xu trong game ULAMC.',
    images: [{ url: '/assets/images/ulamc_bank_topup_section.png', alt: 'Nạp bank ULAMC' }],
  },
};

export default function NapBankPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-24">
        <div className="max-w-2xl mx-auto">
          {/* Page Header — image fills full card, text overlay */}
          <div className="relative mb-10 rounded-2xl overflow-hidden border-2 border-black h-[160px] sm:h-[180px]">
            <img
              src="/assets/images/ulamc_bank_topup_section.png"
              alt="Cinematic Minecraft trading scene with villager merchant and emerald blocks"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark gradient overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            {/* Text content on top of image */}
            <div className="relative z-10 p-5 sm:p-6 h-full flex flex-col justify-end">
              <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-2">
                TÀI KHOẢN
              </span>
              <h1 className="text-2xl sm:text-section-title font-extrabold text-white">
                NẠP BANK
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
                Nạp tiền trực tiếp qua ngân hàng để nhận xu trong game ULAMC.
              </p>
            </div>
          </div>

          <BankTopup />
        </div>
      </main>
      <Footer />
    </div>
  );
}
