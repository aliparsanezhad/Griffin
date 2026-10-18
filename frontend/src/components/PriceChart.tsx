import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart2,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound } from '../services/soundService';

interface PriceChartProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  onTradePair?: (baseSymbol: string, quoteSymbol: string) => void;
}

type Timeframe = '1H' | '24H' | '7D' | '30D' | '1Y';
type ChartStyle = 'area' | 'candles';

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
  rsi: number;
  bidRatio: number;
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
    rsi: 62.4,
    bidRatio: 64,
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
    rsi: 68.1,
    bidRatio: 58,
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
    rsi: 59.5,
    bidRatio: 53,
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
    rsi: 45.2,
    bidRatio: 48,
    historySeed: [0.91, 0.905, 0.895, 0.90, 0.885, 0.875, 0.87, 0.88, 0.882, 0.884]
  },
  {
    id: 'paxg-usd',
    name: 'PAXG / USDT',
    nameFa: 'طلای دیجیتال / تتر',
    baseSymbol: 'PAXG',
    quoteSymbol: 'USDT',
    basePriceUsd: 2685.50,
    change24h: 0.85,
    high24hUsd: 2705.00,
    low24hUsd: 2660.00,
    volume24hUsd: 65000000,
    rsi: 56.7,
    bidRatio: 61,
    historySeed: [2660, 2668, 2675, 2670, 2682, 2690, 2680, 2695, 2702, 2685.5]
  },
  {
    id: 'shirdal-usd',
    name: 'SHIRDAL / USDT',
    nameFa: 'شیردال / تتر',
    baseSymbol: 'SHIRDAL',
    quoteSymbol: 'USDT',
    basePriceUsd: 0.0000485,
    change24h: 34.80,
    high24hUsd: 0.0000520,
    low24hUsd: 0.0000360,
    volume24hUsd: 1850000,
    rsi: 81.2,
    bidRatio: 76,
    historySeed: [0.000036, 0.000039, 0.000042, 0.000040, 0.000045, 0.000048, 0.000046, 0.000050, 0.000051, 0.0000485]
  }
];

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  isUp: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  tomanRate,
  lang,
  isDarkMode,
  onTradePair
}) => {
  const isFa = lang === 'fa';
  const [selectedPairId, setSelectedPairId] = useState<string>('usdt-irt');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const currentPair = TRADING_PAIRS.find(p => p.id === selectedPairId) || TRADING_PAIRS[0];

  // Dynamic candle count based on timeframe
  const candleCount = useMemo(() => {
    switch (timeframe) {
      case '1H': return 16;
      case '24H': return 28;
      case '7D': return 32;
      case '30D': return 38;
      case '1Y': return 48;
    }
  }, [timeframe]);

  // Generate OHLC candlesticks and volume
  const candles: Candle[] = useMemo(() => {
    const baseData = currentPair.historySeed;
    const baseVal = selectedPairId === 'usdt-irt' ? tomanRate : currentPair.basePriceUsd;
    const result: Candle[] = [];

    for (let i = 0; i < candleCount; i++) {
      const progress = i / (candleCount - 1);
      const seedIndex = Math.min(Math.floor(progress * (baseData.length - 1)), baseData.length - 1);
      const seedRatio = selectedPairId === 'usdt-irt' 
        ? baseData[seedIndex] / baseData[baseData.length - 1]
        : baseData[seedIndex] / currentPair.basePriceUsd;

      // Realistic pseudo-variations
      const noise = (Math.sin(i * 0.7) * 0.008) + (Math.cos(i * 1.3) * 0.005);
      const centerPrice = baseVal * seedRatio * (1 + noise);

      const delta = centerPrice * (0.003 + Math.abs(Math.sin(i * 1.8)) * 0.006);
      const isUp = (i % 3 !== 0) || (i === candleCount - 1 && currentPair.change24h >= 0);

      const open = isUp ? centerPrice - delta * 0.5 : centerPrice + delta * 0.5;
      const close = i === candleCount - 1 ? centerPrice : (isUp ? centerPrice + delta * 0.5 : centerPrice - delta * 0.5);
      const high = Math.max(open, close) + delta * (0.2 + Math.abs(Math.cos(i)) * 0.4);
      const low = Math.min(open, close) - delta * (0.2 + Math.abs(Math.sin(i)) * 0.4);
      const volume = Math.abs(Math.sin(i * 0.8) * 80 + 20);

      result.push({
        open,
        close,
        high,
        low,
        volume,
        isUp: close >= open
      });
    }

    // Ensure final candle closes at baseVal
    const last = result[result.length - 1];
    last.close = baseVal;
    last.high = Math.max(last.high, baseVal);
    last.low = Math.min(last.low, baseVal);
    last.isUp = last.close >= last.open;

    return result;
  }, [currentPair, selectedPairId, candleCount, tomanRate]);

  // Chart math & dimensions
  const allLows = candles.map(c => c.low);
  const allHighs = candles.map(c => c.high);
  const minPrice = Math.min(...allLows) * 0.997;
  const maxPrice = Math.max(...allHighs) * 1.003;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

  const svgWidth = 840;
  const svgHeight = 320;
  const paddingX = 42;
  const paddingTop = 25;
  const paddingBottom = 50; // space for volume histogram
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const getX = (idx: number) => {
    return paddingX + (idx / (candleCount - 1)) * chartWidth;
  };

  // Line coordinates for Area mode
  const linePoints = useMemo(() => {
    return candles.map((c, idx) => ({
      x: getX(idx),
      y: getY(c.close),
      val: c.close
    }));
  }, [candles, candleCount, minPrice, priceRange, chartHeight, chartWidth]);

  const linePath = useMemo(() => {
    if (linePoints.length === 0) return '';
    return linePoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [linePoints]);

  const areaPath = useMemo(() => {
    if (linePoints.length === 0) return '';
    const first = linePoints[0];
    const last = linePoints[linePoints.length - 1];
    const bottom = paddingTop + chartHeight;
    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [linePath, linePoints, chartHeight]);

  const activeCandle = hoverIndex !== null && candles[hoverIndex] 
    ? candles[hoverIndex] 
    : candles[candles.length - 1];

  const activePrice = activeCandle.close;
  const isPositive = currentPair.change24h >= 0;

  const candleBarWidth = Math.max(4, Math.min(18, (chartWidth / candleCount) * 0.65));

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all relative overflow-hidden ${
      isDarkMode 
        ? 'bg-[#100b24]/95 border-purple-500/25 text-slate-100 shadow-purple-950/40' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      {/* Top Header: Pair Selector, Chart Modes, Timeframes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-purple-500/20">
        
        {/* Pair Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-purple-950/50 border border-purple-500/20">
          {TRADING_PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => {
                playClickSound();
                setSelectedPairId(pair.id);
                setHoverIndex(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPairId === pair.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{isFa ? pair.nameFa : pair.name}</span>
            </button>
          ))}
        </div>

        {/* Right side controls: Chart Mode Toggle & Timeframes */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Chart Style: Area vs Candles */}
          <div className="flex items-center gap-1 bg-purple-950/60 p-1 rounded-xl border border-purple-500/20">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setChartStyle('candles');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartStyle === 'candles'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isFa ? 'نمودار کندل‌استیک حرفه‌ای' : 'Candlestick Chart'}
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFa ? 'کندل‌استیک' : 'Candles'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setChartStyle('area');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                chartStyle === 'area'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isFa ? 'نمودار پیوسته خطی' : 'Area Line Chart'}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isFa ? 'پیوسته' : 'Area'}</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-purple-950/60 p-1 rounded-xl border border-purple-500/20">
            {(['1H', '24H', '7D', '30D', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  playClickSound();
                  setTimeframe(tf);
                  setHoverIndex(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
      </div>

      {/* Price Summary Row & Live Technical Intelligence */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-5 items-center border-b border-purple-500/10">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {isFa ? 'نرخ لحظه‌ای' : 'Current Price'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
              {selectedPairId === 'usdt-irt' 
                ? (isFa ? `${toPersianDigits(formatToman(activePrice, false))} تومان` : `${formatToman(activePrice, false)} Toman`)
                : `$${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: activePrice < 0.01 ? 6 : 3 })}`
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
                ? `${toPersianDigits(formatToman(usdToToman(activePrice, tomanRate)))} تومان` 
                : `${formatToman(usdToToman(activePrice, tomanRate))} Toman`}
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
          <span className="text-[11px] text-slate-400 block mb-0.5">{isFa ? 'حجم ۲۴ ساعت' : '24h Volume'}</span>
          <span className="font-mono text-sm md:text-base font-bold text-amber-300">
            ${(currentPair.volume24hUsd / 1000000).toFixed(1)}M
          </span>
        </div>

        {/* 1-Click Quick Trade Button */}
        <div className="col-span-2 md:col-span-1 flex justify-start md:justify-end">
          <button
            type="button"
            onClick={() => {
              playSwapStartSound();
              if (onTradePair) {
                onTradePair(currentPair.baseSymbol, currentPair.quoteSymbol);
              }
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? `سواپ ${currentPair.baseSymbol} ⚡` : `Swap ${currentPair.baseSymbol} ⚡`}</span>
          </button>
        </div>
      </div>

      {/* Technical Indicators Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{isFa ? 'اندیکاتورها:' : 'Signals:'}</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-500/20 font-mono text-[10px] text-purple-200">
            RSI(14): <strong className="text-cyan-300">{currentPair.rsi}</strong> ({currentPair.rsi > 70 ? (isFa ? 'اشباع خرید' : 'Overbought') : currentPair.rsi < 30 ? (isFa ? 'اشباع فروش' : 'Oversold') : (isFa ? 'مومنتوم صعودی' : 'Bullish')})
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 font-mono text-[10px] text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            EMA 20/50: Golden Cross
          </span>
        </div>

        {/* Live Depth / Orderbook Ratio Bar */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-slate-400">{isFa ? 'عمق بازار:' : 'Depth:'}</span>
          <div className="w-28 h-2.5 rounded-full bg-purple-950 overflow-hidden flex ring-1 ring-purple-500/20">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${currentPair.bidRatio}%` }} />
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - currentPair.bidRatio}%` }} />
          </div>
          <span className="text-emerald-400 font-bold">{currentPair.bidRatio}% {isFa ? 'خرید' : 'Bids'}</span>
          <span className="text-slate-500">/</span>
          <span className="text-rose-400 font-bold">{100 - currentPair.bidRatio}% {isFa ? 'فروش' : 'Asks'}</span>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full h-[320px] bg-purple-950/20 rounded-2xl border border-purple-500/20 overflow-hidden select-none mt-2">
        
        {/* Ambient chart horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-purple-400" />
          <div className="w-full border-b border-dashed border-purple-400" />
          <div className="w-full border-b border-dashed border-purple-400" />
          <div className="w-full border-b border-dashed border-purple-400" />
        </div>

        {/* SVG Drawing Canvas */}
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const normalizedX = mouseX / rect.width;
            const index = Math.round(normalizedX * (candleCount - 1));
            if (index >= 0 && index < candleCount) {
              setHoverIndex(index);
            }
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#120c24" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Volume Histogram at the bottom (20% height) */}
          {candles.map((c, idx) => {
            const x = getX(idx);
            const barH = (c.volume / maxVolume) * (paddingBottom - 10);
            const barY = svgHeight - 8 - barH;
            return (
              <rect
                key={`vol-${idx}`}
                x={x - candleBarWidth / 2}
                y={barY}
                width={candleBarWidth}
                height={barH}
                fill={c.isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}
                rx="1"
              />
            );
          })}

          {/* MODE 1: Area Line Chart */}
          {chartStyle === 'area' && (
            <>
              <path d={areaPath} fill="url(#chartGradient)" />
              <path 
                d={linePath} 
                fill="none" 
                stroke="url(#strokeGradient)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </>
          )}

          {/* MODE 2: Candlestick Chart */}
          {chartStyle === 'candles' && (
            candles.map((c, idx) => {
              const x = getX(idx);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);

              const topBodyY = Math.min(openY, closeY);
              const bodyHeight = Math.max(3, Math.abs(closeY - openY));
              const color = c.isUp ? '#10b981' : '#f43f5e';

              return (
                <g key={`candle-${idx}`} className="transition-opacity">
                  {/* High - Low Wick */}
                  <line 
                    x1={x} 
                    y1={highY} 
                    x2={x} 
                    y2={lowY} 
                    stroke={color} 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  {/* Candle Body */}
                  <rect 
                    x={x - candleBarWidth / 2} 
                    y={topBodyY} 
                    width={candleBarWidth} 
                    height={bodyHeight} 
                    fill={color} 
                    rx="1.5" 
                  />
                </g>
              );
            })
          )}

          {/* Active Hover Crosshair Line & Point */}
          {hoverIndex !== null && (
            <g>
              <line 
                x1={getX(hoverIndex)} 
                y1={paddingTop} 
                x2={getX(hoverIndex)} 
                y2={svgHeight - 10} 
                stroke="#c084fc" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                opacity="0.85" 
              />
              <circle 
                cx={getX(hoverIndex)} 
                cy={getY(activeCandle.close)} 
                r="6" 
                fill={activeCandle.isUp ? '#10b981' : '#f43f5e'} 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* Live Indicator Badge */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-purple-500/30 text-[10px] font-bold text-purple-200 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isFa ? 'نرخ زنده اوراکل (کمتر از ۰.۲ ثانیه)' : 'Live Oracle Stream (<0.2s)'}</span>
        </div>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && (
          <div 
            className="absolute top-3 right-4 p-2.5 rounded-xl bg-black/85 border border-purple-500/40 text-right backdrop-blur-md text-[10px] font-mono shadow-xl space-y-0.5 animate-fade-in"
          >
            <div className="text-slate-400 font-sans font-bold">
              {isFa ? `نقطه ${toPersianDigits(hoverIndex + 1)} از ${toPersianDigits(candleCount)}` : `Bar #${hoverIndex + 1}`}
            </div>
            <div className="flex justify-between gap-3 text-slate-200">
              <span className="text-slate-400">Open:</span>
              <span>${activeCandle.open.toFixed(activeCandle.open < 0.01 ? 6 : 2)}</span>
            </div>
            <div className="flex justify-between gap-3 text-emerald-400">
              <span className="text-slate-400">High:</span>
              <span>${activeCandle.high.toFixed(activeCandle.high < 0.01 ? 6 : 2)}</span>
            </div>
            <div className="flex justify-between gap-3 text-rose-400">
              <span className="text-slate-400">Low:</span>
              <span>${activeCandle.low.toFixed(activeCandle.low < 0.01 ? 6 : 2)}</span>
            </div>
            <div className="flex justify-between gap-3 text-white font-bold border-t border-white/10 pt-0.5">
              <span className="text-slate-400">Close:</span>
              <span>${activeCandle.close.toFixed(activeCandle.close < 0.01 ? 6 : 2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Chart Footer Tip */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isFa 
              ? 'داده‌های زنده از فیدهای چندزنجیره‌ای Chainlink و اردر‌بوک صرافی‌های نوبیتکس و تترلند استخراج می‌شوند.' 
              : 'Market data is streamed directly from on-chain Chainlink oracles and domestic L2 orderbooks.'}
          </span>
        </div>
        <div className="font-mono text-purple-300">
          {isFa ? 'حالت نمودار: تحلیل تکنیکال حرفه‌ای گریفین' : 'Griffin Technical Suite 2.0'}
        </div>
      </div>
    </div>
  );
};
