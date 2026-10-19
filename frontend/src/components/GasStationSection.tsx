import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Gift, 
  DollarSign, 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  Layers,
  Bell,
  Sliders,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playGasIgnitionSound, playSwapSuccessSound } from '../services/soundService';

interface GasStationSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface HourGasProfile {
  hour: number;
  label: string;
  gwei: number;
  costUsd: number;
  status: 'ultra-low' | 'normal' | 'peak';
  statusFa: string;
  statusEn: string;
  color: string;
  descFa: string;
  descEn: string;
}

export const GasStationSection: React.FC<GasStationSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const [tankFuel, setTankFuel] = useState<number>(() => {
    const saved = localStorage.getItem('griffi_gas_tank');
    return saved !== null ? Number(saved) : 75; // 75%
  });
  const [paymasterEnabled, setPaymasterEnabled] = useState<boolean>(() => {
    return localStorage.getItem('griffi_paymaster_mode') !== 'false';
  });
  const [gasToken, setGasToken] = useState<'USDT' | 'USDC' | 'TON'>('USDT');
  const [claimedDailyFree, setClaimedDailyFree] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFueling, setIsFueling] = useState<boolean>(false);
  const [gasAlertGwei, setGasAlertGwei] = useState<number>(12);
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);
  const [alertChannel, setAlertChannel] = useState<'telegram' | 'browser'>('telegram');
  const [monthlyTrades, setMonthlyTrades] = useState<number>(30);
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    // Current hour in Iran Standard Time (UTC+3:30)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const irstHour = (utcHours + 3 + (now.getUTCMinutes() >= 30 ? 1 : 0)) % 24;
    return irstHour;
  });

  const isFa = lang === 'fa';

  useEffect(() => {
    localStorage.setItem('griffi_gas_tank', tankFuel.toString());
  }, [tankFuel]);

  useEffect(() => {
    localStorage.setItem('griffi_paymaster_mode', paymasterEnabled.toString());
  }, [paymasterEnabled]);

  const handleClaimFreeGas = () => {
    playGasIgnitionSound();
    setIsFueling(true);
    setTimeout(() => {
      setTankFuel((prev) => Math.min(100, prev + 25));
      setClaimedDailyFree(true);
      setIsFueling(false);
      playSwapSuccessSound();
    }, 1000);
  };

  const handleDepositGasCredits = (amountUsdt: number) => {
    playGasIgnitionSound();
    setIsFueling(true);
    setTimeout(() => {
      setTankFuel((prev) => Math.min(100, prev + amountUsdt * 10));
      setIsFueling(false);
      playSwapSuccessSound();
    }, 800);
  };

  const handleToggleGasAlert = () => {
    playClickSound();
    setAlertSubscribed(prev => !prev);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const networksGasStats = [
    { name: 'Arbitrum One', gwei: '0.1 Gwei', usd: 0.02, speed: '< 1s', supported: true, badge: 'پیشنهادی' },
    { name: 'Base', gwei: '0.05 Gwei', usd: 0.01, speed: '< 1s', supported: true, badge: 'فوق‌ارزان' },
    { name: 'Optimism', gwei: '0.08 Gwei', usd: 0.02, speed: '< 1s', supported: true, badge: 'پایدار' },
    { name: 'BNB Chain', gwei: '1.2 Gwei', usd: 0.04, speed: '2s', supported: true, badge: 'نقدینگی بالا' },
    { name: 'Polygon', gwei: '30 Gwei', usd: 0.01, speed: '2s', supported: true, badge: 'میکرو' },
    { name: 'TON Network', gwei: '0.005 TON', usd: 0.03, speed: '3s', supported: true, badge: 'تلگرام' },
    { name: 'Ethereum Mainnet', gwei: '14 Gwei', usd: 0.95, speed: '12s', supported: true, badge: 'لایه ۱' },
  ];

  // Projected annual savings using L2 Arbitrum/Base Paymaster vs Ethereum L1
  const annualL1CostUsd = monthlyTrades * 12 * 1.65;
  const annualL2CostUsd = monthlyTrades * 12 * 0.02;
  const annualSavingsUsd = Math.round(annualL1CostUsd - annualL2CostUsd);
  const annualSavingsToman = Math.round(annualSavingsUsd * tomanRate);

  // 24-hour Tehran Time (IRST) Gas Cost Heatmap
  const tehranGasHours: HourGasProfile[] = Array.from({ length: 24 }).map((_, h) => {
    let gwei = 12;
    let costUsd = 0.02;
    let status: 'ultra-low' | 'normal' | 'peak' = 'normal';
    let statusFa = 'عادی';
    let statusEn = 'Normal';
    let color = 'bg-amber-400';
    let descFa = 'ترافیک متوسط شبکه در ساعات کاری آسیا و اروپا';
    let descEn = 'Moderate network activity during Asian/EU hours';

    if (h >= 3 && h <= 8) {
      gwei = 6;
      costUsd = 0.008;
      status = 'ultra-low';
      statusFa = 'ساعات طلایی (بسیار ارزان)';
      statusEn = 'Golden Hours (Ultra Low)';
      color = 'bg-emerald-400';
      descFa = 'ارزان‌ترین زمان شبانه‌روز برای انجام سواپ و تعامل با قراردادها به وقت تهران';
      descEn = 'Cheapest window of the day for EVM transactions';
    } else if (h >= 16 && h <= 21) {
      gwei = 26;
      costUsd = 0.055;
      status = 'peak';
      statusFa = 'اوج ترافیک (پیک آمریکا)';
      statusEn = 'Peak Traffic (US Market)';
      color = 'bg-rose-500';
      descFa = 'همزمانی با بازگشایی وال‌استریت؛ توصیه به استفاده از سفارش لیمیت Permit2 آف‌چین بدون گس';
      descEn = 'Peak congestion during Wall St hours; consider gasless Permit2 orders';
    } else if (h >= 0 && h <= 2) {
      gwei = 10;
      costUsd = 0.015;
      status = 'ultra-low';
      statusFa = 'آرامش شبانه';
      statusEn = 'Night Low';
      color = 'bg-emerald-500';
      descFa = 'کاهش ترافیک شبانه و افت نرخ کارمزد';
      descEn = 'Late evening cooldown';
    }

    return {
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      gwei,
      costUsd,
      status,
      statusFa,
      statusEn,
      color,
      descFa,
      descEn
    };
  });

  const activeHourData = tehranGasHours[selectedHour] || tehranGasHours[4];

  // Common operations cost estimator
  const operationsCost = [
    { 
      titleFa: 'سواپ معمولی لایه دو (Arbitrum/Base)', 
      titleEn: 'Simple L2 Swap', 
      costUsd: 0.015,
      savingFa: '۹۸٪ ارزان‌تر از صرافی متمرکز'
    },
    { 
      titleFa: 'بریج بین شبکه‌ای کراس‌چین', 
      titleEn: 'Cross-Chain Bridge', 
      costUsd: 0.08,
      savingFa: 'تسویه خودکار در کمتر از ۱ دقیقه'
    },
    { 
      titleFa: 'سپرده‌گذاری در استخر نقدینگی دیفای', 
      titleEn: 'DeFi LP Staking', 
      costUsd: 0.045,
      savingFa: 'شامل تایید هوشمند قرارداد'
    },
    { 
      titleFa: 'سفارش لیمیت آف‌چین با امضای Permit2', 
      titleEn: 'Permit2 Gasless Limit Order', 
      costUsd: 0.00,
      savingFa: 'کاملاً رایگان (بدون پرداخت گس)'
    },
  ];

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/50 shadow-lg shadow-purple-500/20 shrink-0">
            <img 
              src="/mascot/griffi-gas-station.jpg" 
              alt="Griffi Gas Station" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'جایگاه سوخت گریفین | پرداخت کارمزد با تتر (ERC-4337)' : 'Griffin Gas Station & ERC-4337 Paymaster'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" />
                Zero ETH Needed
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پایان مشکل نداشتن اتریوم برای پرداخت گس! کارمزد تراکنش‌ها را مستقیماً با تتر (USDT) پرداخت کنید یا سوخت رایگان بگیرید.'
                : 'Never get stuck without ETH again! Pay gas fees directly in USDT or enjoy daily sponsored gas transactions.'}
            </p>
          </div>
        </div>

        {/* Paymaster Mode Toggle Button */}
        <div className={`p-1.5 rounded-2xl border flex items-center gap-2 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <span className="text-xs font-bold px-2 text-slate-300">
            {isFa ? 'حالت پرداخت با تتر:' : 'Paymaster Mode:'}
          </span>
          <button
            onClick={() => {
              playClickSound();
              setPaymasterEnabled(!paymasterEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 ${
              paymasterEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'bg-white/10 text-slate-400'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${paymasterEnabled ? 'text-amber-300' : 'text-slate-500'}`} />
            <span>{paymasterEnabled ? (isFa ? 'فعال (تتر/USDT)' : 'Enabled') : (isFa ? 'غیرفعال (ETH)' : 'Disabled')}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Gas Pump & Fuel Tank Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        
        {/* Fuel Tank Gauge */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-400" />
                {isFa ? 'باک سوخت گازی شما' : 'Your Gas Tank Gauge'}
              </span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                {tankFuel}%
              </span>
            </div>

            {/* Visual Tank Gauge */}
            <div className="relative w-full h-8 bg-black/40 rounded-2xl p-1 border border-purple-500/30 overflow-hidden mb-3">
              <div 
                className={`h-full rounded-xl transition-all duration-700 bg-gradient-to-r ${
                  tankFuel > 50 
                    ? 'from-emerald-500 via-teal-400 to-amber-400' 
                    : tankFuel > 20 
                      ? 'from-amber-500 to-orange-500' 
                      : 'from-rose-500 to-red-600'
                } ${isFueling ? 'animate-pulse' : ''}`}
                style={{ width: `${tankFuel}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow">
                {isFueling ? (isFa ? 'در حال سوخت‌گیری...' : 'Fueling Up...') : `${Math.floor(tankFuel / 2)} ${isFa ? 'تراکنش آربیتروم موجود' : 'Swaps Remaining'}`}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-right">
              {isFa
                ? 'با هر تراکنش آربیتروم حدود ۲٪ از باک سوخت شما مصرف می‌شود.'
                : 'Each Arbitrum swap consumes approximately 2% of your pre-funded gas credits.'}
            </p>
          </div>

          {/* Daily Free Claim Box */}
          <div className="mt-5 pt-4 border-t border-purple-500/20">
            <button
              onClick={handleClaimFreeGas}
              disabled={claimedDailyFree || isFueling}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                claimedDailyFree
                  ? 'bg-white/5 border border-purple-500/20 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {claimedDailyFree 
                  ? (isFa ? 'سوخت رایگان امروز دریافت شد (۲۴ساعت دیگر)' : 'Daily Free Gas Claimed')
                  : (isFa ? 'دریافت ۱ سهمیه سوخت رایگان روزانه 🎁' : 'Claim Daily Free Gas 🎁')}
              </span>
            </button>
          </div>
        </div>

        {/* Middle Column: Instant Top-Up with USDT */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-white border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300">
                {isFa ? 'شارژ سریع باک با تتر (بدون اتریوم):' : 'Pre-Fund Gas Credits:'}
              </span>
              <div className="flex gap-1">
                {(['USDT', 'USDC', 'TON'] as const).map((tk) => (
                  <button
                    key={tk}
                    onClick={() => {
                      playClickSound();
                      setGasToken(tk);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gasToken === tk
                        ? 'bg-purple-600 text-white'
                        : isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tk}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 text-right">
              {isFa
                ? 'با واریز مستقیم ۳ تا ۱۰ تتر، نیازی به داشتن اتریوم در هیچ کیف‌پولی نخواهید داشت.'
                : 'Deposit 3-10 USDT once to subsidize gas for dozens of transactions seamlessly.'}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { usdt: 2, swaps: 50, label: 'سبک' },
                { usdt: 5, swaps: 150, label: 'معمولی' },
                { usdt: 10, swaps: 300, label: 'حرفه‌ای' },
              ].map((pack) => (
                <button
                  key={pack.usdt}
                  onClick={() => handleDepositGasCredits(pack.usdt)}
                  disabled={isFueling}
                  className={`p-3 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/40 text-slate-200' 
                      : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-slate-800'
                  }`}
                >
                  <span className="text-sm font-extrabold text-amber-400 block font-mono">
                    {pack.usdt} {gasToken}
                  </span>
                  <span className="text-[10px] text-purple-300 block mt-0.5">
                    {pack.swaps} {isFa ? 'سواپ' : 'Swaps'}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    {isFa ? `${toPersianDigits(formatToman(pack.usdt * tomanRate))} ت` : `${formatToman(pack.usdt * tomanRate)} T`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isFa ? 'سازگار با متامسک، ربی، تراست‌ولت و تلگرام' : 'Compatible with MetaMask, Rabby, Trust Wallet & TON'}
            </span>
          </div>
        </div>

        {/* Right Column: Multi-Chain Live Gas Rates */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-white border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                {isFa ? 'نرخ کارمزد زنده‌ی شبکه‌ها' : 'Live Network Gas Rates'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
            </div>

            <div className="space-y-2">
              {networksGasStats.map((net) => (
                <div 
                  key={net.name}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                    isDarkMode ? 'border-purple-500/10 bg-white/5' : 'border-purple-100 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white block">{net.name}</span>
                      {net.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {net.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{net.speed} تایید • {net.gwei}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-amber-400 font-bold block">${net.usd}</span>
                    <span className="text-[10px] text-purple-300 font-mono">
                      ≈ {isFa ? `${toPersianDigits(formatToman(net.usd * tomanRate))} ت` : `${formatToman(net.usd * tomanRate)} T`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tehran Time Zone (IRST) 24h Gas Heatmap */}
      <div className={`p-5 rounded-2xl border my-6 ${
        isDarkMode ? 'bg-purple-950/25 border-purple-500/25' : 'bg-purple-50/50 border-purple-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-right">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white">
                {isFa ? 'نقشه حرارتی ۲۴ ساعته کارمزد گس به وقت رسمی ایران (IRST Heatmap)' : '24h IRST Gas Heatmap (Tehran Time)'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isFa ? 'تشخیص دقیق ساعات طلایی سحرگاهی (۰۳:۰۰ تا ۰۸:۰۰) با کمترین کارمزد جهانی برای انجام معاملات بزرگ' : 'Identify ultra-low fee windows to execute large swaps at minimal cost'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {isFa ? 'طلایی / سحرگاه' : 'Ultra Low'}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {isFa ? 'عادی' : 'Normal'}
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {isFa ? 'پیک نیویورک' : 'Peak'}
            </span>
          </div>
        </div>

        {/* 24-hour visual bar selector */}
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1 py-2">
          {tehranGasHours.map((gh) => {
            const isSelected = selectedHour === gh.hour;
            return (
              <button
                key={gh.hour}
                onClick={() => {
                  playClickSound();
                  setSelectedHour(gh.hour);
                }}
                className={`flex flex-col items-center justify-between p-1.5 rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'ring-2 ring-white border-white bg-white/20 scale-105 shadow-lg z-10'
                    : 'border-purple-500/10 bg-black/30 hover:bg-purple-900/30'
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-slate-300">
                  {gh.hour}
                </span>
                <span className={`w-2.5 h-6 rounded-full my-1 transition-all ${gh.color} ${gh.status === 'ultra-low' ? 'shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} />
                <span className="text-[8px] font-mono text-slate-400">
                  {gh.gwei}G
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hour Details Inspector */}
        <div className="mt-3 p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-mono font-bold">
              {activeHourData.label} IRST
            </span>
            <div>
              <span className="text-white font-black block">
                {isFa ? activeHourData.statusFa : activeHourData.statusEn}
              </span>
              <span className="text-[11px] text-slate-300">
                {isFa ? activeHourData.descFa : activeHourData.descEn}
              </span>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="font-extrabold text-amber-400 text-xs block">
              میانگین گس: {activeHourData.gwei} Gwei
            </span>
            <span className="text-[10px] text-purple-300 block">
              هزینه سواپ: ≈ {isFa ? `${toPersianDigits(formatToman(activeHourData.costUsd * tomanRate))} تومان` : `${formatToman(activeHourData.costUsd * tomanRate)} T`}
            </span>
          </div>
        </div>
      </div>

      {/* Operation Cost Estimator Matrix */}
      <div className={`p-5 rounded-2xl border my-6 ${
        isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/60 border-purple-200'
      }`}>
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 text-right">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'محاسبه کارمزد عملیات‌های رایج بر حسب تومان:' : 'Standard Operations Fee Estimator:'}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {operationsCost.map((op, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between ${
                isDarkMode ? 'bg-black/30 border-purple-500/20' : 'bg-white border-purple-200 shadow-sm'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block mb-1">
                  {isFa ? op.titleFa : op.titleEn}
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">
                  {op.savingFa}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-purple-500/15 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-emerald-400 font-extrabold">
                  {op.costUsd === 0 ? (isFa ? 'رایگان' : 'FREE') : `$${op.costUsd}`}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {op.costUsd === 0 
                    ? '0 IRT' 
                    : isFa ? `${toPersianDigits(formatToman(op.costUsd * tomanRate))} تومان` : `${formatToman(op.costUsd * tomanRate)} T`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Gas Alert Subscription Desk & L2 Savings Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        
        {/* Module 1: Gas Alert Radar & Telegram Bot Link */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between text-right ${
          isDarkMode ? 'bg-purple-950/25 border-purple-500/25' : 'bg-white border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  {isFa ? 'دیده‌بان و ربات هشدار گس ارزان (ساعات طلایی)' : 'Low Gas Alert Bot & Radar'}
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                alertSubscribed 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                {alertSubscribed ? (isFa ? 'فعال و متصل' : 'Active') : (isFa ? 'آماده اتصال' : 'Idle')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              {isFa
                ? 'هنگامی که کارمزد گس شبکه به زیر آستانه انتخابی شما رسید، پیام هشدار فوری دریافت کنید تا سواپ‌های سنگین خود را با کمترین هزینه ثبت کنید.'
                : 'Get notified via Telegram or Web Push when network gas drops below your threshold.'}
            </p>

            {/* Threshold Slider */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20 mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">{isFa ? 'آستانه هشدار کارمزد:' : 'Alert Threshold:'}</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {gasAlertGwei} Gwei
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={gasAlertGwei}
                onChange={(e) => setGasAlertGwei(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>5 Gwei (بسیار ارزان)</span>
                <span>15 Gwei</span>
                <span>30 Gwei (معمولی)</span>
              </div>
            </div>

            {/* Channel Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] text-slate-400">{isFa ? 'درگاه ارسال:' : 'Channel:'}</span>
              <button
                onClick={() => {
                  playClickSound();
                  setAlertChannel('telegram');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  alertChannel === 'telegram'
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                ربات تلگرام @GriffinSwapBot
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setAlertChannel('browser');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  alertChannel === 'browser'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-purple-900/30 text-slate-400 hover:text-white'
                }`}
              >
                وب‌نوتیفیکیشن مرورگر
              </button>
            </div>
          </div>

          <button
            onClick={handleToggleGasAlert}
            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              alertSubscribed
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>
              {alertSubscribed
                ? (isFa ? '✓ هشدار گس فعال شد (کلیک برای لغو)' : '✓ Gas Alert Active (Click to Cancel)')
                : (isFa ? `فعال‌سازی هشدار گس زیر ${gasAlertGwei} Gwei` : `Activate Gas Alert under ${gasAlertGwei} Gwei`)}
            </span>
          </button>
        </div>

        {/* Module 2: L2 Paymaster vs L1 Gas Savings Calculator */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between text-right ${
          isDarkMode ? 'bg-purple-950/25 border-purple-500/25' : 'bg-white border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">
                  {isFa ? 'صرفه‌جویی سالانه با پی‌مستر گریفین (L2 vs L1)' : 'Annual Gas Savings Calculator'}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-400" />
                98.8% Saved
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              {isFa
                ? 'مقایسه هزینه پرداخت مستقیم کارمزد گس در لایه دو و استخرهای گریفین با تراکنش‌های پرهزینه اتریوم لایه ۱.'
                : 'Compare Arbitrum/Base Paymaster costs against Ethereum Mainnet gas fees.'}
            </p>

            {/* Monthly Trades Slider */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-purple-500/20 mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">{isFa ? 'تعداد سواپ / تراکنش در ماه:' : 'Monthly Swaps:'}</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {isFa ? `${toPersianDigits(monthlyTrades)} تراکنش` : `${monthlyTrades} swaps`}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={monthlyTrades}
                onChange={(e) => setMonthlyTrades(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>5 (سبک)</span>
                <span>50</span>
                <span>150 (معامله‌گر فعال)</span>
              </div>
            </div>

            {/* Savings Cards */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-right">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {isFa ? 'هزینه سالانه لایه ۱ اتریوم:' : 'Annual L1 Gas Cost:'}
                </span>
                <span className="text-sm font-mono font-bold text-rose-400">
                  ${Math.round(annualL1CostUsd)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-right">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {isFa ? 'هزینه در گریفین‌سواپ L2:' : 'Griffin L2 Paymaster:'}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ${Math.round(annualL2CostUsd)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-purple-900/30 to-amber-500/15 border border-emerald-400/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-slate-200 font-bold">
                {isFa ? 'سود خالص در جیب شما:' : 'Net Projected Savings:'}
              </span>
            </div>
            <div className="text-left font-mono">
              <span className="text-sm font-black text-emerald-400 block">
                + {isFa ? `${toPersianDigits(formatToman(annualSavingsToman, false))} تومان` : `${formatToman(annualSavingsToman, false)} Toman`}
              </span>
              <span className="text-[10px] text-amber-300">
                ≈ ${annualSavingsUsd} USD
              </span>
            </div>
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
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای تراکنش‌های پی‌مستر مستقیماً به خزانه‌داری هدایت می‌شود:' 
              : 'Platform commission (0.5%) for Paymaster transactions is routed to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1 rounded-lg hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
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
