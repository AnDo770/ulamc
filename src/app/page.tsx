import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import ServerInfoSection from '@/app/components/ServerInfoSection';
import SurvivalSection from '@/app/components/SurvivalSection';
import JoinGuideSection from '@/app/components/JoinGuideSection';
import DiscordSection from '@/app/components/DiscordSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServerInfoSection />
        <SurvivalSection />
        <JoinGuideSection />
        <DiscordSection />
      </main>
      <Footer />
    </div>
  );
}