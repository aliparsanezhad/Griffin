import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink, 
  Flame, 
  Info, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Share2,
  X,
  Sparkles
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound, playSwapSuccessSound, playFuturesLeverageTick } from '../services/soundService';

interface PerpFuturesProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface FuturesPair {
  id: string;
  symbol: string;
  name: string;
  nameFa: string;
  price: number;
  change24h: number;
  fundingRate: number; // percentage
  maxLeverage: number;
}

interface OpenPosition {
  id: string;
  pairId: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  marginUsd: number;
  leverage: number;
  sizeUsd: number;
  liquidationPrice: number;
  openedAt: string;
}

const FUTURES_PAIRS: FuturesPair[] = [
  { id: 'btc-perp', symbol: 'BTC-PERP', name: 'Bitcoin Perpetual', nameFa: 'بیت‌کوین دائمی', price: 68450, change24h: 2.15, fundingRate: 0.012, maxLeverage: 50 },
  { id: 'eth-perp', symbol: 'ETH-PERP', name: 'Ethereum Perpetual', nameFa: 'اتریوم دائمی', price: 3420, change24h: 3.82, fundingRate: 0.009, maxLeverage: 50 },
  { id: 'sol-perp', symbol: 'SOL-PERP', name: 'Solana Perpetual', nameFa: 'سولانا دائمی', price: 178.6, change24h: 5.4, fundingRate: 0.015, maxLeverage: 25 },
  { id: 'paxg-perp', symbol: 'PAXG-PERP', name: 'Gold PAXG Perpetual', nameFa: 'طلای دیجیتال دائمی', price: 2640, change24h: 0.85, fundingRate: 0.005, maxLeverage: 30 },
  { id: 'arb-perp', symbol: 'ARB-PERP', name: 'Arbitrum Perpetual', nameFa: 'آربیتروم دائمی', price: 0.884, change24h: -1.24, fundingRate: -0.004, maxLeverage: 20 },
];

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const PerpFuturesSection: React.FC<PerpFuturesProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';

  const [selectedPair, setSelectedPair] = useState<FuturesPair>(FUTURES_PAIRS[0]);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState<number>(10);
  const [marginInput, setMarginInput] = useState<string>('200');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [fundingCountdown, setFundingCountdown] = useState<string>('03:42:18');

  // Stored active positions
  const [positions, setPositions] = useState<OpenPosition[]>([
    {
      id: 'pos-1',
      pairId: 'btc-perp',
      symbol: 'BTC-PERP',
      side: 'long',
      entryPrice: 67900,
      marginUsd: 500,
      leverage: 10,
      sizeUsd: 5000,
      liquidationPrice: 61790,
      openedAt: '1403/07/20 18:24',
    },
    {
      id: 'pos-2',
      pairId: 'paxg-perp',
      symbol: 'PAXG-PERP',
      side: 'long',
      entryPrice: 2615,
      marginUsd: 300,
      leverage: 5,
      sizeUsd: 1500,
      liquidationPrice: 2145,
      openedAt: '1403/07/21 11:10',
    },
  ]);

  // Dynamic countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = 7 - (now.getHours() % 8);
      const mins = 59 - now.getMinutes();
      const secs = 59 - now.getSeconds();
      setFundingCountdown(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const marginNum = parseFloat(marginInput) || 0;
  const positionSizeUsd = marginNum * leverage;
  const marginToman = usdToToman(marginNum, tomanRate);
  const positionSizeToman = usdToToman(positionSizeUsd, tomanRate);

  // Liquidation calculation
  const maintenanceMargin = 0.05; // 5% maintenance
  const liquidationPrice = side === 'long'
    ? selectedPair.price * (1 - (1 / leverage) + maintenanceMargin)
    : selectedPair.price * (1 + (1 / leverage) - maintenanceMargin);

  const distanceToLiqPercent = Math.max(0.1, Math.abs((selectedPair.price - liquidationPrice) / selectedPair.price) * 100);
  const distanceToLiqUsd = Math.abs(selectedPair.price - liquidationPrice);

  const setTpByPercent = (percent: number) => {
    playClickSound();
    const priceShift = (selectedPair.price * (percent / 100)) / leverage;
    const target = side === 'long' ? (selectedPair.price + priceShift) : (selectedPair.price - priceShift);
    setTakeProfitPrice(Math.round(target).toString());
  };

  const setSlByPercent = (percent: number) => {
    playClickSound();
    const priceShift = (selectedPair.price * (percent / 100)) / leverage;
    const target = side === 'long' ? (selectedPair.price - priceShift) : (selectedPair.price + priceShift);
    setStopLossPrice(Math.round(target).toString());
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleOpenPosition = () => {
    if (marginNum <= 0) return;
    playSwapStartSound();

    const newPos: OpenPosition = {
      id: `pos-${Date.now()}`,
      pairId: selectedPair.id,
      symbol: selectedPair.symbol,
      side,
      entryPrice: selectedPair.price,
      marginUsd: marginNum,
      leverage,
      sizeUsd: positionSizeUsd,
      liquidationPrice,
      openedAt: isFa ? 'هم‌اکنون' : 'Just now',
    };

    setPositions([newPos, ...positions]);
    playSwapSuccessSound();
  };

  const [closedPositionToast, setClosedPositionToast] = useState<{ symbol: string; pnlUsd: number } | null>(null);
  const [sharingPosition, setSharingPosition] = useState<{
    pos: OpenPosition;
    currentPair: FuturesPair;
    pnlPercent: number;
    pnlUsd: number;
    pnlToman: number;
  } | null>(null);
  const [copiedPnlCard, setCopiedPnlCard] = useState<boolean>(false);

  const handleClosePosition = (id: string, symbol: string, pnlUsd: number) => {
    playClickSound();
    setPositions(positions.filter((p) => p.id !== id));
    playSwapSuccessSound();
    setClosedPositionToast({ symbol, pnlUsd });
    setTimeout(() => setClosedPositionToast(null), 4000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-400/60 shadow-xl shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-futures.jpg" 
              alt="Griffi Futures Pilot" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'معاملات تعهدی و فیوچرز دائمی غیرمتمرکز (Perpetual Futures)' : 'Decentralized Perpetual Futures'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                Up to 50x
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'معاملات لانگ و شورت با تتر و اهرم دلخواه بدون نیاز به احراز هویت (KYC)؛ مصون از تحریم‌ها و انسداد حساب صرافی‌های متمرکز با تسویه تومانی لحظه‌ای'
                : 'Trade Long & Short positions with up to 50x leverage. Non-custodial on-chain synthetic settlement with zero geoblocking.'}
            </p>
          </div>
        </div>

        {/* Funding Rate Clock */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">
              {isFa ? 'فاندینگ ریت بعدی:' : 'Next Funding:'}
            </span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {fundingCountdown} ({selectedPair.fundingRate > 0 ? `+${selectedPair.fundingRate}%` : `${selectedPair.fundingRate}%`})
            </span>
          </div>
        </div>
      </div>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-purple-500/10 no-scrollbar">
        {FUTURES_PAIRS.map((pair) => {
          const isSelected = selectedPair.id === pair.id;
          return (
            <button
              key={pair.id}
              onClick={() => {
                playClickSound();
                setSelectedPair(pair);
              }}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/30 ring-1 ring-purple-400'
                  : isDarkMode
                    ? 'bg-purple-950/20 border-purple-500/20 text-slate-300 hover:bg-purple-950/40'
                    : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50'
              }`}
            >
              <span>{pair.symbol}</span>
              <span className="font-mono text-xs">${pair.price.toLocaleString()}</span>
              <span className={`text-[10px] font-mono ${pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pair.change24h >= 0 ? `+${pair.change24h}%` : `${pair.change24h}%`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Trading Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        
        {/* Left: Position Configuration Order Form (5 Cols) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border text-right space-y-5 ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/25' : 'bg-purple-50/70 border-purple-200'
        }`}>
          
          {/* Long / Short Toggle */}
          <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${
            isDarkMode ? 'bg-black/40 border-purple-500/20' : 'bg-white border-purple-200 shadow-inner'
          }`}>
            <button
              onClick={() => {
                playClickSound();
                setSide('long');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                side === 'long'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              <span>{isFa ? 'لانگ (خرید صعودی)' : 'LONG (Bullish)'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSide('short');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                side === 'short'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-300" />
              <span>{isFa ? 'شورت (فروش نزولی)' : 'SHORT (Bearish)'}</span>
            </button>
          </div>

          {/* Leverage Selector & Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                {isFa ? 'اهرم معاملاتی (Leverage):' : 'Trading Leverage:'}
              </span>
              <span className="font-mono font-black text-amber-500 dark:text-amber-400 text-sm">
                {leverage}x
              </span>
            </div>

            {/* Slider */}
            <input 
              type="range"
              min="1"
              max={selectedPair.maxLeverage}
              value={leverage}
              onChange={(e) => {
                setLeverage(Number(e.target.value));
                playFuturesLeverageTick();
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />

            {/* Quick Leverage Presets */}
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
              {[2, 5, 10, 20, selectedPair.maxLeverage].map((lev) => (
                <button
                  key={lev}
                  onClick={() => {
                    playClickSound();
                    setLeverage(lev);
                  }}
                  className={`px-2 py-1 rounded-lg border transition-all ${
                    leverage === lev
                      ? 'bg-amber-400/20 border-amber-400 text-amber-500 dark:text-amber-300 font-bold'
                      : isDarkMode
                        ? 'border-purple-500/20 text-slate-400 hover:text-white'
                        : 'border-purple-200 text-slate-600 hover:bg-purple-100'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            {leverage >= 20 && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{isFa ? 'هشدار ریسک: اهرم بالای ۲۰ نوسان شدید و احتمال لیکوئید شدن سریع دارد.' : 'High leverage risk warning.'}</span>
              </div>
            )}
          </div>

          {/* Margin Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className={`font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {isFa ? 'مارجین ودیعه (USDT):' : 'Margin Collateral (USDT):'}
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {isFa ? 'موجودی در دسترس: ۲,۴۵۰ USDT' : 'Avail: 2,450 USDT'}
              </span>
            </div>

            <div className="relative">
              <input 
                type="number"
                value={marginInput}
                onChange={(e) => setMarginInput(e.target.value)}
                placeholder="200"
                className={`w-full p-3 rounded-xl border font-mono text-sm focus:outline-none focus:border-purple-400 ${
                  isDarkMode 
                    ? 'bg-black/40 border-purple-500/30 text-white' 
                    : 'bg-white border-purple-200 text-slate-900'
                }`}
              />
              <span className="absolute left-3 top-3 text-xs text-purple-400 font-bold">
                USDT
              </span>
            </div>

            {/* Quick Margin Chips */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {[50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMarginInput(amt.toString());
                  }}
                  className={`flex-1 py-1 rounded-lg border font-mono text-[11px] transition-all min-w-[42px] ${
                    marginInput === amt.toString()
                      ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-sm'
                      : isDarkMode
                        ? 'bg-purple-950/40 border-purple-500/20 text-slate-300 hover:bg-purple-900/40'
                        : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setMarginInput('2450');
                }}
                className="py-1 px-2.5 rounded-lg border font-mono text-[11px] font-bold bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all shrink-0"
              >
                MAX
              </button>
            </div>

            <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isFa ? 'معادل تومانی ودیعه:' : 'Toman Equivalent:'} {isFa ? toPersianDigits(formatToman(marginToman)) : formatToman(marginToman)} {isFa ? 'تومان' : 'IRT'}
            </div>
          </div>

          {/* TP & SL Inputs with ROI Quick Preset Chips */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={`block font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isFa ? 'حد سود (TP):' : 'Take Profit:'}
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">+ROI</span>
                </div>
                <input 
                  type="number"
                  placeholder={side === 'long' ? `${selectedPair.price * 1.1}` : `${selectedPair.price * 0.9}`}
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                    isDarkMode 
                      ? 'bg-black/30 border-emerald-500/30 text-emerald-300' 
                      : 'bg-white border-emerald-300 text-emerald-800'
                  }`}
                />
                {/* TP Quick Presets */}
                <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
                  {[25, 50, 100, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTpByPercent(pct)}
                      className="py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                      title={isFa ? `تنظیم تارگت سود +${pct}٪` : `+${pct}% ROI`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={`block font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isFa ? 'حد ضرر (SL):' : 'Stop Loss:'}
                  </label>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">-ROI</span>
                </div>
                <input 
                  type="number"
                  placeholder={side === 'long' ? `${selectedPair.price * 0.95}` : `${selectedPair.price * 1.05}`}
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                    isDarkMode 
                      ? 'bg-black/30 border-rose-500/30 text-rose-300' 
                      : 'bg-white border-rose-300 text-rose-800'
                  }`}
                />
                {/* SL Quick Presets */}
                <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
                  {[10, 20, 35, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSlByPercent(pct)}
                      className="py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title={isFa ? `تنظیم حد ضرر -${pct}٪` : `-${pct}% ROI`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Liquidation Danger Zone Interactive Meter */}
            <div className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
              distanceToLiqPercent <= 4 
                ? 'bg-rose-950/40 border-rose-500/40 shadow-lg shadow-rose-950/30' 
                : distanceToLiqPercent <= 10 
                  ? 'bg-amber-950/30 border-amber-500/30' 
                  : isDarkMode ? 'bg-black/40 border-purple-500/20' : 'bg-white border-purple-200'
            }`}>
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className={`w-3.5 h-3.5 ${
                    distanceToLiqPercent <= 4 ? 'text-rose-400 animate-bounce' : distanceToLiqPercent <= 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`} />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                    {isFa ? 'حاشیه ایمنی فاصله تا لیکوئید:' : 'Liquidation Safety Buffer:'}
                  </span>
                </span>
                <span dir="ltr" className={`font-mono font-black ${
                  distanceToLiqPercent <= 4 ? 'text-rose-400' : distanceToLiqPercent <= 10 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {distanceToLiqPercent.toFixed(1)}% (${Math.round(distanceToLiqUsd).toLocaleString()})
                </span>
              </div>

              {/* Meter progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden relative border border-white/5">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    distanceToLiqPercent <= 4 
                      ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse' 
                      : distanceToLiqPercent <= 10 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(6, distanceToLiqPercent * 4))}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                <span className="text-rose-400 font-bold">{isFa ? 'خطر شدید (<۴٪)' : 'High Risk (<4%)'}</span>
                <span className="text-amber-400">{isFa ? 'احتیاط' : 'Caution'}</span>
                <span className="text-emerald-400 font-bold">{isFa ? 'امن (>۱۰٪)' : 'Safe (>10%)'}</span>
              </div>
            </div>
          </div>

          {/* Order Summary Specs */}
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
            isDarkMode ? 'bg-black/30 border-purple-500/20' : 'bg-white border-purple-200 shadow-sm'
          }`}>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{isFa ? 'ارزش کل پوزیشن:' : 'Total Position Size:'}</span>
              <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${positionSizeUsd.toLocaleString()} ({isFa ? toPersianDigits(formatToman(positionSizeToman)) : formatToman(positionSizeToman)} ت)</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{isFa ? 'قیمت ورود تخمینی:' : 'Est. Entry Price:'}</span>
              <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${selectedPair.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{isFa ? 'قیمت لیکوئید شدن:' : 'Liquidation Price:'}</span>
              <span className="font-mono font-bold text-rose-500">${Math.round(liquidationPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{isFa ? 'کارمزد باز کردن (۰.۵٪):' : 'Trading Fee (0.5%):'}</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-300">${(positionSizeUsd * 0.005).toFixed(2)} USDT</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleOpenPosition}
            disabled={marginNum <= 0}
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
              side === 'long'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/50'
            }`}
          >
            <span>
              {side === 'long' 
                ? (isFa ? `باز کردن پوزیشن لانگ ${selectedPair.symbol}` : `Open Long ${selectedPair.symbol}`)
                : (isFa ? `باز کردن پوزیشن شورت ${selectedPair.symbol}` : `Open Short ${selectedPair.symbol}`)
              }
            </span>
          </button>
        </div>

        {/* Right: Active Positions & Educational Cockpit (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Open Positions List */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-purple-950/30 border-purple-500/25' : 'bg-purple-50/70 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-sm text-white">
                  {isFa ? 'پوزیشن‌های فعال زنجیره‌ای شما' : 'Active On-Chain Positions'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold">
                {positions.length} {isFa ? 'پوزیشن باز' : 'Open'}
              </span>
            </div>

            {/* Closed Position Settlement Confirmation Toast */}
            {closedPositionToast && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fade-in shadow-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isFa 
                      ? `پوزیشن ${closedPositionToast.symbol} با موفقیت بسته شد. سود و اصل مارجین به کیف‌پول شما تسویه گردید.` 
                      : `Position ${closedPositionToast.symbol} closed. P&L settled to self-custody wallet.`}
                  </span>
                </div>
                <span dir="ltr" className={`font-mono font-bold shrink-0 ${closedPositionToast.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {closedPositionToast.pnlUsd >= 0 ? `+${closedPositionToast.pnlUsd.toFixed(2)}` : closedPositionToast.pnlUsd.toFixed(2)} USD
                </span>
              </div>
            )}

            {positions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {isFa ? 'در حال حاضر هیچ پوزیشن فعالی ندارید.' : 'No active positions.'}
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map((pos) => {
                  const currentPair = FUTURES_PAIRS.find(p => p.id === pos.pairId) || selectedPair;
                  const priceDiff = pos.side === 'long'
                    ? (currentPair.price - pos.entryPrice)
                    : (pos.entryPrice - currentPair.price);
                  const pnlPercent = (priceDiff / pos.entryPrice) * pos.leverage * 100;
                  const pnlUsd = (pos.marginUsd * pnlPercent) / 100;
                  const pnlToman = usdToToman(pnlUsd, tomanRate);

                  return (
                    <div 
                      key={pos.id}
                      className={`p-4 rounded-xl border text-right space-y-3 text-xs ${
                        isDarkMode ? 'bg-black/40 border-purple-500/20' : 'bg-white border-purple-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                          }`}>
                            {pos.side.toUpperCase()} {pos.leverage}x
                          </span>
                          <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pos.symbol}</span>
                          <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>({pos.openedAt})</span>
                        </div>

                        {/* PnL Display with BiDi LTR fix */}
                        <div className="text-left font-mono">
                          <span dir="ltr" className={`text-sm font-black inline-block ${pnlUsd >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {pnlUsd >= 0 ? `+${pnlUsd.toFixed(2)}` : pnlUsd.toFixed(2)} USD ({pnlPercent >= 0 ? `+${pnlPercent.toFixed(1)}%` : `${pnlPercent.toFixed(1)}%`})
                          </span>
                          <span className={`block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isFa ? toPersianDigits(formatToman(pnlToman)) : formatToman(pnlToman)} ت
                          </span>
                        </div>
                      </div>

                      {/* Specs Grid */}
                      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50/70 border border-purple-100'}`}>
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 block text-[9px]'}>{isFa ? 'قیمت ورود' : 'Entry Price'}</span>
                          <span>${pos.entryPrice.toLocaleString()}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50/70 border border-purple-100'}`}>
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 block text-[9px]'}>{isFa ? 'مارجین' : 'Margin'}</span>
                          <span>${pos.marginUsd}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50/70 border border-purple-100'}`}>
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 block text-[9px]'}>{isFa ? 'حجم کل' : 'Size'}</span>
                          <span>${pos.sizeUsd.toLocaleString()}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                          <span className="block text-[9px]">{isFa ? 'قیمت لیکوئید' : 'Liq. Price'}</span>
                          <span>${Math.round(pos.liquidationPrice).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setSharingPosition({
                              pos,
                              currentPair,
                              pnlPercent,
                              pnlUsd,
                              pnlToman,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border font-bold text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{isFa ? 'کارت اشتراک سود 📸' : 'Share PnL 📸'}</span>
                        </button>

                        <button
                          onClick={() => handleClosePosition(pos.id, pos.symbol, pnlUsd)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/30' 
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                          }`}
                        >
                          {isFa ? 'بستن پوزیشن و تسویه' : 'Close Position'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Persian Web3 Advantage FAQ Card */}
          <div className={`p-5 rounded-2xl border text-right space-y-2.5 ${
            isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          }`}>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              {isFa ? 'چرا فیوچرز غیرمتمرکز گریفین سواپ برای ایرانیان ایمن‌تر است؟' : 'Why Griffin Futures is Safer for Iranians'}
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>{isFa ? 'عدم نیاز به احراز هویت (KYC): دارایی‌ها همیشه در قرارداد هوشمند ولت خودتان قرار دارد.' : 'Zero KYC: Self-custody smart contract safety.'}</li>
              <li>{isFa ? 'بدون مسدودی حساب یا خطای آی‌پی ۴۰۳: سرورها کاملاً ضدسانسور و غیرمتمرکز هستند.' : 'No geoblocking or account freezes.'}</li>
              <li>{isFa ? 'تسویه سود لحظه‌ای به استیبل‌کوین تتر (USDT) روی شبکه‌های لایه دو کم‌کارمزد (Arbitrum/Base).' : 'Instant USDT settlement on Layer 2.'}</li>
            </ul>
          </div>
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
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای پوزیشن‌های فیوچرز مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) routes directly to verified treasury:'}
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
            {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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

      {/* Glossy PnL Share Poster Modal with 3D Pilot Griffi */}
      {sharingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-md rounded-3xl p-6 border border-purple-500/40 bg-gradient-to-b from-[#190f38] via-[#100a26] to-[#0a0618] text-white shadow-2xl relative overflow-hidden">
            
            {/* Ambient decorative aura */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              sharingPosition.pnlPercent >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`} />

            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound();
                setSharingPosition(null);
                setCopiedPnlCard(false);
              }}
              className="absolute top-4 left-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Platform Branding */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <img src="/mascot/griffi-avatar.jpg" alt="Griffin DEX" className="w-7 h-7 rounded-lg ring-1 ring-amber-400/50" />
                <div>
                  <span className="font-black text-sm block griffin-gradient-text">GriffinSwap 2.0</span>
                  <span className="text-[10px] text-slate-400 font-mono block leading-none">50x On-Chain Perpetual DEX</span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Verified On-Chain</span>
              </span>
            </div>

            {/* Poster Body */}
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black" style={{
                  backgroundColor: sharingPosition.pos.side === 'long' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  color: sharingPosition.pos.side === 'long' ? '#34d399' : '#fb7185',
                  border: `1px solid ${sharingPosition.pos.side === 'long' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
                }}>
                  <Flame className="w-3.5 h-3.5" />
                  <span>{sharingPosition.pos.symbol} • {sharingPosition.pos.side.toUpperCase()} {sharingPosition.pos.leverage}x</span>
                </div>

                {/* Massive ROI Typography */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">{isFa ? 'بازدهی سرمایه (ROI):' : 'Return on Investment:'}</span>
                  <span dir="ltr" className={`text-4xl sm:text-5xl font-black font-mono tracking-tight block ${
                    sharingPosition.pnlPercent >= 0 
                      ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                      : 'text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]'
                  }`}>
                    {sharingPosition.pnlPercent >= 0 ? `+${sharingPosition.pnlPercent.toFixed(2)}%` : `${sharingPosition.pnlPercent.toFixed(2)}%`}
                  </span>
                </div>
              </div>

              {/* 3D Pilot Griffi Mascot */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-amber-400/70 shadow-2xl shrink-0 bg-black/40">
                <img 
                  src="/mascot/griffi-futures.jpg" 
                  alt="Griffi Futures Pilot" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Data Stats Grid */}
            <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'قیمت ورود:' : 'Entry Price:'}</span>
                <span className="font-bold text-slate-200">${sharingPosition.pos.entryPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'قیمت لحظه‌ای (Mark):' : 'Mark Price:'}</span>
                <span className="font-bold text-slate-200">${sharingPosition.currentPair.price.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-purple-500/15">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'سود خالص (دلار):' : 'Net PnL (USD):'}</span>
                <span dir="ltr" className={`font-black ${sharingPosition.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {sharingPosition.pnlUsd >= 0 ? `+$${sharingPosition.pnlUsd.toFixed(2)}` : `-$${Math.abs(sharingPosition.pnlUsd).toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-purple-500/15">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'معادل تومانی:' : 'Toman Net:'}</span>
                <span className="font-bold text-amber-300">
                  {isFa ? `${toPersianDigits(formatToman(sharingPosition.pnlToman))} ت` : `${formatToman(sharingPosition.pnlToman)} T`}
                </span>
              </div>
            </div>

            {/* Anti-Censorship Guarantee Sub-footer */}
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[10px] text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? 'معاملات بدون تحریم و بدون KYC' : '100% Non-Custodial • No-KYC'}</span>
              </span>
              <span className="font-mono text-purple-300">GriffinSwap.com</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  const shareText = `🚀 سود من در فیوچرز اهرمی گریفین سواپ:\nجفت ارز: ${sharingPosition.pos.symbol} (${sharingPosition.pos.side.toUpperCase()} ${sharingPosition.pos.leverage}x)\nبازدهی: ${sharingPosition.pnlPercent >= 0 ? `+${sharingPosition.pnlPercent.toFixed(1)}%` : `${sharingPosition.pnlPercent.toFixed(1)}%`}\nسود خالص: ${sharingPosition.pnlUsd.toFixed(2)} دلار (معادل ${formatToman(sharingPosition.pnlToman)} تومان)\n\nمبادله بدون تحریم و بدون احراز هویت در دکس گریفین: https://griffinswap.com`;
                  navigator.clipboard.writeText(shareText);
                  setCopiedPnlCard(true);
                  setTimeout(() => setCopiedPnlCard(false), 2500);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {copiedPnlCard ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                <span>{copiedPnlCard ? (isFa ? 'متن کارت کپی شد!' : 'Copied!') : (isFa ? 'کپی متن اشتراک‌گذاری' : 'Copy Share Text')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setSharingPosition(null);
                  setCopiedPnlCard(false);
                }}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
              >
                {isFa ? 'بستن' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
