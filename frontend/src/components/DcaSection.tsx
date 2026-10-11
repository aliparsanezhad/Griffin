import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { LimitOrderBook } from './LimitOrderBook';

interface DcaSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

export const DcaSection: React.FC<DcaSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode
}) => {
  const isFa = lang === 'fa';

  // Mode: 'dca' (خرید پله‌ای) or 'limit' (دفتر سفارشات لیمیت)
  const [activeMode, setActiveMode] = useState<'dca' | 'limit'>('dca');

  // DCA State
  const [monthlyToman, setMonthlyToman] = useState<number>(5000000); // 5 Million Tomans per month
  const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'ETH' | 'BTC'>('ETH');
  const [durationMonths, setDurationMonths] = useState<number>(12); // 12 Months

  // Asset historical/projected average returns
  const assetAnnualGrowth: Record<string, number> = {
    'USDT': 0.45, // Fiat depreciation hedge ~45% IRR inflation
    'ETH': 0.85,  // ETH appreciation + inflation ~85%
    'BTC': 1.10   // BTC appreciation + inflation ~110%
  };

  // DCA Math
  const totalInvestedToman = monthlyToman * durationMonths;
  const growthRate = assetAnnualGrowth[selectedAsset] * (durationMonths / 12);
  const projectedFutureToman = Math.round(totalInvestedToman * (1 + growthRate));
  const profitToman = projectedFutureToman - totalInvestedToman;

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      {/* Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'استراتژی‌های پیشرفته سرمایه‌گذاری ضدتورمی' : 'Smart DCA & Limit Orders'}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {isFa ? 'خرید پله‌ای (DCA) و سفارشات محدود 📈' : 'DCA & Limit Orders 📈'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isFa 
              ? 'با پس‌انداز پله‌ای منظم، ارزش سرمایه خود را در برابر افت ارزش ریال بیمه کنید و نوسانات بازار را مهار نمایید.' 
              : 'Automate systematic recurring buys and place limit orders directly non-custodial.'}
          </p>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-950/40 border border-purple-500/25 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('dca')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'dca'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'خرید پله‌ای (DCA)' : 'DCA Simulator'}
          </button>
          <button
            onClick={() => setActiveMode('limit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'limit'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'سفارش محدود (Limit)' : 'Limit Order'}
          </button>
        </div>
      </div>

      {/* MODE 1: DCA Planner */}
      {activeMode === 'dca' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Monthly Budget */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {isFa ? 'پس‌انداز ماهانه (تومان):' : 'Monthly Deposit (Toman):'}
              </label>
              <input 
                type="number"
                step="500000"
                value={monthlyToman}
                onChange={(e) => setMonthlyToman(Number(e.target.value) || 0)}
                className="w-full bg-purple-900/40 border border-purple-500/30 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
              />
              <span className="text-[10px] text-purple-300 mt-1 block">
                ≈ {isFa ? `${toPersianDigits(Math.round(monthlyToman / tomanRate))} تتر در ماه` : `$${Math.round(monthlyToman / tomanRate)} / month`}
              </span>
            </div>

            {/* Target Asset */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {isFa ? 'دارایی هدف برای خرید:' : 'Target Asset:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['USDT', 'ETH', 'BTC'] as const).map(asset => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAsset(asset)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedAsset === asset
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {isFa ? 'افق زمانی پس‌انداز:' : 'Time Horizon:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map(m => (
                  <button
                    key={m}
                    onClick={() => setDurationMonths(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      durationMonths === m
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isFa ? `${toPersianDigits(m)} ماهه` : `${m} Mo`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Comparison Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-amber-950/30 border border-purple-500/30">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'پیش‌بینی عملکرد سرمایه شما در مقایسه با تورم ریال:' : 'Projected Performance vs Fiat Inflation:'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? 'کل مبالغ پرداختی شما:' : 'Total Invested:'}
                </span>
                <span className="text-base font-black font-mono text-slate-200">
                  {isFa ? `${toPersianDigits(formatToman(totalInvestedToman, false))} تومان` : `${formatToman(totalInvestedToman, false)} T`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? `ارزش تخمینی با ${selectedAsset}:` : `Estimated Value in ${selectedAsset}:`}
                </span>
                <span className="text-base font-black font-mono text-amber-400">
                  {isFa ? `${toPersianDigits(formatToman(projectedFutureToman, false))} تومان` : `${formatToman(projectedFutureToman, false)} T`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 block mb-1">
                  {isFa ? 'سود محافظت از ارزش ریال:' : 'Net Inflation Protection:'}
                </span>
                <span className="text-base font-black font-mono text-emerald-400">
                  +{isFa ? `${toPersianDigits(formatToman(profitToman, false))} تومان` : `${formatToman(profitToman, false)} T`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Limit Orders */}
      {activeMode === 'limit' && (
        <div className="mt-6 animate-fade-in">
          <LimitOrderBook
            tomanRate={tomanRate}
            lang={lang}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};
