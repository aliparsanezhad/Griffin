import React, { useState } from 'react';
import { 
  Coins, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeftRight, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface GoldHedgingDeskProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onInitiateSwap?: (fromToken: string, toToken: string, amount: string) => void;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const GoldHedgingDesk: React.FC<GoldHedgingDeskProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
  onInitiateSwap,
}) => {
  const [usdtAmount, setUsdtAmount] = useState<number>(3000);
  const [copied, setCopied] = useState<boolean>(false);

  const isFa = lang === 'fa';

  // Live gold & coin metrics
  const ounceUsd = 2685.50; // Ounce Gold in USD
  const paxgPriceUsd = ounceUsd; // 1 PAXG = 1 Troy Ounce
  const paxgPriceToman = paxgPriceUsd * tomanRate;

  // 1 Gram 18k Gold & Seke Emami
  const gram18kToman = 4780000;
  const sekeEmamiToman = 54500000;

  // Formula for raw value of Seke Emami (8.133g of 21.6 carat / 900 purity)
  const sekeRawToman = ((ounceUsd * tomanRate * 8.133 * 0.9) / 31.1035);
  const sekeBubbleToman = sekeEmamiToman - sekeRawToman;
  const sekeBubblePercent = ((sekeBubbleToman / sekeRawToman) * 100).toFixed(1);

  // Calculations for simulated trade
  const paxgReceived = usdtAmount / paxgPriceUsd;
  const equivalentPhysicalGrams = (paxgReceived * 31.1035 * 0.75); // converted to 18k equivalent
  const bazaarMakerFeeUsdt = usdtAmount * 0.085; // ~8.5% typical bazaar maker fee / ajrat
  const bazaarMakerFeeToman = bazaarMakerFeeUsdt * tomanRate;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSwap = () => {
    playSwapSuccessSound();
    if (onInitiateSwap) {
      onInitiateSwap('USDT', 'PAXG', usdtAmount.toString());
    } else {
      alert(isFa ? `درخواست سواپ ${usdtAmount} تتر به طلای دیجیتال ثبت شد.` : `Swap of ${usdtAmount} USDT to PAXG initiated.`);
    }
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient gold lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/70 shadow-xl shadow-amber-500/20 shrink-0">
            <img 
              src="/mascot/griffi-gold-treasury.jpg" 
              alt="Griffi Gold Treasury" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'میز هجینگ طلای دیجیتال و حباب‌سنج سکه امامی' : 'Digital Gold Hedging & Seke Bubble Radar'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                PAXG & XAUT 0% Bubble
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پوشش ریسک تورم و کاهش ارزش ریال با خرید طلای جهانی بدون حباب سکه و بدون کارمزد اجرت طلافروشی'
                : 'Hedge inflation by swapping USDT to physical gold-backed tokens (PAXG) with 0% coin bubble risk.'}
            </p>
          </div>
        </div>

        {/* Live Spot Ounce Badge */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
            <Coins className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">
              {isFa ? 'اونس جهانی طلا (XAU):' : 'World Gold Spot:'}
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              ${ounceUsd.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Gold vs Seke Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
        
        {/* Card 1: PAX Gold On-Chain */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-purple-900/25 border-amber-400/40' : 'bg-amber-50/60 border-amber-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                {isFa ? 'طلای دیجیتال (PAXG / XAUT)' : 'Digital Gold (PAXG)'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                حباب ۰٪ (ارزش خالص)
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-xl font-black text-white font-mono block">
                ${paxgPriceUsd.toLocaleString()}
              </span>
              <span className="text-xs text-amber-300 font-mono block">
                ≈ {isFa ? `${toPersianDigits(formatToman(paxgPriceToman))} تومان` : `${formatToman(paxgPriceToman)} T`}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed text-right">
              {isFa 
                ? 'پشتوانه ۱۰۰٪ شمش فیزیکی طلای لندن (Brink’s). بدون اجرت ساخت، بدون مالیات و بدون ریسک سرقت فیزیکی.'
                : '100% backed by physical London Good Delivery gold bars. Zero jewelry markup and zero burglary risk.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isFa ? 'پذیرش در تمام دیفای و وام‌دهی' : 'Liquid in DeFi lending & swap'}</span>
          </div>
        </div>

        {/* Card 2: Seke Emami with Bubble Alert */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50/60 border-rose-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-rose-300 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-rose-400" />
                {isFa ? 'سکه امامی (طرح جدید)' : 'Seke Emami (Physical)'}
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30">
                +{sekeBubblePercent}% حباب
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-xl font-black text-white font-mono block">
                {isFa ? `${toPersianDigits(formatToman(sekeEmamiToman))} ت` : `${formatToman(sekeEmamiToman)} T`}
              </span>
              <span className="text-xs text-rose-400 font-mono block">
                {isFa ? `حباب سکه: ${toPersianDigits(formatToman(sekeBubbleToman))} تومان` : `Bubble: ${formatToman(sekeBubbleToman)} T`}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed text-right">
              {isFa 
                ? 'بیش از ۲۰٪ قیمت سکه امامی ناشی از حباب هیجانی است و در صورت کاهش حباب ممکن است ارزش سرمایه ریزش کند.'
                : 'Over 20% of physical Iranian coin price consists of speculative bubble markup.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center gap-1.5 text-xs text-rose-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{isFa ? 'ریسک افت قیمت ناشی از تخلیه حباب' : 'High bubble deflation risk'}</span>
          </div>
        </div>

        {/* Card 3: 18k Gram Gold */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-200 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-300" />
                {isFa ? 'طلای ۱۸ عیار بازار تهران' : '18k Gram Gold'}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                اجرت ~۸.۵٪
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-xl font-black text-white font-mono block">
                {isFa ? `${toPersianDigits(formatToman(gram18kToman))} ت` : `${formatToman(gram18kToman)} T`}
              </span>
              <span className="text-xs text-slate-400 font-mono block">
                هر گرم طلای ۱۸ عیار خام
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed text-right">
              {isFa
                ? 'هنگام خرید طلای زینتی بین ۷ تا ۱۸ درصد اجرت ساخت و سود طلافروش کسر می‌شود که در فروش مجدد می‌سوزد.'
                : 'Jewelry craftsmanship markups (7-18%) are permanently lost when selling back to bazaar.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center gap-1.5 text-xs text-amber-300 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>{isFa ? 'صرفه‌جویی با طلای دیجیتال گریفین' : 'Save 100% on maker fees with PAXG'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Hedging Simulator Box */}
      <div className={`p-6 rounded-2xl border my-6 ${
        isDarkMode ? 'bg-purple-950/30 border-purple-500/20' : 'bg-purple-50/80 border-purple-200'
      }`}>
        <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          <span>{isFa ? 'شبیه‌ساز و ماشین‌حساب تبدیل تتر به طلای بدون حباب (PAXG)' : 'Simulate Tether to Digital Gold Hedging'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Amount input & presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-bold">
                {isFa ? 'مبلغ تبدیل تتر (USDT):' : 'Tether Amount to Swap:'}
              </span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                {usdtAmount.toLocaleString()} USDT
              </span>
            </div>

            <input 
              type="range"
              min="200"
              max="50000"
              step="100"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(Number(e.target.value))}
              className="w-full h-2 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-amber-400 mb-4"
            />

            <div className="flex gap-2">
              {[500, 1500, 3000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    playClickSound();
                    setUsdtAmount(amt);
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    usdtAmount === amt
                      ? 'bg-amber-400 text-purple-950 border-amber-300'
                      : 'bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome breakdown */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isDarkMode ? 'bg-black/30 border-purple-500/30' : 'bg-white border-purple-200'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'طلای دیجیتال دریافتی:' : 'PAXG Gold Received:'}</span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                {paxgReceived.toFixed(4)} PAXG (≈ {equivalentPhysicalGrams.toFixed(2)} {isFa ? 'گرم طلای ۱۸ عیار' : 'g 18k'})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'صرفه‌جویی در اجرت طلافروشی:' : 'Bazaar Markup Saved:'}</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span dir="ltr">+{bazaarMakerFeeUsdt.toFixed(1)} USDT</span>
                <span>≈ {isFa ? `${toPersianDigits(formatToman(bazaarMakerFeeToman))} تومان` : `${formatToman(bazaarMakerFeeToman)} T`}</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{isFa ? 'کارمزد پروتکل گریفین (۰.۵٪):' : 'Protocol Commission (0.5%):'}</span>
              <span className="font-mono text-purple-300" dir="ltr">
                ${(usdtAmount * 0.005).toFixed(2)} USDT
              </span>
            </div>

            {/* Visual Comparison: Seke vs PAXG Bubble Ratio Bar */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-amber-300">
                  {isFa ? 'مقایسه ریسک حباب: طلای دیجیتال vs سکه فیزیکی' : 'Bubble Risk Comparison'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {isFa ? 'طلای دیجیتال: ۱۰۰٪ ارزش خالص' : 'PAXG: 100% Real Value'}
                </span>
              </div>

              {/* Dual comparison meter */}
              <div className="space-y-1.5 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span>{isFa ? 'طلای PAXG (دکس گریفین):' : 'PAXG (GriffinSwap):'}</span>
                    <span className="text-emerald-400 font-bold">{isFa ? '۱۰۰٪ طلای خالص • ۰٪ حباب' : '100% Real Gold • 0% Bubble'}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span>{isFa ? 'سکه امامی (بازار سنتی طلا):' : 'Physical Coin (Bazaar):'}</span>
                    <span className="text-rose-400 font-bold">{isFa ? `+${sekeBubblePercent}٪ حباب سوختنی!` : `+${sekeBubblePercent}% Bubble Deflation Risk!`}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div className="h-full bg-amber-400" style={{ width: `${100 - parseFloat(sekeBubblePercent)}%` }} />
                    <div className="h-full bg-rose-500 animate-pulse" style={{ width: `${sekeBubblePercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleQuickSwap}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-purple-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Coins className="w-4 h-4 text-purple-950" />
              <span>{isFa ? 'سواپ این مبلغ به طلای دیجیتال در گریفین ⚡' : 'Swap to Digital Gold on Griffin ⚡'}</span>
            </button>
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
              ? 'کارمزد مبادلات طلای دیجیتال گریفین سواپ (۰.۵٪) مستقیماً به آدرس خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for digital gold swaps routes non-custodially to treasury:'}
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
