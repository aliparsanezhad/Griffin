import React from 'react';
import { 
  Fuel, 
  Zap
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';

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

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in">
      
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
      </div>

      {/* Grid of Gas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {gasData.map((item) => {
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
    </div>
  );
};
