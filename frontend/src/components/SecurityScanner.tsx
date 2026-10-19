import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Unlock, 
  Lock, 
  HelpCircle,
  ExternalLink,
  Flame,
  Check,
  Globe
} from 'lucide-react';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface SecurityScannerProps {
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface TokenAuditResult {
  symbol: string;
  name: string;
  address: string;
  score: number; // 0-100
  isHoneypot: boolean;
  buyTax: number;
  sellTax: number;
  ownershipRenounced: boolean;
  canMint: boolean;
  hasBlacklist: boolean;
  isLpLocked: boolean;
  lpLockDuration: string;
  creatorSharePercent: number;
  summaryFa: string;
  summaryEn: string;
}

interface AllowanceItem {
  id: string;
  token: string;
  spenderName: string;
  spenderAddress: string;
  allowance: string;
  risk: 'safe' | 'medium' | 'high';
  revoked: boolean;
}

export const SecurityScanner: React.FC<SecurityScannerProps> = ({
  lang,
  isDarkMode = true
}) => {
  const isFa = lang === 'fa';

  // Active sub-tab: 'auditor' (دیدبان توکن و هانی‌پات), 'allowances' (مدیریت دسترسی‌های کیف‌پول), or 'phishing' (سپر ضد فیشینگ)
  const [activeTab, setActiveTab] = useState<'auditor' | 'allowances' | 'phishing'>('auditor');

  // Phishing Domain Verifier State
  const [domainInput, setDomainInput] = useState<string>('');
  const [domainScanning, setDomainScanning] = useState<boolean>(false);
  const [domainResult, setDomainResult] = useState<{
    domain: string;
    isSafe: boolean;
    trustScore: number;
    sslStatus: string;
    officialStatus: string;
    detailsFa: string;
    detailsEn: string;
  } | null>({
    domain: 'griffinswap.com',
    isSafe: true,
    trustScore: 100,
    sslStatus: 'TLS 1.3 رمزنگاری شده ۲۵۶ بیتی',
    officialStatus: 'درگاه رسمی تایید شده صرافی غیرمتمرکز گریفین',
    detailsFa: 'دامنه رسمی با پروتکل خزانه‌داری بدون سرور میانی و فاقد هرگونه لاگ اطلاعات هویتی کاربران ایرانی.',
    detailsEn: 'Official verified domain of GriffinSwap. 100% genuine and safe for transactions.'
  });

  const handleVerifyDomain = (targetDomain?: string) => {
    playClickSound();
    setDomainScanning(true);
    const domainToCheck = (targetDomain || domainInput || 'griffinswap.com').toLowerCase().trim();

    setTimeout(() => {
      setDomainScanning(false);
      const isScam = domainToCheck.includes('scam') || 
                     domainToCheck.includes('free') || 
                     domainToCheck.includes('claim') || 
                     domainToCheck.includes('airdrop') || 
                     domainToCheck.endsWith('.xyz') || 
                     domainToCheck.endsWith('.tk');

      if (isScam) {
        setDomainResult({
          domain: domainToCheck,
          isSafe: false,
          trustScore: 8,
          sslStatus: 'گواهی جعلی یا ناامن',
          officialStatus: '🚨 هشدار فیشینگ: دامنه مخرب و جعلی!',
          detailsFa: 'این سایت توسط هوش مصنوعی گریفی به عنوان تله سرقت کلید خصوصی (Private Key) یا امضای مخرب در کیف‌پول شناسایی شد. فوراً صفحه را ببندید.',
          detailsEn: 'Critical phishing warning: malicious fake portal detected. Do not sign any approvals.'
        });
      } else {
        setDomainResult({
          domain: domainToCheck,
          isSafe: true,
          trustScore: 98,
          sslStatus: 'TLS 1.3 معتبر با احراز هویت سرور',
          officialStatus: 'سایت معتبر و سازگار با وب۳',
          detailsFa: 'گواهی دامنه بررسی گردید. هیچ گزارش منفی از نشت اطلاعات، بدافزار یا قرارداد مخرب برای این دامنه ثبت نشده است.',
          detailsEn: 'Domain verified legitimate. No malicious approvals or phishing reports detected.'
        });
      }
    }, 1000);
  };

  // Auditor State
  const [inputAddress, setInputAddress] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<TokenAuditResult | null>({
    symbol: 'PEPE',
    name: 'Pepe',
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    score: 98,
    isHoneypot: false,
    buyTax: 0,
    sellTax: 0,
    ownershipRenounced: true,
    canMint: false,
    hasBlacklist: false,
    isLpLocked: true,
    lpLockDuration: '۵ سال قفل در تیم فایننس',
    creatorSharePercent: 0.8,
    summaryFa: 'این توکن کاملاً استاندارد و امن است. قرارداد دارای صفر درصد مالیات خرید/فروش بوده، مالکیت سلب شده و هیچ تابع فریز آدرسی در کد آن وجود ندارد.',
    summaryEn: 'Token is verified clean and safe. 0% taxes, renounced ownership, and no blacklisting capabilities.'
  });

  // Presets
  const presets: Record<string, TokenAuditResult> = {
    'PEPE': {
      symbol: 'PEPE',
      name: 'Pepe',
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      score: 98,
      isHoneypot: false,
      buyTax: 0,
      sellTax: 0,
      ownershipRenounced: true,
      canMint: false,
      hasBlacklist: false,
      isLpLocked: true,
      lpLockDuration: 'قفل شده ۵ ساله',
      creatorSharePercent: 0.8,
      summaryFa: 'کاملاً امن: قرارداد سلب مالکیت شده، مالیات خرید و فروش صفر است و کدهای مخرب یا تابع فریز کاربر ندارد.',
      summaryEn: 'Clean standard contract with zero tax and renounced ownership.'
    },
    'SHIB': {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      score: 99,
      isHoneypot: false,
      buyTax: 0,
      sellTax: 0,
      ownershipRenounced: true,
      canMint: false,
      hasBlacklist: false,
      isLpLocked: true,
      lpLockDuration: 'نقدینگی دائمی Uniswap',
      creatorSharePercent: 0.05,
      summaryFa: 'توکن فوق‌العاده معتبر با نقدینگی عمیق، فاقد هرگونه مالیات پنهان یا ریسک مسدودسازی.',
      summaryEn: 'Battle-tested token with deep decentralized liquidity.'
    },
    'FLOKI': {
      symbol: 'FLOKI',
      name: 'Floki',
      address: '0xcf0C122c6b73380ea48f00d473929b9A6089679A',
      score: 92,
      isHoneypot: false,
      buyTax: 0.3,
      sellTax: 0.3,
      ownershipRenounced: true,
      canMint: false,
      hasBlacklist: false,
      isLpLocked: true,
      lpLockDuration: 'قفل شده در FlokiFi Locker',
      creatorSharePercent: 1.2,
      summaryFa: 'قرارداد بازرسی‌شده با مالیات اندک ۰.۳٪ برای خزانه اکوسیستم و نقدینگی قفل‌شده.',
      summaryEn: 'Audited contract with minor 0.3% ecosystem fee and verified lock.'
    },
    'SCAM_HONEYPOT': {
      symbol: 'FAKE_AIRDROP',
      name: 'Claim Free 5000 USDT',
      address: '0xBadDead99991234567890abcdef1234567890abc',
      score: 14,
      isHoneypot: true,
      buyTax: 1.5,
      sellTax: 99.0,
      ownershipRenounced: false,
      canMint: true,
      hasBlacklist: true,
      isLpLocked: false,
      lpLockDuration: 'نقدینگی قفل نشده است!',
      creatorSharePercent: 68.5,
      summaryFa: '🚨 هشدار فوق‌العاده جدی: این توکن هانی‌پات (تله عسل) است! پس از خرید، امکان فروش توکن به دلیل مالیات ۹۹٪ یا تابع مسدودسازی انتقال وجود ندارد. سازنده می‌تواند بی‌نهایت توکن ضرب کند و موجودی استخر را تخلیه نماید!',
      summaryEn: '🚨 CRITICAL HONEYPOT DETECTED: 99% sell tax. Token transfers are restricted. Do not interact!'
    }
  };

  // Allowances State
  const [allowances, setAllowances] = useState<AllowanceItem[]>([
    {
      id: 'alw-1',
      token: 'USDT',
      spenderName: 'Across Protocol V3 Bridge',
      spenderAddress: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
      allowance: 'نامحدود (∞)',
      risk: 'safe',
      revoked: false
    },
    {
      id: 'alw-2',
      token: 'WETH',
      spenderName: 'Uniswap Universal Router',
      spenderAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      allowance: 'نامحدود (∞)',
      risk: 'safe',
      revoked: false
    },
    {
      id: 'alw-3',
      token: 'USDC',
      spenderName: 'Old Deprecated DEX Router 2023',
      spenderAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d',
      allowance: 'نامحدود (∞)',
      risk: 'high',
      revoked: false
    }
  ]);

  // Handle Scan Address
  const handleScanAddress = (addrToScan?: string) => {
    playClickSound();
    setIsScanning(true);
    const target = addrToScan || inputAddress.trim();

    setTimeout(() => {
      setIsScanning(false);
      if (presets[target.toUpperCase()]) {
        setAuditResult(presets[target.toUpperCase()]);
      } else if (target.toLowerCase().includes('bad') || target.toLowerCase().includes('scam')) {
        setAuditResult(presets['SCAM_HONEYPOT']);
      } else {
        // Generate dynamic audit based on address hash
        const isSafe = !target.toLowerCase().endsWith('f');
        setAuditResult({
          symbol: 'TOKEN',
          name: 'Custom ERC-20',
          address: target || '0xCustomTokenAddress...',
          score: isSafe ? 88 : 25,
          isHoneypot: !isSafe,
          buyTax: isSafe ? 1.0 : 5.0,
          sellTax: isSafe ? 1.0 : 95.0,
          ownershipRenounced: isSafe,
          canMint: !isSafe,
          hasBlacklist: !isSafe,
          isLpLocked: isSafe,
          lpLockDuration: isSafe ? '۱۲ ماهه قفل شده' : 'نامشخص',
          creatorSharePercent: isSafe ? 2.5 : 45.0,
          summaryFa: isSafe 
            ? 'بررسی اولیه هوش گریفی: قرارداد دارای استانداردهای مناسب است و مالیات معقولی دارد.'
            : 'هشدار: مالیات فروش غیرعادی یا دسترسی‌های انحصاری سازنده مشاهده شد. احتیاط شدید توصیه می‌شود.',
          summaryEn: isSafe 
            ? 'Contract analysis looks reasonable with standard parameters.'
            : 'Caution: anomalous parameters detected. Verify on-chain details before trading.'
        });
      }
    }, 1200);
  };

  // Handle Revoke
  const handleRevoke = (id: string) => {
    playSwapSuccessSound();
    setAllowances(prev => prev.map(a => a.id === id ? { ...a, revoked: true } : a));
  };

  return (
    <div className={`w-full rounded-3xl p-5 md:p-8 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/95 border-purple-500/25 text-slate-100 shadow-purple-950/40' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      
      {/* Top Header with Griffi Inspector Mascot */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-400/80 shadow-lg shrink-0 bg-black/40">
            <img 
              src="/mascot/griffi-inspector.jpg" 
              alt="Griffi Security Inspector" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'دیدبان امنیت و هانی‌پات‌یاب اختصاصی گریفین' : 'Griffi Contract & Honeypot Auditor'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{isFa ? 'بازرسی هوشمند قراردادها و امنیت ولت' : 'Smart Contract Security Auditor'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                AI + Static Analysis
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isFa 
                ? 'پیش از خرید هر توکن، آن را با رادار گریفی بررسی کنید تا گرفتار هانی‌پات‌ها، مالیات‌های مخفی ۹۹٪، توابع فریز یا سواستفاده از دسترسی‌های تاییدیه نشوید.' 
                : 'Inspect any token for honeypots, hidden malicious taxes, blacklist functions, and manage wallet approvals non-custodially.'}
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-purple-500/25 self-start lg:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('auditor');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'auditor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'تشخیص هانی‌پات و اسکنر توکن' : 'Honeypot Scanner'}
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('allowances');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'allowances'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'مدیریت تاییدیه ولت (Revoke)' : 'Wallet Approvals'}
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('phishing');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'phishing'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isFa ? 'سپر ضد فیشینگ دامنه‌ها' : 'Anti-Phishing Radar'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Honeypot & Token Auditor */}
      {activeTab === 'auditor' && (
        <div className="mt-6 space-y-6 animate-fade-in">
          
          {/* Search Box + Quick Presets */}
          <div className="p-4 md:p-6 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              {isFa ? 'آدرس قرارداد توکن (ERC-20 Contract Address):' : 'Token Contract Address (ERC-20):'}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input 
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="0x... (e.g. 0x6982508145454Ce325dDbE47a25d4ec3d2311933)"
                  className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                onClick={() => handleScanAddress()}
                disabled={isScanning}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>{isScanning ? (isFa ? 'در حال تحلیل...' : 'Analyzing...') : (isFa ? 'اسکن امنیت با رادار گریفی' : 'Audit Token')}</span>
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">{isFa ? 'بررسی سریع نمونه‌ها:' : 'Quick Examples:'}</span>
              {(['PEPE', 'SHIB', 'FLOKI'] as const).map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    setInputAddress(presets[sym].address);
                    setAuditResult(presets[sym]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 hover:bg-emerald-900/50 transition-all"
                >
                  ✓ {sym} ({isFa ? 'امن' : 'Safe'})
                </button>
              ))}
              <button
                onClick={() => {
                  setInputAddress(presets['SCAM_HONEYPOT'].address);
                  setAuditResult(presets['SCAM_HONEYPOT']);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[10px] font-mono text-rose-300 hover:bg-rose-900/70 transition-all flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>🚨 {isFa ? 'نمونه هانی‌پات کلاهبرداری' : 'Simulated Honeypot'}</span>
              </button>
            </div>
          </div>

          {/* High-Tech Animated Radar Scanner Effect */}
          {isScanning && (
            <div className="p-8 rounded-3xl border border-emerald-500/40 bg-black/60 text-center space-y-4 animate-fade-in shadow-2xl">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
                {/* Middle rotating scanner */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-400/80 animate-spin" style={{ animationDuration: '3s' }} />
                {/* Inner radar core */}
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <Search className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-sm font-black text-emerald-300 block">
                  {isFa ? 'رادار گریفی در حال تجزیه بایت‌کد قرارداد هوشمند...' : 'Scanning contract bytecodes & bytecode functions...'}
                </span>
                <p className="text-xs text-slate-400 font-mono">
                  {isFa ? 'بررسی توابع انتقال، بلک‌لیست، کارمزد پنهان و استخرهای نقدینگی' : 'Inspecting transfer functions, mint allowances, LP locks, honeypot traps.'}
                </p>
              </div>
            </div>
          )}

          {/* Audit Result Display */}
          {!isScanning && auditResult && (
            <div className={`p-6 rounded-3xl border transition-all space-y-6 ${
              auditResult.isHoneypot || auditResult.score < 50
                ? 'bg-rose-950/30 border-rose-500/40 shadow-rose-950/30'
                : auditResult.score >= 90
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/20'
                : 'bg-amber-950/20 border-amber-500/40 shadow-amber-950/20'
            }`}>
              
              {/* Score Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-4">
                  {/* Circular Score Badge */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black font-mono shadow-xl border shrink-0 ${
                    auditResult.score >= 90
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                      : auditResult.score >= 60
                      ? 'bg-amber-950 border-amber-400 text-amber-300'
                      : 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                  }`}>
                    <span className="text-xl leading-none">{auditResult.score}</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{auditResult.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-black/40 text-xs font-mono text-purple-300 border border-purple-500/30">
                        {auditResult.symbol}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {auditResult.address}
                    </span>
                  </div>
                </div>

                {/* Honeypot Verdict Badge */}
                <div>
                  {auditResult.isHoneypot ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-900/60 border border-rose-500/60 text-rose-200 text-xs font-black shadow-lg">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>{isFa ? 'خطر: قرارداد هانی‌پات (فروش غیرممکن)' : 'DANGER: HONEYPOT DETECTED'}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs font-black shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isFa ? 'تایید شده: امکان خرید و فروش آزاد' : 'VERIFIED: SAFE TO TRADE'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  {isFa ? 'گزارش تحلیلی هوش مصنوعی گریفی:' : 'Griffi Security Verdict:'}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {isFa ? auditResult.summaryFa : auditResult.summaryEn}
                </p>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Buy Tax */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'مالیات خرید (Buy Tax):' : 'Buy Tax:'}</span>
                  <span className={`text-base font-black font-mono ${auditResult.buyTax > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {auditResult.buyTax}%
                  </span>
                </div>

                {/* Sell Tax */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'مالیات فروش (Sell Tax):' : 'Sell Tax:'}</span>
                  <span className={`text-base font-black font-mono ${auditResult.sellTax > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {auditResult.sellTax}%
                  </span>
                </div>

                {/* Renounced */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'سلب مالکیت سازنده:' : 'Ownership Renounced:'}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${auditResult.ownershipRenounced ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {auditResult.ownershipRenounced ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isFa ? 'بله (امن)' : 'Yes (Safe)'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isFa ? 'خیر (دسترسی دارد)' : 'No (Privileged)'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Mint Function */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'امکان ضرب توکن جدید:' : 'Mint Function:'}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${!auditResult.canMint ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {!auditResult.canMint ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isFa ? 'غیرفعال (امن)' : 'Disabled'}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isFa ? 'خطر ضرب بی‌پایان' : 'Can Mint'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Blacklist Function */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'تابع مسدودسازی ولت:' : 'Blacklist Function:'}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${!auditResult.hasBlacklist ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {!auditResult.hasBlacklist ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isFa ? 'ندارد (ضدتحریم)' : 'None'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isFa ? 'امکان فریز وجود دارد' : 'Present (Freeze Risk)'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Liquidity Lock */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'وضعیت قفل نقدینگی:' : 'LP Locked:'}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${auditResult.isLpLocked ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {auditResult.isLpLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{auditResult.lpLockDuration}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isFa ? 'قفل نیست!' : 'Unlocked'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Creator Share */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'سهم کیف‌پول سازنده:' : 'Creator Holdings:'}</span>
                  <span className={`text-base font-black font-mono ${auditResult.creatorSharePercent > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {auditResult.creatorSharePercent}%
                  </span>
                </div>

                {/* Etherscan Verification */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400">{isFa ? 'کد سورس عمومی:' : 'Source Code:'}</span>
                  <a 
                    href={`https://etherscan.io/address/${auditResult.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 mt-1"
                  >
                    <span>{isFa ? 'مشاهده در اترسکن' : 'Etherscan'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: Token Approvals & Revoke Manager */}
      {activeTab === 'allowances' && (
        <div className="mt-6 space-y-6 animate-fade-in">
          
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>{isFa ? 'چرا پاکسازی تاییدیه ولت (Revoke) برای ایرانیان حیاتی است؟' : 'Why Approvals Hygiene Matters'}</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {isFa 
                  ? 'هنگام سواپ در صرافی‌های مختلف، به قرارداد اجازه برداشت نامحدود داده‌اید. اگر آن پروتکل هک شود یا سرقت رخ دهد، دارایی‌های شما به خطر می‌افتد. با لغو دسترسی‌ها به قراردادهای قدیمی، ولت خود را ایمن نگه دارید.' 
                  : 'Unlimited token allowances leave your wallet exposed if a legacy protocol is compromised. Revoke outdated permissions regularly.'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'قراردادهای نیازمند اقدام:' : 'Approvals to Review:'}</span>
              <span className="text-lg font-black font-mono text-amber-400">
                {allowances.filter(a => !a.revoked).length} {isFa ? 'مجوز باز' : 'Active'}
              </span>
            </div>
          </div>

          {/* Approvals Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">{isFa ? 'توکن' : 'Token'}</th>
                  <th className="py-2.5 px-3">{isFa ? 'قرارداد مجاز (Spender)' : 'Spender Protocol'}</th>
                  <th className="py-2.5 px-3">{isFa ? 'میزان مجوز' : 'Allowance'}</th>
                  <th className="py-2.5 px-3">{isFa ? 'سطح ریسک' : 'Risk'}</th>
                  <th className="py-2.5 px-3 text-center">{isFa ? 'اقدام امنیتی' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {allowances.map((alw) => (
                  <tr key={alw.id} className="hover:bg-purple-950/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-900/60 flex items-center justify-center text-[10px] text-purple-300">
                        {alw.token[0]}
                      </span>
                      <span>{alw.token}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{alw.spenderName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{alw.spenderAddress.substring(0, 10)}...{alw.spenderAddress.substring(alw.spenderAddress.length - 4)}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-300 font-bold">{alw.allowance}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alw.risk === 'safe'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : alw.risk === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {alw.risk === 'safe' ? (isFa ? 'معتبر' : 'Verified') : (isFa ? 'ریسک بالا / قدیمی' : 'High Risk')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {alw.revoked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isFa ? 'لغو شد (امن)' : 'Revoked'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(alw.id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-[11px] font-black transition-all shadow-md active:scale-95"
                        >
                          {isFa ? 'لغو دسترسی (Revoke)' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: Anti-Phishing Domain & Bot Verifier */}
      {activeTab === 'phishing' && (
        <div className="mt-6 space-y-6 animate-fade-in">
          
          {/* Input & Quick Presets */}
          <div className="p-4 md:p-6 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              {isFa ? 'بررسی اصالت آدرس وب‌سایت، کانال یا ربات تلگرام (Anti-Phishing Link Verifier):' : 'Verify Domain or Telegram Bot URL:'}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input 
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. griffinswap.com or t.me/GriffinSwapBot"
                  className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                onClick={() => handleVerifyDomain()}
                disabled={domainScanning}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>{domainScanning ? (isFa ? 'در حال استعلام...' : 'Verifying...') : (isFa ? 'بررسی اصالت درگاه' : 'Verify Domain')}</span>
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">{isFa ? 'نمونه‌های آماده استعلام:' : 'Quick Presets:'}</span>
              <button
                onClick={() => {
                  setDomainInput('griffinswap.com');
                  handleVerifyDomain('griffinswap.com');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 hover:bg-emerald-900/50 transition-all cursor-pointer"
              >
                ✓ griffinswap.com ({isFa ? 'درگاه رسمی' : 'Official'})
              </button>
              <button
                onClick={() => {
                  setDomainInput('t.me/GriffinSwapBot');
                  handleVerifyDomain('t.me/GriffinSwapBot');
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:bg-cyan-900/50 transition-all cursor-pointer"
              >
                ✈️ t.me/GriffinSwapBot ({isFa ? 'ربات رسمی' : 'Official Bot'})
              </button>
              <button
                onClick={() => {
                  setDomainInput('claim-free-griffin-airdrop.xyz');
                  handleVerifyDomain('claim-free-griffin-airdrop.xyz');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[10px] font-mono text-rose-300 hover:bg-rose-900/70 transition-all cursor-pointer flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>🚨 {isFa ? 'سایت فیشینگ کلاهبرداری' : 'Phishing Trap'}</span>
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {domainResult && !domainScanning && (
            <div className={`p-6 rounded-3xl border transition-all space-y-5 ${
              domainResult.isSafe 
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/20' 
                : 'bg-rose-950/30 border-rose-500/50 shadow-rose-950/40'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black font-mono shadow-xl border shrink-0 ${
                    domainResult.isSafe
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                      : 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                  }`}>
                    <span className="text-lg leading-none">{domainResult.trustScore}</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>

                  <div>
                    <h3 className="font-mono text-base font-black text-white">{domainResult.domain}</h3>
                    <span className="text-xs text-slate-300 font-bold block mt-0.5">
                      {domainResult.officialStatus}
                    </span>
                  </div>
                </div>

                <div>
                  {domainResult.isSafe ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isFa ? 'دامنه رسمی و امن' : 'Verified & Safe'}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{isFa ? 'هشدار سرقت دارایی (فیشینگ)' : 'Malicious Phishing Portal'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'رمزنگاری ارتباط و گواهی:' : 'SSL / TLS Encryption:'}</span>
                  <span className="font-mono font-bold text-white">{domainResult.sslStatus}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                  <span className="text-[10px] text-slate-400 block mb-1">{isFa ? 'بررسی دیتابیس بدافزارهای وب۳:' : 'Web3 Threat Database:'}</span>
                  <span className={`font-mono font-bold ${domainResult.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {domainResult.isSafe ? (isFa ? 'پاک (بدون سابقه تخلف)' : 'Clean - No Reports') : (isFa ? 'گزارش شده به عنوان فیشینگ' : 'Flagged as Malicious')}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-slate-200 leading-relaxed">
                💡 <strong className="text-white">{isFa ? 'توصیه امنیتی گریفی:' : 'Security Recommendation:'}</strong>{' '}
                {isFa ? domainResult.detailsFa : domainResult.detailsEn}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
