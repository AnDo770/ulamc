'use client';

import React, { useState } from 'react';

type BankAmount = 10000 | 20000 | 50000 | 100000 | 200000 | 500000;

const AMOUNTS: BankAmount[] = [10000, 20000, 50000, 100000, 200000, 500000];

function formatAmount(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

type FormState = 'idle' | 'loading' | 'pending';

export default function BankTopupForm() {
  const [selectedAmount, setSelectedAmount] = useState<BankAmount | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [amountError, setAmountError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmount) {
      setAmountError('Vui lòng chọn số tiền.');
      return;
    }
    setAmountError('');
    setFormState('loading');
    // Simulate API call delay then show pending state
    setTimeout(() => {
      setFormState('pending');
    }, 800);
  };

  const handleReset = () => {
    setFormState('idle');
    setSelectedAmount(null);
    setAmountError('');
  };

  if (formState === 'pending') {
    return (
      <div className="glass-card rounded-2xl p-8 text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-base font-bold text-foreground mb-2">Hệ thống thanh toán đang được cập nhật</p>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          Chức năng nạp bank sẽ sớm được kích hoạt. Vui lòng thử lại sau hoặc sử dụng phương thức nạp thẻ.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Số tiền đã chọn: <span className="text-foreground font-semibold">{selectedAmount ? formatAmount(selectedAmount) : ''}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReset}
            className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            QUAY LẠI
          </button>
          <a
            href="/nap-the"
            className="btn-primary px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase text-center"
          >
            NẠP THẺ THAY THẾ
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6 mb-8" noValidate>
      {/* Amount Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          SỐ TIỀN
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setAmountError('');
              }}
              className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-150 text-center ${
                selectedAmount === amount ? 'denom-btn-active' : 'denom-btn'
              }`}
            >
              {formatAmount(amount)}
            </button>
          ))}
        </div>
        {amountError && (
          <p className="text-xs text-red-400">{amountError}</p>
        )}
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted border border-border">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sau khi tạo giao dịch, thông tin ngân hàng và mã QR sẽ được hiển thị để bạn thực hiện chuyển khoản. Giao dịch sẽ được xác nhận tự động sau khi nhận được tiền.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={formState === 'loading'}
        className="btn-primary py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {formState === 'loading' ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            ĐANG XỬ LÝ...
          </>
        ) : (
          'TẠO GIAO DỊCH'
        )}
      </button>
    </form>
  );
}
