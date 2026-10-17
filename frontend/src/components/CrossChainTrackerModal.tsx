import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  Zap, 
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playSwapStartSound, playSwapSuccessSound, playClickSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface CrossChainTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken: {
    symbol: string;
    amount: string;
    priceUsd: number;
    logo: string;
    chain: string;
  };
  toToken: {
    symbol: string;
    estimatedAmount: string;
    priceUsd: number;
    logo: string;
    chain: string;
  };
  isGasless: boolean;
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

type StepState = 'pending' | 'in_progress' | 'completed';

export const CrossChainTrackerModal: React.FC<CrossChainTrackerModalProps> = ({
  isOpen,
  onClose,
  fromToken,
  toToken,
  isGasless,
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';

  // Step 1: Source Chain Broadcast
  // Step 2: Cross-chain Relayer Consensus
  // Step 3: Destination Chain Settlement & Mint
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [step1State, setStep1State] = useState<StepState>('in_progress');
  const [step2State, setStep2State] = useState<StepState>('pending');
  const [step3State, setStep3State] = useState<StepState>('pending');
  const [relayerProgress, setRelayerProgress] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [txHash] = useState<string>(() => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));

  // Sequence timer for cross-chain execution simulation
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setStep1State('in_progress');
      setStep2State('pending');
      setStep3State('pending');
      setRelayerProgress(0);
      return;
    }

    playSwapStartSound();

    // Step 1 completes in 1.4s
    const t1 = setTimeout(() => {
      setStep1State('completed');
      setStep2State('in_progress');
      setCurrentStep(2);
      playClickSound();
    }, 1400);

    // Step 2 progress counter
    const progressInterval = setInterval(() => {
      setRelayerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 350);

    // Step 2 completes in 3.8s
    const t2 = setTimeout(() => {
      setStep2State('completed');
      setStep3State('in_progress');
      setCurrentStep(3);
      playClickSound();
    }, 3800);

    // Step 3 completes in 5.2s
    const t3 = setTimeout(() => {
      setStep3State('completed');
      playSwapSuccessSound();
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(progressInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const numFrom = parseFloat(fromToken.amount) || 0;
  const numTo = parseFloat(toToken.estimatedAmount) || 0;
  const fromUsd = numFrom * fromToken.priceUsd;
  const fromToman = usdToToman(fromUsd, tomanRate);
  const toUsd = numTo * toToken.priceUsd;
  const toToman = usdToToman(toUsd, tomanRate);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    playClickSound();
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const isAllComplete = step3State === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all ${
        isDarkMode 
          ? 'bg-[#120c2b] border-purple-500/30 text-slate-100 shadow-purple-950/70' 
          : 'bg-white border-purple-200 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Close Button (Available anytime or after finish) */}
        <button 
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-5 left-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isFa ? 'بستن پنجره' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isFa 
                ? `دیدبان زنده تراکنش بین‌زنجیره‌ای (گام ${toPersianDigits(currentStep)} از ۳)` 
                : `Live Cross-Chain Lifecycle (Step ${currentStep}/3)`}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white">
            {isAllComplete
              ? (isFa ? 'تراکنش با موفقیت به مقصد رسید! 🎉' : 'Cross-Chain Transfer Completed! 🎉')
              : (isFa ? 'در حال پردازش مسیر انتقال رمزارز ⚡' : 'Routing Asset Across Chains ⚡')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isFa 
              ? `انتقال ${fromToken.amount} ${fromToken.symbol} (${fromToken.chain}) به ${toToken.estimatedAmount} ${toToken.symbol} (${toToken.chain})`
              : `Bridging ${fromToken.amount} ${fromToken.symbol} to ${toToken.estimatedAmount} ${toToken.symbol}`}
          </p>
        </div>

        {/* Flow Visualizer Box */}
        <div className={`p-4 rounded-2xl border mb-5 ${
          isDarkMode ? 'bg-black/40 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            {/* Source */}
            <div className="flex items-center gap-2.5">
              <img src={fromToken.logo} alt={fromToken.symbol} className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50" />
              <div>
                <span className="font-bold text-sm block leading-tight font-mono text-white">
                  {fromToken.amount} {fromToken.symbol}
                </span>
                <span className="text-[10px] text-purple-400 font-medium block">
                  {fromToken.chain}
                </span>
                <span className="text-[10px] text-amber-300 font-mono block">
                  ≈ {isFa ? `${toPersianDigits(formatToman(fromToman, false))} ت` : `${formatToman(fromToman, false)} T`}
                </span>
              </div>
            </div>

            {/* Bridge Animated Direction Indicator */}
            <div className="flex flex-col items-center px-3">
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold mb-0.5">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Across V3</span>
              </div>
              <div className="w-16 h-1 bg-purple-900/60 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full transition-all duration-300" 
                  style={{ width: `${step1State === 'completed' ? (step2State === 'completed' ? 100 : Math.max(relayerProgress, 20)) : 10}%` }}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2.5">
              <div className="text-left">
                <span className="font-bold text-sm block leading-tight font-mono text-emerald-400">
                  {toToken.estimatedAmount} {toToken.symbol}
                </span>
                <span className="text-[10px] text-purple-400 font-medium block">
                  {toToken.chain}
                </span>
                <span className="text-[10px] text-amber-300 font-mono block">
                  ≈ {isFa ? `${toPersianDigits(formatToman(toToman, false))} ت` : `${formatToman(toToman, false)} T`}
                </span>
              </div>
              <img src={toToken.logo} alt={toToken.symbol} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50" />
            </div>
          </div>

          {/* Gasless Permit2 Notice */}
          {isGasless && (
            <div className="mt-3 pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-amber-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'سواپ بدون گس (Gasless Permit2 فعال)' : 'Gasless Permit2 Active'}</span>
              </span>
              <span className="text-[10px] text-slate-300">
                {isFa ? 'کارمزد توسط ریله‌یر خزانه‌داری پرداخت شد' : 'Gas sponsored by Griffin Relayer'}
              </span>
            </div>
          )}
        </div>

        {/* Stepper Pipeline */}
        <div className="space-y-3 mb-5">
          
          {/* STEP 1 */}
          <div className={`p-3 rounded-2xl border transition-all ${
            step1State === 'completed'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-purple-950/40 border-purple-500/30 text-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {step1State === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block text-white">
                    {isFa ? '۱. امضای تراکنش و انتشار در شبکه مبدأ' : '1. Broadcast on Source Chain'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {step1State === 'completed'
                      ? (isFa ? `تایید شده در بلاک‌چین ${fromToken.chain} (MEV-Protected)` : `Confirmed on ${fromToken.chain}`)
                      : (isFa ? 'در انتظار امضا و ساخت تراکنش بدون بازگشت...' : 'Signing and packaging intent...')}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 text-slate-300">
                {step1State === 'completed' ? 'PASS' : 'WAIT'}
              </span>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`p-3 rounded-2xl border transition-all ${
            step2State === 'completed'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : step2State === 'in_progress'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {step2State === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : step2State === 'in_progress' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block text-white">
                    {isFa ? '۲. اجماع اعتبارسنج‌های پل و ریله‌یر (Across V3)' : '2. Relayer & Bridge Verification'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {step2State === 'completed'
                      ? (isFa ? 'تایید حدنصاب نودهای پل ارتباطی (12/12)' : '12/12 Oracle signatures gathered')
                      : step2State === 'in_progress'
                        ? (isFa ? `در حال تجمیع نقدینگی بین‌زنجیره‌ای (${relayerProgress}٪)...` : `Aggregating liquidity (${relayerProgress}%)...`)
                        : (isFa ? 'در صف انتظار اعتبارسنجی' : 'Pending verification')}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 text-slate-300">
                {step2State === 'completed' ? 'PASS' : step2State === 'in_progress' ? `${relayerProgress}%` : 'PENDING'}
              </span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={`p-3 rounded-2xl border transition-all ${
            step3State === 'completed'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : step3State === 'in_progress'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {step3State === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : step3State === 'in_progress' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block text-white">
                    {isFa ? `۳. آزادسازی و واریز توکن در شبکه مقصد (${toToken.chain})` : `3. Settlement on ${toToken.chain}`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {step3State === 'completed'
                      ? (isFa ? 'موجودی مستقیماً در کیف‌پول غیرحضانتی شما شارژ شد' : 'Tokens deposited into your self-custody wallet')
                      : (isFa ? 'تسویه آنی قرارداد هوشمند' : 'Awaiting final mint/release')}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 text-slate-300">
                {step3State === 'completed' ? 'SUCCESS' : 'WAIT'}
              </span>
            </div>
          </div>

        </div>

        {/* Transaction Proof & Commission Info */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-2 mb-5 ${
          isDarkMode ? 'bg-black/30 border-purple-500/20 text-slate-300' : 'bg-purple-50 border-purple-200 text-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'هش تراکنش (TxHash):' : 'Tx Hash:'}</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-purple-300 hover:text-white transition-colors" title={txHash}>
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </span>
              <button
                onClick={handleCopyHash}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isFa ? 'کپی هش' : 'Copy'}
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-purple-500/10">
            <span className="text-slate-400">{isFa ? 'کارمزد پروتکل (۰.۵٪ به خزانه):' : 'Protocol Fee (0.5%):'}</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-amber-400 font-bold" title={COMMISSION_WALLET}>
                0xD9C1...A2D3
              </span>
              <button
                onClick={handleCopyWallet}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isFa ? 'کپی آدرس خزانه' : 'Copy Wallet'}
              >
                {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Celebration / Done Button */}
        {isAllComplete ? (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-3">
              <img 
                src="/mascot/griffi-celebration.jpg" 
                alt="Griffi Celebrating" 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400/60 shrink-0" 
              />
              <div className="text-right">
                <span className="text-xs font-black block text-emerald-300">
                  {isFa ? 'گریفی موفقیت تراکنش را تبریک می‌گوید! 🦅' : 'Griffi congratulates you on a smooth bridge!'}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  {isFa ? '+۵۰ پر گریفی به پاداش‌های وفاداری شما اضافه شد.' : '+50 Feathers credited to your loyalty balance.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isFa ? 'انجام شد (بستن پنجره)' : 'Done'}</span>
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/20 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-wait"
          >
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span>{isFa ? 'در حال ارسال و ثبت در بلاک‌چین...' : 'Relaying Transaction...'}</span>
          </button>
        )}

      </div>
    </div>
  );
};
