import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Wallet, 
  Percent, 
  Calculator, 
  Fuel, 
  ShieldCheck, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';

export type NavTab = 'swap' | 'portfolio' | 'earn' | 'calculator' | 'gas' | 'security';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  tomanRate: number;
  rateChange: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  lang: 'fa' | 'en';
  setLang: (l: 'fa' | 'en') => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tomanRate,
  rateChange,
  isDarkMode,
  setIsDarkMode,
  lang,
  setLang,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const isFa = lang === 'fa';

  const navItems = [
    { id: 'swap', label: isFa ? 'سواپ و بریج' : 'Swap & Bridge', icon: ArrowLeftRight },
    { id: 'portfolio', label: isFa ? 'پرتفولیو' : 'Portfolio', icon: Wallet },
    { id: 'earn', label: isFa ? 'کسب سود' : 'Earn', icon: Percent },
    { id: 'calculator', label: isFa ? 'ماشین‌حساب تتر' : 'Toman Calc', icon: Calculator },
    { id: 'gas', label: isFa ? 'کارمزد شبکه' : 'Gas Tracker', icon: Fuel },
    { id: 'security', label: isFa ? 'راهنمای ضدتحریم' : 'Anti-Censorship', icon: ShieldCheck },
  ];

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 px-3 lg:px-8 py-2.5 ${
        isDarkMode 
          ? 'bg-[#100b24]/85 border-purple-500/20' 
          : 'bg-white/85 border-purple-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('swap')}
              className="flex items-center gap-2.5 text-right hover:opacity-90 transition-opacity"
            >
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl p-1 bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <img src="/logo.png" alt="Griffin" className="w-7 h-7 lg:w-8 lg:h-8 object-contain rounded-lg drop-shadow" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base lg:text-lg tracking-tight griffin-gradient-text">
                  {isFa ? 'گریفین سواپ' : 'GriffinSwap'}
                </span>
                <span className={`text-[10px] font-medium tracking-wide ${isDarkMode ? 'text-purple-300/80' : 'text-purple-700'}`}>
                  {isFa ? 'صرافی غیرمتمرکز کاربران ایرانی' : 'Cross-Chain DEX for Iran'}
                </span>
              </div>
            </button>

            {/* Live Tether/Toman Ticker Pill */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-inner border ${
              isDarkMode 
                ? 'bg-purple-950/40 border-purple-500/30 text-slate-200' 
                : 'bg-purple-50 border-purple-200 text-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa ? 'نرخ تتر:' : 'USDT:'}
              </span>
              <span className="font-bold text-amber-500">
                {isFa ? `${toPersianDigits(formatToman(tomanRate, false))} ت` : `${formatToman(tomanRate, false)} T`}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold px-1 rounded bg-emerald-500/10">
                {rateChange}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border ${
            isDarkMode 
              ? 'bg-purple-950/30 border-purple-500/20' 
              : 'bg-purple-100/50 border-purple-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* Language Switch */}
            <button
              onClick={() => setLang(isFa ? 'en' : 'fa')}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                isDarkMode 
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300 hover:text-white' 
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
              }`}
              title="تغییر زبان / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-purple-500" />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300 hover:text-white' 
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-slate-700'
              }`}
              title={isDarkMode ? 'حالت روشن' : 'حالت تاریک'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
            </button>

            {/* Wallet Button */}
            {walletAddress ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-bold transition-all shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{shortenAddress(walletAddress)}</span>
              </button>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'اتصال کیف پول' : 'Connect'}</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-purple-950/40 border-purple-500/20 text-slate-300' 
                  : 'bg-purple-50 border-purple-200 text-slate-700'
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-purple-500/20 pb-2 space-y-1 animate-fade-in">
            <div className={`flex md:hidden items-center justify-between px-3 py-2 mb-2 rounded-xl border text-xs ${
              isDarkMode ? 'bg-purple-950/50 border-purple-500/20' : 'bg-purple-50 border-purple-200'
            }`}>
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                {isFa ? 'نرخ تتر (تومان):' : 'USDT/IRT:'}
              </span>
              <span className="font-bold text-amber-500">
                {isFa ? `${toPersianDigits(formatToman(tomanRate, false))} ت` : `${formatToman(tomanRate, false)} T`}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as NavTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                        : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Wallet Details Modal */}
      {showWalletModal && walletAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'glass-panel border-purple-500/30' : 'glass-panel-light border-purple-200'
          }`}>
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 left-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {isFa ? 'کیف پول متصل است' : 'Wallet Connected'}
                </h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isFa ? 'غیرحضانتی و امن' : 'Active & Protected'}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border mb-4 break-all font-mono text-xs ${
              isDarkMode ? 'bg-purple-950/50 border-purple-500/20 text-slate-200' : 'bg-purple-50 border-purple-200 text-slate-800'
            }`}>
              {walletAddress}
            </div>

            <div className="flex gap-2">
              <a
                href={`https://etherscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isFa ? 'اکسپلورر' : 'Explorer'}</span>
              </a>
              <button
                onClick={() => {
                  onDisconnectWallet();
                  setShowWalletModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
              >
                {isFa ? 'قطع اتصال' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
