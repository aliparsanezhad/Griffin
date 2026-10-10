import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  DollarSign, 
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';

interface TomanCalculatorProps {
  tomanRate: number;
  rateChange: string;
  lang: 'fa' | 'en';
}

export const TomanCalculator: React.FC<TomanCalculatorProps> = ({
  tomanRate,
  rateChange,
  lang,
}) => {
  const isFa = lang === 'fa';
  
  // Bidirectional state
  const [usdtValue, setUsdtValue] = useState<string>('500');
  const [tomanValue, setTomanValue] = useState<string>((500 * tomanRate).toString());
  const [copied, setCopied] = useState<boolean>(false);

  const handleUsdtChange = (val: string) => {
    setUsdtValue(val);
    const num = parseFloat(val) || 0;
    setTomanValue(Math.round(num * tomanRate).toString());
  };

  const handleTomanChange = (val: string) => {
    setTomanValue(val);
    const num = parseFloat(val) || 0;
    setUsdtValue(tomanRate > 0 ? (num / tomanRate).toFixed(2) : '0');
  };

  const currentUsdt = parseFloat(usdtValue) || 0;
  const currentToman = parseFloat(tomanValue) || 0;
  const currentRial = currentToman * 10;

  // Crypto conversion estimates
  const ethPrice = 3420;
  const btcPrice = 89500;
  const ethEquivalent = ethPrice > 0 ? (currentUsdt / ethPrice) : 0;
  const btcEquivalent = btcPrice > 0 ? (currentUsdt / btcPrice) : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full py-6 px-4 max-w-4xl mx-auto animate-fade-in space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2">
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? 'محاسبه‌گر دوطرفه تتر و تومان' : 'Two-Way Crypto Converter'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold griffin-gradient-text">
          {isFa ? 'ماشین‌حساب لحظه‌ای ارزهای دیجیتال' : 'Live Tether & Toman Calculator'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          {isFa
            ? 'تبدیل آنی و دوطرفه تتر به تومان، ریال، اتریوم و بیت‌کوین بر مبنای آخرین نرخ اوراکل'
            : 'Convert dynamically between USDT, Toman, IRR, ETH, and BTC in real time.'}
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl space-y-6">
        
        {/* Rate Banner */}
        <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">{isFa ? 'نرخ اوراکل هر تتر (USDT):' : 'Current USDT Rate:'}</span>
            <span className="font-extrabold text-amber-300 font-mono text-sm">
              {isFa ? `${toPersianDigits(formatToman(tomanRate))} تومان` : `${formatToman(tomanRate, false)} Toman`}
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
              {rateChange}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>{isFa ? 'بروزرسانی زنده' : 'Live Oracle Feed'}</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* USDT Input */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
            <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>{isFa ? 'مقدار تتر (USDT)' : 'Tether Amount (USDT)'}</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </label>
            <input
              type="number"
              value={usdtValue}
              onChange={(e) => handleUsdtChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-mono font-black text-white focus:outline-none"
              placeholder="0"
            />
          </div>

          {/* Toman Input */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-1">
            <label className="text-xs text-amber-300 font-semibold flex items-center justify-between">
              <span>{isFa ? 'مقدار تومان (IRT)' : 'Toman Amount (IRT)'}</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </label>
            <input
              type="number"
              value={tomanValue}
              onChange={(e) => handleTomanChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-mono font-black text-amber-300 focus:outline-none"
              placeholder="0"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>
                {isFa ? `معادل ریال: ${toPersianDigits(formatToman(currentRial))} ریال` : `IRR: ${formatToman(currentRial, false)} Rial`}
              </span>
              <button
                onClick={() => handleCopy(currentToman.toString())}
                className="text-purple-400 hover:text-white flex items-center gap-1"
                title={isFa ? 'کپی رقم' : 'Copy'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isFa ? (copied ? 'کپی شد' : 'کپی') : (copied ? 'Copied' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-xs text-slate-400 block mb-2 font-medium">
            {isFa ? 'مبالغ پرکاربرد:' : 'Quick Presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                onClick={() => handleUsdtChange(val.toString())}
                className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-800/40 border border-purple-500/20 text-xs font-mono font-semibold text-purple-200 hover:text-white transition-all active:scale-95"
              >
                ${val} USDT
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Asset Equivalents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-500/15">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">{isFa ? 'معادل اتریوم (ETH):' : 'ETH Equivalent:'}</span>
            <span className="font-mono font-bold text-white">
              ≈ {ethEquivalent.toFixed(4)} ETH
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">{isFa ? 'معادل بیت‌کوین (BTC):' : 'BTC Equivalent:'}</span>
            <span className="font-mono font-bold text-white">
              ≈ {btcEquivalent.toFixed(6)} BTC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
