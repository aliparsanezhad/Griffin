import React, { useState } from 'react';
import { 
  GitFork, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Fuel, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Info,
  Play,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { LIFI_CONFIG } from '../services/lifiService';
import { playClickSound, playSwapStartSound, playSwapSuccessSound } from '../services/soundService';
import { SmartRouterVisualizer } from './SmartRouterVisualizer';

interface RouteOption {
  id: string;
  name: string;
  tagline: string;
  taglineFa: string;
  badge: string;
  badgeFa: string;
  badgeColor: string;
  timeSeconds: number;
  timeTextFa: string;
  gasUsd: number;
  securityScore: number; // out of 10
  securityDescFa: string;
  dexSteps: string[];
  dexStepsFa: string[];
  bridgeMechanism: string;
  bridgeMechanismFa: string;
  geoblockRisk: string;
  geoblockRiskFa: string;
  auditor: string;
}

interface RouteInspectorProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

export const RouteInspector: React.FC<RouteInspectorProps> = ({
  tomanRate,
  lang,
  isDarkMode,
}) => {
  const isFa = lang === 'fa';
  const commissionWallet = LIFI_CONFIG.feeRecipient;

  const [selectedRouteId, setSelectedRouteId] = useState<string>('across');
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [inspectorMode, setInspectorMode] = useState<'router' | 'bridges'>('router');

  // Simulation state
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simComplete, setSimComplete] = useState<boolean>(false);

  const samplePairs = [
    {
      name: 'USDT (Arbitrum) ➔ WETH (Base)',
      fromChain: 'Arbitrum One',
      fromToken: 'USDT',
      toChain: 'Base',
      toToken: 'WETH',
      amountUsd: 500,
    },
    {
      name: 'USDT (Tron/L1) ➔ USDT (Arbitrum)',
      fromChain: 'Ethereum / TRC20',
      fromToken: 'USDT',
      toChain: 'Arbitrum',
      toToken: 'USDT',
      amountUsd: 1000,
    },
    {
      name: 'POL (Polygon) ➔ USDC (Optimism)',
      fromChain: 'Polygon',
      fromToken: 'POL',
      toChain: 'Optimism',
      toToken: 'USDC',
      amountUsd: 250,
    },
    {
      name: 'WBTC (Arbitrum) ➔ WBTC (Base)',
      fromChain: 'Arbitrum',
      fromToken: 'WBTC',
      toChain: 'Base',
      toToken: 'WBTC',
      amountUsd: 2500,
    },
  ];

  const currentPair = samplePairs[selectedPairIndex];

  const routes: RouteOption[] = [
    {
      id: 'across',
      name: 'Across Protocol V3',
      tagline: 'Intent-based Fast Relayers',
      taglineFa: 'معماری مدرن اینتنت و ریلایرهای غیرمتمرکز',
      badge: 'Fastest (۱۴ ثانیه)',
      badgeFa: 'سریع‌ترین (۱۴ ثانیه)',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      timeSeconds: 14,
      timeTextFa: '۱۴ ثانیه',
      gasUsd: 0.02,
      securityScore: 9.9,
      securityDescFa: 'تأیید خوش‌بینانه و پوشش ریسک ۱۰۰٪ ریلایرها',
      dexSteps: ['Arbitrum Deposit', 'Across Intent Pool', 'Base Settlement'],
      dexStepsFa: ['واریز در آربیتروم', 'ریلایر اینتنت Across', 'دریافت آنی در Base'],
      bridgeMechanism: 'Optimistic Intent Settlement',
      bridgeMechanismFa: 'حل تسویه مبتنی بر اینتنت خوش‌بینانه',
      geoblockRisk: '0% (DeFi permissionless)',
      geoblockRiskFa: '۰٪ (کاملاً ضدتحریم و بدون بلاک آی‌پی)',
      auditor: 'ConsenSys Diligence & OpenZeppelin',
    },
    {
      id: 'stargate',
      name: 'Stargate V2 (LayerZero)',
      tagline: 'Omnichain OFT Deep Liquidity',
      taglineFa: 'نقدینگی عمیق امنی‌چین با فناوری لیرزیرو',
      badge: 'Deepest Liquidity',
      badgeFa: 'بیشترین عمق نقدینگی',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      timeSeconds: 45,
      timeTextFa: '۴۵ ثانیه',
      gasUsd: 0.04,
      securityScore: 9.8,
      securityDescFa: 'شبکه اعتبارسنج‌های توزیع‌شده DVN لیرزیرو',
      dexSteps: ['Camelot Swap (Arb)', 'LayerZero DVN Bridge', 'Aerodrome Swap (Base)'],
      dexStepsFa: ['سواپ اولیه Camelot', 'پل DVN لیرزیرو V2', 'سواپ ثانویه Aerodrome'],
      bridgeMechanism: 'Omnichain Fungible Token (OFT)',
      bridgeMechanismFa: 'توکن قابل‌انتقال یکپارچه چندزنجیره‌ای',
      geoblockRisk: '0% (Decentralized Verifiers)',
      geoblockRiskFa: '۰٪ (اعتبارسنج‌های توزیع‌شده ضدتحریم)',
      auditor: 'Zellic & OtterSec',
    },
    {
      id: 'lifi',
      name: 'LI.FI Super-Aggregator',
      tagline: 'Multi-DEX Smart Order Routing',
      taglineFa: 'مسیریاب هوشمند تجمیعی چندصرافی و چندپل',
      badge: 'Smart Optimal',
      badgeFa: 'بهینه‌ترین خروجی هوشمند',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      timeSeconds: 28,
      timeTextFa: '۲۸ ثانیه',
      gasUsd: 0.035,
      securityScore: 9.9,
      securityDescFa: 'تأییدیه قرارداد هوشمند تجمیع‌کننده با فیلتر آنتی‌MEV',
      dexSteps: ['1inch Split Route', 'Bridge Relayer API', 'Uniswap v3 Base'],
      dexStepsFa: ['تقسیم سفارش ۱inch', 'ریلایر بهینه میان‌زنجیره‌ای', 'سواپ یونی‌سواپ نسخه ۳'],
      bridgeMechanism: 'Multi-Bridge Aggregator with Failover',
      bridgeMechanismFa: 'تجمیع خودکار چند پل با سوئیچ اضطراری',
      geoblockRisk: '0% (Censorship-Resistant Proxy)',
      geoblockRiskFa: '۰٪ (پروکسی غیرمتمرکز بدون ردگیری IP)',
      auditor: 'Code4rena & MixBytes',
    },
    {
      id: 'hop',
      name: 'Hop Protocol & Celer',
      tagline: 'Canonical Token Bridge',
      taglineFa: 'پل وثیقه‌محور توکن‌های کانونیکال',
      badge: 'High Privacy',
      badgeFa: 'حفظ حداکثری حریم خصوصی',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      timeSeconds: 160,
      timeTextFa: '۲ دقیقه و ۴۰ ثانیه',
      gasUsd: 0.065,
      securityScore: 9.5,
      securityDescFa: 'اثبات زنجیره‌ای کانونیکال بدون نود متمرکز',
      dexSteps: ['Arb Token Lock', 'Bonder Liquidity Vault', 'Base Mint/Release'],
      dexStepsFa: ['قفل در والت مبدا', 'استخر نقدینگی باندر', 'آزادسازی در مقصد'],
      bridgeMechanism: 'Automated Market Maker Bonder Bridge',
      bridgeMechanismFa: 'سیستم وثیقه‌گذاری نقدینگی اتوماتیک',
      geoblockRisk: '0% (Trustless)',
      geoblockRiskFa: '۰٪ (تراکنش مستقیم آنچین)',
      auditor: 'Solidified',
    },
  ];

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const gasToman = usdToToman(selectedRoute.gasUsd, tomanRate);

  // Comparison with Centralized Iranian Exchange CEX withdrawal fee
  const cexWithdrawalUsd = 1.5; // typical TRC20/ERC20 fee on Nobitex / TetherLand
  const cexWithdrawalToman = usdToToman(cexWithdrawalUsd, tomanRate);
  const userSavingsToman = cexWithdrawalToman - gasToman;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(commissionWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startSimulation = () => {
    playSwapStartSound();
    setSimulating(true);
    setSimComplete(false);
    setSimStep(1);

    const stepTimer = (step: number, delay: number, next: () => void) => {
      setTimeout(() => {
        setSimStep(step);
        playClickSound();
        next();
      }, delay);
    };

    stepTimer(2, 900, () => {
      stepTimer(3, 1100, () => {
        stepTimer(4, 1200, () => {
          stepTimer(5, 1000, () => {
            setSimulating(false);
            setSimComplete(true);
            playSwapSuccessSound();
          });
        });
      });
    });
  };

  const resetSimulation = () => {
    playClickSound();
    setSimulating(false);
    setSimStep(0);
    setSimComplete(false);
  };

  return (
    <div className={`w-full py-6 px-4 max-w-6xl mx-auto animate-fade-in text-right ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Header Banner with Mascot Navigator */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl mb-8 group bg-[#110d29]">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-navigator.jpg" 
            alt="Griffi Bridge Navigator" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <GitFork className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'موتور تحلیل و بازرسی هوشمند مسیرهای بریج' : 'Cross-Chain Multi-Hop Route Inspector'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'دیدبان چندمسیره و پل‌های بین‌زنجیره‌ای' : 'Cross-Chain Routing Radar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'بررسی شفاف کارمزد گس به تومان، سرعت انتقال، امنیت قراردادهای هوشمند و مقاومت در برابر تحریم در ۳۵ پل تجمیعی'
                  : 'Inspect gas fees in Tomans, execution speed, smart contract audits, and censorship resistance across 35 aggregated bridges.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end">
              <span className="text-[11px] text-amber-300 bg-black/40 px-3 py-1.5 rounded-xl border border-purple-500/20 backdrop-blur-md font-mono">
                {currentPair.name} (${currentPair.amountUsd})
              </span>
              <span className="text-[11px] text-slate-300 bg-black/40 px-3 py-1.5 rounded-xl border border-purple-500/20 backdrop-blur-md">
                {isFa ? 'کارمزد شفاف پروتکل: ۰.۵٪' : 'Protocol Fee: 0.5%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher: Smart Multi-Hop Router vs Bridges Radar */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-2xl bg-purple-950/50 border border-purple-500/30">
          <button
            onClick={() => {
              playClickSound();
              setInspectorMode('router');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              inspectorMode === 'router'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? 'مسیریاب چنداستخری هوشمند گریفین' : 'Griffin Smart Router'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setInspectorMode('bridges');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              inspectorMode === 'bridges'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>{isFa ? 'دیدبان پل‌های بین‌زنجیره‌ای' : 'Cross-Chain Bridges Radar'}</span>
          </button>
        </div>
      </div>

      {inspectorMode === 'router' ? (
        <SmartRouterVisualizer
          tomanRate={tomanRate}
          lang={lang}
          isDarkMode={isDarkMode}
        />
      ) : (
        <>
          {/* Preset Pairs Selector Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'انتخاب مسیر تبادل پرکاربرد:' : 'Select Route Pair:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {samplePairs.map((pair, idx) => (
            <button
              key={pair.name}
              onClick={() => {
                playClickSound();
                setSelectedPairIndex(idx);
                resetSimulation();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPairIndex === idx
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-purple-900/30 text-slate-400 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              {pair.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparative Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Route Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'مسیرهای در دسترس و رتبه‌بندی شده:' : 'Available Ranked Routes:'}</span>
            </h2>
            <span className="text-xs text-slate-400">
              {isFa ? 'بروزرسانی زنده پروتکل‌ها' : 'Live bridge feeds'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const rGasToman = usdToToman(route.gasUsd, tomanRate);

              return (
                <div
                  key={route.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedRouteId(route.id);
                    resetSimulation();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-900/50 via-[#1a113d] to-indigo-950/60 border-purple-400 ring-2 ring-purple-500/50 shadow-xl shadow-purple-900/30'
                      : 'glass-panel border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-950/30'
                  }`}
                >
                  <div>
                    {/* Header: Name and Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-white text-sm">
                        {route.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${route.badgeColor}`}>
                        {isFa ? route.badgeFa : route.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {isFa ? route.taglineFa : route.tagline}
                    </p>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/30 border border-purple-500/15 mb-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'سرعت تخمینی:' : 'Est. Speed:'}</span>
                        <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isFa ? route.timeTextFa : `${route.timeSeconds}s`}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'گس شبکه:' : 'Gas Fee:'}</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                          <span>${route.gasUsd.toFixed(3)}</span>
                          <span className="text-[10px] text-slate-300">({toPersianDigits(formatToman(rGasToman))} ت)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Rating Bar */}
                  <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isFa ? 'امتیاز امنیت:' : 'Security:'}</span>
                    </span>
                    <span className="font-black text-amber-400 font-mono">
                      {route.securityScore} / ۱۰
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Savings Callout compared to Iranian Centralized Exchange */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-purple-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {isFa ? 'صرفه‌جویی چشمگیر در مقایسه با صرافی‌های داخلی (نوبیتکس / تترلند)' : 'Massive Savings vs Local CEX'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {isFa 
                    ? `کارمزد برداشت تتر در صرافی‌های داخلی حدود ۱.۵ دلار (≈ ${toPersianDigits(formatToman(cexWithdrawalToman))} تومان) است. در گریفین‌سواپ تنها ${toPersianDigits(formatToman(gasToman))} تومان کارمزد می‌پردازید!`
                    : `Typical CEX withdrawal costs ~$1.5. On GriffinSwap L2 bridge you pay only ~$${selectedRoute.gasUsd}!`}
                </p>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-[10px] text-emerald-300 block">{isFa ? 'سود شما در هر تراکنش:' : 'Your Net Savings:'}</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {isFa ? `+${toPersianDigits(formatToman(userSavingsToman))} تومان` : `+$${(cexWithdrawalUsd - selectedRoute.gasUsd).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Detailed Route Inspector & Simulator */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-purple-400" />
                <span>{isFa ? 'تحلیل فنی مسیر انتخابی' : 'Selected Route Specs'}</span>
              </h3>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg">
                {selectedRoute.name}
              </span>
            </div>

            {/* Visual Multi-Hop Diagram */}
            <div className="space-y-3 mb-5">
              <span className="text-[11px] font-bold text-slate-400 block">
                {isFa ? 'مراحل عبور تراکنش (Hops):' : 'Transaction Steps (Hops):'}
              </span>

              <div className="space-y-2">
                {selectedRoute.dexStepsFa.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      {sIdx + 1}
                    </span>
                    <span className="flex-1 font-medium">{step}</span>
                    {sIdx < selectedRoute.dexStepsFa.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 rotate-180" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Censorship & Audit Specs */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-xs mb-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isFa ? 'مقاومت در برابر تحریم (OFAC):' : 'Geoblock Resistance:'}</span>
                <span className="text-emerald-400 font-bold">{isFa ? selectedRoute.geoblockRiskFa : selectedRoute.geoblockRisk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isFa ? 'حسابرسی امنیتی (Auditor):' : 'Audit Firm:'}</span>
                <span className="text-slate-200 font-mono text-[11px]">{selectedRoute.auditor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isFa ? 'مکانیسم اعتبارسنجی:' : 'Mechanism:'}</span>
                <span className="text-purple-300 font-medium text-[11px]">{isFa ? selectedRoute.bridgeMechanismFa : selectedRoute.bridgeMechanism}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-purple-500/15">
                <span className="text-slate-400">{isFa ? 'کارمزد خزانه پروتکل:' : 'Integrator Fee:'}</span>
                <span className="text-amber-400 font-bold">0.5% ({isFa ? 'بدون کارمزد پنهان' : '0 Hidden Spread'})</span>
              </div>
            </div>

            {/* Simulation Area */}
            <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'شبیه‌سازی اجرای مسیر با گریفی' : 'Route Execution Simulator'}</span>
                </span>
                {simComplete && (
                  <button 
                    onClick={resetSimulation}
                    className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title={isFa ? 'شروع مجدد' : 'Reset'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {simulating ? (
                <div className="space-y-2 animate-fade-in py-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-300 font-semibold">
                      {simStep === 1 && (isFa ? '۱. امضای تراکنش در ولت کاربر...' : '1. Signing wallet request...')}
                      {simStep === 2 && (isFa ? '۲. تایید مجوز مبادله رمزارز در مبدا...' : '2. Approving token in source chain...')}
                      {simStep === 3 && (isFa ? '۳. ارسال به ریلایرهای بین‌زنجیره‌ای...' : '3. Broadcasting to bridge relayers...')}
                      {simStep === 4 && (isFa ? '۴. اعتبارسنجی پروتکل و آزادسازی توکن...' : '4. Validating cross-chain proof...')}
                      {simStep === 5 && (isFa ? '۵. واریز امن به کیف‌پول کاربر...' : '5. Depositing to destination wallet...')}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{simStep * 20}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-purple-950 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500" 
                      style={{ width: `${simStep * 20}%` }}
                    />
                  </div>
                </div>
              ) : simComplete ? (
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="leading-tight">
                    {isFa 
                      ? 'شبیه‌سازی موفق! تمام مراحل با کمترین اسلیپیج و کارمزد انجام شد.' 
                      : 'Simulation successful! Hops completed with 0 slippage.'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={startSimulation}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isFa ? 'تست و اجرای شبیه‌سازی' : 'Run Simulation'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Treasury Commission Verification Card */}
          <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-xs text-slate-300">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-slate-400">{isFa ? 'واریز کارمزد پروتکل به آدرس خزانه:' : 'Treasury Commission Wallet:'}</span>
              <button
                onClick={handleCopyWallet}
                className="text-amber-400 hover:underline flex items-center gap-1"
                title={commissionWallet}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="font-mono text-[10px]">0xD9C1...A2D3</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              {isFa 
                ? 'تمام کارمزدهای ۰.۵٪ به صورت اتوماتیک و شفاف در قرارداد هوشمند به این آدرس واریز می‌گردد.'
                : 'All 0.5% fees are transparently routed to this address on-chain.'}
            </p>
          </div>
        </div>

      </div>

      {/* Guide Note Box for Iranian Users */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white text-xs">
            {isFa ? 'راهنمای گریفین برای انتخاب بهترین پل رمزارزی:' : 'Griffi’s Guide to Choosing the Best Bridge:'}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isFa 
              ? 'اگر سرعت برایتان اولویت دارد، پروتکل Across V3 را انتخاب نمایید که با معماری اینتنت زیر ۱۵ ثانیه عمل می‌کند. اگر مبالغ بالای ۱۰ هزار دلار مبادله می‌کنید، Stargate V2 به دلیل عمق نقدینگی استخرهای چندزنجیره‌ای اسلیپیج کمتری ارائه می‌دهد. در تمام مسیرها، IP کاربر از طریق نودهای غیرمتمرکز عبور داده می‌شود تا از هرگونه تحریم یا مسدودسازی جلوگیری شود.'
              : 'Choose Across V3 for speed under 15 seconds. Choose Stargate V2 for large volume swaps to avoid slippage. All routes are protected from IP geoblocks.'}
          </p>
        </div>
      </div>
    </>
  )}
</div>
  );
};
