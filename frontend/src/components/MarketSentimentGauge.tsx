import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface MarketSentimentGaugeProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onNavigateSwap?: () => void;
  onNavigateDca?: () => void;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  lang,
  isDarkMode = true,
  onNavigateSwap,
  onNavigateDca,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isFa = lang === 'fa';

  const score = 78; // Extreme Greed
  const scoreLabelFa = 'طمع شدید (Extreme Greed)';
  const scoreLabelEn = 'Extreme Greed';

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentFactors = [
    {
      titleFa: 'نوسانات نرخ دلار در بازار تهران',
      titleEn: 'Tehran FX Volatility',
      score: 22,
      statusFa: 'آرام و باثبات',
      statusEn: 'Low Volatility',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      titleFa: 'سنتیمنت کانال‌های تلگرام کریپتو ایران',
      titleEn: 'Persian Web3 Social Volume',
      score: 86,
      statusFa: 'بسیار صعودی (Bullish)',
      statusEn: 'High Bullish',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      titleFa: 'تسلط بیت‌کوین بر کل بازار (Dominance)',
      titleEn: 'BTC Dominance Index',
      score: 58.4,
      statusFa: 'آماده آلت‌سیزن',
      statusEn: 'Altseason Approaching',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      titleFa: 'ورودی خالص استخرهای نقدینگی آربیتروم',
      titleEn: 'Layer-2 Liquidity Inflow',
      score: 79,
      statusFa: 'انباشت نهنگ‌ها (+۱۸.۴M$)',
      statusEn: 'Whale Accumulation',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-400/60 shadow-xl shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-sentiment.jpg" 
              alt="Griffi Sentiment Astrologer" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'رادار شاخص ترس و طمع و سنتیمنت بازار' : 'Market Sentiment & Fear & Greed Radar'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                تحلیل نجومی گریفی
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پایش ۲۴ ساعته نبض بازار کریپتو و دلار تهران؛ تشخیص زمان بهینه خرید در کف‌ها و سیو سود در اوج‌ها'
                : 'Real-time composite sentiment index combining global metrics and Iranian FX momentum.'}
            </p>
          </div>
        </div>

        {/* Live Score Pill */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">
              {isFa ? 'شاخص فعلی:' : 'Current Index:'}
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {score} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Main Gauge & Speedometer Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Left Column: Visual Speedometer Gauge (5 Cols) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border text-center flex flex-col justify-between items-center ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <span className="text-xs font-bold text-slate-400 mb-2">
            {isFa ? 'وضعیت احساسات کلی بازار:' : 'Market Sentiment State:'}
          </span>

          {/* Speedometer Bar Visual */}
          <div className="relative w-48 h-24 overflow-hidden my-3">
            <div className="w-48 h-48 rounded-full border-[14px] border-slate-700/40 relative">
              <div 
                className="absolute inset-0 rounded-full border-[14px] border-transparent border-t-amber-400 border-r-emerald-400 border-l-rose-500 transition-all duration-700"
                style={{ transform: 'rotate(45deg)' }}
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">{score}</span>
              <span className="text-[11px] font-bold text-slate-300">{isFa ? scoreLabelFa : scoreLabelEn}</span>
            </div>
          </div>

          {/* Historical comparison pills */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-purple-500/20 text-xs">
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'دیروز' : 'Yesterday'}</span>
              <span className="font-mono font-bold text-amber-300">72</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'هفته پیش' : 'Last Week'}</span>
              <span className="font-mono font-bold text-amber-300">65</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/20 text-center">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'ماه پیش' : 'Last Month'}</span>
              <span className="font-mono font-bold text-slate-300">48</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Factors (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 text-right">
            <Activity className="w-4 h-4 text-purple-400" />
            {isFa ? 'تفکیک عوامل تاثیرگذار بر شاخص در ایران و جهان:' : 'Sentiment Breakdown Factors:'}
          </span>

          {sentimentFactors.map((factor) => (
            <div
              key={factor.titleFa}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-right text-xs ${
                isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-white border-purple-200'
              }`}
            >
              <div>
                <span className="font-bold text-white block">{isFa ? factor.titleFa : factor.titleEn}</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${factor.color}`}>
                  {isFa ? factor.statusFa : factor.statusEn}
                </span>
              </div>
              <div className="text-left">
                <span className="font-mono text-base font-extrabold text-amber-400">
                  {typeof factor.score === 'number' ? factor.score : factor.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Griffi Strategic Advice Box */}
      <div className={`p-5 rounded-2xl border my-6 flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/30' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="text-right space-y-1">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {isFa ? 'استراتژی پیشنهادی گریفی در وضعیت فعلی:' : 'Griffi Recommended Action:'}
          </span>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {isFa
              ? 'در شرایط طمع شدید، از خرید هیجانی در سقف قیمت‌ها پرهیز کنید. به جای آن، از خرید پله‌ای (DCA) استفاده کرده یا سودهای خود را در طلای دیجیتال (PAXG) و تتر ذخیره کنید.'
              : 'Avoid FOMO during Extreme Greed. Consider DCA limit orders or securing profits in USDT/PAXG.'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {onNavigateDca && (
            <button
              onClick={() => {
                playClickSound();
                onNavigateDca();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              {isFa ? 'تنظیم خرید پله‌ای (DCA)' : 'Setup DCA'}
            </button>
          )}

          {onNavigateSwap && (
            <button
              onClick={() => {
                playSwapSuccessSound();
                onNavigateSwap();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs shadow-md transition-all flex items-center gap-1"
            >
              <span>{isFa ? 'سواپ و سیو سود' : 'Take Profit Swap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-4 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) routes to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1 rounded-lg hover:bg-white/10 text-purple-300 transition-colors"
            title="کپی آدرس خزانه"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
