import React, { useState, useRef, useEffect } from 'react';
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
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Gift, 
  Volume2, 
  VolumeX,
  GitFork,
  HelpCircle,
  Send,
  Coins,
  Users,
  Flame,
  CreditCard,
  Rocket,
  ChevronDown
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../services/tomanService';
import { isSoundMuted, setSoundMuted, playClickSound } from '../services/soundService';
import { AntiPhishingModal } from './AntiPhishingModal';

export type NavTab = 
  | 'swap' 
  | 'futures'
  | 'launchpad'
  | 'cards'
  | 'domains'
  | 'chart' 
  | 'arbitrage' 
  | 'routes'
  | 'dca' 
  | 'portfolio' 
  | 'earn' 
  | 'calculator' 
  | 'gold'
  | 'p2p'
  | 'gas' 
  | 'security' 
  | 'telegram'
  | 'loyalty';

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
  onOpenTour?: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
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
  onOpenTour,
  mobileMenuOpen: externalMobileMenuOpen,
  setMobileMenuOpen: externalSetMobileMenuOpen,
}) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const mobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setMobileMenuOpen = externalSetMobileMenuOpen !== undefined ? externalSetMobileMenuOpen : setInternalMobileMenuOpen;

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const [showAntiPhishingModal, setShowAntiPhishingModal] = useState<boolean>(false);
  const [antiPhishingPhrase, setAntiPhishingPhrase] = useState<string>(() => localStorage.getItem('griffi_antiphishing_phrase') || 'شیردال زرین');
  const [antiPhishingEmoji, setAntiPhishingEmoji] = useState<string>(() => localStorage.getItem('griffi_antiphishing_emoji') || '🦅🛡️');

  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playClickSound();
    }
  };

  const isFa = lang === 'fa';

  // Primary visible tabs in top bar (5 high-frequency actions)
  const primaryTabs = [
    { id: 'swap', label: isFa ? 'سواپ و بریج' : 'Swap & Bridge', icon: ArrowLeftRight },
    { id: 'futures', label: isFa ? 'فیوچرز' : 'Futures', icon: Flame, badge: '50x' },
    { id: 'launchpad', label: isFa ? 'لانچ‌پد' : 'Launchpad', icon: Rocket, badge: 'NEW' },
    { id: 'cards', label: isFa ? 'کارت‌های وب۳' : 'Web3 Cards', icon: CreditCard },
    { id: 'earn', label: isFa ? 'کسب سود' : 'Earn', icon: Percent },
  ];

  // Secondary tools categorized in "More" mega dropdown
  const moreCategories = [
    {
      titleFa: '📊 بازار و تحلیل',
      titleEn: '📊 Market & Tools',
      items: [
        { id: 'chart', labelFa: 'نمودار زنده و سنتیمنت', labelEn: 'Live Chart & Sentiment', icon: TrendingUp },
        { id: 'arbitrage', labelFa: 'دیدبان آربیتراژ صرافی‌ها', labelEn: 'Arbitrage Scanner', icon: Sparkles },
        { id: 'routes', labelFa: 'دیدبان پل‌ها و مسیرها', labelEn: 'Bridges & Routes', icon: GitFork },
        { id: 'calculator', labelFa: 'ماشین‌حساب نرخ تومان', labelEn: 'Toman Calculator', icon: Calculator },
        { id: 'gas', labelFa: 'رصد کارمزد شبکه (Gas)', labelEn: 'Gas Tracker', icon: Fuel },
      ]
    },
    {
      titleFa: '🪙 معاملات و دارایی',
      titleEn: '🪙 Assets & Trading',
      items: [
        { id: 'dca', labelFa: 'سفارشات پله‌ای و لیمیت', labelEn: 'DCA & Limit Orders', icon: Calendar },
        { id: 'gold', labelFa: 'صندوق طلا و حباب سکه', labelEn: 'Digital Gold & Seke', icon: Coins },
        { id: 'p2p', labelFa: 'اسکرو همتا‌به‌همتا (P2P)', labelEn: 'P2P Escrow', icon: Users },
        { id: 'portfolio', labelFa: 'تحلیل پورتفولیو و سود', labelEn: 'Portfolio Tracker', icon: Wallet },
      ]
    },
    {
      titleFa: '🛡️ اکوسیستم و امنیت',
      titleEn: '🛡️ Ecosystem & Security',
      items: [
        { id: 'domains', labelFa: 'دامنه‌های وب۳ (.griffi)', labelEn: '.griffi Web3 Domains', icon: Globe },
        { id: 'security', labelFa: 'امنیت و اسکن هانی‌پات', labelEn: 'Security & Honeypot', icon: ShieldCheck },
        { id: 'telegram', labelFa: 'درگاه تلگرام و TON', labelEn: 'Telegram & TON', icon: Send },
        { id: 'loyalty', labelFa: 'باشگاه پرهای گریفی (VIP)', labelEn: 'Griffi Pass & Rewards', icon: Gift },
      ]
    }
  ];

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isMoreActive = moreCategories.some(cat => cat.items.some(i => i.id === activeTab));

  return (
    <>
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 px-3 lg:px-6 py-2.5 ${
        isDarkMode 
          ? 'bg-[#100b24]/90 border-purple-500/20' 
          : 'bg-white/95 border-purple-200 shadow-sm'
      }`}>
        <div className="max-w-[1550px] mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Toman Ticker Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('swap')}
              className="flex items-center gap-2.5 text-right hover:opacity-90 transition-opacity"
            >
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl p-0.5 bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden ring-1 ring-amber-400/50">
                <img 
                  src="/mascot/griffi-avatar.jpg" 
                  alt="Griffi Mascot" 
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base lg:text-lg tracking-tight griffin-gradient-text leading-tight">
                  {isFa ? 'گریفین سواپ' : 'GriffinSwap'}
                </span>
                <span className="text-[10px] font-medium tracking-wide text-purple-400 dark:text-purple-300/80">
                  {isFa ? 'صرافی غیرمتمرکز کاربران ایرانی' : 'Cross-Chain DEX & Gateway'}
                </span>
              </div>
            </button>

            {/* Live Toman Rate Pill */}
            <div className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isDarkMode 
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-200' 
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}>
              <span className="text-[11px] font-sans font-medium text-slate-400">
                {isFa ? 'نرخ تتر:' : 'USDT:'}
              </span>
              <span className="font-bold text-amber-500 dark:text-amber-300">
                {toPersianDigits(formatToman(tomanRate))} {isFa ? 'ت' : 'T'}
              </span>
              <span className={`text-[10px] font-bold ${
                rateChange.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {rateChange}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (5 Primary + Mega Dropdown) */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border shrink-0 ${
            isDarkMode 
              ? 'bg-purple-950/30 border-purple-500/20' 
              : 'bg-purple-100/50 border-purple-200'
          }`}>
            {primaryTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Categorized "More Tools" Mega Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => {
                  playClickSound();
                  setMoreMenuOpen(!moreMenuOpen);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isMoreActive
                    ? 'bg-purple-700/60 text-white font-bold border border-purple-400/40'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{isFa ? 'سایر ابزارها' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Dropdown Panel */}
              {moreMenuOpen && (
                <div className={`absolute top-full mt-2 left-0 right-auto md:right-0 md:left-auto w-[680px] p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl z-50 animate-fade-in ${
                  isDarkMode 
                    ? 'bg-[#150e2e]/95 border-purple-500/40 shadow-purple-950/60 text-white' 
                    : 'bg-white/95 border-purple-200 shadow-xl text-slate-900'
                }`}>
                  <div className="grid grid-cols-3 gap-4">
                    {moreCategories.map((cat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-[11px] font-black text-amber-400 border-b border-purple-500/20 pb-1">
                          {isFa ? cat.titleFa : cat.titleEn}
                        </div>
                        <div className="space-y-1">
                          {cat.items.map((it) => {
                            const ItIcon = it.icon;
                            const isSelected = activeTab === it.id;
                            return (
                              <button
                                key={it.id}
                                onClick={() => {
                                  playClickSound();
                                  setActiveTab(it.id as NavTab);
                                  setMoreMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-right transition-all ${
                                  isSelected 
                                    ? 'bg-purple-600 text-white font-bold shadow' 
                                    : isDarkMode 
                                      ? 'text-slate-300 hover:text-white hover:bg-purple-900/40' 
                                      : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50'
                                }`}
                              >
                                <ItIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-purple-400'}`} />
                                <span className="truncate">{isFa ? it.labelFa : it.labelEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Bar (Always visible on desktop!) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Anti-Phishing Safety Code Button */}
            <button
              onClick={() => {
                playClickSound();
                setShowAntiPhishingModal(true);
              }}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDarkMode
                  ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'border-emerald-500/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={isFa ? 'کد اختصاصی ضد فیشینگ شما' : 'Your Anti-Phishing Passphrase'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono">{antiPhishingEmoji} {antiPhishingPhrase.length > 8 ? antiPhishingPhrase.slice(0, 8) + '...' : antiPhishingPhrase}</span>
            </button>

            {/* Guided Tour Trigger Button */}
            {onOpenTour && (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenTour();
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all shadow-sm ${
                  isDarkMode 
                    ? 'border-amber-400/50 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25' 
                    : 'border-amber-500/60 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
                title={isFa ? 'تور آموزشی تعاملی با گریفی' : 'Guided Tour with Griffi'}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'تور گریفی' : 'Tour'}</span>
              </button>
            )}

            {/* Unified Utility Capsule (Language, Theme, Sound FX) */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isDarkMode 
                ? 'bg-purple-950/40 border-purple-500/20' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              {/* Language Switch */}
              <button
                onClick={() => setLang(isFa ? 'en' : 'fa')}
                className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                    : 'text-slate-700 hover:text-purple-950 hover:bg-white'
                }`}
                title={isFa ? 'تغییر زبان به انگلیسی' : 'Switch Language to Persian'}
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-mono font-bold">{isFa ? 'EN' : 'فا'}</span>
              </button>

              <div className="w-[1px] h-3.5 bg-purple-500/20 my-auto" />

              {/* Dark / Light Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                    : 'text-slate-700 hover:text-purple-950 hover:bg-white'
                }`}
                title={isDarkMode ? 'حالت روشن' : 'حالت تاریک'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              <div className="w-[1px] h-3.5 bg-purple-500/20 my-auto" />

              {/* Sound FX Toggle */}
              <button
                onClick={handleToggleSound}
                className={`p-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                    : 'text-slate-700 hover:text-purple-950 hover:bg-white'
                }`}
                title={muted ? 'روشن کردن صدا' : 'بی‌صدا کردن'}
              >
                {muted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            </div>

            {/* Connect / Connected Wallet Button */}
            {walletAddress ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{shortenAddress(walletAddress)}</span>
              </button>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 hover:scale-105 active:scale-95 shrink-0"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>{isFa ? 'اتصال کیف پول' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-purple-950/40 border-purple-500/20 text-slate-300' 
                  : 'bg-purple-50 border-purple-200 text-slate-700'
              }`}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer with Categorized Sections */}
        {mobileMenuOpen && (
          <div className={`lg:hidden fixed inset-x-0 top-[65px] bottom-0 z-50 p-4 overflow-y-auto animate-fade-in ${
            isDarkMode ? 'bg-[#0f0924]/95 backdrop-blur-2xl text-white' : 'bg-white/98 text-slate-900 shadow-2xl'
          }`}>
            <div className="max-w-md mx-auto space-y-5 pb-16">
              
              {/* Primary Mobile Tabs */}
              <div className="space-y-1">
                <span className="text-[11px] font-black text-amber-400 block px-2">
                  {isFa ? '🚀 بخش‌های اصلی' : '🚀 Primary'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {primaryTabs.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          playClickSound();
                          setActiveTab(item.id as NavTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold text-right transition-all border ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-amber-400/50 shadow-md'
                            : isDarkMode
                              ? 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                              : 'bg-purple-50 border-purple-200 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categorized Mobile Menus */}
              {moreCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] font-black text-purple-400 dark:text-purple-300 block px-2">
                    {isFa ? cat.titleFa : cat.titleEn}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((it) => {
                      const ItIcon = it.icon;
                      const isActive = activeTab === it.id;
                      return (
                        <button
                          key={it.id}
                          onClick={() => {
                            playClickSound();
                            setActiveTab(it.id as NavTab);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs text-right transition-all border ${
                            isActive
                              ? 'bg-purple-600 text-white border-amber-400/50 font-bold shadow'
                              : isDarkMode
                                ? 'bg-purple-950/30 border-purple-500/20 text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <ItIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-purple-400'}`} />
                          <span className="truncate">{isFa ? it.labelFa : it.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Mobile Wallet & Action Section */}
              <div className="pt-3 border-t border-purple-500/20 space-y-2">
                {walletAddress ? (
                  <button
                    onClick={() => {
                      onDisconnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs"
                  >
                    {isFa ? 'قطع اتصال کیف پول' : 'Disconnect Wallet'} ({shortenAddress(walletAddress)})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onConnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg"
                  >
                    {isFa ? 'اتصال کیف پول' : 'Connect Wallet'}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Wallet Details Modal */}
      {showWalletModal && walletAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#150d2a] border-purple-500/30 text-white' : 'bg-white border-purple-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
              <span className="font-extrabold text-sm">{isFa ? 'کیف پول متصل' : 'Connected Wallet'}</span>
              <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-center font-mono text-xs text-amber-300 select-all break-all">
              {walletAddress}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  setShowWalletModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                {isFa ? 'کپی آدرس' : 'Copy'}
              </button>
              <button
                onClick={() => {
                  onDisconnectWallet();
                  setShowWalletModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs"
              >
                {isFa ? 'قطع اتصال' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Phishing Modal */}
      <AntiPhishingModal
        isOpen={showAntiPhishingModal}
        onClose={() => setShowAntiPhishingModal(false)}
        lang={lang}
        isDarkMode={isDarkMode}
        onSavePhrase={(phrase: string, emoji: string) => {
          setAntiPhishingPhrase(phrase);
          setAntiPhishingEmoji(emoji);
        }}
      />
    </>
  );
};
