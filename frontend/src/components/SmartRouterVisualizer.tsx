import React, { useState } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface SmartRouterVisualizerProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const SmartRouterVisualizer: React.FC<SmartRouterVisualizerProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const [tradeAmount, setTradeAmount] = useState<number>(10000); // 10,000 USDT
  const [selectedPair, setSelectedPair] = useState<string>('USDT-ETH');
  const [copied, setCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<'smart' | 'single'>('smart');

  const isFa = lang === 'fa';

  // Dynamic split calculations based on trade volume
  const griffinSplit = tradeAmount > 50000 ? 45 : tradeAmount > 20000 ? 52 : 60;
  const uniSplit = tradeAmount > 50000 ? 35 : tradeAmount > 20000 ? 33 : 30;
  const sushiSplit = 100 - griffinSplit - uniSplit;

  // Price impact comparison
  const singlePoolImpact = Math.min(8.5, Math.max(0.8, (tradeAmount / 20000) * 1.6)).toFixed(2);
  const smartPoolImpact = (parseFloat(singlePoolImpact) * 0.08).toFixed(2);

  // Financial savings in USDT and Tomans
  const singlePoolLossUsdt = (tradeAmount * parseFloat(singlePoolImpact)) / 100;
  const smartPoolLossUsdt = (tradeAmount * parseFloat(smartPoolImpact)) / 100;
  const savedUsdt = singlePoolLossUsdt - smartPoolLossUsdt;
  const savedToman = savedUsdt * tomanRate;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const tradePresets = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode 
        ? 'bg-[#120c24]/90 border-purple-500/30' 
        : 'bg-white/95 border-purple-200'
    }`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-smart-router.jpg" 
              alt="Griffi Smart Router" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'مسیریاب هوشمند چندمسیری گریفین' : 'Griffin Multi-Hop Smart Order Router'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                AI Smart Split
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa 
                ? 'تجمیع هوشمند نقدینگی بین چندین استخر عمیق جهت حذف اسلیپیج و کاهش قیمت برای حجم‌های بالا' 
                : 'Intelligent multi-pool liquidity splitting to prevent price slippage and maximize output for Iranian traders'}
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className={`flex items-center p-1 rounded-2xl border ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <button
            onClick={() => {
              playClickSound();
              setMode('smart');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'smart'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? 'مسیر هوشمند گریفین' : 'Smart Multi-Hop'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setMode('single');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'single'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isFa ? 'تک استخر سنتی (Uniswap)' : 'Single Pool'}</span>
          </button>
        </div>
      </div>

      {/* Trade Volume Control & Live Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        
        {/* Left Column: Volume Slider & Presets */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {isFa ? 'حجم معامله تستی:' : 'Simulated Swap Volume:'}
              </span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {tradeAmount.toLocaleString()} USDT
              </span>
            </div>

            <div className="text-xs text-purple-400 font-medium mb-3">
              ≈ {isFa ? `${toPersianDigits(formatToman(tradeAmount * tomanRate))} تومان` : `${formatToman(tradeAmount * tomanRate)} Tomans`}
            </div>

            {/* Slider */}
            <input 
              type="range"
              min="500"
              max="150000"
              step="500"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value))}
              className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-4"
            />

            {/* Preset Volume Pills */}
            <div className="grid grid-cols-3 gap-1.5">
              {tradePresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    playClickSound();
                    setTradeAmount(preset);
                  }}
                  className={`py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    tradeAmount === preset
                      ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                      : isDarkMode 
                        ? 'bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10'
                        : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-100'
                  }`}
                >
                  ${(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Pair selector */}
          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              {isFa ? 'جفت‌ارز انتخاب‌شده:' : 'Simulated Pair:'}
            </span>
            <div className="flex gap-1">
              {['USDT-ETH', 'USDT-WBTC', 'USDT-ARB'].map((pair) => (
                <button
                  key={pair}
                  onClick={() => {
                    playClickSound();
                    setSelectedPair(pair);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedPair === pair
                      ? 'bg-amber-400 text-purple-950'
                      : isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right: Dynamic Routing Visual Tree */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-white border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-purple-400" />
                {isFa ? 'نقشه تفکیک مسیرها و استخرهای تأمین نقدینگی' : 'Visual Liquidity Hop Distribution'}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {mode === 'smart' ? (isFa ? 'اسلیپیج کنترل‌شده: ۰.۰۸٪' : 'Optimal Split Active') : (isFa ? 'اسلیپیج بالا: ۳.۸٪' : 'Single Route')}
              </span>
            </div>

            {/* Visual Stream Graph */}
            {mode === 'smart' ? (
              <div className="space-y-3">
                {/* Route 1: Griffin Native Pool */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-purple-900/30 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xs shadow">
                      GS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Griffin Native Deep AMM (Arbitrum)
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                          0% Tax / 0.15% fee
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-300">
                        {((tradeAmount * griffinSplit) / 100).toLocaleString()} USDT ({griffinSplit}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold">~0.02% Slippage</span>
                  </div>
                </div>

                {/* Route 2: Uniswap v3 */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300 font-black text-xs">
                      UNI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Uniswap v3 Concentrated Pool</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                          0.05% fee
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-300">
                        {((tradeAmount * uniSplit) / 100).toLocaleString()} USDT ({uniSplit}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold">~0.04% Slippage</span>
                  </div>
                </div>

                {/* Route 3: Sushi Trident */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isDarkMode ? 'bg-cyan-900/20 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-xs">
                      SUSHI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">SushiSwap v3 Deep Liquidity</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                          0.3% fee
                        </span>
                      </div>
                      <span className="text-[11px] text-cyan-300">
                        {((tradeAmount * sushiSplit) / 100).toLocaleString()} USDT ({sushiSplit}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold">~0.03% Slippage</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Pool Inefficient Mode */
              <div className={`p-5 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 text-sm">Uniswap v3 (تک‌مسیر بدون تفکیک هوشمند)</span>
                  <span className="text-xs font-mono text-rose-400 font-bold">+{singlePoolImpact}% افت قیمت ناشی از عمق کم</span>
                </div>
                <p className="text-xs text-rose-200/80">
                  {isFa 
                    ? 'به دلیل سرازیر شدن ۱۰۰٪ حجم به یک استخر، اسلیپیج به شدت افزایش یافته و بخشی از سرمایه شما می‌سوزد!' 
                    : 'Concentrating 100% of volume into a single pool creates severe price impact and capital loss.'}
                </p>
                <div className="w-full bg-rose-950 rounded-full h-2 overflow-hidden mt-3">
                  <div className="bg-rose-500 h-full w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Live Savings Matrix Bar */}
          <div className="mt-4 pt-3 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">
                  {isFa ? 'سود خالص ناشی از مسیریاب هوشمند:' : 'Net Savings with Griffin Split:'}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  +${savedUsdt.toFixed(1)} USDT ≈ {isFa ? `${toPersianDigits(formatToman(savedToman))} تومان` : `${formatToman(savedToman)} Tomans`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playSwapSuccessSound();
                alert(isFa ? 'مسیریابی هوشمند برای معاملات آینده شما فعال شد!' : 'Smart Routing confirmed for future swaps!');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFa ? 'اعمال مسیریاب در معاملات' : 'Use Smart Router'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-4 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <Layers className="w-4 h-4 text-purple-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) بدون دستکاری مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) is routed non-custodially to the verified treasury address:'}
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
