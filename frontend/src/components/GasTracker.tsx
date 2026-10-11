import React, { useState } from 'react';
import { 
  Fuel, 
  Zap,
  Clock,
  ShieldCheck,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';
import { GasStationSection } from './GasStationSection';

interface GasInfo {
  chain: string;
  symbol: string;
  gwei: number;
  estSwapCostUsd: number;
  speed: 'بسیار ارزان' | 'ارزان' | 'عادی' | 'گران';
  speedEn: 'Lowest' | 'Low' | 'Medium' | 'High';
  statusColor: string;
}

interface GasTrackerProps {
  tomanRate: number;
  lang: 'fa' | 'en';
}

export const GasTracker: React.FC<GasTrackerProps> = ({ tomanRate, lang }) => {
  const isFa = lang === 'fa';
  const [subTab, setSubTab] = useState<'station' | 'radar'>('station');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'l2' | 'l1'>('all');

  const gasData: GasInfo[] = [
    {
      chain: "Base",
      symbol: "ETH",
      gwei: 0.04,
      estSwapCostUsd: 0.01,
      speed: "بسیار ارزان",
      speedEn: "Lowest",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      chain: "Arbitrum One",
      symbol: "ETH",
      gwei: 0.1,
      estSwapCostUsd: 0.02,
      speed: "بسیار ارزان",
      speedEn: "Lowest",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      chain: "Polygon (PoS)",
      symbol: "POL",
      gwei: 35.0,
      estSwapCostUsd: 0.015,
      speed: "ارزان",
      speedEn: "Low",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      chain: "BNB Smart Chain (BSC)",
      symbol: "BNB",
      gwei: 3.0,
      estSwapCostUsd: 0.06,
      speed: "ارزان",
      speedEn: "Low",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      chain: "Optimism",
      symbol: "ETH",
      gwei: 0.08,
      estSwapCostUsd: 0.03,
      speed: "ارزان",
      speedEn: "Low",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      chain: "Ethereum Mainnet",
      symbol: "ETH",
      gwei: 15.5,
      estSwapCostUsd: 1.85,
      speed: "عادی",
      speedEn: "Medium",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    }
  ];

  const filteredData = gasData.filter((item) => {
    if (selectedFilter === 'l2') {
      return item.chain === 'Base' || item.chain === 'Arbitrum One' || item.chain === 'Optimism' || item.chain === 'Polygon (PoS)';
    }
    if (selectedFilter === 'l1') {
      return item.chain === 'Ethereum Mainnet' || item.chain === 'BNB Smart Chain (BSC)';
    }
    return true;
  });

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in text-right space-y-6">
      
      {/* Top Segmented Mode Control */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-purple-950/50 border border-purple-500/30">
          <button
            onClick={() => {
              playClickSound();
              setSubTab('station');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'station'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? 'جایگاه سوخت گریفین (Paymaster تتر)' : 'Gas Station & Paymaster'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setSubTab('radar');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'radar'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? 'رادار لحظه‌ای کارمزد شبکه‌ها' : 'Multi-Chain Gas Radar'}</span>
          </button>
        </div>
      </div>

      {subTab === 'station' ? (
        <GasStationSection tomanRate={tomanRate} lang={lang} />
      ) : (
        <>
          {/* Title */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'رهگیری آنی کارمزد گس شبکه‌ها' : 'Real-Time Gas Tracker'}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold griffin-gradient-text">
              {isFa ? 'هزینه تراکنش در بلاک‌چین‌ها' : 'Multi-Chain Gas Fees'}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {isFa
                ? 'مقایسه هزینه تقریبی هر سواپ به دلار و تومان برای انتخاب بهینه‌ترین زمان و شبکه'
                : 'Compare estimated swap costs across networks in USD and Toman.'}
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedFilter('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-purple-950/40 text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'همه شبکه‌ها' : 'All Chains'}
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedFilter('l2');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'l2'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-purple-950/40 text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'لایه‌های ۲ ارزان (L2)' : 'Cheap L2s'}
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedFilter('l1');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'l1'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-purple-950/40 text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'شبکه‌های اصلی (L1)' : 'Layer 1s'}
              </button>
            </div>
          </div>

      {/* Grid of Gas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredData.map((item) => {
          const costToman = usdToToman(item.estSwapCostUsd, tomanRate);
          return (
            <div
              key={item.chain}
              className="glass-panel p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-white text-sm">{item.chain}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {isFa ? item.speed : item.speedEn}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-black text-white font-mono">{item.gwei}</span>
                  <span className="text-xs text-slate-400 font-semibold">Gwei</span>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/15 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isFa ? 'تخمین هزینه سواپ:' : 'Estimated Swap Cost:'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${item.estSwapCostUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{isFa ? 'معادل تومانی:' : 'In Toman:'}</span>
                  <span className="font-mono font-bold text-amber-300">
                    ≈ {isFa ? `${toPersianDigits(formatToman(costToman))} تومان` : `${formatToman(costToman, false)} Toman`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tehran Timezone Low-Gas Radar Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'ساعات طلایی کمترین کارمزد (به وقت تهران):' : 'Golden Low-Fee Hours (Iran Time):'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFa 
              ? 'ترافیک شبکه اتریوم در ساعات ۰۴:۰۰ صبح تا ۰۹:۳۰ صبح به وقت ایران (همزمان با بسته بودن بازارهای مالی آمریکا و آسیا) به حداقل می‌رسد. در این ساعات گس اتریوم معمولاً زیر ۱۰ Gwei سقوط کرده و هزینه تراکنش تا ۷۰٪ ارزان‌تر می‌شود.'
              : 'Ethereum congestion is lowest between 04:00 AM and 09:30 AM Tehran Time. Gas drops under 10 Gwei, saving up to 70%.'}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isFa ? 'توصیه گریفی: تراکنش‌های بزرگ را صبح زود ثبت کنید' : 'Griffi Tip: Execute large trades early morning'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-amber-950/30 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? 'حفاظت ضد ساندویچ و MEV Blocker:' : 'Anti-Sandwich & MEV Protection:'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFa 
              ? 'ربات‌های فرانت‌رانینگ (Front-running) می‌توانند با افزایش کارمزد، تراکنش شما را ساندویچ کرده و اسلیپیج تحمیل کنند. گریفین‌سواپ از مم‌پول خصوصی Flashbots Protect برای ارسال امن تراکنش‌های بزرگ بدون خطر دیده شدن در مم‌پول عمومی پشتیبانی می‌کند.'
              : 'Front-running bots can sandwich large swaps in public mempools. GriffinSwap supports private Flashbots RPC endpoints to shield orders.'}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'پروتکل امن غیرحضانتی بدون نشت داده' : 'Private Mempool Guard Active'}</span>
          </div>
        </div>
      </div>

      {/* Advice Box for Iranian Users */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 text-xs text-slate-300 leading-relaxed space-y-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2 text-amber-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{isFa ? 'توصیه فنی گریفین برای کاهش کارمزد کاربران ایرانی:' : 'Griffin Cost-Saving Tip:'}</span>
        </h4>
        <p>
          {isFa
            ? 'برای مبالغ کمتر از ۵۰۰ دلار، همواره از شبکه‌های لایه دوم اتریوم (مانند آربیتروم Arbitrum یا بیس Base) استفاده کنید. کارمزد یک مبادله روی آربیتروم کمتر از ۲,۰۰۰ تومان است، در حالی که همان مبادله روی شبکه اصلی اتریوم ممکن است بیش از ۱۸۰,۰۰۰ تومان هزینه گس داشته باشد.'
            : 'For transfers under $500, always prefer Layer-2 networks (Arbitrum, Base). Fees are below $0.05 compared to $2+ on Ethereum Mainnet.'}
        </p>
      </div>
    </>
  )}
</div>
  );
};
