import React, { useState, useEffect } from 'react';
import { LiFiWidget } from '@lifi/widget';
import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  Sparkles,
  ArrowDownUp,
  Settings,
  HelpCircle,
  Check,
  TrendingUp,
  ChevronDown,
  GitFork,
  Compass,
  Clock,
  ArrowLeftRight
} from 'lucide-react';
import { LIFI_CONFIG, POPULAR_CHAINS } from '../services/lifiService';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { PriceChart } from './PriceChart';
import { ArbitrageScanner } from './ArbitrageScanner';
import { RouteInspector } from './RouteInspector';
import { CexVsDexComparison } from './CexVsDexComparison';
import { MarketSentimentGauge } from './MarketSentimentGauge';
import { TxPreFlightModal } from './TxPreFlightModal';
import { CrossChainTrackerModal } from './CrossChainTrackerModal';
import { TokenSelectModal, type TokenItem } from './TokenSelectModal';
import { LimitOrderBook } from './LimitOrderBook';
import { playSwapStartSound, playSwapSuccessSound, playClickSound } from '../services/soundService';

interface SwapSectionProps {
  tomanRate: number;
  isDarkMode: boolean;
  lang: 'fa' | 'en';
  walletAddress: string | null;
  initialFromSymbol?: string;
  initialToSymbol?: string;
  initialAmount?: string;
}

interface TokenChoice {
  symbol: string;
  name: string;
  chain: string;
  priceUsd: number;
  logo: string;
}

