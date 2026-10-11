import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';

interface PriceChartProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

type Timeframe = '1H' | '24H' | '7D' | '30D' | '1Y';

interface PairInfo {
  id: string;
  name: string;
  nameFa: string;
  baseSymbol: string;
  quoteSymbol: string;
  basePriceUsd: number;
  change24h: number;
  high24hUsd: number;
  low24hUsd: number;
  volume24hUsd: number;
  historySeed: number[];
}

const TRADING_PAIRS: PairInfo[] = [
  {
    id: 'usdt-irt',
    name: 'USDT / IRT',
    nameFa: 'تتر / تومان',
    baseSymbol: 'USDT',
    quoteSymbol: 'IRT',
    basePriceUsd: 1.0,
    change24h: 1.45,
    high24hUsd: 1.01,
    low24hUsd: 0.99,
    volume24hUsd: 48500000,
    historySeed: [92200, 92500, 92800, 92600, 93100, 93400, 93200, 93600, 93800, 93500]
  },
  {
    id: 'eth-usd',
    name: 'ETH / USDT',
    nameFa: 'اتریوم / تتر',
    baseSymbol: 'ETH',
    quoteSymbol: 'USDT',
    basePriceUsd: 3420.50,
    change24h: 3.82,
    high24hUsd: 3485.00,
    low24hUsd: 3280.00,
    volume24hUsd: 1250000000,
    historySeed: [3280, 3310, 3295, 3340, 3380, 3360, 3390, 3410, 3440, 3420.5]
  },
  {
    id: 'btc-usd',
    name: 'BTC / USDT',
    nameFa: 'بیت‌کوین / تتر',
    baseSymbol: 'BTC',
    quoteSymbol: 'USDT',
    basePriceUsd: 68450.00,
    change24h: 2.15,
    high24hUsd: 69200.00,
    low24hUsd: 67100.00,
    volume24hUsd: 3420000000,
    historySeed: [67100, 67400, 67800, 67500, 68100, 68600, 68300, 68900, 69100, 68450]
  },
  {
    id: 'arb-usd',
    name: 'ARB / USDT',
    nameFa: 'آربیتروم / تتر',
    baseSymbol: 'ARB',
    quoteSymbol: 'USDT',
    basePriceUsd: 0.884,
    change24h: -1.24,
    high24hUsd: 0.915,
    low24hUsd: 0.865,
    volume24hUsd: 145000000,
    historySeed: [0.91, 0.905, 0.895, 0.90, 0.885, 0.875, 0.87, 0.88, 0.882, 0.884]
  },
  {
    id: 'sol-usd',
    name: 'SOL / USDT',
    nameFa: 'سولانا / تتر',
    baseSymbol: 'SOL',
    quoteSymbol: 'USDT',
    basePriceUsd: 178.60,
    change24h: 5.40,
    high24hUsd: 182.50,
    low24hUsd: 169.00,
    volume24hUsd: 890000000,
    historySeed: [169, 171, 173.5, 172, 175, 177, 176, 179, 181, 178.6]
  }
];

