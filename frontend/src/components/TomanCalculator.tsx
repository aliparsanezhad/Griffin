import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  DollarSign, 
  Clock,
  Copy,
  Check,
  Scale,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { InflationPnlTracker } from './InflationPnlTracker';
import { playClickSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface TomanCalculatorProps {
  tomanRate: number;
  rateChange: string;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const TomanCalculator: React.FC<TomanCalculatorProps> = ({
  tomanRate,
  rateChange,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';
  
  // Tab mode: 'converter' (Tether & Gold) vs 'pnl' (Inflation & Devaluation Shield)
  const [calcMode, setCalcMode] = useState<'converter' | 'pnl'>('converter');

  // Bidirectional state
  const [usdtValue, setUsdtValue] = useState<string>('500');
  const [tomanValue, setTomanValue] = useState<string>((500 * tomanRate).toString());
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

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

  // Crypto and Gold conversion estimates
  const ethPrice = 3420;
  const btcPrice = 89500;
  const ethEquivalent = ethPrice > 0 ? (currentUsdt / ethPrice) : 0;
  const btcEquivalent = btcPrice > 0 ? (currentUsdt / btcPrice) : 0;

  const sekePriceToman = Math.round(tomanRate * 558); // Seke Bahar Azadi in Tomans
  const goldGramPriceToman = Math.round((sekePriceToman / 8.133) * 0.705); // 1g of 18k Gold in Tomans
  const sekeEquivalent = currentToman > 0 ? (currentToman / sekePriceToman) : 0;
  const goldGramEquivalent = currentToman > 0 ? (currentToman / goldGramPriceToman) : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 text-right animate-fade-in ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      
      {/* Hero Banner with Griffi Financial Mascot */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl group bg-[#110d29]">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-accountant.jpg" 
            alt="Griffi Accountant" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'موتور محاسباتی نرخ برابری تتر و دارایی‌های دیجیتال' : 'Real-Time Crypto-Toman Valuation Engine'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'ماشین‌حساب جامع تتر، طلا و رمزارزها' : 'Tether, Gold & Crypto Calculator'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'محاسبه آنی و دوطرفه ارزش تتر به تومان، ریال، سکه تمام آزادی، طلای ۱۸ عیار و برابری با بیت‌کوین و اتریوم' 
                  : 'Instant bidirectional conversion between USDT, Toman, IRR, physical gold, and major cryptocurrencies.'}
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md self-start md:self-auto">
              <button
                onClick={() => {
                  playClickSound();
                  setCalcMode('converter');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  calcMode === 'converter'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'ماشین‌حساب دوطرفه' : 'Two-Way Calculator'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setCalcMode('pnl');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  calcMode === 'pnl'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'سپر تورم ریال 🛡️' : 'Inflation Shield 🛡️'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {calcMode === 'converter' && (
        <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl transition-all space-y-6 ${
          isDarkMode 
            ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
            : 'bg-white border-purple-200 text-slate-800 shadow-xl'
        }`}>
          
          {/* Live Rate Header Banner */}
          <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-xs gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">{isFa ? 'نرخ اوراکل زنده هر تتر (USDT):' : 'Current USDT Rate:'}</span>
              <span className="font-extrabold text-amber-300 font-mono text-sm">
                {isFa ? `${toPersianDigits(formatToman(tomanRate))} تومان` : `${formatToman(tomanRate, false)} Toman`}
              </span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold font-mono">
                {rateChange || '+1.4%'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'بروزرسانی زنده بدون تاخیر' : 'Real-time feed'}</span>
            </div>
          </div>

          {/* Input Conversion Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            
            {/* USDT Input */}
            <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span>{isFa ? 'مقدار تتر (USDT)' : 'Tether Amount (USDT)'}</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </label>
              <input
                type="number"
                value={usdtValue}
                onChange={(e) => handleUsdtChange(e.target.value)}
                className="w-full bg-transparent text-3xl font-mono font-black text-white focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-400 block pt-1 border-t border-purple-500/10">
                1 USDT = 1.00 USD
              </span>
            </div>

            {/* Toman Input */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-2">
              <label className="text-xs text-amber-300 font-semibold flex items-center justify-between">
                <span>{isFa ? 'معادل تومان (IRT)' : 'Toman Amount (IRT)'}</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </label>
              <input
                type="number"
                value={tomanValue}
                onChange={(e) => handleTomanChange(e.target.value)}
                className="w-full bg-transparent text-3xl font-mono font-black text-amber-300 focus:outline-none"
                placeholder="0"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-300 pt-1 border-t border-purple-500/10">
                <span>
                  {isFa ? `معادل ریال: ${toPersianDigits(formatToman(currentRial))} ریال` : `IRR: ${formatToman(currentRial, false)} Rial`}
                </span>
                <button
                  onClick={() => handleCopy(currentToman.toString())}
                  className="text-purple-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  title={isFa ? 'کپی رقم' : 'Copy'}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isFa ? (copied ? 'کپی شد' : 'کپی رقم') : (copied ? 'Copied' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs text-slate-400 block mb-2 font-medium">
              {isFa ? 'مبالغ متداول برای محاسبه فوری:' : 'Quick Presets:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {[100, 250, 500, 1000, 2500, 5000, 10000].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    playClickSound();
                    handleUsdtChange(val.toString());
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    usdtValue === val.toString()
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                      : 'bg-purple-950/40 hover:bg-purple-800/40 border-purple-500/20 text-purple-200 hover:text-white'
                  }`}
                >
                  ${val} USDT
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Asset & Gold Equivalents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-purple-500/20">
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/15 flex flex-col justify-between text-xs">
              <span className="text-slate-400">{isFa ? 'معادل اتریوم (ETH):' : 'ETH Equivalent:'}</span>
              <span className="font-mono font-bold text-white mt-1 text-sm">
                ≈ {ethEquivalent.toFixed(4)} ETH
              </span>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/15 flex flex-col justify-between text-xs">
              <span className="text-slate-400">{isFa ? 'معادل بیت‌کوین (BTC):' : 'BTC Equivalent:'}</span>
              <span className="font-mono font-bold text-white mt-1 text-sm">
                ≈ {btcEquivalent.toFixed(6)} BTC
              </span>
            </div>
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 flex flex-col justify-between text-xs">
              <span className="text-amber-300 font-semibold">{isFa ? 'معادل سکه بهار آزادی:' : 'Gold Coin (Seke):'}</span>
              <span className="font-mono font-bold text-amber-200 mt-1 text-sm">
                ≈ {sekeEquivalent.toFixed(3)} {isFa ? 'سکه' : 'Coins'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 flex flex-col justify-between text-xs">
              <span className="text-amber-300 font-semibold">{isFa ? 'معادل طلای ۱۸ عیار:' : '18k Gold:'}</span>
              <span className="font-mono font-bold text-amber-200 mt-1 text-sm">
                ≈ {goldGramEquivalent.toFixed(2)} {isFa ? 'گرم' : 'grams'}
              </span>
            </div>
          </div>

          {/* Verified Protocol Treasury Fee Guarantee */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-right">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-slate-300">
                {isFa 
                  ? 'کارمزد پروتکل گریفین‌سواپ در تمام تبدیل‌ها (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌گردد:' 
                  : 'Platform protocol fee (0.5%) routes directly to verified treasury:'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">
                {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
              </code>
              <button
                onClick={handleCopyWallet}
                className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
                title="کپی آدرس خزانه"
              >
                {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="مشاهده در ایترسکن"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: Inflation & PnL Shield Tracker */}
      {calcMode === 'pnl' && (
        <div className="animate-fade-in">
          <InflationPnlTracker tomanRate={tomanRate} lang={lang} isDarkMode={isDarkMode} />
        </div>
      )}

    </div>
  );
};
