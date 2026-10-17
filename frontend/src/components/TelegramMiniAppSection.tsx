import React, { useState } from 'react';
import { 
  Send, 
  Smartphone, 
  Bell, 
  Check, 
  ArrowLeftRight, 
  ExternalLink,
  Sparkles,
  Bot,
  DollarSign,
  Copy,
  Zap
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface TelegramMiniAppSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const TelegramMiniAppSection: React.FC<TelegramMiniAppSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode = true
}) => {
  const isFa = lang === 'fa';
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  // State for simulated TON <-> EVM swap
  const [tonAmount, setTonAmount] = useState<string>('25');
  const [selectedDirection, setSelectedDirection] = useState<'ton-to-evm' | 'evm-to-ton'>('ton-to-evm');
  const [swapInitiated, setSwapInitiated] = useState<boolean>(false);

  // Telegram alert toggles
  const [alerts, setAlerts] = useState({
    tomanRate: true,
    lowGas: true,
    swapFilled: true
  });

  const tonPriceUsd = 5.40;
  const numTon = parseFloat(tonAmount) || 0;
  const totalUsd = numTon * tonPriceUsd;
  const totalToman = totalUsd * tomanRate;

  // EVM output (USDT on Arbitrum)
  const evmUsdtOutput = (totalUsd * 0.995).toFixed(2); // 0.5% protocol fee

  const handleSimulateBridge = () => {
    playSwapSuccessSound();
    setSwapInitiated(true);
    setTimeout(() => setSwapInitiated(false), 4500);
  };

  const toggleAlert = (key: keyof typeof alerts) => {
    playClickSound();
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className={`w-full rounded-3xl p-5 md:p-8 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/95 border-purple-500/25 text-slate-100 shadow-purple-950/40' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      
      {/* Top Banner with Griffi Telegram 3D Mascot */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-2 ring-cyan-400/80 shadow-lg shrink-0 bg-black/40">
            <img 
              src="/mascot/griffi-telegram.jpg" 
              alt="Griffi Telegram Bot" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-1">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFa ? 'مینی‌اپ تلگرام و درگاه کراس‌چین شبکه TON' : 'Telegram Mini App & TON Bridge'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{isFa ? 'سواپ مستقیم داخل تلگرام و پل ارتباطی TON' : 'Telegram WebApp & TON-to-EVM Bridge'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                @GriffinSwapBot
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isFa 
                ? 'امکان تبادل آنی دارایی‌های اکوسیستم تلگرام (TON، نات‌کوین، داگز و همستر) با شبکه‌های لایه دو اتریوم (Arbitrum و Base) بدون نیاز به فیلترشکن اختصاصی و احراز هویت.' 
                : 'Directly swap TON ecosystem assets (TON, NOT, DOGS, USDT-TON) with Arbitrum, Base, and Polygon directly inside Telegram.'}
            </p>
          </div>
        </div>

        {/* Telegram Direct Launch Button */}
        <div className="flex items-center gap-2">
          <a
            href="https://t.me/GriffinSwapBot"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-sky-500 text-white font-black text-xs shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 text-cyan-200" />
            <span>{isFa ? 'اجرای در تلگرام (Mini App)' : 'Launch Mini App'}</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Main Grid: Interactive TON Bridge + Telegram Phone Simulation */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: TON <-> EVM Bridge Converter (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-cyan-950/40 border border-cyan-500/25 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'تبدیل آنی تون (TON) به تتر آربیتروم (USDT):' : 'Instant TON <-> EVM Bridge:'}</span>
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedDirection(selectedDirection === 'ton-to-evm' ? 'evm-to-ton' : 'ton-to-evm');
                }}
                className="text-[11px] font-bold text-cyan-300 hover:text-white px-2 py-1 rounded-lg bg-black/40 border border-cyan-500/20 transition-all flex items-center gap-1"
              >
                <span>{isFa ? 'تغییر جهت' : 'Reverse'}</span>
                <ArrowLeftRight className="w-3 h-3" />
              </button>
            </div>

            {/* Input TON */}
            <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  {selectedDirection === 'ton-to-evm' ? (isFa ? 'موجودی ارسالی از کیف‌پول Tonkeeper:' : 'Send from Tonkeeper:') : (isFa ? 'پرداخت از متامسک / ربی:' : 'Send from EVM Wallet:')}
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">
                  {selectedDirection === 'ton-to-evm' ? 'TON Network' : 'Arbitrum One'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input 
                  type="text" 
                  value={tonAmount}
                  onChange={(e) => setTonAmount(e.target.value)}
                  className="bg-transparent text-xl font-black font-mono text-white focus:outline-none w-full"
                  placeholder="0.0"
                />
                <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-black text-xs shrink-0 font-mono">
                  {selectedDirection === 'ton-to-evm' ? 'TON' : 'USDT'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1 border-t border-purple-500/10">
                <span>≈ ${totalUsd.toFixed(2)} USD</span>
                <span className="text-amber-300 font-bold">
                  ≈ {isFa ? `${toPersianDigits(formatToman(totalToman, false))} تومان` : `${formatToman(totalToman, false)} T`}
                </span>
              </div>
            </div>

            {/* Output EVM */}
            <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  {selectedDirection === 'ton-to-evm' ? (isFa ? 'دریافت روی شبکه آربیتروم (EVM):' : 'Receive on Arbitrum:') : (isFa ? 'دریافت روی شبکه تون (TON):' : 'Receive on TON:')}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {selectedDirection === 'ton-to-evm' ? 'Arbitrum (L2)' : 'TON Network'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-black font-mono text-emerald-400 truncate">
                  {evmUsdtOutput}
                </span>
                <span className="px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-200 font-black text-xs shrink-0 font-mono">
                  {selectedDirection === 'ton-to-evm' ? 'USDT' : 'TON'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1 border-t border-purple-500/10">
                <span>{isFa ? 'کارمزد پروتکل: ۰.۵٪ (خزانه 0xD9C1...A2D3)' : 'Protocol Fee: 0.5% (Treasury)'}</span>
                <span className="text-emerald-400 font-bold">{isFa ? 'تسویه: ۲۵ ثانیه' : 'Speed: 25s'}</span>
              </div>
            </div>

            {/* Bridge Action CTA */}
            {swapInitiated ? (
              <div className="w-full p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-white flex items-center justify-center gap-2 font-bold text-sm shadow-xl animate-fade-in">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>{isFa ? 'بریج میان TON و آربیتروم با موفقیت تایید شد!' : 'TON-to-EVM Bridge Confirmed!'}</span>
              </div>
            ) : (
              <button
                onClick={handleSimulateBridge}
                disabled={numTon <= 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-sky-500 text-white font-black text-sm shadow-xl shadow-cyan-950/40 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>
                  {isFa 
                    ? `تبدیل آنی ${tonAmount} تون به ${evmUsdtOutput} تتر` 
                    : `Bridge ${tonAmount} TON to ${evmUsdtOutput} USDT`}
                </span>
              </button>
            )}

          </div>

          {/* Telegram Smart Price Alerts Configuration */}
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'اعلان‌های هوشمند تلگرام گریفی (Telegram Alerts):' : 'Griffi Telegram Bot Alerts:'}</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold">
                {isFa ? 'ارسال رایگان در ربات' : 'Free Bot Service'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              
              <div 
                onClick={() => toggleAlert('tomanRate')}
                className="p-3 rounded-xl bg-black/40 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center ${alerts.tomanRate ? 'bg-cyan-500 text-slate-950' : 'border border-slate-600'}`}>
                    {alerts.tomanRate && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <div>
                    <span className="text-white font-bold block">{isFa ? 'هشدار نوسان شدید تتر/تومان' : 'USDT/IRT Volatility Alert'}</span>
                    <span className="text-[10px] text-slate-400">{isFa ? 'ارسال پیام هنگام نوسان بیش از ۲٪ در طول یک ساعت' : 'Alert on > 2% hourly swing'}</span>
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">{alerts.tomanRate ? (isFa ? 'فعال' : 'ON') : (isFa ? 'غیرفعال' : 'OFF')}</span>
              </div>

              <div 
                onClick={() => toggleAlert('lowGas')}
                className="p-3 rounded-xl bg-black/40 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center ${alerts.lowGas ? 'bg-cyan-500 text-slate-950' : 'border border-slate-600'}`}>
                    {alerts.lowGas && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <div>
                    <span className="text-white font-bold block">{isFa ? 'یادآور ساعات طلایی گس ارزان تهران' : 'Tehran Golden Hours Gas Alert'}</span>
                    <span className="text-[10px] text-slate-400">{isFa ? 'پیام خودکار در ساعت ۰۵:۰۰ صبح هنگام سقوط گس به زیر ۱۰ Gwei' : 'Ping when gas drops < 10 Gwei'}</span>
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">{alerts.lowGas ? (isFa ? 'فعال' : 'ON') : (isFa ? 'غیرفعال' : 'OFF')}</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right: Simulated Mobile Telegram Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div className="w-full max-w-[280px] rounded-[36px] p-3 bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-slate-700 shadow-2xl space-y-2">
            
            {/* Phone Speaker Notch */}
            <div className="flex justify-center mb-1">
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>

            {/* Telegram Header */}
            <div className="p-2.5 rounded-2xl bg-[#17212b] border border-cyan-500/20 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-cyan-400 bg-black">
                  <img src="/mascot/griffi-avatar.jpg" alt="Griffi" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-bold text-[11px] block text-white leading-tight">GriffinSwap Bot</span>
                  <span className="text-[9px] text-cyan-400">bot • verified</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">Telegram</span>
            </div>

            {/* Simulated Chat Messages */}
            <div className="p-2.5 rounded-2xl bg-[#0e1621] space-y-2 text-[11px] min-h-[220px]">
              
              <div className="p-2.5 rounded-xl bg-[#182533] text-slate-200 space-y-1 shadow">
                <span className="text-[10px] font-bold text-cyan-300 block">🦅 Griffi Assistant:</span>
                <p className="text-[10px] leading-relaxed">
                  سلام! نرخ لحظه‌ای تتر در بازار تهران ۹۳,۵۰۰ تومان است. می‌خواهید تترهای TON خود را به آربیتروم منتقل کنید؟
                </p>
                <span className="text-[8px] text-slate-400 block text-left">14:20</span>
              </div>

              <div className="p-2 rounded-xl bg-cyan-900/60 text-cyan-100 space-y-1 border border-cyan-500/30 text-right">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>⚡ سواپ سریع در مینی‌اپ</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </div>
                <div className="p-1.5 rounded-lg bg-black/40 font-mono text-[9px] text-center text-white">
                  25 TON ➔ 134.3 USDT
                </div>
              </div>

            </div>

            {/* Telegram WebApp Launch Bar */}
            <a
              href="https://t.me/GriffinSwapBot"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs text-center flex items-center justify-center gap-1.5 shadow"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
              <span>{isFa ? 'باز کردن مینی‌اپ تلگرام' : 'Open in Telegram'}</span>
            </a>

          </div>

          <span className="text-[10px] text-slate-400 mt-3 text-center">
            {isFa ? 'پشتیبانی از کیف‌پول‌های Tonkeeper و Telegram Wallet' : 'Supports Tonkeeper & Telegram Wallet'}
          </span>
        </div>

      </div>

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-6 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای تراکنش‌های مینی‌اپ و پل TON مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for Telegram mini app and TON bridge routes directly to verified treasury:'}
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
            {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
