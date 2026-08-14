'use client';

import React, { useState } from 'react';
import type { CardType, Denomination } from '@/services/cardTopup';
import {
  CARD_TYPE_LABELS,
  DENOMINATION_LABELS,
  submitCardTopup,
} from '@/services/cardTopup';
import { getToken } from '@/services/auth';

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
    if (isSubmitting) return; // prevent double-submit
    if (!validate() || !selectedDenom) return;

    setSubmitState('loading');
    setErrors({});

    const token = getToken() || '';

    // Calls POST /api/topup/card (server-side — API key never exposed to client)
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
        {transactionId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border mb-6">
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
      {/* General Error */}
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

      {/* Card Type */}
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

      {/* Denomination */}
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

      {/* Card Code */}
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

      {/* Serial Number */}
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

      {/* Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted border border-border">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Thẻ sẽ được xử lý tự động. Không nhập thẻ đã sử dụng hoặc thông tin sai. Chúng tôi không chịu trách nhiệm với thẻ nhập sai.
        </p>
      </div>

      {/* Submit */}
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