const AVAILABLE_TOKENS: TokenChoice[] = [
  { symbol: "USDT", name: "Tether USD", chain: "Arbitrum One", priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { symbol: "ETH", name: "Ethereum", chain: "Ethereum", priceUsd: 3420.00, logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "USDC", name: "USD Coin", chain: "Base", priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
  { symbol: "ARB", name: "Arbitrum", chain: "Arbitrum One", priceUsd: 0.88, logo: "https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png" },
  { symbol: "BNB", name: "BNB Coin", chain: "BNB Chain", priceUsd: 590.00, logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { symbol: "POL", name: "Polygon", chain: "Polygon", priceUsd: 0.45, logo: "https://assets.coingecko.com/coins/images/4713/large/polygon.png" },
  { symbol: "PAXG", name: "PAX Gold", chain: "Ethereum", priceUsd: 2640.00, logo: "https://assets.coingecko.com/coins/images/9519/large/paxg.png" },
  { symbol: "TON", name: "Toncoin", chain: "TON", priceUsd: 5.20, logo: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png" },
  { symbol: "SOL", name: "Solana", chain: "Solana", priceUsd: 178.50, logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "SHIRDAL", name: "Shirdal Mythic", chain: "Arbitrum One", priceUsd: 0.0000485, logo: "/mascot/griffi-avatar.jpg" },
];

const USER_BALANCES: Record<string, number> = {
  USDT: 2450.00,
  ETH: 1.45,
  USDC: 820.00,
  ARB: 650.00,
  BNB: 2.10,
  POL: 1200.00,
  PAXG: 0.85,
  TON: 45.00,
  SOL: 12.80,
  SHIRDAL: 5000000,
};

const QUICK_PAIRS = [
  { label: 'USDT ➔ ETH', from: AVAILABLE_TOKENS[0], to: AVAILABLE_TOKENS[1] },
  { label: 'USDT ➔ ARB', from: AVAILABLE_TOKENS[0], to: AVAILABLE_TOKENS[3] },
  { label: 'USDT ➔ PAXG', from: AVAILABLE_TOKENS[0], to: AVAILABLE_TOKENS[6] },
  { label: 'USDT ➔ TON', from: AVAILABLE_TOKENS[0], to: AVAILABLE_TOKENS[7] },
  { label: 'USDT ➔ SHIRDAL', from: AVAILABLE_TOKENS[0], to: AVAILABLE_TOKENS[9] },
];

export const SwapSection: React.FC<SwapSectionProps> = ({
  tomanRate,
  isDarkMode,
  lang,
  walletAddress,
  initialFromSymbol,
  initialToSymbol,
  initialAmount,
}) => {
  const isFa = lang === 'fa';
  
  // Swap mode toggle: 'native' (Griffin Fast Swap) vs 'limit' (Gasless Limit Book) vs 'lifi' (LI.FI Advanced Multi-chain Widget)
  const [swapEngine, setSwapEngine] = useState<'native' | 'limit' | 'lifi'>('native');

  // Native swap state
  const [fromToken, setFromToken] = useState<TokenChoice>(() => {
    if (initialFromSymbol) {
      const found = AVAILABLE_TOKENS.find(t => t.symbol.toUpperCase() === initialFromSymbol.toUpperCase());
      if (found) return found;
    }
    return AVAILABLE_TOKENS[0];
  });
  const [toToken, setToToken] = useState<TokenChoice>(() => {
    if (initialToSymbol) {
      const found = AVAILABLE_TOKENS.find(t => t.symbol.toUpperCase() === initialToSymbol.toUpperCase());
      if (found) return found;
    }
    return AVAILABLE_TOKENS[1];
  });
  const [fromAmount, setFromAmount] = useState<string>(() => initialAmount || '500');

  useEffect(() => {
    if (initialFromSymbol) {
      const found = AVAILABLE_TOKENS.find(t => t.symbol.toUpperCase() === initialFromSymbol.toUpperCase());
      if (found) setFromToken(found);
    }
    if (initialToSymbol) {
      const found = AVAILABLE_TOKENS.find(t => t.symbol.toUpperCase() === initialToSymbol.toUpperCase());
      if (found) setToToken(found);
    }
    if (initialAmount) {
      setFromAmount(initialAmount);
    }
  }, [initialFromSymbol, initialToSymbol, initialAmount]);

  const [slippage, setSlippage] = useState<number>(0.5);
  const [isGasless, setIsGasless] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPreFlightModal, setShowPreFlightModal] = useState<boolean>(false);
  const [showTrackerModal, setShowTrackerModal] = useState<boolean>(false);
  const [companionView, setCompanionView] = useState<'none' | 'chart' | 'arbitrage' | 'routes' | 'cexCompare' | 'sentiment'>('chart');
  const [selectingFor, setSelectingFor] = useState<'from' | 'to' | null>(null);
  const [invertRate, setInvertRate] = useState<boolean>(false);

  const currentTokenBalance = USER_BALANCES[fromToken.symbol] ?? 100.00;

  const handleSelectToken = (token: TokenItem) => {
    if (selectingFor === 'from') {
      setFromToken({
        symbol: token.symbol,
        name: token.name,
        chain: token.chain,
        priceUsd: token.priceUsd,
        logo: token.logo,
      });
    } else if (selectingFor === 'to') {
      setToToken({
        symbol: token.symbol,
        name: token.name,
        chain: token.chain,
        priceUsd: token.priceUsd,
        logo: token.logo,
      });
    }
  };

  // Calculations
  const numericFrom = parseFloat(fromAmount) || 0;
  const fromUsd = numericFrom * fromToken.priceUsd;
  const fromToman = usdToToman(fromUsd, tomanRate);

  // Output estimation
  const calculatedOutput = toToken.priceUsd > 0 ? (fromUsd / toToken.priceUsd) : 0;
  const toUsd = calculatedOutput * toToken.priceUsd;
  const toToman = usdToToman(toUsd, tomanRate);

  // Exchange Rate calculations
  const rateNormal = toToken.priceUsd > 0 ? (fromToken.priceUsd / toToken.priceUsd).toFixed(toToken.priceUsd < 0.01 ? 6 : 4) : '0';
  const rateInverted = fromToken.priceUsd > 0 ? (toToken.priceUsd / fromToken.priceUsd).toFixed(fromToken.priceUsd < 0.01 ? 6 : 4) : '0';
  const unitPriceToman = invertRate ? usdToToman(toToken.priceUsd, tomanRate) : usdToToman(fromToken.priceUsd, tomanRate);

  const handleFlipTokens = () => {
    playClickSound();
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleExecuteNativeSwap = () => {
    setIsSwapping(true);
    playSwapStartSound();
    setShowTrackerModal(true);
    setTimeout(() => setIsSwapping(false), 1000);
  };

  return (
    <div className="w-full py-4 px-3 md:px-4 max-w-5xl mx-auto animate-fade-in flex flex-col items-center">
      
      {/* Sleek Compact Above-the-Fold Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{isFa ? 'صرافی و پل بین‌زنجیره‌ای بدون تحریم' : 'Censorship-Resistant Cross-Chain DEX'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
          <span className="griffin-gradient-text">
            {isFa ? 'مبادله هوشمند و بدون کارمزد گس' : 'Smart Gasless Cross-Chain Swap'}
          </span>
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300">
            {isFa ? '۵۸+ شبکه بلاک‌چین' : '58+ Chains'}
          </span>
          <span>•</span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300">
            {isFa ? '۳۵ پل نقدینگی' : '35 Bridge Routes'}
          </span>
          <span>•</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
            {isFa ? 'کارمزد پروتکل: ۰.۵٪' : 'Protocol Fee: 0.5%'}
          </span>
        </div>
      </div>

      {/* Main Swap Card Container */}
      <div className="w-full flex flex-col items-center">
        
        {/* Persistent Engine Switcher & Auxiliary Controls */}
        <div className={`w-full flex items-center justify-between mb-3 px-1 transition-all ${
          swapEngine === 'limit' ? 'max-w-4xl' : 'max-w-[480px]'
        }`}>
          <div className="flex items-center p-0.5 rounded-xl bg-purple-950/80 border border-purple-500/25 text-xs backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSwapEngine('native');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                swapEngine === 'native'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFa ? 'سواپ سریع' : 'Fast Swap'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSwapEngine('limit');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                swapEngine === 'limit'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isFa ? 'سفارش لیمیت' : 'Limit'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSwapEngine('lifi');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                swapEngine === 'lifi'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span>{isFa ? 'بریج LI.FI' : 'LI.FI Bridge'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {swapEngine === 'native' && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border transition-colors ${
                  showSettings 
                    ? 'bg-purple-600 text-white border-purple-400' 
                    : isDarkMode 
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300' 
                      : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
                }`}
                title={isFa ? 'تنظیمات اسلیپیج' : 'Slippage settings'}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowHelpModal(true)}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300' 
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
              }`}
              title={isFa ? 'راهنما' : 'Help'}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODE 1: Griffin Native Fast Swap Engine */}
        {swapEngine === 'native' && (
          <div className={`w-full max-w-[480px] rounded-3xl p-5 md:p-6 border shadow-2xl relative transition-all ${
            isDarkMode 
              ? 'glass-panel border-purple-500/30 shadow-purple-950/50' 
              : 'glass-panel-light border-purple-200 shadow-purple-100'
          }`}>

            {/* Slippage Settings Drawer */}
            {showSettings && (
              <div className="mb-4 p-3 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-xs space-y-2 animate-fade-in">
                <div className="flex justify-between items-center text-slate-300 font-medium">
                  <span>{isFa ? 'میزان لغزش قیمت (Slippage Tolerance):' : 'Slippage Tolerance:'}</span>
                  <span className="font-mono font-bold text-amber-400">{slippage}%</span>
                </div>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={`flex-1 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                        slippage === s
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-900/30 text-slate-300 hover:bg-purple-900/50'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Hot Pairs Selector with Dual Token Logos */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 mb-3 text-[11px] font-semibold">
              <span className="text-slate-400 text-[10px] shrink-0 font-bold">{isFa ? 'جفت‌های داغ:' : 'Hot Pairs:'}</span>
              {QUICK_PAIRS.map((pair) => (
                <button
                  key={pair.label}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setFromToken(pair.from);
                    setToToken(pair.to);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                    fromToken.symbol === pair.from.symbol && toToken.symbol === pair.to.symbol
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : isDarkMode
                        ? 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/20 text-slate-300'
                        : 'bg-white hover:bg-purple-100 border-purple-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                    <img src={pair.from.logo} alt={pair.from.symbol} className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-black/40" />
                    <img src={pair.to.logo} alt={pair.to.symbol} className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-black/40" />
                  </div>
                  <span>{pair.label}</span>
                </button>
              ))}
            </div>

            {/* FROM TOKEN BOX with Dynamic Balance & Touch-Friendly Presets */}
            <div className={`p-4 rounded-2xl border space-y-2 mb-2 ${
              isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'}>
                  {isFa ? 'پرداخت می‌کنید (مبدأ)' : 'You Pay'}
                </span>
                
                {/* Dynamic Token Balance & Quick Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isFa ? 'موجودی:' : 'Bal:'} {currentTokenBalance.toLocaleString()} {fromToken.symbol}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {[
                      { label: '25%', multiplier: 0.25 },
                      { label: '50%', multiplier: 0.50 },
                      { label: '75%', multiplier: 0.75 },
                      { label: 'MAX', multiplier: 1.00 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          const val = currentTokenBalance * btn.multiplier;
                          if (val >= 1000) setFromAmount(val.toString());
                          else if (val >= 1) setFromAmount(val.toFixed(2));
                          else setFromAmount(val.toFixed(4));
                        }}
                        className="px-2 py-1 min-h-[28px] rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-bold transition-colors flex items-center justify-center active:scale-95"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className={`w-full bg-transparent text-3xl sm:text-4xl font-black font-mono tracking-tight focus:outline-none placeholder:text-slate-600 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  placeholder="0.0"
                />

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectingFor('from');
                  }}
                  className={`group flex items-center gap-2.5 py-2 px-3 rounded-2xl border transition-all shrink-0 hover:scale-[1.03] active:scale-95 shadow-md ${
                    isDarkMode 
                      ? 'bg-purple-900/50 hover:bg-purple-800/60 border-purple-400/30 text-white shadow-purple-950/40' 
                      : 'bg-white hover:bg-purple-50 border-purple-200 text-slate-800 shadow-purple-100'
                  }`}
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-purple-400/50 shrink-0 shadow-inner">
                    <img src={fromToken.logo} alt={fromToken.symbol} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col text-right leading-none">
                    <span className="font-extrabold text-sm">{fromToken.symbol}</span>
                    <span className="text-[9px] text-purple-300 font-medium opacity-80">{fromToken.chain.split(' ')[0]}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-300 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Toman & USD estimate for input */}
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-purple-500/10">
                <span className="text-slate-400 font-mono">
                  ${fromUsd.toFixed(2)}
                </span>
                <span className="font-mono font-bold text-amber-500">
                  ≈ {isFa ? `${toPersianDigits(formatToman(fromToman))} تومان` : `${formatToman(fromToman, false)} Toman`}
                </span>
              </div>
            </div>

            {/* Flip / Invert Button */}
            <div className="flex justify-center -my-2.5 relative z-10">
              <button
                type="button"
                onClick={handleFlipTokens}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:rotate-180 duration-300 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-[#0f0b21] text-white shadow-purple-600/40' 
                    : 'bg-purple-600 hover:bg-purple-500 border-white text-white shadow-purple-300'
                }`}
                title={isFa ? 'جابه‌جایی ارز مبدأ و مقصد' : 'Flip tokens'}
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* TO TOKEN BOX */}
            <div className={`p-4 rounded-2xl border space-y-2 mt-0 mb-2.5 ${
              isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'}>
                  {isFa ? 'دریافت می‌کنید (مقصد تقریبی)' : 'You Receive (Estimated)'}
                </span>
                <span className="text-[11px] text-purple-400 font-semibold">
                  {toToken.chain}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight truncate ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {calculatedOutput > 0 ? (calculatedOutput < 0.001 ? calculatedOutput.toFixed(6) : calculatedOutput.toFixed(4)) : '0.00'}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectingFor('to');
                  }}
                  className={`group flex items-center gap-2.5 py-2 px-3 rounded-2xl border transition-all shrink-0 hover:scale-[1.03] active:scale-95 shadow-md ${
                    isDarkMode 
                      ? 'bg-purple-900/50 hover:bg-purple-800/60 border-purple-400/30 text-white shadow-purple-950/40' 
                      : 'bg-white hover:bg-purple-50 border-purple-200 text-slate-800 shadow-purple-100'
                  }`}
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-purple-400/50 shrink-0 shadow-inner">
                    <img src={toToken.logo} alt={toToken.symbol} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col text-right leading-none">
                    <span className="font-extrabold text-sm">{toToken.symbol}</span>
                    <span className="text-[9px] text-purple-300 font-medium opacity-80">{toToken.chain.split(' ')[0]}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-300 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Toman & USD estimate for output */}
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-purple-500/10">
                <span className="text-slate-400 font-mono">
                  ${toUsd.toFixed(2)}
                </span>
                <span className="font-mono font-bold text-amber-500">
                  ≈ {isFa ? `${toPersianDigits(formatToman(toToman))} تومان` : `${formatToman(toToman, false)} Toman`}
                </span>
              </div>
            </div>

            {/* Interactive Exchange Rate Pill with 1-Click Invert */}
            <div className="flex items-center justify-between px-2 mb-3 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setInvertRate(!invertRate);
                }}
                className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                  isDarkMode 
                    ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300' 
                    : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
                }`}
                title={isFa ? 'معکوس کردن نمایش نرخ برابری' : 'Invert exchange rate'}
              >
                <ArrowLeftRight className="w-3 h-3 text-purple-400 group-hover:rotate-180 transition-transform duration-300" />
                <span>
                  {invertRate 
                    ? `1 ${toToken.symbol} ≈ ${rateInverted} ${fromToken.symbol}`
                    : `1 ${fromToken.symbol} ≈ ${rateNormal} ${toToken.symbol}`
                  }
                </span>
              </button>
              
              <span className="text-[10px] text-amber-500/90 font-bold">
                ≈ {isFa ? `${toPersianDigits(formatToman(unitPriceToman))} تومان` : `${formatToman(unitPriceToman, false)} Toman`}
              </span>
            </div>

            {/* High-Tech Electric Cyan / Emerald Gasless Permit2 Toggle */}
            <div className={`p-3 rounded-2xl border mb-3 flex items-center justify-between transition-all ${
              isGasless
                ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/20'
                : isDarkMode
                  ? 'bg-purple-950/20 border-purple-500/20 text-slate-300 hover:border-purple-500/30'
                  : 'bg-purple-50/80 border-purple-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl ${isGasless ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold block text-white">
                      {isFa ? 'سواپ بدون نیاز به اتریوم گس (Gasless Permit2)' : 'Gasless Permit2 Meta-Tx'}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                      isGasless ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      ⚡ 0 ETH GAS
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {isFa ? 'کارمزد شبکه از خود تتر کسر می‌شود و نیازی به موجودی ETH ندارید.' : 'Relayer pays native gas; fee deducted from swapped token.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsGasless(!isGasless);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isGasless ? 'bg-cyan-400 justify-end' : 'bg-purple-950/80 border border-purple-500/30 justify-start'
                }`}
                title={isFa ? 'فعال/غیرفعال‌سازی حالت بدون گس' : 'Toggle gasless'}
              >
                <span className={`w-4 h-4 rounded-full transition-transform ${isGasless ? 'bg-slate-950' : 'bg-slate-400'}`} />
              </button>
            </div>

            {/* Smart Route & Gas details */}
            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 mb-5 ${
              isDarkMode ? 'bg-purple-950/20 border-purple-500/15 text-slate-300' : 'bg-purple-50 border-purple-200 text-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>{isFa ? 'مسیر تجمیع نقدینگی:' : 'Routing:'}</span>
                <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <span>Across V3 + Stargate V2</span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCompanionView('routes');
                    }}
                    className="text-[10px] text-amber-600 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 transition-all hover:bg-amber-400/25"
                  >
                    {isFa ? 'تحلیل پل‌ها 🔍' : 'Inspect 🔍'}
                  </button>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>{isFa ? 'کارمزد شبکه (گس):' : 'Estimated Gas:'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {isGasless ? (isFa ? 'رایگان (پرداخت با Permit2)' : 'Sponsored (Permit2)') : '< $0.05 (≈ ۴,۵۰۰ ت)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>{isFa ? 'کارمزد پروتکل:' : 'Integrator Fee:'}</span>
                <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">0.5% ({isFa ? 'تخفیف ویژه کاربران ایرانی' : 'Iran discount'})</span>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-1 border-t border-purple-500/15">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}>{isFa ? 'آدرس خزانه کارمزدها:' : 'Commission Wallet:'}</span>
                <span 
                  className="font-mono text-amber-600 dark:text-amber-300 font-semibold hover:underline cursor-pointer" 
                  title="0xD9C10B10945D85396f0838EA045587a25FD2A2D3"
                  onClick={() => navigator.clipboard.writeText("0xD9C10B10945D85396f0838EA045587a25FD2A2D3")}
                >
                  0xD9C1...A2D3 📋
                </span>
              </div>
            </div>

            {/* Execute Button */}
            {swapSuccess ? (
              <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/50 text-white flex items-center gap-3 shadow-xl shadow-emerald-900/30 animate-fade-in">
                <img src="/mascot/griffi-flower.jpg" alt="Griffi celebrating" className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400/60 shrink-0" />
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1 text-emerald-300 font-bold text-xs">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isFa ? 'مبادله با موفقیت انجام شد! 🎉' : 'Swap Successfully Executed! 🎉'}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 block">
                    {isFa ? 'گریفی تبریک می‌گوید! کارمزد به آدرس 0xD9C1...A2D3 منتقل شد.' : 'Griffi congratulates you! Commission routed to treasury.'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  setShowPreFlightModal(true);
                }}
                disabled={isSwapping || numericFrom <= 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isSwapping ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isFa ? 'در حال ارسال تراکنش به شبکه...' : 'Executing Swap on Chain...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {walletAddress 
                        ? (isFa ? 'شبیه‌سازی امنیتی و انجام مبادله' : 'Simulate & Swap') 
                        : (isFa ? 'شبیه‌سازی و مبادله رمزارز' : 'Simulate & Swap Tokens')}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Security Guarantee Note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'بدون احراز هویت • ۱۰۰٪ غیرحضانتی • ضدتحریم' : '100% Non-Custodial • 0 KYC • Safe for Iran'}</span>
            </div>
          </div>
        )}

        {/* MODE 2: Full LI.FI Aggregator Widget */}
        {swapEngine === 'lifi' && (
          <div className="w-full flex justify-center overflow-visible" dir="ltr">
            <div className="w-full max-w-[480px] rounded-3xl shadow-2xl overflow-visible">
              <LiFiWidget 
                integrator={LIFI_CONFIG.integrator}
                variant="compact"
                appearance={isDarkMode ? 'dark' : 'light'}
                hiddenUI={{ appearance: true }}
                feeConfig={{ fee: LIFI_CONFIG.fee }}
              />
            </div>
          </div>
        )}

        {/* MODE 3: Gasless Permit2 Limit Order Book */}
        {swapEngine === 'limit' && (
          <div className="w-full max-w-4xl animate-fade-in">
            <LimitOrderBook
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>

      {/* Popular Iranian Web3 Chains Quick Bar */}
      <div className="mt-10 max-w-2xl w-full text-center">
        <span className="text-xs font-bold text-slate-400 block mb-3">
          {isFa ? 'شبکه‌های پرکاربرد با کمترین کارمزد تراکنش:' : 'Supported High-Speed Low-Fee Networks:'}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_CHAINS.map((chain) => (
            <div
              key={chain.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all hover:scale-105 ${
                isDarkMode 
                  ? 'bg-purple-950/40 border-purple-500/20 text-slate-200' 
                  : 'bg-white border-purple-200 text-slate-700'
              }`}
            >
              <img src={chain.logo} alt={chain.name} className="w-4 h-4 rounded-full" />
              <span>{chain.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Companion Panels (Price Chart & Arbitrage Radar & Route Inspector) */}
      <div className="mt-8 w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full flex-nowrap">
            <button
              onClick={() => setCompanionView(companionView === 'chart' ? 'none' : 'chart')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                companionView === 'chart'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'نمودار زنده قیمت' : 'Price Chart'}</span>
            </button>

            <button
              onClick={() => setCompanionView(companionView === 'arbitrage' ? 'none' : 'arbitrage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                companionView === 'arbitrage'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'دیدبان آربیتراژ بازار ایران' : 'Arbitrage Radar'}</span>
            </button>

            <button
              onClick={() => setCompanionView(companionView === 'routes' ? 'none' : 'routes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                companionView === 'routes'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'دیدبان پل‌ها و مسیرها' : 'Route Inspector'}</span>
            </button>

            <button
              onClick={() => setCompanionView(companionView === 'cexCompare' ? 'none' : 'cexCompare')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                companionView === 'cexCompare'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'مقایسه با نوبیتکس و صرافی‌ها' : 'CEX vs DEX'}</span>
            </button>

            <button
              onClick={() => setCompanionView(companionView === 'sentiment' ? 'none' : 'sentiment')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                companionView === 'sentiment'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'سنتیمنت و ترس و طمع' : 'Sentiment Gauge'}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isFa ? 'بروزرسانی زنده اوراکل تتر و رمزارزها' : 'Live Oracle Feeds'}
          </span>
        </div>

        {companionView === 'chart' && (
          <div className="animate-fade-in">
            <PriceChart tomanRate={tomanRate} lang={lang} isDarkMode={isDarkMode} />
          </div>
        )}

        {companionView === 'arbitrage' && (
          <div className="animate-fade-in">
            <ArbitrageScanner 
              tomanRate={tomanRate} 
              lang={lang} 
              isDarkMode={isDarkMode} 
              onNavigateSwap={() => {
                setCompanionView('none');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {companionView === 'routes' && (
          <div className="animate-fade-in">
            <RouteInspector tomanRate={tomanRate} lang={lang} isDarkMode={isDarkMode} />
          </div>
        )}

        {companionView === 'cexCompare' && (
          <div className="animate-fade-in">
            <CexVsDexComparison tomanRate={tomanRate} lang={lang} isDarkMode={isDarkMode} />
          </div>
        )}

        {companionView === 'sentiment' && (
          <div className="animate-fade-in">
            <MarketSentimentGauge tomanRate={tomanRate} lang={lang} isDarkMode={isDarkMode} />
          </div>
        )}
      </div>

      {/* Help & FAQ Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-right">
          <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'glass-panel border-purple-500/30' : 'glass-panel-light border-purple-200'
          }`}>
            <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>{isFa ? 'راهنمای مبادله در گریفین سواپ' : 'GriffinSwap Guide'}</span>
            </h3>

            <div className={`space-y-3 text-xs leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <p>
                <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>• تفاوت گریفین با صرافی متمرکز:</b>
                <br />
                در صرافی‌های متمرکز مثل نوبیتکس یا بایننس، کلید خصوصی در اختیار شرکت است. در گریفین، دارایی شما مستقیماً از کیف پول خودتان جا‌به‌جا می‌شود و هیچ نهادی قادر به فریز سرمایه نیست.
              </p>
              <p>
                <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>• کارمزد شبکه (گس):</b>
                <br />
                شبکه‌های آربیتروم (Arbitrum)، بیس (Base) و پالیگان (Polygon) کارمزدی کمتر از چند هزار تومان دارند. توصیه می‌شود برای مبالغ خرد از اتریوم لایه اول استفاده نکنید.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              {isFa ? 'متوجه شدم' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Searchable Multi-Token Modal */}
      <TokenSelectModal
        isOpen={selectingFor !== null}
        onClose={() => setSelectingFor(null)}
        onSelectToken={handleSelectToken}
        selectedTokenSymbol={selectingFor === 'from' ? fromToken.symbol : toToken.symbol}
        lang={lang}
        isDarkMode={isDarkMode}
        userBalances={USER_BALANCES}
        tomanRate={tomanRate}
      />

      {/* Pre-Flight Transaction Simulation & MEV Guard Modal */}
      <TxPreFlightModal
        isOpen={showPreFlightModal}
        onClose={() => setShowPreFlightModal(false)}
        onConfirmSuccess={handleExecuteNativeSwap}
        fromToken={{
          symbol: fromToken.symbol,
          amount: fromAmount,
          priceUsd: fromToken.priceUsd,
          logo: fromToken.logo,
          chain: fromToken.chain,
        }}
        toToken={{
          symbol: toToken.symbol,
          estimatedAmount: calculatedOutput.toFixed(4),
          priceUsd: toToken.priceUsd,
          logo: toToken.logo,
          chain: toToken.chain,
        }}
        slippage={slippage}
        tomanRate={tomanRate}
        lang={lang}
        isDarkMode={isDarkMode}
      />

      {/* Live Cross-Chain Multi-Hop Transaction Tracker */}
      <CrossChainTrackerModal
        isOpen={showTrackerModal}
        onClose={() => {
          setShowTrackerModal(false);
          setSwapSuccess(true);
          playSwapSuccessSound();
          setTimeout(() => setSwapSuccess(false), 5000);
        }}
        fromToken={{
          symbol: fromToken.symbol,
          amount: fromAmount,
          priceUsd: fromToken.priceUsd,
          logo: fromToken.logo,
          chain: fromToken.chain,
        }}
        toToken={{
          symbol: toToken.symbol,
          estimatedAmount: calculatedOutput.toFixed(4),
          priceUsd: toToken.priceUsd,
          logo: toToken.logo,
          chain: toToken.chain,
        }}
        isGasless={isGasless}
        tomanRate={tomanRate}
        lang={lang}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
