import React, { useState } from 'react';
import { 
  Heart, 
  ExternalLink, 
  HelpCircle,
  X,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Flame,
  Rocket,
  CreditCard,
  Wallet,
  Activity,
  Bot
} from 'lucide-react';
import type { NavTab } from './Navbar';
import { playClickSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface FooterProps {
  lang: 'fa' | 'en';
  setActiveTab?: (tab: NavTab) => void;
  isDarkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  lang, 
  setActiveTab,
  isDarkMode = true 
}) => {
  const isFa = lang === 'fa';
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleNavClick = (tab: NavTab) => {
    playClickSound();
    if (setActiveTab) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className={`w-full border-t transition-colors mt-20 pt-12 pb-24 lg:pb-12 px-4 lg:px-8 text-xs ${
      isDarkMode 
        ? 'bg-[#0a0718] border-purple-500/20 text-slate-400' 
        : 'bg-white border-purple-200 text-slate-600 shadow-xl'
    }`}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Section: Brand + 4 Column Feature Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Vision (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-3.5 text-right">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-2 ring-amber-400/60 shadow-lg shadow-purple-500/20 shrink-0">
                <img 
                  src="/mascot/griffi-avatar.jpg" 
                  alt="Griffi Shirdal Mascot" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="font-black text-base md:text-lg text-white griffin-gradient-text tracking-tight">
                {isFa ? 'گریفین سواپ | GriffinSwap' : 'GriffinSwap 2.0'}
              </span>
            </div>

            <p className={`text-xs leading-relaxed max-w-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa 
                ? 'پل نقدینگی و صرافی غیرمتمرکز، چندزنجیره‌ای و ضدتحریم؛ طراحی شده برای جامعه وب۳، رمزارز و سرمایه‌گذاران فارسی‌زبان با همراهی گریفی، بچه شیردال هوشمند.'
                : 'Premier decentralized, non-custodial cross-chain liquidity aggregator engineered for Iranian and global Web3 users with 58+ supported networks.'}
            </p>

            {/* Infrastructure Health Status Pill */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono ${
              isDarkMode ? 'bg-purple-950/40 border-purple-500/25 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{isFa ? '۵۸ شبکه آنلاین • رله‌های بدون فیلتر فعال' : '58 Chains Online • Censorship-Free RPCs'}</span>
            </div>
          </div>

          {/* Col 1: Products & Trading */}
          <div className="space-y-2.5 text-right">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 block">
              {isFa ? '🚀 معاملات و سواپ' : '🚀 Trading'}
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => handleNavClick('swap')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{isFa ? 'سواپ سریع و بدون گس' : 'Fast Cross-Chain Swap'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('futures')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>{isFa ? 'فیوچرز دائمی اهرم ۵۰x' : '50x Perpetual Futures'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('launchpad')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Rocket className="w-3 h-3 text-amber-300" />
                  <span>{isFa ? 'لانچ‌پد و ریخته‌گری توکن' : 'Fair Token Launchpad'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('dca')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{isFa ? 'خرید پله‌ای (DCA) و لیمیت' : 'DCA & Limit Orders'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('arbitrage')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>{isFa ? 'رادار آربیتراژ نوبیتکس' : 'Nobitex Arbitrage Radar'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Web3 FinTech */}
          <div className="space-y-2.5 text-right">
            <span className="text-[11px] font-black tracking-wider uppercase text-purple-400 block">
              {isFa ? '💳 ابزارهای مالی وب۳' : '💳 Web3 FinTech'}
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => handleNavClick('cards')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-3 h-3 text-pink-400" />
                  <span>{isFa ? 'مسترکارت و گیفت‌کارت وب۳' : 'Web3 Debit Cards & Subs'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('domains')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>{isFa ? 'دامنه‌های دائمی (.griffi)' : 'Griffin Domains (.griffi)'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('gold')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign className="w-3 h-3 text-amber-400" />
                  <span>{isFa ? 'هجینگ طلای دیجیتال (PAXG)' : 'Digital Gold Hedging'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('earn')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{isFa ? 'استخرهای سود حلال دیفای' : 'Halal DeFi Earn Vaults'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('calculator')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Wallet className="w-3 h-3 text-purple-400" />
                  <span>{isFa ? 'ماشین‌حساب زنده تتر/تومان' : 'Live Toman Calculator'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Ecosystem */}
          <div className="space-y-2.5 text-right">
            <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400 block">
              {isFa ? '🛡️ امنیت و جامعه' : '🛡️ Security & Community'}
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => handleNavClick('security')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{isFa ? 'هاب امنیتی و سرورهای RPC' : 'Security Hub & Fast RPCs'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('loyalty')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isFa ? 'باشگاه وفاداری پرهای گریفی' : 'Griffi Feathers Loyalty'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('telegram')} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span>{isFa ? 'بات و مینی‌اپ تلگرام' : 'Telegram Bot & Mini App'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowAboutModal(true)} 
                  className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3 h-3 text-purple-400" />
                  <span>{isFa ? 'درباره پروژه گریفین' : 'About GriffinSwap'}</span>
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com/aliparsanezhad/Griffin" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Verified Protocol Treasury Transparency Card */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          isDarkMode 
            ? 'bg-purple-950/30 border-purple-500/25 text-slate-300' 
            : 'bg-purple-50/80 border-purple-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-3 text-right">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-white">
                  {isFa ? 'خزانه رسمی پروتکل گریفین سواپ (۱۰۰٪ کارمزدها):' : 'Verified Protocol Treasury:'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  0.5% Protocol Fee
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFa 
                  ? 'تمام درآمدهای پروتکل به صورت شفاف و غیرحضانتی مستقیماً به این قرارداد هوشمند واریز می‌گردد.' 
                  : 'All protocol commissions route transparently to this audited multi-chain smart contract.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <code className="px-3 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-amber-300 select-all">
              {COMMISSION_WALLET}
            </code>
            <button
              onClick={handleCopyWallet}
              className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition-all hover:scale-105 active:scale-95"
              title={isFa ? 'کپی آدرس خزانه' : 'Copy Treasury Address'}
            >
              {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="View on Etherscan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Persian Community Note */}
        <div className="pt-6 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} GriffinSwap Protocol. {isFa ? 'کلیه حقوق محفوظ و تحت مجوز MIT منتشر شده است.' : 'All rights reserved under MIT license.'}
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span>{isFa ? 'طراحی و توسعه‌یافته با عشق برای جامعه وب۳ ایران' : 'Engineered with love for the Iranian Web3 community'}</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          </div>
        </div>

      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-right">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative transition-all ${
            isDarkMode 
              ? 'bg-[#120c24] border-purple-500/30 text-slate-200 shadow-purple-950/60' 
              : 'bg-white border-purple-200 text-slate-800'
          }`}>
            <button 
              onClick={() => {
                playClickSound();
                setShowAboutModal(false);
              }}
              className="absolute top-5 left-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/80 shadow-xl bg-purple-600/30 flex items-center justify-center shrink-0">
                <img src="/mascot/griffi-wave.jpg" alt="Griffi Mascot" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-black text-white text-base md:text-lg">
                  {isFa ? 'درباره پروژه گریفین سواپ (GriffinSwap)' : 'About GriffinSwap'}
                </h3>
                <span className="text-xs text-amber-300 font-medium block">
                  {isFa ? 'همراه با گریفی، نماد شیردال باستانی و نگهبان هوشمند وب۳ 🦅' : 'With Griffi, the mythical baby Persian griffin mascot'}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <p>
                گریفین سواپ (شیردال) یک پلتفرم مبادله غیرمتمرکز، چندزنجیره‌ای و ضدتحریم است که با هدف ارتقای دسترسی آزاد هموطنان و کاربران فارسی‌زبان به امور مالی غیرمتمرکز (DeFi) توسعه داده شده است.
              </p>
              <p>
                با تجمیع نقدینگی برترین پروتکل‌های جهان نظیر Across Protocol، Stargate، Uniswap و برترین شبکه‌های لایه دو، گریفین سواپ امکان انتقال بدون گس و بدون احراز هویت دارایی‌ها را میان ۵۸ شبکه بلاک‌چین با کمترین کارمزد ممکن فراهم می‌آورد.
              </p>
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-[11px] text-slate-300 space-y-1.5 font-mono">
                <div className="font-bold text-amber-300 font-sans">{isFa ? 'آدرس رسمی خزانه پروتکل و تجمیع کارمزدها:' : 'Official Protocol Treasury:'}</div>
                <div className="text-purple-200 select-all text-xs break-all bg-black/40 p-2 rounded-xl border border-purple-500/20">{COMMISSION_WALLET}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {isFa 
                    ? '🔒 گریفین سواپ کاملاً غیرحضانتی (Non-Custodial) است؛ هیچ نهادی کلید خصوصی یا دارایی‌های شما را کنترل نمی‌کند.'
                    : '🔒 Non-custodial: You retain 100% control over private keys.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setShowAboutModal(false);
              }}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              {isFa ? 'متوجه شدم (بستن پنجره)' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
