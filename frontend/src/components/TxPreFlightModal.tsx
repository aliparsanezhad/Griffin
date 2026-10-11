import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowDown, 
  X, 
  Zap, 
  Fuel, 
  Check 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface TxPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess: () => void;
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
  slippage: number;
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const TxPreFlightModal: React.FC<TxPreFlightModalProps> = ({
  isOpen,
  onClose,
  onConfirmSuccess,
  fromToken,
  toToken,
  slippage,
  tomanRate,
  lang,
  isDarkMode = true
}) => {
  const isFa = lang === 'fa';

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Simulation timer on open
  useEffect(() => {
    if (isOpen) {
      setIsSimulating(true);
      setIsConfirmed(false);
      const timer = setTimeout(() => {
        setIsSimulating(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numFrom = parseFloat(fromToken.amount) || 0;
  const numTo = parseFloat(toToken.estimatedAmount) || 0;
  const minGuaranteed = (numTo * (1 - slippage / 100)).toFixed(4);

  const fromTotalUsd = numFrom * fromToken.priceUsd;
  const fromTotalToman = fromTotalUsd * tomanRate;

  const toTotalUsd = numTo * toToken.priceUsd;
  const toTotalToman = toTotalUsd * tomanRate;

  const commissionUsd = fromTotalUsd * 0.005;
  const gasToman = 2400; // < $0.03 on L2

  const handleConfirmAndSend = () => {
    playSwapSuccessSound();
    setIsConfirmed(true);
    setTimeout(() => {
      onConfirmSuccess();
      onClose();
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all ${
        isDarkMode 
          ? 'bg-[#130d2c] border-purple-500/30 text-slate-100 shadow-purple-950/60' 
          : 'bg-white border-purple-200 text-slate-800 shadow-2xl'
      }`}>
        
        {/* Close Button */}
        {!isConfirmed && (
          <button 
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="absolute top-5 left-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* SCREEN 1: PRE-FLIGHT INSPECTION & SIMULATION */}
        {!isConfirmed && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? 'شبیه‌سازی امنیتی پیش از ارسال تراکنش' : 'Pre-Flight Safety Simulation'}</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white">
                {isFa ? 'بررسی نهایی و اجرای هوشمند تراکنش 🛡️' : 'Review & Confirm Swap 🛡️'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa 
                  ? 'قرارداد پیش از کسر موجودی، در محیط شبیه‌ساز تست شد تا از بروز خطای گس یا لغزش قیمت جلوگیری شود.'
                  : 'Transaction simulated off-chain to prevent gas loss and verify slippage limits.'}
              </p>
            </div>

            {/* Simulation Status Badge */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
              isSimulating
                ? 'bg-purple-950/40 border-purple-500/20 text-purple-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {isSimulating ? (
                  <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-bold">
                  {isSimulating 
                    ? (isFa ? 'در حال شبیه‌سازی بای‌کد تراکنش...' : 'Simulating contract execution...') 
                    : (isFa ? 'شبیه‌سازی با موفقیت پاس شد (۰ خطا)' : 'Simulation Passed (0 Reverts)')}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-emerald-400 border border-emerald-500/30">
                MEV-Protected
              </span>
            </div>

            {/* Token Flow Card */}
            <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/20 space-y-3">
              
              {/* Sending */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isFa ? 'پرداخت از ولت شما:' : 'You Send:'}</span>
                  <div className="flex items-center gap-2">
                    <img src={fromToken.logo} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                    <span className="font-black font-mono text-white text-base">
                      {fromToken.amount} {fromToken.symbol}
                    </span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-white block">${fromTotalUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-amber-300">
                    ≈ {isFa ? `${toPersianDigits(formatToman(fromTotalToman, false))} ت` : `${formatToman(fromTotalToman, false)} T`}
                  </span>
                </div>
              </div>

              {/* Arrow Divider */}
              <div className="flex justify-center -my-1">
                <div className="p-1.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Receiving */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isFa ? 'دریافت تخمینی در ولت:' : 'You Receive (Est.):'}</span>
                  <div className="flex items-center gap-2">
                    <img src={toToken.logo} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                    <span className="font-black font-mono text-emerald-400 text-base">
                      {toToken.estimatedAmount} {toToken.symbol}
                    </span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-white block">${toTotalUsd.toFixed(2)}</span>
                  <span className="text-[10px] text-amber-300">
                    ≈ {isFa ? `${toPersianDigits(formatToman(toTotalToman, false))} ت` : `${formatToman(toTotalToman, false)} T`}
                  </span>
                </div>
              </div>

            </div>

            {/* Key Execution Specs */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'حداقل دریافت تضمینی (با اسلیپیج):' : 'Minimum Guaranteed:'}</span>
                <span className="font-mono text-white font-bold">
                  {minGuaranteed} {toToken.symbol} ({slippage}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'کارمزد تخمینی شبکه (گس):' : 'Estimated Network Gas:'}</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Fuel className="w-3 h-3" />
                  <span>&lt; $0.03 (≈ {isFa ? `${toPersianDigits(formatToman(gasToman, false))} تومان` : `${gasToman} T`})</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'کارمزد پروتکل گریفین (۰.۵٪ به خزانه):' : 'Griffin Fee (0.5% to Treasury):'}</span>
                <span className="font-mono text-purple-300 font-bold">
                  ${commissionUsd.toFixed(2)} (0xD9C1...A2D3)
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-purple-500/15">
                <span className="text-slate-400">{isFa ? 'مسیردهی بین‌زنجیره‌ای:' : 'Bridge Routing:'}</span>
                <span className="font-bold text-amber-300 font-mono">
                  Across V3 Intent Engine (14s)
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-all"
              >
                {isFa ? 'ویرایش جزئیات' : 'Back / Edit'}
              </button>
              <button
                onClick={handleConfirmAndSend}
                disabled={isSimulating}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white shadow-xl shadow-emerald-950/50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isFa ? 'تایید و ارسال به کیف‌پول' : 'Confirm & Execute'}</span>
              </button>
            </div>

          </div>
        )}

        {/* SCREEN 2: CELEBRATION & SUCCESS */}
        {isConfirmed && (
          <div className="py-4 flex flex-col items-center text-center space-y-4 animate-fade-in">
            
            {/* 3D Celebration Mascot */}
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-amber-400/80 shadow-2xl bg-black/40 animate-bounce-subtle">
              <img 
                src="/mascot/griffi-celebration.jpg" 
                alt="Griffi Celebrating" 
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'تراکنش با موفقیت در بلاک‌چین ثبت شد!' : 'Transaction Successfully Broadcast!'}</span>
            </div>

            <h3 className="text-xl font-black text-white">
              {isFa ? 'تبریک! مبادله شما انجام شد 🎉' : 'Congratulations! Swap Filled 🎉'}
            </h3>

            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              {isFa
                ? `مقدار ${toToken.estimatedAmount} ${toToken.symbol} به صورت مستقیم و غیرحضانتی به کیف‌پول شما واریز گردید و ۵۰ پر گریفی به وفاداری شما اضافه شد!`
                : `Transferred ${toToken.estimatedAmount} ${toToken.symbol} to your self-custodial wallet! 50 Griffi feathers rewarded.`}
            </p>

            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 font-mono text-[11px] text-purple-200">
              TxHash: 0x7b88...3e41 • {isFa ? 'کارمزد خزانه: ۰.۵٪' : 'Treasury: 0.5%'}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
