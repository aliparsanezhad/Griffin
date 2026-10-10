import React, { useState } from 'react';
import { LiFiWidget } from '@lifi/widget';
import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  Sparkles,
  ArrowDownUp,
  Settings,
  HelpCircle,
  Check
} from 'lucide-react';
import { LIFI_CONFIG, POPULAR_CHAINS } from '../services/lifiService';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';

interface SwapSectionProps {
  tomanRate: number;
  isDarkMode: boolean;
  lang: 'fa' | 'en';
  walletAddress: string | null;
}

interface TokenChoice {
  symbol: string;
  name: string;
  chain: string;
  priceUsd: number;
  logo: string;
}

const AVAILABLE_TOKENS: TokenChoice[] = [
  { symbol: "USDT", name: "Tether USD", chain: "Arbitrum One", priceUsd: 1.00, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdt.svg" },
  { symbol: "ETH", name: "Ethereum", chain: "Ethereum", priceUsd: 3420.00, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg" },
  { symbol: "USDC", name: "USD Coin", chain: "Base", priceUsd: 1.00, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdc.svg" },
  { symbol: "ARB", name: "Arbitrum", chain: "Arbitrum One", priceUsd: 0.88, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg" },
  { symbol: "BNB", name: "BNB Coin", chain: "BNB Chain", priceUsd: 590.00, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg" },
  { symbol: "POL", name: "Polygon", chain: "Polygon", priceUsd: 0.45, logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg" },
];

export const SwapSection: React.FC<SwapSectionProps> = ({
  tomanRate,
  isDarkMode,
  lang,
  walletAddress,
}) => {
  const isFa = lang === 'fa';
  
  // Swap mode toggle: 'native' (Griffin Fast Swap) vs 'lifi' (LI.FI Advanced Multi-chain Widget)
  const [swapEngine, setSwapEngine] = useState<'native' | 'lifi'>('native');

  // Native swap state
  const [fromToken, setFromToken] = useState<TokenChoice>(AVAILABLE_TOKENS[0]); // USDT
  const [toToken, setToToken] = useState<TokenChoice>(AVAILABLE_TOKENS[1]); // ETH
  const [fromAmount, setFromAmount] = useState<string>('500');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Calculations
  const numericFrom = parseFloat(fromAmount) || 0;
  const fromUsd = numericFrom * fromToken.priceUsd;
  const fromToman = usdToToman(fromUsd, tomanRate);

  // Output estimation
  const calculatedOutput = toToken.priceUsd > 0 ? (fromUsd / toToken.priceUsd) : 0;
  const toUsd = calculatedOutput * toToken.priceUsd;
  const toToman = usdToToman(toUsd, tomanRate);

  const handleFlipTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleExecuteNativeSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setSwapSuccess(true);
      setTimeout(() => setSwapSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in flex flex-col items-center">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{isFa ? 'صرافی و پل بین‌زنجیره‌ای بدون تحریم' : 'Censorship-Resistant Cross-Chain DEX'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
          <span className="griffin-gradient-text">
            {isFa ? 'مبادله هوشمند رمزارزها' : 'Smart Cross-Chain Swap'}
          </span>
        </h1>
        <p className={`text-xs md:text-sm font-medium leading-relaxed max-w-lg mx-auto ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {isFa 
            ? 'تبادل آنی میان بیش از ۵۸ شبکه بلاک‌چین با تجمیع نقدینگی ۳۵ پل ارتباطی و کمترین کارمزد' 
            : 'Instant swaps and bridges across 58+ chains with aggregated liquidity and lowest fees.'}
        </p>
      </div>

      {/* Engine Switcher (Griffin Fast Swap vs LI.FI Aggregator) */}
      <div className="mb-6 flex items-center gap-1.5 p-1 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs font-bold shadow-lg">
        <button
          onClick={() => setSwapEngine('native')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            swapEngine === 'native'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? 'سواپ سریع گریفین (پیشنهادی)' : 'Griffin Fast Swap'}</span>
        </button>

        <button
          onClick={() => setSwapEngine('lifi')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            swapEngine === 'lifi'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>{isFa ? 'ویجت چندزنجیره‌ای LI.FI' : 'LI.FI Aggregator'}</span>
        </button>
      </div>

      {/* Main Swap Card Container */}
      <div className="w-full flex justify-center">
        
        {/* MODE 1: Griffin Native Fast Swap Engine */}
        {swapEngine === 'native' && (
          <div className={`w-full max-w-[480px] rounded-3xl p-5 md:p-6 border shadow-2xl relative transition-all ${
            isDarkMode 
              ? 'glass-panel border-purple-500/30 shadow-purple-950/50' 
              : 'glass-panel-light border-purple-200 shadow-purple-100'
          }`}>
            
            {/* Header / Slippage settings */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <ArrowDownUp className="w-4 h-4 text-purple-400" />
                {isFa ? 'مبادله نقدینگی' : 'Swap Tokens'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDarkMode 
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300' 
                      : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
                  }`}
                  title={isFa ? 'تنظیمات اسلیپیج' : 'Slippage settings'}
                >
                  <Settings className="w-4 h-4" />
                </button>
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

            {/* FROM TOKEN BOX */}
            <div className={`p-4 rounded-2xl border space-y-2 mb-2 ${
              isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'}>
                  {isFa ? 'پرداخت می‌کنید (مبدأ)' : 'You Pay'}
                </span>
                <span className="text-[11px] text-purple-400 font-semibold">
                  {fromToken.chain}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className={`w-full bg-transparent text-2xl font-black font-mono focus:outline-none ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  placeholder="0.0"
                />

                <select
                  value={fromToken.symbol}
                  onChange={(e) => {
                    const found = AVAILABLE_TOKENS.find(t => t.symbol === e.target.value);
                    if (found) setFromToken(found);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-xl border-none focus:outline-none shadow-md cursor-pointer"
                >
                  {AVAILABLE_TOKENS.map(t => (
                    <option key={t.symbol} value={t.symbol} className="bg-slate-900 text-white">
                      {t.symbol} ({t.chain})
                    </option>
                  ))}
                </select>
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
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleFlipTokens}
                className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 border-2 border-[#120e26] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:rotate-180 duration-200"
                title={isFa ? 'جابه‌جایی ارز مبدأ و مقصد' : 'Flip tokens'}
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* TO TOKEN BOX */}
            <div className={`p-4 rounded-2xl border space-y-2 mt-0 mb-4 ${
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
                <div className={`text-2xl font-black font-mono truncate ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {calculatedOutput > 0 ? calculatedOutput.toFixed(4) : '0.00'}
                </div>

                <select
                  value={toToken.symbol}
                  onChange={(e) => {
                    const found = AVAILABLE_TOKENS.find(t => t.symbol === e.target.value);
                    if (found) setToToken(found);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-xl border-none focus:outline-none shadow-md cursor-pointer"
                >
                  {AVAILABLE_TOKENS.map(t => (
                    <option key={t.symbol} value={t.symbol} className="bg-slate-900 text-white">
                      {t.symbol} ({t.chain})
                    </option>
                  ))}
                </select>
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

            {/* Smart Route & Gas details */}
            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 mb-5 ${
              isDarkMode ? 'bg-purple-950/20 border-purple-500/15 text-slate-300' : 'bg-purple-100/30 border-purple-200 text-slate-600'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'مسیر تجمیع نقدینگی:' : 'Routing:'}</span>
                <span className="font-semibold text-purple-400 flex items-center gap-1">
                  <span>LI.FI Protocol (Stargate V2 + Uniswap)</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'کارمزد شبکه (گس):' : 'Estimated Gas:'}</span>
                <span className="font-mono text-emerald-400 font-bold">&lt; $0.05 (≈ ۴,۵۰۰ ت)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'کارمزد گریفین سواپ:' : 'Integrator Fee:'}</span>
                <span className="font-mono text-slate-400">0.5% (تخفیف ویژه کاربران ایرانی)</span>
              </div>
            </div>

            {/* Execute Button */}
            {swapSuccess ? (
              <div className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 animate-pulse">
                <Check className="w-5 h-5" />
                <span>{isFa ? 'مبادله با موفقیت انجام شد!' : 'Swap Successfully Executed!'}</span>
              </div>
            ) : (
              <button
                onClick={handleExecuteNativeSwap}
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
                        ? (isFa ? 'تأیید و انجام مبادله' : 'Confirm & Swap') 
                        : (isFa ? 'مبادله رمزارز' : 'Swap Tokens')}
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
          <div className="w-full flex justify-center overflow-visible">
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
    </div>
  );
};
