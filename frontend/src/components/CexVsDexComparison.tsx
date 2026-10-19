import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Zap, 
  Calculator,
  Calendar,
  Flame
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';

interface CexVsDexComparisonProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface CexProfile {
  id: string;
  name: string;
  makerFee: number;
  takerFee: number;
  withdrawalUsdt: number;
  kycRequired: boolean;
  settlementDelay: string;
}

export const CexVsDexComparison: React.FC<CexVsDexComparisonProps> = ({
  tomanRate,
  lang,
  isDarkMode = true
}) => {
  const isFa = lang === 'fa';

  const cexProfiles: CexProfile[] = [
    {
      id: 'nobitex',
      name: 'نوبیتکس (سطح کاربری ۱)',
      makerFee: 0.0035,
      takerFee: 0.0035,
      withdrawalUsdt: 2.0,
      kycRequired: true,
      settlementDelay: 'پایا سیکل بعد (تا ۲۴ ساعت)'
    },
    {
      id: 'wallex',
      name: 'والکس (سطح کلاسیک)',
      makerFee: 0.0040,
      takerFee: 0.0040,
      withdrawalUsdt: 2.5,
      kycRequired: true,
      settlementDelay: 'سیکل پایا شاپرک'
    },
    {
      id: 'tabdil',
      name: 'تبدیل / اوکی‌اکسچنج',
      makerFee: 0.0038,
      takerFee: 0.0038,
      withdrawalUsdt: 2.0,
      kycRequired: true,
      settlementDelay: 'واریز بانکی پایا'
    },
    {
      id: 'foreign',
      name: 'صرافی خارجی (بایننس/مکسی)',
      makerFee: 0.0010,
      takerFee: 0.0010,
      withdrawalUsdt: 3.0,
      kycRequired: true,
      settlementDelay: 'ریسک مسدودی هویت ایرانی'
    }
  ];

  const [selectedCexId, setSelectedCexId] = useState<string>('nobitex');
  const [tradeAmountToman, setTradeAmountToman] = useState<number>(50000000); // 50M Tomans
  const [tradesPerMonth, setTradesPerMonth] = useState<number>(6); // 6 trades per month

  const currentCex = cexProfiles.find(c => c.id === selectedCexId) || cexProfiles[0];
  const tradeUsdt = Math.round(tradeAmountToman / (tomanRate || 93500));
  
  // Fee math per trade
  const cexWithdrawalCostToman = Math.round(currentCex.withdrawalUsdt * tomanRate);
  const cexTradingFeeToman = Math.round(tradeAmountToman * currentCex.takerFee);
  const cexTotalCostToman = cexWithdrawalCostToman + cexTradingFeeToman;

  const dexL2GasUsdt = 0.025; // ~$0.025 on Arbitrum/Base (< 2,500 Toman)
  const dexProtocolFeePercent = 0.005; // 0.5% (with 0 custody risk)
  const dexGasCostToman = Math.round(dexL2GasUsdt * tomanRate);
  const dexProtocolFeeToman = Math.round(tradeAmountToman * dexProtocolFeePercent);
  const dexTotalCostToman = dexGasCostToman + dexProtocolFeeToman;

  // Net per-trade savings on withdrawal taxes and spreads
  const perTradeSavingsToman = Math.max(0, cexTotalCostToman - dexTotalCostToman + (currentCex.withdrawalUsdt * tomanRate * 0.9));
  const annualSavingsToman = perTradeSavingsToman * tradesPerMonth * 12;
  const annualSavingsUsdt = Math.round(annualSavingsToman / (tomanRate || 93500));

  const comparisonRows = [
    {
      metricFa: 'احراز هویت و اطلاعات هویتی (KYC)',
      metricEn: 'Identity Verification (KYC)',
      dexFa: 'صفر درصد (بدون نیاز به کارت ملی، ویدیو یا شماره شبا)',
      dexEn: '0% (No National ID or KYC Required)',
      cexFa: 'اجباری (کارت ملی، تصویر سلفی، شماره شبا، تایید تلفن)',
      cexEn: 'Mandatory (ID Card, Selfie, Bank Card, Phone Verification)',
      dexWinner: true
    },
    {
      metricFa: 'مالکیت و کنترل کلید خصوصی (Custody)',
      metricEn: 'Asset Custody & Private Keys',
      dexFa: '۱۰۰٪ در ولت شخصی کاربر (غیرحضانتی و امن)',
      dexEn: '100% Non-Custodial (Your Keys, Your Coins)',
      cexFa: 'حضانتی در کیف‌پول صرافی (ریسک ورشکستگی یا انسداد)',
      cexEn: 'Custodial (Exchange holds keys, insolvency risk)',
      dexWinner: true
    },
    {
      metricFa: 'کارمزد ثابت برداشت به کیف‌پول',
      metricEn: 'Withdrawal Network Fee',
      dexFa: 'کمتر از ۲,۵۰۰ تومان (< ۰.۰۳ دلار روی آربیتروم)',
      dexEn: '< $0.03 on Arbitrum/Base (< 2,500 T)',
      cexFa: '۱.۵ تا ۳ تتر ثابت (معادل ۱۴۰,۰۰۰ تا ۲۸۰,۰۰۰ تومان)',
      cexEn: '1.5 - 3.0 USDT Fixed (~140,000 - 280,000 T)',
      dexWinner: true
    },
    {
      metricFa: 'سرعت واریز و تسویه نهایی',
      metricEn: 'Settlement & Deposit Speed',
      dexFa: '۱۴ ثانیه (تسویه آنی روی بلاک‌چین)',
      dexEn: '14 Seconds (Instant On-Chain Settlement)',
      cexFa: 'چند ساعت تا ۲۴ ساعت (تابع چرخه‌های پایا و ساتنا)',
      cexEn: 'Hours to Next Business Day (Paya/Satna Cycles)',
      dexWinner: true
    },
    {
      metricFa: 'ریسک انسداد و خطای آی‌پی / تحریم',
      metricEn: 'Sanctions & Freeze Risk',
      dexFa: 'صفر (مجهز به نودهای خصوصی و ضدتحریم ۱RPC)',
      dexEn: 'Zero (Protected by 1RPC & Anti-MEV nodes)',
      cexFa: 'ریسک مسدودسازی حساب بانکی یا انسداد با آی‌پی خارجی',
      cexEn: 'Bank Account Freeze or Geoblock on Foreign IPs',
      dexWinner: true
    }
  ];

  return (
    <div className={`w-full rounded-3xl p-5 md:p-8 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/95 border-purple-500/25 text-slate-100 shadow-purple-950/40' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      
      {/* Banner with Griffi Persian Guardian 3D Mascot */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/80 shadow-lg shrink-0 bg-black/40">
            <img 
              src="/mascot/griffi-guardian.jpg" 
              alt="Griffi Persian Guardian" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'نگهبان استقلال مالی و وب۳ ایرانیان 🦅' : 'Guardian of Iranian Web3 Sovereignty'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{isFa ? 'چرا گریفین‌سواپ به جای صرافی‌های متمرکز؟' : 'Why GriffinSwap over Centralized Exchanges?'}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isFa 
                ? 'مقایسه شفاف هزینه‌ها، ریسک‌های نگهداری سرمایه و کارمزدهای پنهان برداشت میان گریفین‌سواپ و صرافی‌های متمرکز داخلی.' 
                : 'Transparent comparative analysis of custody risk, withdrawal fees, and privacy between GriffinSwap and centralized CEXs.'}
            </p>
          </div>
        </div>

        {/* Treasury transparency badge */}
        <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-right self-start lg:self-auto shrink-0 font-mono text-xs">
          <span className="text-[10px] text-slate-400 block">{isFa ? 'خزانه رسمی کارمزدها:' : 'Treasury Fee Wallet:'}</span>
          <span className="text-amber-300 font-bold">0xD9C1...A2D3</span>
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-amber-950/30 border border-purple-500/30 space-y-5">
        
        {/* Top bar: Exchange selector & Volume indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'ماشین‌حساب مقایسه صرفه‌جویی کارمزد و هزینه‌های پنهان:' : 'Real-Time Fee & Latency Savings Calculator:'}</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isFa ? 'صرافی متمرکز مدنظر خود را انتخاب کرده تا تفاوت واقعی کارمزدهای برداشت را مشاهده کنید:' : 'Select benchmark exchange to evaluate cost differences:'}
            </p>
          </div>

          {/* CEX selector pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {cexProfiles.map((cex) => (
              <button
                key={cex.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedCexId(cex.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedCexId === cex.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-black/30 text-slate-400 border-purple-500/20 hover:text-white'
                }`}
              >
                {cex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid: Volume + Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Slider 1: Trade Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold">{isFa ? 'حجم هر معامله:' : 'Trade Size:'}</span>
              <span className="text-amber-400 font-mono font-bold">
                {isFa ? `${toPersianDigits(formatToman(tradeAmountToman))} تومان` : `${formatToman(tradeAmountToman)} T`}
                {' '}(≈ ${tradeUsdt} USDT)
              </span>
            </div>
            <input 
              type="range"
              min="10000000"
              max="500000000"
              step="10000000"
              value={tradeAmountToman}
              onChange={(e) => setTradeAmountToman(Number(e.target.value))}
              className="w-full h-2 bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>۱۰ م تومان</span>
              <span>۲۵۰ م تومان</span>
              <span>۵۰۰ م تومان</span>
            </div>
          </div>

          {/* Slider 2: Trade Frequency per month */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{isFa ? 'تعداد معاملات در ماه:' : 'Trades per Month:'}</span>
              </span>
              <span className="text-purple-300 font-mono font-bold">
                {tradesPerMonth} {isFa ? 'معامله در ماه' : 'trades/mo'}
              </span>
            </div>
            <input 
              type="range"
              min="1"
              max="30"
              step="1"
              value={tradesPerMonth}
              onChange={(e) => setTradesPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>۱ معامله (هولدر)</span>
              <span>۱۵ معامله (سوئینگ)</span>
              <span>۳۰ معامله (دی‌تریدر)</span>
            </div>
          </div>

        </div>

        {/* 4 Metrics Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* CEX Cost Per Trade */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30 space-y-1 text-right">
            <span className="text-[10px] text-rose-300 block font-bold">
              {currentCex.name}:
            </span>
            <div className="text-base font-black font-mono text-rose-400">
              ≈ {isFa ? `${toPersianDigits(formatToman(cexTotalCostToman, false))} تومان` : `${formatToman(cexTotalCostToman, false)} T`}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              کارمزد خروج: {currentCex.withdrawalUsdt} USDT ثابت
            </span>
          </div>

          {/* GriffinSwap Cost Per Trade */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1 text-right">
            <span className="text-[10px] text-emerald-300 block font-bold">
              {isFa ? 'گریفین‌سواپ (شبکه L2):' : 'GriffinSwap L2 Gas:'}
            </span>
            <div className="text-base font-black font-mono text-emerald-400">
              ≈ {isFa ? `${toPersianDigits(formatToman(dexTotalCostToman, false))} تومان` : `${formatToman(dexTotalCostToman, false)} T`}
            </div>
            <span className="text-[10px] text-slate-400 block">
              گس زیر ۲,۵۰۰ تومان بدون باج خروج
            </span>
          </div>

          {/* Per-Trade Savings */}
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-1 text-right">
            <span className="text-[10px] text-emerald-300 block font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'صرفه‌جویی در هر معامله:' : 'Per-Trade Net Saved:'}</span>
            </span>
            <div className="text-base font-black font-mono text-amber-300">
              +{isFa ? `${toPersianDigits(formatToman(perTradeSavingsToman, false))} تومان` : `${formatToman(perTradeSavingsToman, false)} T`}
            </div>
            <span className="text-[10px] text-emerald-400 block">
              مستقیماً در ولت شخصی شما می‌ماند
            </span>
          </div>

          {/* Annual Tally Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-600/30 via-purple-900/40 to-black/60 border border-amber-400/60 space-y-1 text-right shadow-lg">
            <span className="text-[10px] text-amber-300 block font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'مجموع صرفه‌جویی سالانه:' : 'Annual Projected Savings:'}</span>
            </span>
            <div className="text-lg font-black font-mono text-white">
              +{isFa ? `${toPersianDigits(formatToman(annualSavingsToman, false))} تومان` : `${formatToman(annualSavingsToman, false)} T`}
            </div>
            <span className="text-[10px] text-amber-300/90 font-mono block">
              ≈ +${annualSavingsUsdt.toLocaleString()} USDT در سال
            </span>
          </div>

        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-purple-500/20 text-slate-400 pb-3">
              <th className="py-3 px-3">{isFa ? 'معیار مقایسه' : 'Feature'}</th>
              <th className="py-3 px-3 text-emerald-400 font-bold bg-emerald-950/20 rounded-t-xl">
                {isFa ? '🦅 گریفین‌سواپ (GriffinSwap)' : '🦅 GriffinSwap'}
              </th>
              <th className="py-3 px-3 text-rose-300">
                {isFa ? 'صرافی‌های متمرکز (CEX)' : 'Centralized CEXs'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                <td className="py-3.5 px-3 font-bold text-white">
                  {isFa ? row.metricFa : row.metricEn}
                </td>
                <td className="py-3.5 px-3 bg-emerald-950/10 text-emerald-300 font-bold font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{isFa ? row.dexFa : row.dexEn}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-slate-400 font-sans">
                  {isFa ? row.cexFa : row.cexEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Golden Rules Note */}
      <div className="mt-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isFa 
              ? '«کلیدهای شما، دارایی شماست؛ بدون کلید، دارایی مال شما نیست.» گریفین‌سواپ این اصل وب۳ را در ایران محقق می‌کند.'
              : '"Not your keys, not your coins." GriffinSwap brings true financial sovereignty to Iranian Web3.'}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{isFa ? 'میانگین سواپ: ۱۴ ثانیه' : 'Avg Swap: 14s'}</span>
        </div>
      </div>

    </div>
  );
};
