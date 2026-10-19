import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
  Coins,
  Wallet,
  Flame
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export interface VaultItem {
  id: string;
  protocol: string;
  asset: string;
  chain: string;
  apy: string;
  tvl: string;
  risk: 'خیلی کم' | 'کم' | 'متوسط';
  riskEn: 'Very Low' | 'Low' | 'Medium';
  desc: string;
  badge?: string;
  isHalal?: boolean;
}

interface EarnSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onSelectVaultToDeposit: (vault: VaultItem) => void;
}

export const EarnSection: React.FC<EarnSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
  onSelectVaultToDeposit,
}) => {
  const isFa = lang === 'fa';
  const [earnSubTab, setEarnSubTab] = useState<'vaults' | 'my_deposits'>('vaults');
  const [filterAsset, setFilterAsset] = useState<'all' | 'usdt' | 'usdc' | 'eth' | 'paxg' | 'halal'>('all');
  const [calculatorDeposit, setCalculatorDeposit] = useState<number>(1000);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [claimedToast, setClaimedToast] = useState<string | null>(null);

  // Live ticking accrued yields for active deposits
  const [activeDeposits, setActiveDeposits] = useState([
    {
      id: 'dep-1',
      vaultName: 'صندوق طلای فیزیکی گریفین (PAXG)',
      asset: 'PAXG',
      principalAmount: 2.5,
      principalUsd: 6713.75,
      apy: 6.85,
      accruedYieldToken: 0.0342,
      stakedAt: '۱۴ روز پیش',
      isHalal: true
    },
    {
      id: 'dep-2',
      vaultName: 'استخر سهم کارمزد سواپ گریفین (USDT)',
      asset: 'USDT',
      principalAmount: 1500,
      principalUsd: 1500,
      apy: 11.40,
      accruedYieldToken: 24.15,
      stakedAt: '۲۱ روز پیش',
      isHalal: true
    }
  ]);

  // Live ticking interest simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDeposits(prev => prev.map(dep => ({
        ...dep,
        accruedYieldToken: dep.accruedYieldToken + (dep.principalAmount * (dep.apy / 100) / (365 * 86400)) * 2
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimYield = (id: string, asset: string, amount: number) => {
    playSwapSuccessSound();
    setActiveDeposits(prev => prev.map(dep => dep.id === id ? { ...dep, accruedYieldToken: 0.0001 } : dep));
    setClaimedToast(`سود ${amount.toFixed(4)} ${asset} با موفقیت به کیف‌پول شما واریز شد!`);
    setTimeout(() => setClaimedToast(null), 3500);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const vaults: VaultItem[] = [
    {
      id: "griffin-gold-paxg",
      protocol: "Griffin Gold Treasury",
      asset: "PAXG",
      chain: "Arbitrum One",
      apy: "6.85%",
      tvl: "$34.5M",
      risk: "خیلی کم",
      riskEn: "Very Low",
      desc: isFa 
        ? "سپرده‌گذاری طلای فیزیکی؛ سود پایدار بدون بهره و ۱۰۰٪ منطبق با مضاربه و شریعت اسلامی" 
        : "Physical gold vault; stable yield without interest, 100% Sharia compliant (Zero Riba)",
      badge: isFa ? "طلای حلال ☪️" : "Halal Gold ☪️",
      isHalal: true
    },
    {
      id: "griffin-usdt-amm",
      protocol: "Griffin AMM Fee Share",
      asset: "USDT",
      chain: "Arbitrum One",
      apy: "11.40%",
      tvl: "$58.2M",
      risk: "خیلی کم",
      riskEn: "Very Low",
      desc: isFa 
        ? "تقسیم مستقیم کارمزد سواپ صرافی میان تامین‌کنندگان نقدینگی بر پایه مشارکت مدنی بدون ربا" 
        : "Direct share of DEX swap commissions distributed to liquidity providers without interest",
      badge: isFa ? "سود حلال ☪️" : "Halal Yield ☪️",
      isHalal: true
    },
    {
      id: "morpho-usdc-base",
      protocol: "Morpho Blue",
      asset: "USDC",
      chain: "Base",
      apy: "8.42%",
      tvl: "$142M",
      risk: "کم",
      riskEn: "Low",
      desc: isFa 
        ? "صندوق نقدینگی استیبل‌کوین روی شبکه ارزان بیس با بازدهی بالا و قراردادهای اثبات‌شده" 
        : "Curated stablecoin yield vault on Base L2 with high security and low transaction gas",
      badge: isFa ? "پیشنهاد ویژه" : "Featured"
    },
    {
      id: "aave-usdt-arb",
      protocol: "Aave v3",
      asset: "USDT",
      chain: "Arbitrum One",
      apy: "7.15%",
      tvl: "$380M",
      risk: "خیلی کم",
      riskEn: "Very Low",
      desc: isFa 
        ? "استخر نقدینگی آوه روی آربیتروم با بیشترین نقدینگی و بالاترین درجه امنیت در دیفای" 
        : "Aave v3 deep liquidity market on Arbitrum with the highest battle-tested security",
      badge: isFa ? "امن‌ترین" : "Safest"
    },
    {
      id: "pendle-ezeth-arb",
      protocol: "Pendle Finance",
      asset: "ezETH",
      chain: "Arbitrum One",
      apy: "14.80%",
      tvl: "$95M",
      risk: "متوسط",
      riskEn: "Medium",
      desc: isFa 
        ? "خرید سود ثابت از بازسهام‌گذاری اتریوم (Restaking) با بالاترین نرخ بازدهی" 
        : "Fixed-yield tokenized market from liquid restaking with peak DeFi yields"
    },
    {
      id: "compound-usdc-poly",
      protocol: "Compound v3",
      asset: "USDC",
      chain: "Polygon",
      apy: "5.90%",
      tvl: "$65M",
      risk: "کم",
      riskEn: "Low",
      desc: isFa 
        ? "تامین نقدینگی در پروتکل کامپاند روی پالیگان با تراکنش‌های آنی و کارمزد کمتر از ۱ سنت" 
        : "Compound v3 liquidity supply on Polygon with sub-cent gas and instant settlement"
    }
  ];

  const filteredVaults = vaults.filter((v) => {
    if (filterAsset === 'all') return true;
    if (filterAsset === 'halal') return v.isHalal === true;
    return v.asset.toLowerCase().includes(filterAsset);
  });

  // Calculate annual & monthly return
  const avgApy = 0.0842;
  const yearlyUsdReturn = calculatorDeposit * avgApy;
  const yearlyTomanReturn = usdToToman(yearlyUsdReturn, tomanRate);
  const monthlyUsdReturn = yearlyUsdReturn / 12;
  const monthlyTomanReturn = yearlyTomanReturn / 12;

  const quickPresets = [250, 500, 1000, 2500, 5000, 10000];

  return (
    <div className="w-full py-6 px-4 max-w-6xl mx-auto animate-fade-in text-right">
      
      {/* 3D Mascot Hero Banner: Griffi Yield Guardian */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 mb-8 transition-all ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1c1236] via-[#140c2a] to-[#0c081a] border-purple-500/30 shadow-2xl' 
          : 'bg-gradient-to-br from-purple-100 via-indigo-50 to-amber-50 border-purple-200 shadow-xl'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Pitch & Guidance */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'سود دلاری پایدار بدون ربا (Islamic DeFi)' : 'Zero-Riba Halal DeFi Vaults'}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black griffin-gradient-text">
              {isFa ? 'خزانه‌های سود دیفای و استیکینگ گریفی' : 'Griffin DeFi Staking & Yield Vaults'}
            </h1>

            <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {isFa
                ? 'دارایی‌های تتر، طلا (PAXG) و اتریوم خود را در معتبرترین استخرهای دیفای با قراردادهای ممیزی‌شده سپرده‌گذاری کنید. سود پرداختی از محل کارمزدهای واقعی سواپ صرافی (AMM Fee Share) تامین شده و ۱۰۰٪ منطبق بر موازین عدم ربا و مشارکت مدنی است.'
                : 'Deposit stablecoins, digital gold, and bluechips into audited non-custodial vaults with 1-click execution. Yields originate strictly from real AMM swap volume.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'استخرهای بدون تحریم و بدون KYC' : '100% Non-Custodial & KYC-Free'}</span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'bg-purple-950/40 border-purple-500/30 text-purple-200' : 'bg-white border-purple-200 text-purple-700'
              }`}>
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'میانگین سود سالانه: ۸.۴٪ تا ۱۴.۸٪' : 'Average APY: 8.4% - 14.8%'}</span>
              </div>
            </div>
          </div>

          {/* 3D Mascot Image: Griffi DeFi Vault Guardian */}
          <div className="relative shrink-0 w-44 h-44 md:w-56 md:h-56 rounded-3xl overflow-hidden ring-2 ring-amber-400/50 shadow-2xl shadow-purple-600/30">
            <img 
              src="/mascot/griffi-vault.jpg" 
              alt="Griffi DeFi Vault Guardian" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 inset-x-2 text-center text-[10px] font-bold text-amber-300 bg-purple-950/80 backdrop-blur-md py-1 rounded-xl border border-amber-400/30">
              {isFa ? 'گریفی نگهبان خزانه‌های سودآور 💎✨' : 'Griffi the Yield Steward 💎✨'}
            </div>
          </div>

        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              playClickSound();
              setEarnSubTab('vaults');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              earnSubTab === 'vaults'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{isFa ? 'صندوق‌های سودآور دیفای' : 'Explore Vaults'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setEarnSubTab('my_deposits');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
              earnSubTab === 'my_deposits'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? 'سپرده‌های فعال من' : 'My Staked Vaults'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/25">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? 'سود ثانیه‌ای در حال تجمیع است (Live Yield)' : 'Accruing Live Yield'}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {claimedToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fade-in shadow-2xl">
          <span className="font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{claimedToast}</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">تسویه غیرحضانتی ولت</span>
        </div>
      )}

      {/* VIEW 1: MY ACTIVE DEPOSITS */}
      {earnSubTab === 'my_deposits' && (
        <div className="space-y-4 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeDeposits.map((dep) => {
              const yieldToman = usdToToman(dep.accruedYieldToken * (dep.asset === 'PAXG' ? 2685.5 : 1), tomanRate);
              const principalToman = usdToToman(dep.principalUsd, tomanRate);

              return (
                <div
                  key={dep.id}
                  className="p-6 rounded-3xl border border-purple-500/30 bg-purple-950/40 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-base">{dep.vaultName}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {dep.apy}% APY
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">اصل سپرده:</span>
                        <span className="text-white font-bold">{dep.principalAmount} {dep.asset}</span>
                        <span className="text-[10px] text-slate-500 block">≈ {toPersianDigits(formatToman(principalToman, false))} ت</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">سود زنده تجمیع‌شده:</span>
                        <span className="text-emerald-400 font-black text-sm">+{dep.accruedYieldToken.toFixed(5)} {dep.asset}</span>
                        <span className="text-[10px] text-emerald-500 block">≈ +{toPersianDigits(formatToman(yieldToman, false))} ت</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleClaimYield(dep.id, dep.asset, dep.accruedYieldToken)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                    >
                      {isFa ? 'برداشت سود تجمیع‌شده (Claim)' : 'Claim Yield'}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        alert(isFa ? 'درخواست برداشت اصل سپرده ثبت شد و ظرف ۲ ساعت به ولت شما واریز می‌گردد.' : 'Unstake request initiated.');
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isFa ? 'خروج از استخر' : 'Unstake'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: EXPLORE VAULTS & CALCULATOR */}
      {earnSubTab === 'vaults' && (
        <>
          {/* Interactive Yield Calculator Banner */}
          <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl mb-8 relative overflow-hidden transition-all ${
            isDarkMode 
              ? 'cyber-gradient-card border-purple-500/35 neon-glow-purple' 
              : 'glass-panel-light border-purple-200'
          }`}>
            {/* Top Laser Accent Line */}
            <div className="laser-line -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-7 space-y-4">
            <div>
              <h3 className={`font-black text-lg md:text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Percent className="w-5 h-5 text-amber-400" />
                <span>{isFa ? 'ماشین‌حساب زنده سود دلاری و تومانی سپرده‌گذاری' : 'Live Yield & Toman Profit Calculator'}</span>
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {isFa
                  ? 'سرمایه مورد نظر خود را وارد کنید تا درآمد ماهیانه و سالانه شما بر اساس میانگین سود واقعی خزانه‌ها محاسبه شود.'
                  : 'Enter deposit amount to simulate expected monthly and annual earnings in USD and Toman.'}
              </p>
            </div>

            {/* Amount input & Toman preview */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={calculatorDeposit || ''}
                  onChange={(e) => setCalculatorDeposit(Math.max(0, Number(e.target.value)))}
                  className={`w-full rounded-2xl px-4 py-3 text-base font-black font-mono border focus:outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-purple-950/60 border-purple-500/30 text-white focus:border-amber-400' 
                      : 'bg-white border-purple-200 text-slate-900 focus:border-purple-500'
                  }`}
                  placeholder="1000"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 font-mono">
                  USDT
                </span>
              </div>

              <div className={`px-4 py-3 rounded-2xl border text-xs font-mono font-bold flex items-center justify-between sm:justify-start gap-2 ${
                isDarkMode ? 'bg-purple-950/40 border-purple-500/20 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'
              }`}>
                <span className="text-[11px] text-slate-400">{isFa ? 'ارزش معادل:' : 'Value:'}</span>
                <span className="text-amber-400 font-bold">
                  ≈ {isFa ? `${toPersianDigits(formatToman(usdToToman(calculatorDeposit, tomanRate)))} تومان` : `${formatToman(usdToToman(calculatorDeposit, tomanRate), false)} Toman`}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium ml-1">{isFa ? 'مقادیر سریع:' : 'Presets:'}</span>
              {quickPresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCalculatorDeposit(amt);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 ${
                    calculatorDeposit === amt
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : isDarkMode
                        ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300'
                        : 'bg-white hover:bg-purple-50 border-purple-200 text-slate-700'
                  }`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Profit Output Highlight Card */}
          <div className={`md:col-span-5 p-6 rounded-3xl border text-center space-y-3 shadow-inner ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-950/80 via-indigo-950/70 to-purple-950/90 border-purple-500/30' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
          }`}>
            <div>
              <span className="text-xs text-purple-300 font-bold block mb-1">
                {isFa ? 'تخمین سود سالانه (میانگین ۸.۴٪ APY):' : 'Estimated Annual Profit:'}
              </span>
              <div className="text-3xl lg:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                +${yearlyUsdReturn.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                + {isFa ? `${toPersianDigits(formatToman(yearlyTomanReturn))} تومان سود خالص` : `${formatToman(yearlyTomanReturn, false)} Toman`}
              </div>
            </div>

            <div className="pt-3 border-t border-purple-500/20 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">{isFa ? 'سود تخمینی ماهیانه:' : 'Monthly Yield:'}</span>
              <span className="font-bold text-purple-200">
                +${monthlyUsdReturn.toFixed(1)} (≈ {isFa ? `${toPersianDigits(formatToman(monthlyTomanReturn))} ت` : `${formatToman(monthlyTomanReturn, false)} T`})
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: isFa ? 'همه صندوق‌ها' : 'All Vaults' },
          { id: 'halal', label: isFa ? 'صندوق‌های حلال (بدون ربا) ☪️' : 'Halal Yields ☪️' },
          { id: 'paxg', label: isFa ? 'طلای دیجیتال (PAXG)' : 'Gold (PAXG)' },
          { id: 'usdt', label: 'تتر (USDT)' },
          { id: 'usdc', label: 'یو‌اس‌دی‌سی (USDC)' },
          { id: 'eth', label: 'اتریوم (ETH)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClickSound();
              setFilterAsset(tab.id as any);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              filterAsset === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                : isDarkMode
                  ? 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredVaults.map((vault) => (
          <div
            key={vault.id}
            className={`p-6 rounded-3xl border transition-all hover:shadow-2xl flex flex-col justify-between ${
              vault.isHalal 
                ? isDarkMode ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/15' : 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/50'
                : isDarkMode ? 'border-purple-500/20 hover:border-purple-500/40 bg-purple-950/30' : 'border-purple-200 hover:border-purple-300 bg-white'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-sm ${
                    vault.isHalal 
                      ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-purple-600/20 border-purple-500/30 text-purple-300'
                  }`}>
                    {vault.asset}
                  </div>
                  <div>
                    <h4 className={`font-extrabold text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <span>{vault.protocol}</span>
                      {vault.badge && (
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                          vault.isHalal 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                        }`}>
                          {vault.badge}
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-purple-400 font-medium">{vault.chain}</span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-2xl font-black text-emerald-400 block">
                    {vault.apy}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {isFa ? 'سود سالانه (APY)' : 'Annual APY'}
                  </span>
                </div>
              </div>

              <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {vault.desc}
              </p>

              <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border text-xs mb-4 ${
                isDarkMode ? 'bg-purple-950/40 border-purple-500/15' : 'bg-purple-50 border-purple-100'
              }`}>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isFa ? 'کل سرمایه (TVL):' : 'Total TVL:'}</span>
                  <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{vault.tvl}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isFa ? 'سطح ریسک قرارداد:' : 'Risk Rating:'}</span>
                  <span className="font-semibold text-emerald-400">{isFa ? vault.risk : vault.riskEn}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onSelectVaultToDeposit(vault);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <span>{isFa ? 'سرمایه‌گذاری ۱ کلیکه با کامپوزر' : '1-Click Deposit via Composer'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Sharia & Halal DeFi Guidance Notice */}
      <div className={`p-5 rounded-3xl border mb-6 text-right space-y-2 transition-all ${
        isDarkMode 
          ? 'glass-panel border-emerald-500/30 bg-emerald-950/20' 
          : 'bg-emerald-50 border-emerald-200 text-slate-800'
      }`}>
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isFa ? 'راهنمای فقهی و انطباق شرعی در خزانه‌های گریفین سواپ:' : 'Sharia-Compliant DeFi Criteria:'}
        </span>
        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {isFa
            ? 'در فقه اسلامی، ربا (سود ثابت ناشی از قرض) جایز نیست. خزانه‌های طلای دیجیتال و سهم کارمزد گریفین، بر پایه عقد مضاربه و مشارکت مدنی هستند؛ سود پرداخت‌شده از محل کارمزدهای واقعی مبادلات سواپ استخراج شده و هیچ‌گونه بهره قرضی در آن وجود ندارد.'
            : 'Islamic finance prohibits Riba (interest on debt). Griffin Halal Vaults operate under Mudarabah & Musharakah principles: yields derive from actual AMM trading fees and physical gold holding.'}
        </p>
      </div>

      {/* Verified Protocol Treasury Commission Transparency Card */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-all ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای سپرده‌گذاری و مدیریت صندوق‌ها مستقیماً به خزانه‌داری رسمی واریز می‌شود:'
              : 'Platform commission (0.5%) for vault management routes directly to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1.5 rounded-xl hover:bg-white/10 text-purple-300 transition-colors"
            title={isFa ? 'کپی آدرس خزانه رسمی' : 'Copy Treasury Address'}
          >
            {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isFa ? 'مشاهده در اترسکن' : 'View on Etherscan'}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

    </div>
  );
};
