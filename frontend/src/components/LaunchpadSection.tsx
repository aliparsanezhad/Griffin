import React, { useState } from 'react';
import { 
  Rocket, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  Copy, 
  Check, 
  CheckCircle2,
  Activity,
  Clock,
  Users,
  Share2,
  Crown
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound, playSwapStartSound, playSwapSuccessSound, playAnvilForgeSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface LaunchpadSectionProps {
  tomanRate: number;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

interface LaunchpadToken {
  id: string;
  name: string;
  nameFa: string;
  symbol: string;
  creator: string;
  marketCapUsd: number;
  progressPercent: number;
  bondingTargetUsd: number;
  holdersCount: number;
  priceUsd: number;
  change24h: number;
  descriptionFa: string;
  descriptionEn: string;
  chain: string;
  chainIcon: string;
  isHalalVerified: boolean;
  isGraduated?: boolean;
}

interface RecentTrade {
  id: string;
  type: 'buy' | 'sell';
  amountUsdt: number;
  tokensAmount: string;
  wallet: string;
  timeAgoFa: string;
  timeAgoEn: string;
}

const INITIAL_TOKENS: LaunchpadToken[] = [
  {
    id: 'shirdal',
    name: 'Shirdal Mythic Token',
    nameFa: 'توکن اسطوره‌ای شیردال',
    symbol: 'SHIRDAL',
    creator: '0x71C8...438F',
    marketCapUsd: 48500,
    progressPercent: 70.3,
    bondingTargetUsd: 69000,
    holdersCount: 412,
    priceUsd: 0.0000485,
    change24h: 34.8,
    descriptionFa: 'توکن نمادین حامیان اکوسیستم گریفین؛ بدون پیش‌فروش با قفل خودکار نقدینگی در صرافی.',
    descriptionEn: 'Flagship community token of Griffin ecosystem with 100% fair launch and LP burn.',
    chain: 'Arbitrum One',
    chainIcon: '🔷',
    isHalalVerified: true,
  },
  {
    id: 'tomanx',
    name: 'TomanX Yield Shield',
    nameFa: 'تومان‌ایکس سپر تورم',
    symbol: 'TOMANX',
    creator: '0x328A...991A',
    marketCapUsd: 69000,
    progressPercent: 100,
    bondingTargetUsd: 69000,
    holdersCount: 1280,
    priceUsd: 0.000108,
    change24h: 18.2,
    descriptionFa: 'فارغ‌التحصیل شده از باندینگ کرو! نقدینگی ۱۲،۰۰۰ دلاری در یونی‌سواپ قفل و سوزانده شد.',
    descriptionEn: 'Graduated to Uniswap DEX! $12,000 LP permanently locked and burned.',
    chain: 'Arbitrum One',
    chainIcon: '🔷',
    isHalalVerified: true,
    isGraduated: true,
  },
  {
    id: 'saffron',
    name: 'Khorasan Saffron Real Asset',
    nameFa: 'زعفران قائنات وب۳',
    symbol: 'SAFFRON',
    creator: '0x99A1...B210',
    marketCapUsd: 29400,
    progressPercent: 42.6,
    bondingTargetUsd: 69000,
    holdersCount: 198,
    priceUsd: 0.0000294,
    change24h: 12.4,
    descriptionFa: 'توکن غیرمتمرکز متصل به زعفران صادراتی قائنات؛ سود حاصل از صادرات میان هولدرها توزیع می‌شود.',
    descriptionEn: 'RWA-backed community initiative sharing agricultural export rewards.',
    chain: 'Base',
    chainIcon: '🔵',
    isHalalVerified: true,
  },
  {
    id: 'zagros',
    name: 'Zagros Cyber Guild',
    nameFa: 'گیلد سایبری زاگرس',
    symbol: 'ZAGROS',
    creator: '0x45D1...E882',
    marketCapUsd: 14200,
    progressPercent: 20.5,
    bondingTargetUsd: 69000,
    holdersCount: 94,
    priceUsd: 0.0000142,
    change24h: -3.2,
    descriptionFa: 'جامعه توسعه‌دهندگان قراردادهای هوشمند و زیرساخت‌های ضدسانسور وب۳ در ایران.',
    descriptionEn: 'Decentralized guild funding anti-censorship tools and developer bounties.',
    chain: 'Polygon',
    chainIcon: '🟣',
    isHalalVerified: true,
  },
];

export const LaunchpadSection: React.FC<LaunchpadSectionProps> = ({
  tomanRate,
  lang,
  isDarkMode = true,
}) => {
  const isFa = lang === 'fa';
  const [tokens, setTokens] = useState<LaunchpadToken[]>(INITIAL_TOKENS);
  const [selectedToken, setSelectedToken] = useState<LaunchpadToken>(INITIAL_TOKENS[0]);
  const [filter, setFilter] = useState<'all' | 'graduated' | 'bonding'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trade state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmountUsd, setTradeAmountUsd] = useState<string>('25');
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareToken = (symbol: string) => {
    navigator.clipboard.writeText(`https://griffinswap.io/#launchpad?token=${symbol}&treasury=${COMMISSION_WALLET}`);
    setCopiedShare(true);
    playClickSound();
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Recent Live Trades Feed
  const [trades, setTrades] = useState<RecentTrade[]>([
    { id: 't1', type: 'buy', amountUsdt: 125, tokensAmount: '+2.57M', wallet: '0x89A...41b', timeAgoFa: '۲۵ ثانیه پیش', timeAgoEn: '25s ago' },
    { id: 't2', type: 'buy', amountUsdt: 50, tokensAmount: '+1.03M', wallet: '0x3Fc...92c', timeAgoFa: '۱ دقیقه پیش', timeAgoEn: '1m ago' },
    { id: 't3', type: 'sell', amountUsdt: 25, tokensAmount: '-515K', wallet: '0x71C...438', timeAgoFa: '۳ دقیقه پیش', timeAgoEn: '3m ago' },
    { id: 't4', type: 'buy', amountUsdt: 250, tokensAmount: '+5.14M', wallet: '0x44B...19e', timeAgoFa: '۵ دقیقه پیش', timeAgoEn: '5m ago' },
  ]);

  // New Token Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescFa, setNewDescFa] = useState('');
  const [newChain, setNewChain] = useState('Arbitrum One');
  const [newCategory, setNewCategory] = useState<'meme' | 'utility' | 'culture' | 'ai'>('culture');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const filteredTokens = tokens.filter((t) => {
    if (filter === 'graduated' && !t.isGraduated) return false;
    if (filter === 'bonding' && t.isGraduated) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.nameFa.includes(q)
    );
  });

  const numAmount = parseFloat(tradeAmountUsd) || 0;
  const tomanValue = usdToToman(numAmount, tomanRate);
  const tokenQuantity = selectedToken.priceUsd > 0 ? numAmount / selectedToken.priceUsd : 0;
  const marketCapToman = usdToToman(selectedToken.marketCapUsd, tomanRate);

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    playAnvilForgeSound();
    playSwapStartSound();

    setTimeout(() => {
      playSwapSuccessSound();
      setTradeSuccess(true);

      // Dynamically calculate bonding curve growth
      const addedMarketCap = tradeType === 'buy' ? numAmount : -Math.min(numAmount, selectedToken.marketCapUsd * 0.1);
      const newMarketCap = Math.max(1000, selectedToken.marketCapUsd + addedMarketCap);
      const newProgress = Math.min(100, parseFloat(((newMarketCap / selectedToken.bondingTargetUsd) * 100).toFixed(1)));
      const priceMultiplier = 1 + (tradeType === 'buy' ? 0.025 : -0.015);
      const newPrice = parseFloat((selectedToken.priceUsd * priceMultiplier).toFixed(8));
      const isGraduated = newProgress >= 100;

      const updatedToken: LaunchpadToken = {
        ...selectedToken,
        marketCapUsd: Math.round(newMarketCap),
        progressPercent: newProgress,
        priceUsd: newPrice,
        holdersCount: tradeType === 'buy' ? selectedToken.holdersCount + 1 : selectedToken.holdersCount,
        change24h: parseFloat((selectedToken.change24h + (tradeType === 'buy' ? 2.4 : -1.8)).toFixed(1)),
        isGraduated,
      };

      setSelectedToken(updatedToken);
      setTokens(tokens.map((t) => (t.id === updatedToken.id ? updatedToken : t)));

      // Prepend trade into live feed
      const newTrade: RecentTrade = {
        id: `trade-${Date.now()}`,
        type: tradeType,
        amountUsdt: numAmount,
        tokensAmount: `${tradeType === 'buy' ? '+' : '-'}${(tokenQuantity / 1000000).toFixed(2)}M`,
        wallet: '0x71C...438F (شما)',
        timeAgoFa: 'چند لحظه پیش',
        timeAgoEn: 'Just now'
      };
      setTrades([newTrade, ...trades.slice(0, 4)]);

      setTimeout(() => setTradeSuccess(false), 3000);
    }, 900);
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newName) return;
    setIsCreating(true);
    playAnvilForgeSound();
    playSwapStartSound();

    setTimeout(() => {
      const newToken: LaunchpadToken = {
        id: newSymbol.toLowerCase(),
        name: newName,
        nameFa: newName,
        symbol: newSymbol.toUpperCase(),
        creator: '0x71C8...438F (شما)',
        marketCapUsd: 5000,
        progressPercent: 7.2,
        bondingTargetUsd: 69000,
        holdersCount: 1,
        priceUsd: 0.000005,
        change24h: 100,
        descriptionFa: newDescFa || 'توکن تازه متولد شده در سکوی پرتاب گریفی با نقدینگی قفل‌شده و ضد راگ‌پول.',
        descriptionEn: 'Fair launch meme & utility token created via Griffin Launchpad.',
        chain: newChain,
        chainIcon: newChain === 'Arbitrum One' ? '🔷' : newChain === 'Base' ? '🔵' : '🟣',
        isHalalVerified: true,
      };

      setTokens([newToken, ...tokens]);
      setSelectedToken(newToken);
      setIsCreating(false);
      setCreateSuccessMsg(true);
      playSwapSuccessSound();
      setTimeout(() => {
        setCreateSuccessMsg(false);
        setShowCreateModal(false);
        setNewSymbol('');
        setNewName('');
        setNewDescFa('');
      }, 2000);
    }, 1200);
  };

  // SVG Geometry for Exponential Bonding Curve
  const curveWidth = 320;
  const curveHeight = 90;
  const padX = 20;
  const padY = 15;
  const progressClamped = Math.min(100, Math.max(0, selectedToken.progressPercent));
  
  // Point on curve: x from padX to curveWidth - padX
  const currentX = padX + (progressClamped / 100) * (curveWidth - 2 * padX);
  // Quadratic exponential growth y from curveHeight - padY to padY
  const normProgress = progressClamped / 100;
  const currentY = (curveHeight - padY) - (Math.pow(normProgress, 1.8) * (curveHeight - 2 * padY));

  return (
    <div className="w-full space-y-6">
      
      {/* Hero Banner: Griffi Token Alchemist & Blacksmith */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1b1035] via-[#150d2e] to-[#0d081f] border-purple-500/30' 
          : 'bg-gradient-to-br from-purple-100 via-amber-50 to-indigo-100 border-purple-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Text & Pitch */}
          <div className="space-y-3 text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'سکوی پرتاب و ریخته‌گری توکن‌های وب۳' : 'Fair Launch & Token Foundry'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black griffin-gradient-text">
              {isFa ? 'لانچ‌پد عادلانه گریفی (Fair Launchpad)' : 'Griffin Fair Launchpad'}
            </h1>

            <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {isFa
                ? 'توکن یا میم‌کوین پروژه خود را بدون نیاز به سرمایه اولیه و در امنیت ۱۰۰٪ بسازید! مکانیزم باندینگ کرو (Bonding Curve) با قفل خودکار نقدینگی، مانع از راگ‌پول و کلاهبرداری شده و پس از تکمیل، توکن به استخر رسمی صرافی منتقل می‌شود.'
                : 'Deploy fair launch meme and community tokens with zero upfront liquidity. Automatic bonding curve protects investors from rug-pulls.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>{isFa ? 'ساخت توکن جدید (۱۰ تتر)' : 'Deploy New Token ($10)'}</span>
              </button>

              <div className={`px-3 py-2 rounded-2xl border text-[11px] font-mono flex items-center gap-2 ${
                isDarkMode ? 'bg-purple-950/40 border-purple-500/30 text-slate-300' : 'bg-white/80 border-purple-200 text-slate-700'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'کارمزد خزانه پروتکل: ۰.۵٪' : 'Protocol Commission: 0.5%'}</span>
              </div>
            </div>
          </div>

          {/* 3D Mascot: Griffi the Token Alchemist */}
          <div className="relative shrink-0 w-44 h-44 md:w-56 md:h-56 rounded-3xl overflow-hidden ring-2 ring-amber-400/50 shadow-2xl shadow-purple-600/30">
            <img 
              src="/mascot/griffi-launchpad.jpg" 
              alt="Griffi the Token Alchemist" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 inset-x-2 text-center text-[10px] font-bold text-amber-300 bg-purple-950/80 backdrop-blur-md py-1 rounded-xl border border-amber-400/30">
              {isFa ? 'گریفی آهنگر و کیمیاگر توکن‌ها 🪙✨' : 'Griffi the Token Smith 🪙✨'}
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Token Explorer & Live Bonding Curve Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left/Main Column: Token List & Bonding Curve Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Filter Tabs */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border w-full sm:w-auto ${
              isDarkMode ? 'bg-purple-950/40 border-purple-500/30' : 'bg-purple-100/70 border-purple-200'
            }`}>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isFa ? 'همه توکن‌ها' : 'All'}
              </button>
              <button
                onClick={() => setFilter('bonding')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  filter === 'bonding'
                    ? 'bg-purple-600 text-white shadow'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'در حال پر شدن' : 'Bonding'}</span>
              </button>
              <button
                onClick={() => setFilter('graduated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  filter === 'graduated'
                    ? 'bg-purple-600 text-white shadow'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? 'فارغ‌التحصیل صرافی' : 'Graduated'}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isFa ? 'جستجوی نماد یا نام توکن...' : 'Search symbol or name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-9 pl-3 py-2 rounded-2xl text-xs border focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-purple-950/40 border-purple-500/30 text-white focus:border-amber-400' 
                    : 'bg-white border-purple-200 text-slate-900 focus:border-purple-500'
                }`}
              />
            </div>
          </div>

          {/* Token Cards Grid */}
          <div className="space-y-3">
            {filteredTokens.map((token) => {
              const isSelected = selectedToken.id === token.id;
              const mcToman = usdToToman(token.marketCapUsd, tomanRate);

              return (
                <div
                  key={token.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedToken(token);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? isDarkMode 
                        ? 'bg-purple-900/40 border-amber-400/60 shadow-lg shadow-purple-600/20' 
                        : 'bg-purple-50 border-purple-500 shadow-md'
                      : isDarkMode
                        ? 'bg-purple-950/30 border-purple-500/20 hover:bg-purple-900/30'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md ring-1 ring-amber-400/40 shrink-0">
                        {token.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{token.symbol}</span>
                          <span className="text-[11px] text-purple-300 font-medium">{token.nameFa}</span>
                          <span className="text-xs">{token.chainIcon}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {isFa ? 'سازنده: ' : 'Creator: '} {token.creator}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="text-xs font-bold text-white">
                        ${token.priceUsd < 0.001 ? token.priceUsd.toFixed(7) : token.priceUsd.toFixed(4)}
                      </div>
                      <div className={`text-[11px] font-bold ${token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                    {isFa ? token.descriptionFa : token.descriptionEn}
                  </p>

                  {/* Bonding Curve Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">
                        {isFa ? 'پیشرفت تکمیل نقدینگی و مهاجرت:' : 'Bonding Curve Progress:'}
                      </span>
                      <span className="font-mono font-bold text-amber-300">
                        {token.progressPercent}% {token.isGraduated && '🎓'}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-purple-950 border border-purple-500/30 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          token.isGraduated 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(token.progressPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                      <span>{isFa ? 'ارزش بازار: ' : 'Market Cap: '} <strong className="text-purple-200 font-mono">${token.marketCapUsd.toLocaleString()}</strong> ({toPersianDigits(formatToman(mcToman))} ت)</span>
                      <span>{toPersianDigits(token.holdersCount)} {isFa ? 'هولدر' : 'Holders'}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Live Trading, Interactive Bonding Curve & Recent Trades (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className={`p-5 rounded-3xl border sticky top-20 overflow-hidden relative ${
            isDarkMode ? 'cyber-gradient-card border-purple-500/35 backdrop-blur-xl neon-glow-purple shadow-2xl' : 'bg-white border-purple-200 shadow-xl'
          }`}>
            {/* Top Laser Accent Line */}
            <div className="laser-line -mx-5 -mt-5 mb-4" />
            
            {/* Header of selected token */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-amber-300">{selectedToken.symbol}</span>
                <span className="text-xs text-slate-400">{selectedToken.nameFa}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareToken(selectedToken.symbol)}
                  className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-500/20 text-xs flex items-center gap-1 cursor-pointer transition-all"
                  title="اشتراک‌گذاری توکن"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="text-[10px] hidden sm:inline">{copiedShare ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'اشتراک' : 'Share')}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isFa ? 'حلال و ضد راگ‌پول' : 'Anti-Rug Certified'}</span>
                </div>
              </div>
            </div>

            {/* Interactive Visual SVG Bonding Curve */}
            <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 mb-3 space-y-1.5 text-right">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-white flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'منحنی هوشمند باندینگ کرو (P = k · S²):' : 'Live Bonding Curve:'}</span>
                </span>
                <span className="text-amber-300 font-mono text-[10px]">
                  {selectedToken.progressPercent}% / $69,000
                </span>
              </div>

              {/* Curve Graphic */}
              <div className="relative w-full h-20 flex items-center justify-center">
                <svg viewBox={`0 0 ${curveWidth} ${curveHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="70%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>

                  {/* Curve line */}
                  <path 
                    d={`M ${padX} ${curveHeight - padY} Q ${curveWidth * 0.6} ${curveHeight - padY} ${curveWidth - padX} ${padY}`} 
                    fill="none" 
                    stroke="url(#curveGlow)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />

                  {/* Graduation Goal Node */}
                  <circle cx={curveWidth - padX} cy={padY} r="5" fill="#10b981" stroke="#34d399" strokeWidth="2" />
                  <text x={curveWidth - padX} y={padY - 8} textAnchor="end" fontSize="9" fill="#34d399" fontWeight="bold">
                    🎓 Uniswap Burn ($69K)
                  </text>

                  {/* Current Token Position Marker */}
                  <circle cx={currentX} cy={currentY} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1 border-t border-purple-500/10">
                <span>استارت: $5,000</span>
                <span className="text-emerald-400 font-bold">تکمیل: قفل نقدینگی ۱۲،۰۰۰$ در دکس</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                <span className="text-slate-400 text-[10px] block">{isFa ? 'ارزش کل (تومان):' : 'MCap Toman:'}</span>
                <span className="font-bold text-purple-200 text-xs">{toPersianDigits(formatToman(marketCapToman))} ت</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                <span className="text-slate-400 text-[10px] block">{isFa ? 'وضعیت باندینگ:' : 'Bonding Status:'}</span>
                <span className="font-bold text-amber-300 text-xs">{selectedToken.progressPercent}% {isFa ? 'تکمیل' : 'Filled'}</span>
              </div>
            </div>

            {/* 4-Stage Milestone Roadmap */}
            <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 mb-3 space-y-2 text-right">
              <span className="text-[11px] font-bold text-slate-300 block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'مراحل تکاملی باندینگ کرو تا صرافی:' : 'Curve Milestones to Uniswap:'}</span>
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  {selectedToken.progressPercent >= 100 ? (isFa ? 'فارغ‌التحصیل 🎓' : 'Graduated') : (isFa ? 'مرحله ۲ از ۴' : 'Stage 2/4')}
                </span>
              </span>

              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <span className="block font-bold">۱. ریخته‌گری</span>
                  <span className="text-[8px] text-emerald-400/80">تکمیل ✓</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  selectedToken.progressPercent > 0 
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 font-bold' 
                    : 'bg-purple-950/30 border-purple-500/20 text-slate-400'
                }`}>
                  <span className="block">۲. باندینگ</span>
                  <span className="text-[8px]">{selectedToken.progressPercent}%</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  selectedToken.marketCapUsd >= 30000 
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 font-bold' 
                    : 'bg-purple-950/30 border-purple-500/20 text-slate-400'
                }`}>
                  <span className="block">۳. قله پادشاه</span>
                  <span className="text-[8px]">$30k+</span>
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  selectedToken.isGraduated 
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-bold' 
                    : 'bg-purple-950/30 border-purple-500/20 text-slate-400'
                }`}>
                  <span className="block">۴. دکس یونی</span>
                  <span className="text-[8px]">$69k</span>
                </div>
              </div>
            </div>

            {/* Fair Holder Distribution Safety Meter */}
            <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 mb-3 space-y-1.5 text-right text-xs">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" />
                  <span>{isFa ? 'توزیع امن هولدرها و نبود ریسک نهنگ:' : 'Anti-Whale Distribution:'}</span>
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">{isFa ? 'امنیت ۱۰۰٪' : 'Safe Tier'}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: '65%' }} title="Bonding Curve: 65%" />
                <div className="bg-purple-500 h-full" style={{ width: '31%' }} title="Community: 31%" />
                <div className="bg-amber-400 h-full" style={{ width: '4%' }} title="Creator: 4%" />
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>استخر باندینگ (۶۵٪)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>جامعه ({selectedToken.holdersCount} نفر - ۳۱٪)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>سازنده (۴٪)</span>
                </span>
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="flex gap-2 p-1 bg-purple-950/60 rounded-xl mb-3 border border-purple-500/20">
              <button
                type="button"
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'buy'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'خرید توکن (Buy)' : 'Buy'}
              </button>
              <button
                type="button"
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'sell'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFa ? 'فروش توکن (Sell)' : 'Sell'}
              </button>
            </div>

            {/* Trade Form */}
            <form onSubmit={handleTrade} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {isFa ? 'مقدار پرداختی (تتر USDT):' : 'Amount (USDT):'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={tradeAmountUsd}
                    onChange={(e) => setTradeAmountUsd(e.target.value)}
                    className="w-full bg-purple-950/70 border border-purple-500/30 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    placeholder="25"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-300">
                    USDT
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                  <span>≈ {toPersianDigits(formatToman(tomanValue))} تومان</span>
                  <div className="flex gap-1">
                    {['10', '25', '50', '100'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTradeAmountUsd(amt)}
                        className="px-1.5 py-0.5 rounded bg-purple-900/40 text-[10px] hover:bg-purple-800 text-purple-200"
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimated token output */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs space-y-1 font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span>{isFa ? 'دریافتی تخمینی:' : 'Estimated Output:'}</span>
                  <span className="font-bold text-amber-300">
                    {tokenQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[10px]">
                  <span>{isFa ? 'کارمزد پروتکل (خزانه ۰.۵٪):' : 'Platform Fee (0.5%):'}</span>
                  <span className="text-emerald-400 font-bold">${(numAmount * 0.005).toFixed(3)} USDT</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-black text-xs md:text-sm text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                  tradeType === 'buy'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-600/30'
                }`}
              >
                {tradeType === 'buy' 
                  ? (isFa ? `خرید فوری ${selectedToken.symbol}` : `Instant Buy ${selectedToken.symbol}`)
                  : (isFa ? `فروش ${selectedToken.symbol}` : `Sell ${selectedToken.symbol}`)
                }
              </button>

              {tradeSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isFa ? 'تراکنش با موفقیت در شبکه ثبت شد!' : 'Transaction executed successfully!'}</span>
                </div>
              )}
            </form>

            {/* Live Recent Trades Stream */}
            <div className="mt-4 pt-3 border-t border-purple-500/20">
              <span className="text-[11px] font-bold text-slate-300 block mb-2 text-right flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isFa ? 'جریان زنده معاملات توکن (Live Trades):' : 'Recent Token Trades:'}</span>
              </span>

              <div className="space-y-1.5 text-[10px] font-mono">
                {trades.map((tr) => (
                  <div 
                    key={tr.id}
                    className="p-1.5 rounded-lg bg-black/30 border border-purple-500/10 flex items-center justify-between text-right"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${tr.type === 'buy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {tr.type === 'buy' ? (isFa ? 'خرید' : 'BUY') : (isFa ? 'فروش' : 'SELL')}
                      </span>
                      <span className="text-white font-bold">{tr.tokensAmount}</span>
                      <span className="text-slate-400 font-mono text-[9px]">{tr.wallet}</span>
                    </div>

                    <div className="text-left">
                      <span className="text-amber-300 font-bold block">${tr.amountUsdt}</span>
                      <span className="text-slate-500 text-[8px] block">{isFa ? tr.timeAgoFa : tr.timeAgoEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Commission Wallet & Anti-Rug Assurance */}
            <div className="mt-3 pt-2 border-t border-purple-500/20 text-[10px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>{isFa ? 'آدرس رسمی خزانه پروتکل:' : 'Treasury Wallet:'}</span>
                <button
                  onClick={handleCopyWallet}
                  className="font-mono text-purple-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  title="کپی آدرس خزانه"
                >
                  <span>0xD9C1...A2D3</span>
                  {copiedWallet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[10px] text-slate-300 leading-relaxed text-right">
                {isFa 
                  ? '🔒 امنیت باندینگ کرو: به محض رسیدن ارزش به ۶۹،۰۰۰ دلار، ۱۲،۰۰۰ دلار نقدینگی در صرافی واریز شده و توکن‌های LP برای همیشه سوزانده می‌شوند.'
                  : '🔒 Once $69,000 threshold is reached, $12,000 liquidity is migrated to Uniswap and LP is burned.'}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Create New Token */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative ${
            isDarkMode ? 'bg-[#150e2e] border-purple-500/40' : 'bg-white border-purple-200'
          }`}>
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base griffin-gradient-text">
                  {isFa ? 'ساخت توکن جدید در لانچ‌پد گریفی' : 'Deploy New Token on Griffin'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1 text-right">
                  {isFa ? 'نام توکن (مثلاً: Persepolis Coin):' : 'Token Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: پرسپولیس وب۳"
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-right"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1 text-right">
                  {isFa ? 'نماد اختصاری توکن (Symbol - حداکثر ۶ حرف):' : 'Symbol (Max 6 letters):'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="SHIRDAL"
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-slate-300 font-bold block mb-1 text-right">
                  {isFa ? 'دسته‌بندی توکن:' : 'Category:'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'culture', labelFa: 'فرهنگی/ملی', labelEn: 'Culture' },
                    { id: 'meme', labelFa: 'میم‌کوین', labelEn: 'Meme' },
                    { id: 'utility', labelFa: 'کاربردی', labelEn: 'Utility' },
                    { id: 'ai', labelFa: 'هوش مصنوعی', labelEn: 'AI & Bot' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                        newCategory === cat.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                          : 'bg-purple-950/40 text-slate-300 border-purple-500/20'
                      }`}
                    >
                      {isFa ? cat.labelFa : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1 text-right">
                  {isFa ? 'شبکه بلاک‌چین اولیه:' : 'Target Blockchain:'}
                </label>
                <select
                  value={newChain}
                  onChange={(e) => setNewChain(e.target.value)}
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-right"
                >
                  <option value="Arbitrum One">Arbitrum One (کمترین کارمزد - پیشنهادی)</option>
                  <option value="Base">Base (کوین‌بیس)</option>
                  <option value="Polygon">Polygon (پالیگان)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1 text-right">
                  {isFa ? 'توضیحات معرفی و اهداف پروژه (فارسی/انگلیسی):' : 'Project Description:'}
                </label>
                <textarea
                  rows={2}
                  value={newDescFa}
                  onChange={(e) => setNewDescFa(e.target.value)}
                  placeholder="درباره ایده، اعضای کامیونیتی و کاربرد توکن خود بنویسید..."
                  className="w-full bg-purple-950/60 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 leading-relaxed text-right"
                />
              </div>

              {/* Anti-Rug & Commission Note */}
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-[11px] leading-relaxed space-y-1.5 text-right">
                <div className="flex items-center justify-between font-bold">
                  <span>{isFa ? 'ضمانت راستی‌آزمایی و خزانه‌داری:' : 'Griffin Assurance & Treasury:'}</span>
                  <span className="font-mono text-emerald-400">{isFa ? 'گس تخمینی: < $0.05' : 'Gas: < $0.05'}</span>
                </div>
                <p>
                  {isFa 
                    ? 'هزینه ساخت توکن ۱۰ تتر است که مستقیماً به آدرس خزانه‌داری رسمی (0xD9C1...A2D3) واریز می‌شود. هیچ توکنی برای تیم پیش‌تولید نخواهد شد و ۱۰۰٪ توکن‌ها در استخر باندینگ کرو برای عموم عرضه می‌شود.'
                    : 'Creation fee is $10 sent directly to official treasury (0xD9C1...A2D3). 100% of tokens are minted directly into the public bonding curve pool.'}
                </p>
                <div className="pt-1 border-t border-amber-400/20 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate max-w-[280px]">0xD9C10B10945D85396f0838EA045587a25FD2A2D3</span>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="p-1 rounded hover:bg-white/10 text-amber-300 shrink-0 cursor-pointer"
                    title={isFa ? 'کپی آدرس' : 'Copy'}
                  >
                    {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isCreating 
                  ? (isFa ? 'گریفی در حال ریخته‌گری توکن... 🪙' : 'Forging Token with Griffi... 🪙')
                  : (isFa ? 'تایید و ساخت توکن (۱۰ USDT)' : 'Confirm & Deploy Token ($10)')
                }
              </button>

              {createSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                  {isFa ? 'توکن با موفقیت در شبکه ساخته و عرضه شد!' : 'Token successfully deployed to bonding curve!'}
                </div>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
