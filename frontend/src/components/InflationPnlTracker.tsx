import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Calculator, 
  Sparkles, 
  Scale, 
  Copy, 
  Check,
  RotateCcw
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playCoinDingSound } from '../services/soundService';

interface InflationPnlTrackerProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

export const InflationPnlTracker: React.FC<InflationPnlTrackerProps> = ({
  tomanRate,
  lang,
  isDarkMode,
}) => {
  const isFa = lang === 'fa';

  // Preset investment scenarios for quick exploration
  const PRESET_SCENARIOS = [
    {
      nameFa: 'خرید بیت‌کوین در سال گذشته',
      nameEn: '1-Year BTC Hold',
      tokenSymbol: 'BTC',
      tokenName: 'Bitcoin',
      buyPriceUsd: 38000,
      currentPriceUsd: 68450,
      tokenAmount: 0.1,
      historicalTomanRate: 54000,
      holdingMonths: 12,
    },
    {
      nameFa: 'خرید اتریوم در کف قیمتی',
      nameEn: 'ETH Bottom Buy',
      tokenSymbol: 'ETH',
      tokenName: 'Ethereum',
      buyPriceUsd: 2200,
      currentPriceUsd: 3420,
      tokenAmount: 1.5,
      historicalTomanRate: 58000,
      holdingMonths: 8,
    },
    {
      nameFa: 'پس‌انداز تتر ضد تورم',
      nameEn: 'USDT Inflation Shield',
      tokenSymbol: 'USDT',
      tokenName: 'Tether USD',
      buyPriceUsd: 1.0,
      currentPriceUsd: 1.0,
      tokenAmount: 2000,
      historicalTomanRate: 48000,
      holdingMonths: 18,
    },
    {
      nameFa: 'طلای دیجیتال پکس‌گلد',
      nameEn: 'PAXG Digital Gold',
      tokenSymbol: 'PAXG',
      tokenName: 'PAX Gold',
      buyPriceUsd: 1950,
      currentPriceUsd: 2650,
      tokenAmount: 1.0,
      historicalTomanRate: 51000,
      holdingMonths: 14,
    },
  ];

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const activeScenario = PRESET_SCENARIOS[selectedScenarioIndex];

  // Custom calculation states
  const [tokenAmount, setTokenAmount] = useState<number>(activeScenario.tokenAmount);
  const [buyPriceUsd, setBuyPriceUsd] = useState<number>(activeScenario.buyPriceUsd);
  const [currentPriceUsd, setCurrentPriceUsd] = useState<number>(activeScenario.currentPriceUsd);
  const [historicalTomanRate, setHistoricalTomanRate] = useState<number>(activeScenario.historicalTomanRate);
  const [holdingMonths, setHoldingMonths] = useState<number>(activeScenario.holdingMonths);
  const [copied, setCopied] = useState<boolean>(false);

  // When clicking a scenario preset
  const handleSelectScenario = (idx: number) => {
    playClickSound();
    setSelectedScenarioIndex(idx);
    const s = PRESET_SCENARIOS[idx];
    setTokenAmount(s.tokenAmount);
    setBuyPriceUsd(s.buyPriceUsd);
    setCurrentPriceUsd(s.currentPriceUsd);
    setHistoricalTomanRate(s.historicalTomanRate);
    setHoldingMonths(s.holdingMonths);
  };

  // Math Calculations
  const initialCostUsd = tokenAmount * buyPriceUsd;
  const initialCostToman = initialCostUsd * historicalTomanRate;

  const currentValueUsd = tokenAmount * currentPriceUsd;
  const currentValueToman = currentValueUsd * tomanRate;

  const cryptoProfitUsd = currentValueUsd - initialCostUsd;
  const cryptoProfitPercent = initialCostUsd > 0 ? (cryptoProfitUsd / initialCostUsd) * 100 : 0;

  const totalTomanProfit = currentValueToman - initialCostToman;
  const totalTomanProfitPercent = initialCostToman > 0 ? (totalTomanProfit / initialCostToman) * 100 : 0;

  // Currency devaluation effect: How much Toman would be gained even if crypto price stayed unchanged
  const pureFxProfitToman = initialCostUsd * (tomanRate - historicalTomanRate);

  // Bank comparison (assuming Iranian legal bank deposit ~22% annual simple interest)
  const bankInterestToman = initialCostToman * (0.22 * (holdingMonths / 12));
  const bankTotalToman = initialCostToman + bankInterestToman;
  const outperformanceVsBank = currentValueToman - bankTotalToman;

  // Gold Equivalence (1 Seke Azadi ≈ 54,000,000 Toman)
  const SEKE_PRICE_TOMAN = 54000000;
  const initialSeke = initialCostToman / SEKE_PRICE_TOMAN;
  const currentSeke = currentValueToman / SEKE_PRICE_TOMAN;

  const handleCopySummary = () => {
    playClickSound();
    const text = isFa 
      ? `📊 گزارش بازدهی و سپر تورم گریفین‌سواپ:
دارایی: ${activeScenario.tokenName}
سرمایه اولیه: ${formatToman(initialCostToman)} تومان ($${initialCostUsd.toFixed(0)})
ارزش امروز: ${formatToman(currentValueToman)} تومان ($${currentValueUsd.toFixed(0)})
سود خالص تومانی: +${formatToman(totalTomanProfit)} تومان (${totalTomanProfitPercent.toFixed(1)}٪)
سود مازاد نسبت به بانک: +${formatToman(outperformanceVsBank)} تومان
حساب شده در صرافی غیرمتمرکز گریفین‌سواپ (بدون تحریم و بدون KYC)`
      : `GriffinSwap Inflation Shield Report:
Initial: $${initialCostUsd.toFixed(0)} (${formatToman(initialCostToman, false)} Toman)
Current: $${currentValueUsd.toFixed(0)} (${formatToman(currentValueToman, false)} Toman)
Toman Profit: +${formatToman(totalTomanProfit, false)} Toman (${totalTomanProfitPercent.toFixed(1)}%)
Calculated on GriffinSwap`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    playCoinDingSound();
    handleSelectScenario(0);
  };

  return (
    <div className={`w-full py-6 px-4 max-w-6xl mx-auto animate-fade-in text-right ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Hero Banner with Mascot Analyst */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl mb-8 group bg-[#110d29]">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-analyst.jpg" 
            alt="Griffi Wealth Analyst" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'تحلیلگر ثروت و سپر تورم ریال با گریفی' : 'Inflation & Wealth Shield Analyst'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'محاسبه‌گر سود و زیان دلاری و تورم تومانی' : 'Crypto P&L & Inflation Shield'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'بررسی علمی سود خالص ارزی، حفظ قدرت خرید در برابر افت ریال، و مقایسه با نرخ سود بانکی و سکه طلا'
                  : 'Benchmark crypto returns against Rial currency depreciation, official inflation, and bank interest.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
                title={isFa ? 'تنظیم مجدد' : 'Reset'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFa ? 'مقادیر اولیه' : 'Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isFa ? 'سناریوهای واقعی و آماده:' : 'Real Preset Scenarios:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <button
              key={scenario.nameFa}
              onClick={() => handleSelectScenario(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedScenarioIndex === idx
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-purple-900/30 text-slate-400 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              {isFa ? scenario.nameFa : scenario.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Column: Interactive Input Sliders & Fields (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>{isFa ? 'تنظیم مقادیر سرمایه‌گذاری' : 'Investment Parameters'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400">
              {activeScenario.tokenSymbol}
            </span>
          </div>

          {/* Amount of Token */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'مقدار رمزارز خریداری شده:' : 'Token Amount:'}</span>
              <span className="font-mono font-bold text-white">{tokenAmount} {activeScenario.tokenSymbol}</span>
            </div>
            <input 
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(parseFloat(e.target.value) || 0)}
              step="any"
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Buy Price USD */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'قیمت خرید دلاری هر واحد:' : 'Buy Price (USD):'}</span>
              <span className="font-mono font-bold text-white">${buyPriceUsd.toLocaleString()}</span>
            </div>
            <input 
              type="number"
              value={buyPriceUsd}
              onChange={(e) => setBuyPriceUsd(parseFloat(e.target.value) || 0)}
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Historical Toman Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'نرخ تتر در زمان خرید (تومان):' : 'USDT Rate at Purchase:'}</span>
              <span className="font-mono font-bold text-amber-400">{toPersianDigits(formatToman(historicalTomanRate, false))} ت</span>
            </div>
            <input 
              type="number"
              value={historicalTomanRate}
              onChange={(e) => setHistoricalTomanRate(parseFloat(e.target.value) || 0)}
              step="1000"
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Current Price USD */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'قیمت فعلی بازار (دلار):' : 'Current Market Price (USD):'}</span>
              <span className="font-mono font-bold text-emerald-400">${currentPriceUsd.toLocaleString()}</span>
            </div>
            <input 
              type="number"
              value={currentPriceUsd}
              onChange={(e) => setCurrentPriceUsd(parseFloat(e.target.value) || 0)}
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Current Live Toman Rate (Read-only oracle feed) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'نرخ زنده تتر امروز (اوراکل):' : 'Current Tether Rate (Live):'}</span>
              <span className="font-mono font-bold text-emerald-400">
                {isFa ? `${toPersianDigits(formatToman(tomanRate, false))} تومان` : `${formatToman(tomanRate, false)} T`}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 text-[11px] text-slate-300 flex justify-between items-center">
              <span>{isFa ? 'رشد نرخ ارز در این بازه:' : 'FX Devaluation Rate:'}</span>
              <span className="font-mono font-bold text-amber-300">
                +{historicalTomanRate > 0 ? (((tomanRate - historicalTomanRate) / historicalTomanRate) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Holding duration slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'مدت زمان نگهداری:' : 'Holding Period:'}</span>
              <span className="font-bold text-purple-300 font-mono">{holdingMonths} {isFa ? 'ماه' : 'months'}</span>
            </div>
            <input 
              type="range"
              min="1"
              max="36"
              value={holdingMonths}
              onChange={(e) => setHoldingMonths(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Visual Return Matrix & Comparison Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Big Profit Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 via-[#180f33] to-indigo-950/60 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide block mb-1">
                  {isFa ? 'ارزش کنونی سرمایه شما' : 'Current Portfolio Value'}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-4xl font-black text-white font-mono">
                    ${currentValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-400 font-mono">
                    ≈ {isFa ? `${toPersianDigits(formatToman(currentValueToman))} تومان` : `${formatToman(currentValueToman, false)} Toman`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-purple-600/40 hover:bg-purple-600 text-white font-bold text-xs border border-purple-400/30 flex items-center gap-1.5 self-start sm:self-center transition-all"
                title={isFa ? 'کپی گزارش بازدهی' : 'Copy Summary'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'اشتراک گزارش' : 'Share')}</span>
              </button>
            </div>

            {/* Split Metrics: Pure Crypto vs Toman Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-purple-500/20">
              
              {/* Crypto pure USD gain */}
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isFa ? 'سود ارزی خالص (Crypto P&L):' : 'Pure Crypto P&L:'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-base font-black font-mono ${cryptoProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {cryptoProfitUsd >= 0 ? '+' : ''}${cryptoProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded ${cryptoProfitPercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {cryptoProfitPercent >= 0 ? '+' : ''}{cryptoProfitPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Toman Total Gain */}
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isFa ? 'سود کل تومانی (با احتساب تورم):' : 'Total Toman P&L:'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-base font-black font-mono ${totalTomanProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {totalTomanProfit >= 0 ? '+' : ''}{toPersianDigits(formatToman(totalTomanProfit, false))} ت
                  </span>
                  <span className="text-xs font-bold font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                    +{totalTomanProfitPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Devaluation Shield & Bank Comparison Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Currency Devaluation Shield Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'سپر ضد تورم ریال:' : 'Devaluation Shield:'}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isFa 
                  ? `حفظ سرمایه به دلار مانع از بین رفتن ${toPersianDigits(formatToman(pureFxProfitToman))} تومان از ارزش خرید شما شده است.`
                  : `Holding crypto shielded ${formatToman(pureFxProfitToman, false)} Toman against local currency loss.`}
              </p>
              <div className="font-mono text-xs font-black text-emerald-400">
                +{toPersianDigits(formatToman(pureFxProfitToman))} تومان حفظ ارزش
              </div>
            </div>

            {/* Outperformance vs 22% Bank Deposit Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'برتری نسبت به سپرده بانکی:' : 'Vs 22% Bank Deposit:'}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isFa 
                  ? `اگر این پول در بانک ایران با سود ۲۲٪ مانده بود، امروز ارزش آن ${toPersianDigits(formatToman(bankTotalToman))} ت بود.`
                  : `Bank deposit would have yielded only ${formatToman(bankTotalToman, false)} Toman.`}
              </p>
              <div className="font-mono text-xs font-black text-emerald-400">
                +{toPersianDigits(formatToman(outperformanceVsBank))} تومان سود مازاد
              </div>
            </div>

          </div>

          {/* Purchasing Power in Gold Coins (سکه بهار آزادی) */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isFa ? 'سنجش بر مبنای سکه تمام بهار آزادی:' : 'Gold Coin Purchasing Power:'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isFa 
                    ? `سرمایه اولیه معادل ${initialSeke.toFixed(1)} سکه طلا بوده و اکنون معادل ${currentSeke.toFixed(1)} سکه است.` 
                    : `Purchasing power grew from ${initialSeke.toFixed(1)} to ${currentSeke.toFixed(1)} gold coins.`}
                </span>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-[10px] text-amber-300 block">{isFa ? 'رشد تعداد سکه:' : 'Gold Multiplier:'}</span>
              <span className="font-mono text-base font-black text-amber-400">
                {initialSeke > 0 ? (currentSeke / initialSeke).toFixed(2) : '1.0'}x
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