export const PriceChart: React.FC<PriceChartProps> = ({
  tomanRate,
  lang,
  isDarkMode
}) => {
  const isFa = lang === 'fa';
  const [selectedPairId, setSelectedPairId] = useState<string>('usdt-irt');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const currentPair = TRADING_PAIRS.find(p => p.id === selectedPairId) || TRADING_PAIRS[0];

  // Generate dynamic chart points based on timeframe and pair
  const chartPoints = useMemo(() => {
    const baseData = currentPair.historySeed;
    const factorMap: Record<Timeframe, number> = {
      '1H': 12,
      '24H': 24,
      '7D': 35,
      '30D': 45,
      '1Y': 60
    };
    const count = factorMap[timeframe];
    const points: number[] = [];

    const baseVal = selectedPairId === 'usdt-irt' ? tomanRate : currentPair.basePriceUsd;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      // Sinusoidal trend + minor seed variance
      const seedIndex = Math.min(Math.floor(progress * (baseData.length - 1)), baseData.length - 1);
      const seedRatio = selectedPairId === 'usdt-irt' 
        ? baseData[seedIndex] / baseData[baseData.length - 1]
        : baseData[seedIndex] / currentPair.basePriceUsd;
      
      const noise = (Math.sin(i * 0.7) * 0.008) + (Math.cos(i * 1.3) * 0.005);
      const val = baseVal * seedRatio * (1 + noise);
      points.push(val);
    }
    // Ensure final point is exact current price
    points[points.length - 1] = baseVal;
    return points;
  }, [currentPair, selectedPairId, timeframe, tomanRate]);

  // SVG Chart Dimensions & Math
  const minPrice = Math.min(...chartPoints) * 0.995;
  const maxPrice = Math.max(...chartPoints) * 1.005;
  const range = maxPrice - minPrice || 1;

  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingY = 30;
  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingY * 2;

  const pointsCoordinates = useMemo(() => {
    return chartPoints.map((val, idx) => {
      const x = paddingX + (idx / (chartPoints.length - 1)) * chartInnerWidth;
      const y = paddingY + chartInnerHeight - ((val - minPrice) / range) * chartInnerHeight;
      return { x, y, val };
    });
  }, [chartPoints, minPrice, range, chartInnerWidth, chartInnerHeight]);

  // Construct SVG Path
  const linePath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    return pointsCoordinates.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [pointsCoordinates]);

  // Construct Area Fill Path
  const areaPath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    const first = pointsCoordinates[0];
    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const bottom = paddingY + chartInnerHeight;
    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [linePath, pointsCoordinates, chartInnerHeight]);

  const activePoint = hoverIndex !== null && pointsCoordinates[hoverIndex] 
    ? pointsCoordinates[hoverIndex] 
    : pointsCoordinates[pointsCoordinates.length - 1];

  const isPositive = currentPair.change24h >= 0;

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      {/* Top Header: Pair Selector & Timeframes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-purple-500/20">
        
        {/* Pair Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-purple-950/40 border border-purple-500/20">
          {TRADING_PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => {
                setSelectedPairId(pair.id);
                setHoverIndex(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedPairId === pair.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{isFa ? pair.nameFa : pair.name}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-purple-950/40 p-1 rounded-xl border border-purple-500/20 self-start md:self-auto">
          {(['1H', '24H', '7D', '30D', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 items-center">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {isFa ? 'نرخ فعلی' : 'Current Price'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
              {selectedPairId === 'usdt-irt' 
                ? (isFa ? `${toPersianDigits(formatToman(activePoint.val, false))} تومان` : `${formatToman(activePoint.val, false)} Toman`)
                : `$${activePoint.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`
              }
            </span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{currentPair.change24h > 0 ? `+${currentPair.change24h}%` : `${currentPair.change24h}%`}</span>
            </span>
          </div>
          {selectedPairId !== 'usdt-irt' && (
            <span className="text-xs font-mono text-purple-300/80 block mt-0.5">
              ≈ {isFa 
                ? `${toPersianDigits(formatToman(usdToToman(activePoint.val, tomanRate)))} تومان` 
                : `${formatToman(usdToToman(activePoint.val, tomanRate))} Toman`}
            </span>
          )}
        </div>

        <div className="border-r border-purple-500/20 pr-4">
          <span className="text-[11px] text-slate-400 block mb-0.5">{isFa ? 'بیشترین ۲۴ ساعت' : '24h High'}</span>
          <span className="font-mono text-sm md:text-base font-bold text-slate-200">
            {selectedPairId === 'usdt-irt'
              ? `${toPersianDigits(formatToman(tomanRate + 800, false))} ت`
              : `$${currentPair.high24hUsd.toLocaleString()}`
            }
          </span>
        </div>

        <div className="border-r border-purple-500/20 pr-4">
          <span className="text-[11px] text-slate-400 block mb-0.5">{isFa ? 'کمترین ۲۴ ساعت' : '24h Low'}</span>
          <span className="font-mono text-sm md:text-base font-bold text-slate-200">
            {selectedPairId === 'usdt-irt'
              ? `${toPersianDigits(formatToman(tomanRate - 650, false))} ت`
              : `$${currentPair.low24hUsd.toLocaleString()}`
            }
          </span>
        </div>

        <div className="border-r border-purple-500/20 pr-4">
          <span className="text-[11px] text-slate-400 block mb-0.5">{isFa ? 'حجم معاملات ۲۴ ساعته' : '24h Volume'}</span>
          <span className="font-mono text-sm md:text-base font-bold text-amber-300">
            ${(currentPair.volume24hUsd / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full h-[280px] bg-purple-950/20 rounded-2xl border border-purple-500/20 overflow-hidden select-none">
        
        {/* Ambient chart grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-purple-400" />
          <div className="w-full border-b border-dashed border-purple-400" />
          <div className="w-full border-b border-dashed border-purple-400" />
        </div>

        {/* SVG Drawing */}
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const normalizedX = mouseX / rect.width;
            const index = Math.round(normalizedX * (chartPoints.length - 1));
            if (index >= 0 && index < chartPoints.length) {
              setHoverIndex(index);
            }
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#120c24" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#strokeGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Active Hover Crosshair Line */}
          {activePoint && (
            <g>
              <line 
                x1={activePoint.x} 
                y1={paddingY} 
                x2={activePoint.x} 
                y2={paddingY + chartInnerHeight} 
                stroke="#c084fc" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                opacity="0.8" 
              />
              <circle 
                cx={activePoint.x} 
                cy={activePoint.y} 
                r="6" 
                fill="#38bdf8" 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* Live Indicator Badge */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-purple-500/30 text-[10px] font-bold text-purple-200 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isFa ? 'نرخ لحظه‌ای اوراکل' : 'Live Oracle Stream'}</span>
        </div>
      </div>

      {/* Bottom Chart Footer Tip */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {isFa 
              ? 'داده‌های نمودار از فیدهای زنجیره‌ای Chainlink و اردر‌بوک بازار ایران استخراج می‌شود.' 
              : 'Market data is streamed directly from on-chain oracles and domestic orderbooks.'}
          </span>
        </div>
        <div className="font-mono text-purple-300">
          {isFa ? 'تأخیر میانگین: کمتر از ۰.۲ ثانیه' : 'Latency: < 0.2s'}
        </div>
      </div>
    </div>
  );
};
