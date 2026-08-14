'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createBankTransaction, getBankTransactionStatus } from '@/services/bankTopup';
import type { BankTopupResponse, BankTransactionStatus } from '@/services/bankTopup';
import { getToken, getMinecraftUsername, isAuthenticated } from '@/services/auth';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type FlowState = 'input' | 'loading' | 'qr';

const EXAMPLE_AMOUNTS = [50000, 100000, 150000, 250000, 500000];

// ─── Transfer Content Preview ─────────────────────────────────────────────────
/**
 * Displays the transfer content (= Minecraft username from session) as read-only.
 * Includes a copy button. User cannot edit this value.
 */
function TransferContentPreview({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(username);
    } catch {
      const el = document.createElement('textarea');
      el.value = username;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [username]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Nội dung chuyển khoản
      </p>
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted border border-border">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nhập chính xác nội dung này khi chuyển khoản
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide transition-all hover:bg-primary/20"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ĐÃ SAO CHÉP
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              SAO CHÉP
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── QR Display ───────────────────────────────────────────────────────────────
function QRDisplay({
  data,
  mcUsername,
  onReset,
}: {
  data: BankTopupResponse;
  mcUsername: string;
  onReset: () => void;
}) {
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [txStatus, setTxStatus] = useState<BankTransactionStatus>('PENDING');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll transaction status every 5 seconds
  useEffect(() => {
    if (!data.transactionId) return;

    const poll = async () => {
      const token = getToken() || '';
      const res = await getBankTransactionStatus(data.transactionId!, token);
      if (res.success && res.status) {
        setTxStatus(res.status);
        if (res.status === 'SUCCESS' || res.status === 'FAILED' || res.status === 'EXPIRED') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }
    };

    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data.transactionId]);

  const handleCopy = useCallback(async (text: string, type: 'content' | 'txid') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    if (type === 'content') {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } else {
      setCopiedTxId(true);
      setTimeout(() => setCopiedTxId(false), 2000);
    }
  }, []);

  const statusConfig: Record<BankTransactionStatus, { label: string; color: string; pulse: boolean }> = {
    PENDING: { label: 'ĐANG CHỜ THANH TOÁN', color: 'text-primary', pulse: true },
    SUCCESS: { label: 'THANH TOÁN THÀNH CÔNG', color: 'text-green-400', pulse: false },
    FAILED: { label: 'GIAO DỊCH THẤT BẠI', color: 'text-red-400', pulse: false },
    EXPIRED: { label: 'GIAO DỊCH HẾT HẠN', color: 'text-yellow-400', pulse: false },
  };

  const sc = statusConfig[txStatus];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          {sc.pulse && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
          <span className={`text-xs font-bold tracking-widest uppercase ${sc.color}`}>{sc.label}</span>
        </div>
        <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
          THANH TOÁN QUA NGÂN HÀNG
        </h3>
        <p className="text-2xl font-extrabold text-primary mt-2">
          {(data.amount || 0).toLocaleString('vi-VN')}đ
        </p>
      </div>

      {/* Recipient account — locked from session */}
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
        <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-1 rounded-md border border-border flex-shrink-0">Đã xác thực</span>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">MÃ QR</p>
        {data.qrCodeUrl ? (
          <img
            src={data.qrCodeUrl}
            alt="Mã QR thanh toán ngân hàng"
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border border-border object-contain bg-white p-2"
          />
        ) : (
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-3"
            data-txid={data.transactionId}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1M17 14v3h-3M14 17h3" />
            </svg>
            <p className="text-xs text-muted-foreground text-center px-2 leading-relaxed">
              QR sẽ hiển thị<br />sau khi nối API
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
          Quét mã QR bằng ứng dụng ngân hàng để thanh toán nhanh chóng.
        </p>
      </div>

      {/* Bank info */}
      {(data.bank || data.accountNumber) && (
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted border border-border">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">THÔNG TIN NGÂN HÀNG</p>
          {data.bank && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngân hàng</span>
              <span className="font-bold text-foreground">{data.bank}</span>
            </div>
          )}
          {data.accountNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số tài khoản</span>
              <span className="font-bold text-foreground font-mono">{data.accountNumber}</span>
            </div>
          )}
          {data.accountName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chủ tài khoản</span>
              <span className="font-bold text-foreground">{data.accountName}</span>
            </div>
          )}
        </div>
      )}

      {/* Payment Details */}
      <div className="flex flex-col gap-3">
        {data.transferContent && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">NỘI DUNG CHUYỂN KHOẢN</p>
              <p className="text-sm font-bold text-foreground truncate">{data.transferContent}</p>
            </div>
            <button
              onClick={() => handleCopy(data.transferContent!, 'content')}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide transition-all hover:bg-primary/20"
            >
              {copiedContent ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>ĐÃ SAO CHÉP</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>SAO CHÉP</>
              )}
            </button>
          </div>
        )}

        {data.transactionId && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">MÃ GIAO DỊCH</p>
              <p className="text-sm font-bold text-foreground font-mono">{data.transactionId}</p>
            </div>
            <button
              onClick={() => handleCopy(data.transactionId!, 'txid')}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-bold tracking-wide transition-all hover:bg-border"
            >
              {copiedTxId ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>ĐÃ SAO CHÉP</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>SAO CHÉP</>
              )}
            </button>
          </div>
        )}

        {!data.bank && !data.accountNumber && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thông tin ngân hàng và số tài khoản sẽ được hiển thị sau khi tích hợp API thanh toán.
              Giao dịch sẽ được xác nhận tự động sau khi nhận được tiền.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="btn-secondary py-3 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
        TẠO GIAO DỊCH MỚI
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BankTopup() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [flowState, setFlowState] = useState<FlowState>('input');
  const [qrData, setQrData] = useState<BankTopupResponse | null>(null);
  const [mcUsername, setMcUsername] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const username = getMinecraftUsername();
    setMcUsername(username);
    setLoggedIn(isAuthenticated());
  }, []);

  const isSubmitting = flowState === 'loading';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInputValue(raw ? Number(raw).toLocaleString('vi-VN') : '');
    if (error) setError('');
  };

  const parseAmount = (formatted: string): number =>
    parseInt(formatted.replace(/\D/g, '') || '0', 10);

  const handleExampleClick = (amount: number) => {
    setInputValue(amount.toLocaleString('vi-VN'));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!loggedIn || !mcUsername) {
      setError('Bạn cần đăng nhập bằng tài khoản Minecraft trước khi nạp tiền.');
      return;
    }

    const amount = parseAmount(inputValue);
    if (!amount || amount < 10000) {
      setError('Vui lòng nhập số tiền tối thiểu 10.000đ.');
      return;
    }
    if (amount > 50000000) {
      setError('Số tiền tối đa là 50.000.000đ.');
      return;
    }

    setError('');
    setFlowState('loading');

    const token = getToken() || '';

    const result = await createBankTransaction({ amount }, token);

    if (result.success) {
      setQrData(result);
      setFlowState('qr');
    } else {
      setError(result.message || 'Không thể tạo giao dịch. Vui lòng thử lại.');
      setFlowState('input');
    }
  };

  const handleReset = () => {
    setFlowState('input');
    setInputValue('');
    setQrData(null);
    setError('');
  };

  // Not logged in
  if (!loggedIn || !mcUsername) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-base font-bold text-foreground mb-2">Chưa đăng nhập</p>
        <p className="text-sm text-muted-foreground mb-6">
          Bạn cần đăng nhập bằng tài khoản Minecraft để nạp tiền qua ngân hàng.
          Tiền sẽ được cộng vào đúng tài khoản đã đăng nhập.
        </p>
        <Link href="/dang-nhap" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase inline-block">
          ĐĂNG NHẬP MINECRAFT
        </Link>
      </div>
    );
  }

  if (flowState === 'loading') {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <svg className="animate-spin text-primary" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm font-semibold text-muted-foreground">Đang tạo giao dịch...</p>
      </div>
    );
  }

  if (flowState === 'qr' && qrData) {
    return <QRDisplay data={qrData} mcUsername={mcUsername} onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6" noValidate>
      {/* Logged-in account badge — locked */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/8 border border-primary/20">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Tên tài khoản</p>
          <p className="text-sm font-bold text-primary truncate">{mcUsername}</p>
        </div>
        <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-1 rounded-md border border-border flex-shrink-0">Đã xác thực</span>
      </div>

      {/* Transfer content preview — auto-set to username, read-only */}
      <TransferContentPreview username={mcUsername!} />

      {/* Amount Input */}
      <div className="flex flex-col gap-3">
        <label htmlFor="bank-amount" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          SỐ TIỀN MUỐN NẠP
        </label>
        <div className="relative">
          <input
            id="bank-amount"
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Nhập số tiền..."
            disabled={isSubmitting}
            className={`w-full px-4 py-3.5 rounded-xl bg-muted border text-foreground text-base font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-12 disabled:opacity-60 ${
              error ? 'border-red-500/60 focus:ring-red-500/30' : 'border-border focus:border-primary/40'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">đ</span>
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* Example Amounts */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Ví dụ nhanh</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleExampleClick(amount)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 disabled:opacity-60 ${
                parseAmount(inputValue) === amount
                  ? 'bg-primary/15 border-primary/40 text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {amount.toLocaleString('vi-VN')}đ
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          Bạn có thể nhập bất kỳ số tiền hợp lệ nào. Các ví dụ trên chỉ để tham khảo nhanh.
        </p>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted border border-border">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sau khi tạo giao dịch, quét mã QR bằng ứng dụng ngân hàng và chuyển khoản đúng nội dung.
          Tiền sẽ được cộng vào tài khoản <span className="font-bold text-foreground">{mcUsername}</span> sau khi xác nhận.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            ĐANG TẠO GIAO DỊCH...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1M17 14v3h-3M14 17h3" />
            </svg>
            TẠO MÃ QR
          </>
        )}
      </button>
    </form>
  );
}
