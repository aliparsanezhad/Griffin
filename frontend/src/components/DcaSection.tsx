import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  ArrowRightLeft,
  Zap,
  Clock,
  Play,
  Pause,
  Flame,
  History,
  Sliders
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound } from '../services/soundService';
import { LimitOrderBook } from './LimitOrderBook';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface DcaSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  onInitiateSwap?: (fromToken: string, toToken: string, amount: string) => void;
}

interface ActiveDcaPlan {
  id: string;
  asset: 'PAXG' | 'BTC' | 'ETH' | 'SHIRDAL' | 'USDT';
  assetName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  installmentToman: number;
  completedOrders: number;
  totalOrders: number;
  avgBuyPriceUsd: number;
  currentProfitPercent: number;
  nextExecutionDate: string;
  status: 'active' | 'paused';
}

export const DcaSection: React.FC<DcaSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode,
  onInitiateSwap
}) => {
  const isFa = lang === 'fa';

  // Mode: 'dca' (خرید پله‌ای) or 'limit' (دفتر سفارشات لیمیت)
  const [activeMode, setActiveMode] = useState<'dca' | 'limit'>('dca');

  // Sub-tab under DCA: 'calculator' (ماشین‌حساب و طراحی استراتژی) or 'active_plans' (برنامه‌های فعال من)
  const [dcaSubTab, setDcaSubTab] = useState<'calculator' | 'active_plans'>('calculator');

  // DCA Frequency: 'daily' | 'weekly' | 'monthly'
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // DCA State
  const [installmentToman, setInstallmentToman] = useState<number>(5000000); // Default for monthly
  const [selectedAsset, setSelectedAsset] = useState<'PAXG' | 'USDT' | 'ETH' | 'BTC' | 'SHIRDAL'>('PAXG');
  const [durationMonths, setDurationMonths] = useState<number>(12); // Duration in months
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Backtest Timeframe: '3m' | '6m' | '1y'
  const [backtestPeriod, setBacktestPeriod] = useState<'3m' | '6m' | '1y'>('6m');

  // Mock active plans state
  const [activePlans, setActivePlans] = useState<ActiveDcaPlan[]>([
    {
      id: 'dca-plan-1',
      asset: 'PAXG',
      assetName: 'طلای آب‌شده دیجیتال PAXG',
      frequency: 'weekly',
      installmentToman: 2500000,
      completedOrders: 7,
      totalOrders: 24,
      avgBuyPriceUsd: 2615.40,
      currentProfitPercent: 19.8,
      nextExecutionDate: 'فردا ۰۴:۱۵ بامداد (ساعت طلایی تهران)',
      status: 'active'
    },
    {
      id: 'dca-plan-2',
      asset: 'BTC',
      assetName: 'بیت‌کوین Bitcoin',
      frequency: 'daily',
      installmentToman: 500000,
      completedOrders: 42,
      totalOrders: 180,
      avgBuyPriceUsd: 87400.00,
      currentProfitPercent: 28.4,
      nextExecutionDate: 'امروز ۱۸:۰۰ به وقت تهران',
      status: 'active'
    }
  ]);

  // Adjust default installment when frequency changes
  const handleFrequencyChange = (newFreq: 'daily' | 'weekly' | 'monthly') => {
    playClickSound();
    setFrequency(newFreq);
    if (newFreq === 'daily') {
      setInstallmentToman(200000); // 200,000 Tomans daily (~$2)
    } else if (newFreq === 'weekly') {
      setInstallmentToman(1500000); // 1.5M Tomans weekly (~$15)
    } else {
      setInstallmentToman(5000000); // 5M Tomans monthly (~$50)
    }
  };

  // Asset annual growth estimates
  const assetAnnualGrowth: Record<string, number> = {
    'USDT': 0.45,   // Fiat depreciation hedge ~45% IRR inflation
    'PAXG': 0.65,   // Physical gold parity + dollar inflation ~65%
    'ETH': 0.85,    // ETH appreciation + inflation ~85%
    'BTC': 1.10,    // BTC appreciation + inflation ~110%
    'SHIRDAL': 1.45 // Native ecosystem token upside ~145%
  };

  // Executions count based on frequency and duration
  const executionsPerMonth = frequency === 'daily' ? 30 : frequency === 'weekly' ? 4 : 1;
  const totalExecutions = executionsPerMonth * durationMonths;
  const totalInvestedToman = installmentToman * totalExecutions;

  const growthRate = assetAnnualGrowth[selectedAsset] * (durationMonths / 12);
  const projectedFutureToman = Math.round(totalInvestedToman * (1 + growthRate));
  const profitToman = projectedFutureToman - totalInvestedToman;

  // Trajectory simulation
  const trajectoryPoints = useMemo(() => {
    const points: { month: number; invested: number; dcaVal: number; cashVal: number }[] = [];
    const monthlyTotal = installmentToman * executionsPerMonth;
    for (let m = 1; m <= durationMonths; m++) {
      const invested = monthlyTotal * m;
      const cashVal = Math.round(invested * Math.pow(1 - 0.42 / 12, m));
      const dcaVal = Math.round(invested * (1 + (assetAnnualGrowth[selectedAsset] / 12) * (m / 1.7)));
      points.push({ month: m, invested, dcaVal, cashVal });
    }
    return points;
  }, [installmentToman, executionsPerMonth, durationMonths, selectedAsset]);

  // SVG Chart math for DCA comparison
  const maxVal = Math.max(...trajectoryPoints.map(p => p.dcaVal), totalInvestedToman) * 1.05;
  const minVal = Math.min(...trajectoryPoints.map(p => p.cashVal)) * 0.95;
  const chartValRange = maxVal - minVal || 1;

  const chartW = 700;
  const chartH = 140;
  const padX = 25;
  const padY = 15;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const getDcaX = (idx: number) => padX + (idx / (durationMonths - 1 || 1)) * innerW;
  const getDcaY = (val: number) => padY + innerH - ((val - minVal) / chartValRange) * innerH;

  const dcaLinePath = useMemo(() => {
    return trajectoryPoints.reduce((acc, pt, i) => {
      const x = getDcaX(i);
      const y = getDcaY(pt.dcaVal);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [trajectoryPoints, maxVal, minVal]);

  const cashLinePath = useMemo(() => {
    return trajectoryPoints.reduce((acc, pt, i) => {
      const x = getDcaX(i);
      const y = getDcaY(pt.cashVal);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [trajectoryPoints, maxVal, minVal]);

  const dcaAreaPath = useMemo(() => {
    if (!dcaLinePath || trajectoryPoints.length === 0) return '';
    const lastX = getDcaX(trajectoryPoints.length - 1);
    const firstX = getDcaX(0);
    const bottomY = padY + innerH;
    return `${dcaLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [dcaLinePath, trajectoryPoints]);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const togglePlanStatus = (id: string) => {
    playClickSound();
    setActivePlans(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'active' ? 'paused' : 'active'
        };
      }
      return p;
    }));
  };

  // Backtest historical returns database
  const historicalBacktestData = {
    '3m': {
      periodLabel: '۳ ماه گذشته (فصل اخیر)',
      paxg: '+۱۸.۶٪',
      btc: '+۲۴.۲٪',
      eth: '+۱۵.۴٪',
      shirdal: '+۴۵.۰٪',
      cashRial: '-۱۱.۲٪',
      summary: 'خرید پله‌ای هفتگی در ۳ ماه اخیر ریسک اصلاحات ناگهانی بازار را به صفر رسانده و میانگین ورود را ۹.۳٪ بهینه‌تر از خرید یکجا کرده است.'
    },
    '6m': {
      periodLabel: '۶ ماه گذشته (نیمسال اخیر)',
      paxg: '+۵۴.۲٪',
      btc: '+۸۸.۴٪',
      eth: '+۶۲.۱٪',
      shirdal: '+۱۴۲.۵٪',
      cashRial: '-۲۳.۸٪',
      summary: 'اگر در ۶ ماه گذشته استراتژی خرید پله‌ای روزانه یا هفتگی PAXG یا بیت‌کوین را اجرا کرده بودید، کل تورم ریال را خنثی و سود دلاری خالص کسب می‌کردید.'
    },
    '1y': {
      periodLabel: '۱ سال گذشته (سال مالی اخیر)',
      paxg: '+۸۲.۵٪',
      btc: '+۱۶۸.۰٪',
      eth: '+۱۱۰.۴٪',
      shirdal: '+۲۸۵.۰٪',
      cashRial: '-۴۲.۰٪',
      summary: 'طی یک سال کامل، استراتژی میانگین کم کردن قیمت (DCA) روی طلا و رمزارز پایدار، بهترین محافظت تاریخ در برابر نوسانات ارزش ارز ملی بوده است.'
    }
  };

  const currentBacktest = historicalBacktestData[backtestPeriod];

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 text-right animate-fade-in ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      
      {/* Hero Banner with Griffi Financial Strategist Mascot */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl group bg-[#110d29]">
        <div className="relative h-60 sm:h-64 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-accountant.jpg" 
            alt="Griffi Wealth Strategist" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'استراتژی‌های ضدتورمی، خرید پله‌ای خودکار و سفارشات لیمیت' : 'Anti-Inflation DCA & Limit Terminal'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'خرید پله‌ای (DCA) و دفتر سفارشات هوشمند' : 'Dollar-Cost Averaging & Limit Orders'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'برنامه‌ریزی خودکار روزانه، هفتگی و ماهانه برای تبدیل ریال به طلای دیجیتال و رمزارز؛ حذف نوسانات هیجانی و حفظ پایدار قدرت خرید خانوار' 
                  : 'Automate systematic DCA plans and execute non-custodial limit orders directly on-chain.'}
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md self-start md:self-auto">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveMode('dca');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'dca'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'خرید پله‌ای (DCA)' : 'DCA Strategy'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveMode('limit');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'limit'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'دفتر سفارش محدود (Limit)' : 'Limit Order Book'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
        isDarkMode 
          ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
          : 'bg-white border-purple-200 text-slate-800 shadow-xl'
      }`}>

        {/* MODE 1: DCA Planner */}
        {activeMode === 'dca' && (
          <div className="space-y-6">

            {/* Sub-Tabs: Calculator & Simulator vs Active Plans */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setDcaSubTab('calculator');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dcaSubTab === 'calculator'
                      ? 'bg-purple-600/30 border border-purple-400/40 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isFa ? 'طراحی و شبیه‌ساز استراتژی DCA' : 'Strategy Simulator'}</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setDcaSubTab('active_plans');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    dcaSubTab === 'active_plans'
                      ? 'bg-purple-600/30 border border-purple-400/40 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isFa ? 'برنامه‌های فعال من' : 'My Active DCA Plans'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* Tehran Golden Gas Hour Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 text-[11px]">
                  {isFa ? 'بهترین ساعات اجرای کم‌کارمزد:' : 'Golden Gas Hours:'}
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  {isFa ? '۰۳:۰۰ الی ۰۷:۰۰ بامداد تهران (شبکه ارزان)' : '03:00 - 07:00 IRST (Eco Gas)'}
                </span>
              </div>
            </div>

            {/* TAB CONTENT: Strategy Calculator */}
            {dcaSubTab === 'calculator' && (
              <div className="space-y-6">

                {/* Frequency Selector Pills */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      {isFa ? 'دوره تناوب خرید پله‌ای (DCA Frequency):' : 'Select DCA Frequency:'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFa ? 'فواصل زمانی بین هر تراکنش خرید خودکار را مشخص کنید' : 'Intervals between automated recurring buys'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                    {[
                      { id: 'daily', label: 'روزانه (Daily)', hint: 'روزی ۲ تتر' },
                      { id: 'weekly', label: 'هفتگی (Weekly)', hint: 'هفته‌ای ۲۵ تتر' },
                      { id: 'monthly', label: 'ماهانه (Monthly)', hint: 'ماهی ۱۰۰ تتر' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleFrequencyChange(item.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                          frequency === item.id
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-1 ring-purple-300'
                            : 'bg-black/40 text-slate-400 hover:text-white border border-purple-500/20'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 3 Parameter Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Installment Amount Input */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                    <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
                      <span>
                        {frequency === 'daily' 
                          ? (isFa ? 'مبلغ خرید در هر روز (تومان):' : 'Daily Installment (Toman):')
                          : frequency === 'weekly'
                          ? (isFa ? 'مبلغ خرید در هر هفته (تومان):' : 'Weekly Installment (Toman):')
                          : (isFa ? 'مبلغ خرید در هر ماه (تومان):' : 'Monthly Installment (Toman):')
                        }
                      </span>
                      <span className="font-mono text-amber-400 text-[11px]">
                        ≈ {isFa ? `${toPersianDigits(Math.round(installmentToman / tomanRate))} $` : `$${Math.round(installmentToman / tomanRate)}`}
                      </span>
                    </label>
                    <input 
                      type="number"
                      step={frequency === 'daily' ? '50000' : '500000'}
                      value={installmentToman}
                      onChange={(e) => setInstallmentToman(Math.max(50000, Number(e.target.value) || 0))}
                      className="w-full bg-purple-900/40 border border-purple-500/30 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    />
                    
                    {/* Quick Presets tailored to frequency */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                      {(frequency === 'daily' 
                        ? [100000, 200000, 500000, 1000000]
                        : frequency === 'weekly'
                        ? [1000000, 2500000, 5000000, 10000000]
                        : [2000000, 5000000, 10000000, 25000000]
                      ).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            playClickSound();
                            setInstallmentToman(preset);
                          }}
                          className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            installmentToman === preset 
                              ? 'bg-amber-400 text-slate-950 shadow' 
                              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
                          }`}
                        >
                          {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Asset Selection */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      {isFa ? 'دارایی هدف برای خرید پله‌ای:' : 'Target Asset for DCA:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { symbol: 'PAXG', name: 'طلا PAXG' },
                        { symbol: 'USDT', name: 'تتر دلار' },
                        { symbol: 'ETH', name: 'اتریوم' },
                        { symbol: 'BTC', name: 'بیت‌کوین' },
                        { symbol: 'SHIRDAL', name: 'شیردال DEX' },
                      ] as const).map(asset => (
                        <button
                          key={asset.symbol}
                          onClick={() => {
                            playClickSound();
                            setSelectedAsset(asset.symbol as any);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                            selectedAsset === asset.symbol
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-purple-400'
                              : 'bg-black/30 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-mono text-xs">{asset.symbol}</span>
                          <span className="text-[10px] opacity-75">{asset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Horizon Duration */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      {isFa ? 'افق زمانی پس‌انداز:' : 'Time Horizon:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[6, 12, 24].map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            playClickSound();
                            setDurationMonths(m);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            durationMonths === m
                              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                              : 'bg-black/30 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isFa ? `${toPersianDigits(m)} ماهه` : `${m} Months`}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/20 text-[10px] text-purple-200">
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-300">
                        <Sparkles className="w-3 h-3" />
                        <span>{isFa ? 'تعداد کل سفارشات:' : 'Total Executions:'}</span>
                      </div>
                      <span className="font-mono font-bold text-white text-xs">
                        {isFa ? `${toPersianDigits(totalExecutions)} تراکنش پله‌ای` : `${totalExecutions} Recurring Orders`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Results Comparison Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-amber-950/40 border border-purple-500/30">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>
                        {isFa 
                          ? `پیش‌بینی عملکرد دارایی ${selectedAsset} در برابر تورم و افت ارزش ریال:` 
                          : `Projected Performance of ${selectedAsset} vs Fiat Inflation:`}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-purple-300">
                      {frequency === 'daily' ? '۳۰ تراکنش/ماه' : frequency === 'weekly' ? '۴ تراکنش/ماه' : '۱ تراکنش/ماه'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {isFa ? 'کل سرمایه ریالی پس‌اندازشده:' : 'Total Invested:'}
                      </span>
                      <span className="text-base font-black font-mono text-slate-200">
                        {isFa ? `${toPersianDigits(formatToman(totalInvestedToman, false))} تومان` : `${formatToman(totalInvestedToman, false)} T`}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                        ≈ ${(totalInvestedToman / tomanRate).toFixed(0)} USD ({totalExecutions} قسط)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {isFa ? `ارزش آتی پورتفولیو با ${selectedAsset}:` : `Estimated Value in ${selectedAsset}:`}
                      </span>
                      <span className="text-base font-black font-mono text-amber-400">
                        {isFa ? `${toPersianDigits(formatToman(projectedFutureToman, false))} تومان` : `${formatToman(projectedFutureToman, false)} T`}
                      </span>
                      <span className="text-[10px] text-amber-500/80 block mt-0.5 font-mono">
                        ≈ ${(projectedFutureToman / tomanRate).toFixed(0)} USD
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[11px] text-emerald-300 block mb-1 font-bold">
                        {isFa ? 'سود حفظ ارزش ریال و رشد دارایی:' : 'Net Inflation Protection:'}
                      </span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        +{isFa ? `${toPersianDigits(formatToman(profitToman, false))} تومان` : `${formatToman(profitToman, false)} T`}
                      </span>
                      <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                        (+{Math.round(growthRate * 100)}% بازدهی نسبت به ریال)
                      </span>
                    </div>
                  </div>

                  {/* Visual Inflation vs DCA Curve */}
                  <div className="mt-6 pt-5 border-t border-purple-500/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-xs">
                      <span className="font-bold text-slate-200">
                        {isFa ? 'منحنی مقایسه قدرت خرید (DCA در برابر نگهداری ریال):' : 'Purchasing Power Trajectory:'}
                      </span>
                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          {isFa ? `پورتفولیو ${selectedAsset}` : `${selectedAsset} Portfolio`}
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <span className="w-2.5 h-0.5 bg-rose-400 border-b border-dashed" />
                          {isFa ? 'نگهداری ریال (تورم ۴۲٪)' : 'Cash Rial (Inflation)'}
                        </span>
                      </div>
                    </div>

                    <div className="relative w-full h-[140px] bg-black/40 rounded-xl border border-purple-500/20 overflow-hidden">
                      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="dcaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* DCA Area & Line */}
                        <path d={dcaAreaPath} fill="url(#dcaGradient)" />
                        <path d={dcaLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Cash Erosion Line */}
                        <path d={cashLinePath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />

                        {/* Points on DCA Curve */}
                        {trajectoryPoints.map((pt, i) => (
                          <circle
                            key={`pt-${i}`}
                            cx={getDcaX(i)}
                            cy={getDcaY(pt.dcaVal)}
                            r="3.5"
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* 1-Click Action to Start DCA Plan in Swap */}
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-900/30 p-3.5 rounded-xl border border-purple-500/25">
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">
                        {isFa 
                          ? `آماده شروع اولین قسط ${frequency === 'daily' ? 'روزانه' : frequency === 'weekly' ? 'هفتگی' : 'ماهانه'} با ${selectedAsset} هستید؟` 
                          : `Ready to execute first installment of ${selectedAsset}?`}
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {isFa 
                          ? `مبلغ ${(installmentToman / tomanRate).toFixed(1)} تتر برای قسط اول به صورت خودکار در سواپ آماده اجرا می‌شود.` 
                          : `Pre-fills ${(installmentToman / tomanRate).toFixed(1)} USDT for the first installment in Swap.`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSwapStartSound();
                        if (onInitiateSwap) {
                          onInitiateSwap('USDT', selectedAsset, (installmentToman / tomanRate).toFixed(1));
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isFa ? 'شروع قسط اول در سواپ ⚡' : 'Start Installment in Swap ⚡'}</span>
                    </button>
                  </div>
                </div>

                {/* Historical Backtest Section */}
                <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {isFa ? 'تست تاریخی استراتژی (Backtest Performance):' : 'Historical Strategy Backtest:'}
                      </span>
                    </div>

                    {/* Timeframe selector */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/20">
                      {(['3m', '6m', '1y'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            playClickSound();
                            setBacktestPeriod(p);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            backtestPeriod === p
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {p === '3m' ? (isFa ? '۳ ماه اخیر' : '3M') : p === '6m' ? (isFa ? '۶ ماه اخیر' : '6M') : (isFa ? '۱ سال اخیر' : '1Y')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Backtest Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">طلا PAXG</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{currentBacktest.paxg}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">ضد تورم طلایی</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">بیت‌کوین BTC</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{currentBacktest.btc}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">پادشاه کریپتو</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">اتریوم ETH</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{currentBacktest.eth}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">سوخت قراردادها</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">شیردال DEX</span>
                      <span className="text-sm font-black font-mono text-amber-400">{currentBacktest.shirdal}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">اکوسیستم بومی</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-rose-300 block mb-1">ریال در بانک</span>
                      <span className="text-sm font-black font-mono text-rose-400">{currentBacktest.cashRial}</span>
                      <span className="text-[9px] text-rose-400/80 block mt-0.5">کاهش ارزش خرید</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-purple-900/20 p-2.5 rounded-xl border border-purple-500/15">
                    💡 <span className="font-bold">{currentBacktest.periodLabel}:</span> {currentBacktest.summary}
                  </p>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Active DCA Plans */}
            {dcaSubTab === 'active_plans' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{isFa ? 'برنامه‌های فعال خرید پله‌ای شما:' : 'Your Active DCA Automated Plans:'}</span>
                  </h4>
                  <span className="text-xs font-mono text-purple-300">
                    {activePlans.length} {isFa ? 'استراتژی در حال اجرا' : 'Active Strategies'}
                  </span>
                </div>

                <div className="space-y-3">
                  {activePlans.map(plan => {
                    const progressPercent = Math.round((plan.completedOrders / plan.totalOrders) * 100);
                    return (
                      <div 
                        key={plan.id}
                        className="p-4 rounded-2xl bg-black/40 border border-purple-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-purple-400/40"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{plan.assetName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 text-[10px] font-mono">
                              {plan.frequency === 'daily' ? 'روزانه' : plan.frequency === 'weekly' ? 'هفتگی' : 'ماهانه'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              plan.status === 'active' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              {plan.status === 'active' ? 'در حال اجرا' : 'متوقف موقت'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                            <span>
                              {isFa ? 'مبلغ هر تراکنش:' : 'Per installment:'}{' '}
                              <strong className="text-amber-400 font-mono">
                                {isFa ? `${toPersianDigits(formatToman(plan.installmentToman, false))} تومان` : `${formatToman(plan.installmentToman, false)} T`}
                              </strong>
                            </span>
                            <span>
                              {isFa ? 'میانگین خرید:' : 'Avg Buy:'}{' '}
                              <strong className="text-purple-300 font-mono">${plan.avgBuyPriceUsd.toLocaleString()}</strong>
                            </span>
                            <span>
                              {isFa ? 'سود تحقق‌نیافته:' : 'Unrealized PnL:'}{' '}
                              <strong className="text-emerald-400 font-mono">+{plan.currentProfitPercent}%</strong>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full max-w-md pt-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>پیشرفت: {toPersianDigits(plan.completedOrders)} از {toPersianDigits(plan.totalOrders)} تراکنش</span>
                              <span className="font-mono">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400 block pt-0.5">
                            ⏰ {isFa ? 'نوبت اجرای بعدی:' : 'Next execution:'} {plan.nextExecutionDate}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => togglePlanStatus(plan.id)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              plan.status === 'active'
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {plan.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{plan.status === 'active' ? (isFa ? 'توقف موقت' : 'Pause') : (isFa ? 'ادامه اجرا' : 'Resume')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verified Protocol Treasury Fee Guarantee */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-right">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {isFa 
                    ? 'کارمزد پروتکل در تمام سفارشات DCA و لیمیت (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
                    : 'All protocol commissions (0.5%) route directly to verified treasury:'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">
                  {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
                </code>
                <button
                  onClick={handleCopyWallet}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
                  title="کپی آدرس خزانه"
                >
                  {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="مشاهده در ایترسکن"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: Limit Orders */}
        {activeMode === 'limit' && (
          <div className="animate-fade-in">
            <LimitOrderBook
              tomanRate={tomanRate}
              lang={lang}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

      </div>
    </div>
  );
};
