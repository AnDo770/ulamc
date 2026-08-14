'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { login } from '@/services/auth';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isSubmitting = loginState === 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double-submit

    if (!username.trim() || !password.trim()) {
      setLoginState('error');
      setErrorMessage('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
      return;
    }

    setLoginState('loading');
    setErrorMessage('');

    // Calls POST /api/auth/login (server-side route — password never logged)
    const result = await login({ username: username.trim(), password });

    if (result.success) {
      setLoginState('success');
    } else {
      setLoginState('error');
      setErrorMessage(result.message || 'Sai tên tài khoản hoặc mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Background image (decorative) */}
      <div className="absolute -inset-8 rounded-3xl overflow-hidden opacity-10 pointer-events-none">
        <AppImage
          src="/assets/images/ulamc_login_section.png"
          alt="Cinematic Minecraft character at spawn entrance"
          fill
          className="object-cover object-center"
          sizes="500px"
        />
      </div>

      <div className="relative z-10 glass-card rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-3">
            TÀI KHOẢN
          </span>
          <h1 className="text-2xl font-extrabold text-foreground">ĐĂNG NHẬP</h1>
          <p className="text-sm text-muted-foreground mt-2">Đăng nhập vào tài khoản ULAMC của bạn.</p>
        </div>

        {/* Success state */}
        {loginState === 'success' && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm font-semibold text-primary">Đăng nhập thành công!</p>
          </div>
        )}

        {/* Error state */}
        {loginState === 'error' && errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Tên tài khoản
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản..."
              autoComplete="username"
              disabled={isSubmitting || loginState === 'success'}
              className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoComplete="current-password"
              disabled={isSubmitting || loginState === 'success'}
              className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm disabled:opacity-60"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loginState === 'success'}
            className="btn-primary py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                ĐANG ĐĂNG NHẬP...
              </>
            ) : loginState === 'success' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ĐÃ ĐĂNG NHẬP
              </>
            ) : (
              'ĐĂNG NHẬP'
            )}
          </button>
        </form>

        {/* Server info */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Server: <span className="text-primary font-bold">ULAMC.COM</span>
            <span className="mx-2 text-border">·</span>
            Cổng: <span className="text-foreground font-semibold">19132</span>
          </p>
        </div>
      </div>
    </div>
  );
}