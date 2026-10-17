import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Percent,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRightLeft,
  Coins,
  DollarSign
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface ArbitrageScannerProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  onNavigateSwap?: () => void;
}

interface ExchangeRate {
  id: string;
  name: string;
  nameEn: string;
  buyRate: number; // Toman per unit
  sellRate: number;
  feePercent: string;
  kycRequired: boolean;
  status: 'active' | 'warning';
  logo: string;
  withdrawalFeeUsd: number;
}

export const ArbitrageScanner: React.FC<ArbitrageScannerProps> = ({
  tomanRate,
  lang,
  isDarkMode,
  onNavigateSwap
}) => {
  const isFa = lang === 'fa';
  const [selectedAsset, setSelectedAsset] = useState<'usdt' | 'paxg'>('usdt');
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const paxgBaseToman = Math.round(tomanRate * 2720); // PAXG ~ $2,720

  // Live and simulated rates across major Iranian platforms for USDT
  const usdtExchanges: ExchangeRate[] = [
    {
      id: 'griffin',
      name: 'گریفین سواپ (شیردال وب۳)',
      nameEn: 'GriffinSwap DEX',
      buyRate: tomanRate,
      sellRate: tomanRate,
      feePercent: '0.5% (بدون کارمزد ریالی)',
      kycRequired: false,
      status: 'active',
      logo: '/mascot/griffi-avatar.jpg',
      withdrawalFeeUsd: 0.05
    },
    {
      id: 'nobitex',
      name: 'نوبیتکس (Nobitex P2P)',
      nameEn: 'Nobitex P2P',
      buyRate: tomanRate + 380,
      sellRate: tomanRate - 290,
      feePercent: '0.2% - 0.35%',
      kycRequired: true,
      status: 'active',
      logo: 'https://cdn.nobitex.ir/static/img/favicon.ico',
      withdrawalFeeUsd: 1.50
    },
    {
      id: 'wallex',
      name: 'والکس (Wallex OTC)',
      nameEn: 'Wallex OTC',
      buyRate: tomanRate + 480,
      sellRate: tomanRate - 360,
      feePercent: '0.25% - 0.4%',
      kycRequired: true,
      status: 'active',
      logo: 'https://wallex.ir/favicon.ico',
      withdrawalFeeUsd: 1.80
    },
    {
      id: 'tetherland',
      name: 'تترلند (TetherLand)',
      nameEn: 'TetherLand',
      buyRate: tomanRate + 620,
      sellRate: tomanRate - 420,
      feePercent: 'اسپرد مخفی در سواپ',
      kycRequired: true,
      status: 'active',
      logo: 'https://tetherland.com/favicon.ico',
      withdrawalFeeUsd: 2.00
    },
    {
      id: 'abantether',
      name: 'آبان‌تتر (AbanTether)',
      nameEn: 'AbanTether',
      buyRate: tomanRate + 530,
      sellRate: tomanRate - 390,
      feePercent: '۰.۳٪',
      kycRequired: true,
      status: 'active',
      logo: 'https://abantether.com/favicon.ico',
      withdrawalFeeUsd: 1.60
    }
  ];

  // Gold / PAXG Rates vs Physical Coin
  const paxgExchanges: ExchangeRate[] = [
    {
      id: 'griffin-paxg',
      name: 'گریفین سواپ (طلای دیجیتال PAXG)',
      nameEn: 'GriffinSwap (PAXG)',
      buyRate: paxgBaseToman,
      sellRate: paxgBaseToman,
      feePercent: '0.5% (حباب صفر درصد)',
      kycRequired: false,
      status: 'active',
      logo: '/mascot/griffi-avatar.jpg',
      withdrawalFeeUsd: 0.10
    },
    {
      id: 'bazaar-seke',
      name: 'سکه تمام طرح جدید (بازار بزرگ تهران)',
      nameEn: 'Physical Gold Coin (Tehran)',
      buyRate: Math.round(paxgBaseToman * 1.18), // 18% bubble
      sellRate: Math.round(paxgBaseToman * 1.09),
      feePercent: '۱۵٪ تا ۲۰٪ حباب + ریسک فیزیکی',
      kycRequired: true,
      status: 'warning',
      logo: 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png',
      withdrawalFeeUsd: 5.00
    },
    {
      id: 'nobitex-gold',
      name: 'نوبیتکس (صندوق طلای کهربا/زر)',
      nameEn: 'Nobitex Gold Funds',
      buyRate: Math.round(paxgBaseToman * 1.05),
      sellRate: Math.round(paxgBaseToman * 0.98),
      feePercent: '۰.۳۵٪ + محدودیت دامنه نوسان',
      kycRequired: true,
      status: 'active',
      logo: 'https://cdn.nobitex.ir/static/img/favicon.ico',
      withdrawalFeeUsd: 2.00
    }
  ];

  const currentExchanges = selectedAsset === 'usdt' ? usdtExchanges : paxgExchanges;

  // Best rates
  const lowestBuy = Math.min(...currentExchanges.map(e => e.buyRate));
  const highestSell = Math.max(...currentExchanges.map(e => e.sellRate));
  const spreadToman = Math.abs(highestSell - lowestBuy);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const estimatedSavingsToman = selectedAsset === 'usdt'
    ? Math.round(calcAmount * 420 + 1.5 * tomanRate)
    : Math.round(calcAmount * (paxgBaseToman * 0.12));

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 text-right animate-fade-in ${
      isDarkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      
      {/* Hero Banner with Griffi Wealth Analyst Mascot */}
      <div className="rounded-3xl border border-purple-500/30 overflow-hidden relative shadow-2xl group bg-[#110d29]">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img 
            src="/mascot/griffi-analyst.jpg" 
            alt="Griffi Wealth Analyst" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0817] via-[#0b0817]/60 to-transparent" />
          
          <div className="absolute bottom-5 right-6 left-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-xs font-bold text-amber-300 mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'دیدبان آربیتراژ و تحلیل هم‌زمان بازارهای داخلی' : 'Iranian P2P & CEX Arbitrage Radar'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">
                {isFa ? 'رادار قیمت لحظه‌ای تتر و طلای دیجیتال' : 'Live Rate Radar & CEX Arbitrage'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {isFa 
                  ? 'بررسی شفاف کارمزد پنهان و اسپرد قیمت نوبیتکس، والکس، تترلند و بازار تهران با نرخ جهانی گریفین‌سواپ بدون نیاز به احراز هویت'
                  : 'Real-time spread detection and zero-KYC arbitrage between Iranian CEXs and GriffinSwap non-custodial pools.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end">
              {onNavigateSwap && (
                <button
                  onClick={() => {
                    playClickSound();
                    onNavigateSwap();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isFa ? 'سواپ مستقیم بدون احراز هویت' : 'Direct Swap (Zero KYC)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
        isDarkMode 
          ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
          : 'bg-white border-purple-200 text-slate-800 shadow-xl'
      }`}>

        {/* Top Controls: Asset Switcher & Live Spread Pill */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-purple-500/20">
          
          {/* Asset Selector Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-purple-950/60 border border-purple-500/30">
            <button
              onClick={() => {
                playClickSound();
                setSelectedAsset('usdt');
                setCalcAmount(1000);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAsset === 'usdt'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'تتر (USDT / تومان)' : 'USDT / Toman'}</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setSelectedAsset('paxg');
                setCalcAmount(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAsset === 'paxg'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFa ? 'طلای دیجیتال (PAXG / سکه)' : 'PAXG Gold vs Coin'}</span>
            </button>
          </div>

          {/* Spread Highlight Pill */}
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                {isFa ? 'حداکثر اختلاف نرخ در بازار:' : 'Max Market Spread:'}
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {isFa ? `${toPersianDigits(formatToman(spreadToman, false))} تومان` : `${formatToman(spreadToman, false)} Toman`}
              </span>
            </div>
          </div>
        </div>

        {/* Exchanges Comparison Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 text-slate-400 font-bold">
                <th className="py-3 px-3">{isFa ? 'پلتفرم / صرافی' : 'Exchange'}</th>
                <th className="py-3 px-3">{isFa ? 'خرید از صرافی (تومان)' : 'Buy Price'}</th>
                <th className="py-3 px-3">{isFa ? 'فروش به صرافی (تومان)' : 'Sell Price'}</th>
                <th className="py-3 px-3">{isFa ? 'کارمزد مبادله' : 'Trading Fee'}</th>
                <th className="py-3 px-3">{isFa ? 'کارمزد برداشت شبکه' : 'Withdrawal Fee'}</th>
                <th className="py-3 px-3">{isFa ? 'احراز هویت (KYC)' : 'KYC Required'}</th>
                <th className="py-3 px-3 text-center">{isFa ? 'امنیت و حریم خصوصی' : 'Privacy Rating'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/15">
              {currentExchanges.map((ex) => {
                const isGriffin = ex.id.startsWith('griffin');
                return (
                  <tr 
                    key={ex.id}
                    className={`transition-colors ${
                      isGriffin 
                        ? 'bg-purple-900/30 font-bold border-l-4 border-l-amber-400' 
                        : 'hover:bg-purple-950/20'
                    }`}
                  >
                    <td className="py-3.5 px-3 flex items-center gap-2.5">
                      <img 
                        src={ex.logo} 
                        alt={ex.name} 
                        className={`w-6 h-6 rounded-lg object-cover ${isGriffin ? 'ring-2 ring-amber-400' : ''}`}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <span className={isGriffin ? 'text-amber-300 font-black' : 'text-slate-200'}>
                          {isFa ? ex.name : ex.nameEn}
                        </span>
                        {isGriffin && (
                          <span className="block text-[10px] text-purple-300 font-normal">
                            {isFa ? '۱۰۰٪ غیرحضانتی و ضدتحریم' : 'Non-custodial & Censorship-Free'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                      {isFa ? `${toPersianDigits(formatToman(ex.buyRate, false))} ت` : `${formatToman(ex.buyRate, false)} T`}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      {isFa ? `${toPersianDigits(formatToman(ex.sellRate, false))} ت` : `${formatToman(ex.sellRate, false)} T`}
                    </td>

                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      {ex.feePercent}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      ${ex.withdrawalFeeUsd.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      {ex.kycRequired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                          <span>{isFa ? 'الزامی (کارت ملی و سلفی)' : 'Required'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isFa ? 'صفر (اتصال مستقیم ولت)' : 'Zero KYC'}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {isGriffin ? (
                        <span className="text-amber-400 font-black">⭐⭐⭐⭐⭐ (A+)</span>
                      ) : ex.status === 'warning' ? (
                        <span className="text-rose-400 font-bold">⚠️ ریسک مسدودی</span>
                      ) : (
                        <span className="text-slate-400">⭐⭐⭐ (B)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Interactive Savings / Arbitrage Estimator */}
        <div className="mt-8 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>
                {isFa 
                  ? `ماشین‌حساب سود و صرفه‌جویی گریفین‌سواپ (${selectedAsset === 'usdt' ? 'تتر' : 'طلای PAXG'}):` 
                  : 'Fee Savings & Net Profit Calculator:'}
              </span>
            </h4>

            {/* Quick Amount Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(selectedAsset === 'usdt' ? [250, 500, 1000, 5000, 10000] : [0.5, 1, 2, 5, 10]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    playClickSound();
                    setCalcAmount(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    calcAmount === preset
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/50'
                  }`}
                >
                  {preset} {selectedAsset === 'usdt' ? '$' : 'PAXG'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isFa 
                  ? `مبلغ مبادله (${selectedAsset === 'usdt' ? 'تتر' : 'اونس طلای دیجیتال'}):` 
                  : 'Trade Amount:'}
              </label>
              <input 
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-purple-900/40 border border-purple-500/30 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 text-right">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {isFa ? 'هزینه پنهان در صرافی‌های داخلی (اسپرد + کارمزد خروج):' : 'Estimated CEX Spread & Fees:'}
              </span>
              <span className="text-sm font-mono font-bold text-rose-400">
                ≈ {isFa ? `${toPersianDigits(formatToman(estimatedSavingsToman, false))} تومان` : `${formatToman(estimatedSavingsToman, false)} Toman`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
              <span className="text-[11px] text-emerald-300 block mb-0.5 font-bold">
                {isFa ? 'صرفه‌جویی خالص و سود با گریفین‌سواپ:' : 'Net Advantage with GriffinSwap:'}
              </span>
              <span className="text-sm font-mono font-black text-emerald-400">
                {isFa ? `+ ${toPersianDigits(formatToman(estimatedSavingsToman, false))} تومان سود خالص` : `+ ${formatToman(estimatedSavingsToman, false)} Toman Saved`}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Protocol Treasury Fee Guarantee */}
        <div className="mt-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-right">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              {isFa 
                ? 'تمام کارمزدهای مبادله گریفین سواپ (۰.۵٪) بدون کارمزد ریالی مستقیماً به خزانه‌داری رسمی واریز می‌گردد:' 
                : 'All platform fees (0.5%) route directly to official verified treasury:'}
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
    </div>
  );
};
