import React from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';

interface MarketTickerProps {
  tomanRate: number;
  rateChange: string;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onSelectPair?: (pairId: string) => void;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  tomanRate,
  rateChange,
  lang,
  isDarkMode = true,
  onSelectPair
}) => {
  const isFa = lang === 'fa';

  const goldSekeToman = Math.round(tomanRate * 558); // Seke Bahar Azadi
  const goldGramToman = Math.round((goldSekeToman / 8.133) * 0.705); // 18k Gram ~ 4.4M Toman
  const aedToman = Math.round(tomanRate / 3.67); // AED / IRT

  const tickerItems = [
    {
      id: 'usdt-irt',
      labelFa: 'تتر / تومان',
      labelEn: 'USDT/IRT',
      value: isFa ? `${toPersianDigits(formatToman(tomanRate, false))} ت` : `${formatToman(tomanRate, false)} T`,
      change: rateChange || '+1.4%',
      isPositive: true
    },
    {
      id: 'seke-irt',
      labelFa: 'سکه تمام آزادی',
      labelEn: 'Gold Coin',
      value: isFa ? `${toPersianDigits(formatToman(goldSekeToman, false))} ت` : `${formatToman(goldSekeToman, false)} T`,
      change: '+0.85%',
      isPositive: true
    },
    {
      id: 'gram-irt',
      labelFa: 'طلای ۱۸ عیار',
      labelEn: '18K Gold',
      value: isFa ? `${toPersianDigits(formatToman(goldGramToman, false))} ت` : `${formatToman(goldGramToman, false)} T`,
      change: '+0.60%',
      isPositive: true
    },
    {
      id: 'eth-usd',
      labelFa: 'اتریوم (ETH)',
      labelEn: 'ETH/USD',
      value: '$3,420.50',
      change: '+3.82%',
      isPositive: true
    },
    {
      id: 'btc-usd',
      labelFa: 'بیت‌کوین (BTC)',
      labelEn: 'BTC/USD',
      value: '$68,450',
      change: '+2.15%',
      isPositive: true
    },
    {
      id: 'aed-irt',
      labelFa: 'درهم امارات',
      labelEn: 'AED/IRT',
      value: isFa ? `${toPersianDigits(formatToman(aedToman, false))} ت` : `${formatToman(aedToman, false)} T`,
      change: '+0.15%',
      isPositive: true
    },
    {
      id: 'arb-usd',
      labelFa: 'آربیتروم (ARB)',
      labelEn: 'ARB/USD',
      value: '$0.884',
      change: '-1.24%',
      isPositive: false
    }
  ];

  return (
    <div className={`w-full border-b overflow-x-auto scrollbar-none py-1.5 px-3 md:px-8 transition-colors select-none ${
      isDarkMode 
        ? 'bg-[#0d091e]/90 border-purple-500/15 text-slate-300' 
        : 'bg-purple-50/70 border-purple-200/80 text-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center gap-6 whitespace-nowrap text-[11px] font-medium">
        
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-l border-purple-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>{isFa ? 'نرخ‌های زنده بازار' : 'Live Feeds'}</span>
          </span>
        </div>

        {/* Scrolling/Flex Items */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
          {tickerItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (onSelectPair) {
                  playClickSound();
                  onSelectPair(item.id);
                }
              }}
              className="group flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              title={isFa ? 'مشاهده در نمودار زنده' : 'View on chart'}
            >
              <span className="text-slate-400 group-hover:text-purple-300 transition-colors">
                {isFa ? item.labelFa : item.labelEn}:
              </span>
              <span className="font-bold font-mono text-white">
                {item.value}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                item.isPositive 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-rose-400 bg-rose-500/10'
              }`}>
                {item.isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                <span>{item.change}</span>
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
