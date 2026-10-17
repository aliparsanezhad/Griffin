import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  ArrowRightLeft
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';
import { LimitOrderBook } from './LimitOrderBook';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface DcaSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

export const DcaSection: React.FC<DcaSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode
}) => {
  const isFa = lang === 'fa';

  // Mode: 'dca' (خرید پله‌ای) or 'limit' (دفتر سفارشات لیمیت)
  const [activeMode, setActiveMode] = useState<'dca' | 'limit'>('dca');

  // DCA State
  const [monthlyToman, setMonthlyToman] = useState<number>(5000000); // 5 Million Tomans per month
  const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'ETH' | 'BTC' | 'PAXG' | 'SHIRDAL'>('PAXG');
  const [durationMonths, setDurationMonths] = useState<number>(12); // 12 Months
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Asset historical/projected average returns
  const assetAnnualGrowth: Record<string, number> = {
    'USDT': 0.45,   // Fiat depreciation hedge ~45% IRR inflation
    'PAXG': 0.65,   // Physical gold parity + dollar inflation ~65%
    'ETH': 0.85,    // ETH appreciation + inflation ~85%
    'BTC': 1.10,    // BTC appreciation + inflation ~110%
    'SHIRDAL': 1.45 // Native ecosystem token upside ~145%
  };

  // DCA Math
  const totalInvestedToman = monthlyToman * durationMonths;
  const growthRate = assetAnnualGrowth[selectedAsset] * (durationMonths / 12);
  const projectedFutureToman = Math.round(totalInvestedToman * (1 + growthRate));
  const profitToman = projectedFutureToman - totalInvestedToman;

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
      
      {/* Hero Banner with Griffi Financial Strategist Mascot */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl group bg-[#110d29]">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-accountant.jpg" 
            alt="Griffi Wealth Strategist" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'استراتژی‌های ضدتورمی و مدیریت دارایی گریفی' : 'Anti-Inflation DCA & Limit Terminal'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'خرید پله‌ای (DCA) و دفتر سفارشات محدود' : 'Dollar-Cost Averaging & Limit Orders'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'برنامه‌ریزی منظم ماهانه برای تبدیل ریال به طلای دیجیتال و رمزارز؛ حذف نوسانات هیجانی و حفظ قدرت خرید خانوار' 
                  : 'Automate systematic DCA plans and execute non-custodial limit orders directly on-chain.'}
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md self-start md:self-auto">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveMode('dca');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'dca'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'برنامه‌ریزی خرید پله‌ای (DCA)' : 'DCA Strategy'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveMode('limit');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'limit'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'دفتر سفارش محدود (Limit)' : 'Limit Order Book'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
        isDarkMode 
          ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
          : 'bg-white border-purple-200 text-slate-800 shadow-xl'
      }`}>

        {/* MODE 1: DCA Planner */}
        {activeMode === 'dca' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Monthly Budget Input */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
                  <span>{isFa ? 'پس‌انداز ماهانه (تومان):' : 'Monthly Deposit (Toman):'}</span>
                  <span className="font-mono text-amber-400 text-[11px]">
                    ≈ {isFa ? `${toPersianDigits(Math.round(monthlyToman / tomanRate))} $` : `$${Math.round(monthlyToman / tomanRate)}`}
                  </span>
                </label>
                <input 
                  type="number"
                  step="500000"
                  value={monthlyToman}
                  onChange={(e) => setMonthlyToman(Math.max(100000, Number(e.target.value) || 0))}
                  className="w-full bg-purple-900/40 border border-purple-500/30 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
                
                {/* Presets */}
                <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                  {[2000000, 5000000, 10000000, 25000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        playClickSound();
                        setMonthlyToman(preset);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        monthlyToman === preset 
                          ? 'bg-amber-400 text-slate-950 shadow' 
                          : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
                      }`}
                    >
                      {preset / 1000000}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Asset Selection */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isFa ? 'دارایی هدف برای خرید پله‌ای:' : 'Target Asset for DCA:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { symbol: 'PAXG', name: 'طلا PAXG' },
                    { symbol: 'USDT', name: 'تتر دلار' },
                    { symbol: 'ETH', name: 'اتریوم' },
                    { symbol: 'BTC', name: 'بیت‌کوین' },
                    { symbol: 'SHIRDAL', name: 'شیردال DEX' },
                  ] as const).map(asset => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        playClickSound();
                        setSelectedAsset(asset.symbol as any);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedAsset === asset.symbol
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-purple-400'
                          : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-xs">{asset.symbol}</span>
                      <span className="text-[10px] opacity-75">{asset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon Duration */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isFa ? 'افق زمانی پس‌انداز:' : 'Time Horizon:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[6, 12, 24].map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        playClickSound();
                        setDurationMonths(m);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        durationMonths === m
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isFa ? `${toPersianDigits(m)} ماهه` : `${m} Months`}
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/20 text-[10px] text-purple-200">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    <span>{isFa ? 'مزیت استراتژی پله‌ای:' : 'DCA Advantage:'}</span>
                  </div>
                  <span>
                    {isFa 
                      ? 'خرید با قیمت میانگین، ریسک خرید در سقف قیمت را کاملاً خنثی می‌کند.'
                      : 'Eliminates peak-buying risk through dollar-cost averaging.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Results Comparison Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-amber-950/40 border border-purple-500/30">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>
                  {isFa 
                    ? `پیش‌بینی عملکرد دارایی ${selectedAsset} در برابر تورم و افت ارزش ریال:` 
                    : `Projected Performance of ${selectedAsset} vs Fiat Inflation:`}
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isFa ? 'کل سرمایه ریالی پس‌اندازشده:' : 'Total Invested:'}
                  </span>
                  <span className="text-base font-black font-mono text-slate-200">
                    {isFa ? `${toPersianDigits(formatToman(totalInvestedToman, false))} تومان` : `${formatToman(totalInvestedToman, false)} T`}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    ≈ ${(totalInvestedToman / tomanRate).toFixed(0)} USD
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isFa ? `ارزش آتی پورتفولیو با ${selectedAsset}:` : `Estimated Value in ${selectedAsset}:`}
                  </span>
                  <span className="text-base font-black font-mono text-amber-400">
                    {isFa ? `${toPersianDigits(formatToman(projectedFutureToman, false))} تومان` : `${formatToman(projectedFutureToman, false)} T`}
                  </span>
                  <span className="text-[10px] text-amber-500/80 block mt-0.5 font-mono">
                    ≈ ${(projectedFutureToman / tomanRate).toFixed(0)} USD
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-300 block mb-1 font-bold">
                    {isFa ? 'سود حفظ ارزش ریال و رشد دارایی:' : 'Net Inflation Protection:'}
                  </span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    +{isFa ? `${toPersianDigits(formatToman(profitToman, false))} تومان` : `${formatToman(profitToman, false)} T`}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                    (+{Math.round(growthRate * 100)}% بازدهی نسبت به ریال)
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Protocol Treasury Fee Guarantee */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-right">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {isFa 
                    ? 'کارمزد پروتکل در تمام سفارشات DCA و لیمیت (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
                    : 'All protocol commissions (0.5%) route directly to verified treasury:'}
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

        {/* MODE 2: Limit Orders */}
        {activeMode === 'limit' && (
          <div className="animate-fade-in">
            <LimitOrderBook
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

      </div>
    </div>
  );
};
