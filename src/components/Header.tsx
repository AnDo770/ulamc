'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { isAuthenticated, getMinecraftUsername, logout } from '@/services/auth';

const navLinks = [
  { label: 'TRANG CHỦ', href: '/' },
  { label: 'MÁY CHỦ', href: '/#may-chu' },
  { label: 'CÁCH THAM GIA', href: '/#cach-tham-gia' },
  { label: 'NẠP THẺ', href: '/nap-the' },
  { label: 'NẠP BANK', href: '/nap-bank' },
  { label: 'DISCORD', href: 'https://discord.com/invite/b5GAx4baHR', external: true },
];

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mcUsername, setMcUsername] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Read session on mount and whenever storage changes (e.g. after login/logout)
  useEffect(() => {
    const readSession = () => {
      setLoggedIn(isAuthenticated());
      setMcUsername(getMinecraftUsername());
    };
    readSession();

    // Listen for storage events so header updates when login/logout happens in another tab
    window.addEventListener('storage', readSession);
    return () => window.removeEventListener('storage', readSession);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setMcUsername(null);
    setIsMobileMenuOpen(false);
    router?.push('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-nav' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <AppLogo
                height={36}
                className="transition-transform duration-300 group-hover:scale-105 w-[140px] sm:w-[150px] md:w-[160px]"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks?.map((link) =>
                link?.external ? (
                  <a
                    key={link?.label}
                    href={link?.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-semibold tracking-widest text-muted-foreground hover:text-primary transition-colors duration-200 uppercase"
                  >
                    {link?.label}
                  </a>
                ) : (
                  <Link
                    key={link?.label}
                    href={link?.href}
                    className="px-3 py-2 text-xs font-semibold tracking-widest text-muted-foreground hover:text-primary transition-colors duration-200 uppercase"
                  >
                    {link?.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop Auth Area */}
            <div className="hidden md:flex items-center gap-3">
              {loggedIn && mcUsername ? (
                <>
                  {/* Logged-in state: show username + logout */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-xs font-bold text-primary max-w-[120px] truncate">{mcUsername}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-semibold tracking-widest uppercase btn-secondary rounded-lg"
                  >
                    ĐĂNG XUẤT
                  </button>
                </>
              ) : (
                <Link
                  href="/dang-nhap"
                  className="px-4 py-2 text-xs font-semibold tracking-widest uppercase btn-secondary rounded-lg"
                >
                  ĐĂNG NHẬP
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg hover:bg-muted transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 mobile-menu-overlay flex flex-col transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <AppLogo height={32} className="w-[130px]" />
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 pt-8 gap-1">
          {navLinks?.map((link) =>
            link?.external ? (
              <a
                key={link?.label}
                href={link?.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMobileLinkClick}
                className="py-4 text-sm font-semibold tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-border uppercase"
              >
                {link?.label}
              </a>
            ) : (
              <Link
                key={link?.label}
                href={link?.href}
                onClick={handleMobileLinkClick}
                className="py-4 text-sm font-semibold tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-border uppercase"
              >
                {link?.label}
              </Link>
            )
          )}

          {/* Mobile auth section */}
          {loggedIn && mcUsername ? (
            <>
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Đã đăng nhập</p>
                  <p className="text-sm font-bold text-primary truncate">{mcUsername}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 py-4 text-center text-sm font-bold tracking-widest uppercase btn-secondary rounded-xl"
              >
                ĐĂNG XUẤT
              </button>
            </>
          ) : (
            <Link
              href="/dang-nhap"
              onClick={handleMobileLinkClick}
              className="mt-6 py-4 text-center text-sm font-bold tracking-widest uppercase btn-secondary rounded-xl"
            >
              ĐĂNG NHẬP
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}