import React, { useState } from 'react';
import { 
  Percent, 
  Sparkles, 
  ArrowUpRight
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';

interface VaultItem {
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
}

interface EarnSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  onSelectVaultToDeposit: (vault: VaultItem) => void;
}

export const EarnSection: React.FC<EarnSectionProps> = ({
  tomanRate,
  lang,
  onSelectVaultToDeposit,
}) => {
  const isFa = lang === 'fa';
  const [filterAsset, setFilterAsset] = useState<'all' | 'usdt' | 'usdc' | 'eth'>('all');
  const [calculatorDeposit, setCalculatorDeposit] = useState<number>(1000);

  const vaults: VaultItem[] = [
    {
      id: "morpho-usdc-base",
      protocol: "Morpho Blue",
      asset: "USDC",
      chain: "Base",
      apy: "8.42%",
      tvl: "$142M",
      risk: "کم",
      riskEn: "Low",
      desc: "صندوق نقدینگی استیبل‌کوین روی شبکه ارزان بیس با بازدهی بالا و قراردادهای اثبات‌شده",
      badge: "پیشنهاد ویژه"
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
      desc: "استخر وام‌دهی آوه روی آربیتروم با بیشترین نقدینگی و بالاترین درجه امنیت در دیفای",
      badge: "امن‌ترین"
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
      desc: "خرید سود ثابت از بازسهام‌گذاری اتریوم (Restaking) با بالاترین نرخ بازدهی"
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
      desc: "وام‌دهی در پروتکل غیرمتمرکز کامپاند روی پالیگان با تراکنش‌های آنی و ارزان"
    }
  ];

  const filteredVaults = vaults.filter((v) => {
    if (filterAsset === 'all') return true;
    return v.asset.toLowerCase().includes(filterAsset);
  });

  // Calculate annual return for the calculator widget
  const avgApy = 0.0842;
  const yearlyUsdReturn = calculatorDeposit * avgApy;
  const yearlyTomanReturn = usdToToman(yearlyUsdReturn, tomanRate);

  return (
    <div className="w-full py-6 px-4 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFa ? 'الهام‌گرفته از Jumper Earn و LI.FI Composer' : 'Powered by LI.FI Composer'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
          <span className="griffin-gradient-text">
            {isFa ? 'کسب درآمد دلاری غیرمتمرکز (Earn)' : 'DeFi Yield & Staking Vaults'}
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 font-medium">
          {isFa
            ? 'سود سالانه پایدار روی تتر و استیبل‌کوین‌ها در معتبرترین پروتکل‌های دیفای، بدون دخالت بانک و بدون تحریم'
            : 'Deposit stablecoins and blue-chip tokens into audited yield vaults with 1-click execution.'}
        </p>

        {/* Griffi Earn 3D Vault Banner */}
        <div className="mt-5 p-4 rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-amber-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-5 text-right shadow-2xl max-w-2xl mx-auto">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-amber-400/80 shrink-0 shadow-lg bg-black/40">
            <img src="/mascot/griffi-vault.jpg" alt="Griffi DeFi Vault" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <span className="font-black text-amber-300 text-sm flex items-center gap-1.5 mb-1">
              <span>{isFa ? 'خزانه‌های سود پایدار با گریفی 🌼💎' : 'Stable Yield Vaults with Griffi 🌼💎'}</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              {isFa 
                ? 'استخرهای دیفای ممیزی‌شده با بازدهی سالانه تا ۱۴.۸٪ روی تتر و استیبل‌کوین‌ها بدون خطر قفل سرمایه یا توقیف.' 
                : 'Curated high-yield non-custodial vaults with up to 14.8% APY on stablecoins.'}
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-purple-200 bg-purple-900/50 px-2.5 py-1 rounded-xl font-mono">
              <span>{isFa ? 'خزانه رسمی کارمزدها: 0xD9C1...A2D3' : 'Official Treasury: 0xD9C1...A2D3'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yield Calculator Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl mb-10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              <span>{isFa ? 'محاسبه‌گر سود دلاری و تومانی سپرده‌گذاری' : 'Yield Profit Calculator'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'با سرمایه‌گذاری تتر خود در صندوق‌های امن دیفای، هم ارزش دارایی شما در برابر تورم حفظ می‌شود و هم سود سالانه دلاری دریافت می‌کنید.'
                : 'Protect your capital from inflation and earn competitive annual yields on USD stablecoins.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="relative max-w-xs w-full">
                <input
                  type="number"
                  value={calculatorDeposit}
                  onChange={(e) => setCalculatorDeposit(Number(e.target.value) || 0)}
                  className="w-full bg-purple-950/50 border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-400"
                  placeholder="1000"
                />
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">USDT</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ≈ {isFa ? `${toPersianDigits(formatToman(usdToToman(calculatorDeposit, tomanRate)))} تومان` : `${formatToman(usdToToman(calculatorDeposit, tomanRate), false)} Toman`}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 to-indigo-950/80 border border-purple-500/30 text-center space-y-2 shadow-inner">
            <span className="text-xs text-purple-300 font-bold block">
              {isFa ? 'تخمین سود سالانه (میانگین ۸.۴٪ APY):' : 'Estimated Annual Profit:'}
            </span>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              +${yearlyUsdReturn.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm font-bold text-amber-300 font-mono">
              + {isFa ? `${toPersianDigits(formatToman(yearlyTomanReturn))} تومان سود خالص` : `${formatToman(yearlyTomanReturn, false)} Toman`}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'all', label: isFa ? 'همه صندوق‌ها' : 'All Vaults' },
          { id: 'usdt', label: 'تتر (USDT)' },
          { id: 'usdc', label: 'یو‌اس‌دی‌سی (USDC)' },
          { id: 'eth', label: 'اتریوم (ETH)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAsset(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterAsset === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-500/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVaults.map((vault) => (
          <div
            key={vault.id}
            className="glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
                    {vault.asset}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                      <span>{vault.protocol}</span>
                      {vault.badge && (
                        <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">
                          {vault.badge}
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-purple-300 font-medium">{vault.chain}</span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-2xl font-black text-emerald-400 font-mono block">
                    {vault.apy}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {isFa ? 'سود سالانه (APY)' : 'Annual APY'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {vault.desc}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/15 text-xs mb-4">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isFa ? 'کل سرمایه (TVL):' : 'Total TVL:'}</span>
                  <span className="font-mono font-bold text-white">{vault.tvl}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">{isFa ? 'سطح ریسک قرارداد:' : 'Risk Rating:'}</span>
                  <span className="font-semibold text-emerald-400">{isFa ? vault.risk : vault.riskEn}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectVaultToDeposit(vault)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
            >
              <span>{isFa ? 'سرمایه‌گذاری ۱ کلیکه با کامپوزر' : '1-Click Deposit via Composer'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
