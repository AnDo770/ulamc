'use client';

import React, { useState, useEffect } from 'react';
import type { CardType, Denomination } from '@/services/cardTopup';
import {
  CARD_TYPE_LABELS,
  DENOMINATION_LABELS,
  submitCardTopup,
} from '@/services/cardTopup';
import { getToken, getMinecraftUsername, isAuthenticated } from '@/services/auth';
import Link from 'next/link';

const CARD_TYPES: CardType[] = ['VIETTEL', 'VINAPHONE', 'MOBIFONE'];
const DENOMINATIONS: Denomination[] = [10000, 20000, 50000, 100000, 200000, 500000];

type SubmitState = 'idle' | 'loading' | 'submitted';

interface FormErrors {
  cardCode?: string;
  serialNumber?: string;
  general?: string;
}

export default function TopupForm() {
  const [selectedCardType, setSelectedCardType] = useState<CardType>('VIETTEL');
  const [selectedDenom, setSelectedDenom] = useState<Denomination | null>(null);
  const [cardCode, setCardCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [resultMessage, setResultMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [mcUsername, setMcUsername] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const username = getMinecraftUsername();
    setMcUsername(username);
    setLoggedIn(isAuthenticated());
  }, []);

  const isSubmitting = submitState === 'loading';

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!cardCode.trim()) newErrors.cardCode = 'Vui lòng nhập mã thẻ.';
    if (!serialNumber.trim()) newErrors.serialNumber = 'Vui lòng nhập số serial.';
    if (!selectedDenom) newErrors.general = 'Vui lòng chọn mệnh giá.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate() || !selectedDenom) return;

    if (!loggedIn || !mcUsername) {
      setErrors({ general: 'Bạn cần đăng nhập bằng tài khoản Minecraft trước khi nạp thẻ.' });
      return;
    }

    setSubmitState('loading');
    setErrors({});

    const token = getToken() || '';

    const result = await submitCardTopup(
      {
        cardType: selectedCardType,
        denomination: selectedDenom,
        cardCode: cardCode.trim(),
        serialNumber: serialNumber.trim(),
      },
      token
    );

    if (result.success) {
      setTransactionId(result.transactionId || '');
      setResultMessage(result.message || 'Thẻ đang được xử lý.');
      setSubmitState('submitted');
    } else {
      setErrors({ general: result.message || 'Nạp thẻ thất bại.' });
      setSubmitState('idle');
    }
  };

  const handleReset = () => {
    setSubmitState('idle');
    setCardCode('');
    setSerialNumber('');
    setSelectedDenom(null);
    setResultMessage('');
    setTransactionId('');
    setErrors({});
  };

  // Not logged in — show login prompt
  if (!loggedIn || !mcUsername) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-base font-bold text-foreground mb-2">Chưa đăng nhập</p>
        <p className="text-sm text-muted-foreground mb-6">
          Bạn cần đăng nhập bằng tài khoản Minecraft để nạp thẻ.
          Tiền sẽ được cộng vào đúng tài khoản đã đăng nhập.
        </p>
        <Link href="/dang-nhap" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase inline-block">
          ĐĂNG NHẬP MINECRAFT
        </Link>
      </div>
    );
  }

  if (submitState === 'submitted') {
    return (
      <div className="glass-card rounded-2xl p-8 text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-base font-bold text-foreground mb-2">Đã gửi yêu cầu nạp thẻ</p>
        <p className="text-sm text-muted-foreground mb-3">{resultMessage}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 mb-3">
          <span className="text-xs text-muted-foreground">Tài khoản nhận:</span>
          <span className="text-xs font-bold text-primary">{mcUsername}</span>
        </div>
        {transactionId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border mb-6 ml-2">
            <span className="text-xs text-muted-foreground">Mã GD:</span>
            <span className="text-xs font-bold text-foreground font-mono">{transactionId}</span>
          </div>
        )}
        <div>
          <button
            onClick={handleReset}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            NẠP THẺ KHÁC
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6 mb-8" noValidate>
      {/* Logged-in account badge — locked, cannot be changed */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Tài khoản nhận tiền</p>
          <p className="text-sm font-bold text-primary truncate">{mcUsername}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-1 rounded-md border border-border">Đã xác thực</span>
        </div>
      </div>

      {errors.general && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-xs text-red-400 font-medium">{errors.general}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">LOẠI THẺ</label>
        <div className="grid grid-cols-3 gap-2">
          {CARD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelectedCardType(type)}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 ${
                selectedCardType === type ? 'card-type-btn-active' : 'card-type-btn'
              }`}
            >
              {CARD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">MỆNH GIÁ</label>
        <div className="grid grid-cols-3 gap-2">
          {DENOMINATIONS.map((denom) => (
            <button
              key={denom}
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSelectedDenom(denom);
                if (errors.general?.includes('mệnh giá')) {
                  setErrors((prev) => ({ ...prev, general: undefined }));
                }
              }}
              className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 ${
                selectedDenom === denom ? 'denom-btn-active' : 'denom-btn'
              }`}
            >
              {DENOMINATION_LABELS[denom]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cardCode" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">MÃ THẺ</label>
        <input
          id="cardCode"
          type="text"
          value={cardCode}
          onChange={(e) => {
            setCardCode(e.target.value);
            if (errors.cardCode) setErrors((prev) => ({ ...prev, cardCode: undefined }));
          }}
          placeholder="Nhập mã thẻ"
          autoComplete="off"
          disabled={isSubmitting}
          className={`input-field rounded-xl px-4 py-3 text-sm w-full font-mono tracking-widest disabled:opacity-60 ${
            errors.cardCode ? 'border-red-500/50' : ''
          }`}
        />
        {errors.cardCode && <p className="text-xs text-red-400">{errors.cardCode}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="serialNumber" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">SỐ SERIAL</label>
        <input
          id="serialNumber"
          type="text"
          value={serialNumber}
          onChange={(e) => {
            setSerialNumber(e.target.value);
            if (errors.serialNumber) setErrors((prev) => ({ ...prev, serialNumber: undefined }));
          }}
          placeholder="Nhập số serial"
          autoComplete="off"
          disabled={isSubmitting}
          className={`input-field rounded-xl px-4 py-3 text-sm w-full font-mono tracking-widest disabled:opacity-60 ${
            errors.serialNumber ? 'border-red-500/50' : ''
          }`}
        />
        {errors.serialNumber && <p className="text-xs text-red-400">{errors.serialNumber}</p>}
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted border border-border">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Thẻ sẽ được xử lý tự động. Tiền sẽ được cộng vào tài khoản <span className="font-bold text-foreground">{mcUsername}</span>. Không nhập thẻ đã sử dụng hoặc thông tin sai.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            ĐANG NẠP THẺ...
          </>
        ) : (
          'NẠP THẺ'
        )}
      </button>
    </form>
  );
}
