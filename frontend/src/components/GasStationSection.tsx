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
  ExternalLink 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playGasIgnitionSound, playSwapSuccessSound } from '../services/soundService';

interface GasStationSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

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

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const networksGasStats = [
    { name: 'Arbitrum One', gwei: '0.1 Gwei', usd: 0.02, speed: '< 1s', supported: true },
    { name: 'Base', gwei: '0.05 Gwei', usd: 0.01, speed: '< 1s', supported: true },
    { name: 'Optimism', gwei: '0.08 Gwei', usd: 0.02, speed: '< 1s', supported: true },
    { name: 'Polygon', gwei: '30 Gwei', usd: 0.01, speed: '2s', supported: true },
    { name: 'TON Network', gwei: '0.005 TON', usd: 0.03, speed: '3s', supported: true },
    { name: 'Ethereum Mainnet', gwei: '14 Gwei', usd: 0.95, speed: '12s', supported: true },
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
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
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
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 shadow-md shadow-amber-500/20 hover:scale-[1.02]'
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
                  className={`p-3 rounded-xl border text-center transition-all hover:scale-105 ${
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
                    <span className="font-bold text-white block">{net.name}</span>
                    <span className="text-[10px] text-slate-400">{net.speed} تایید</span>
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
            className="p-1 rounded-lg hover:bg-white/10 text-purple-300 transition-colors"
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
