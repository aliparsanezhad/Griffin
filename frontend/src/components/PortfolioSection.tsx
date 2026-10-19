import React, { useState } from 'react';
import { 
  Wallet, 
  Coins, 
  History, 
  Layers, 
  ExternalLink, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  Search,
  PieChart,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  TrendingUp,
  Sliders,
  Zap,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';
import { playClickSound } from '../services/soundService';
import { TaxExportModal } from './TaxExportModal';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface TokenItem {
  symbol: string;
  name: string;
  chain: string;
  balance: number;
  priceUsd: number;
  logo: string;
  color: string;
  hexColor: string;
}

interface TxItem {
  hash: string;
  type: 'swap' | 'transfer' | 'bridge';
  chain: string;
  fromToken: string;
  toToken?: string;
  amount: string;
  time: string;
  status: 'completed' | 'pending';
}

interface PortfolioProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  tomanRate: number;
  lang: 'fa' | 'en';
}

export const PortfolioSection: React.FC<PortfolioProps> = ({
  walletAddress,
  onConnectWallet,
  tomanRate,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeTab, setActiveTab] = useState<'tokens' | 'transactions' | 'rebalance'>('tokens');
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [showTaxModal, setShowTaxModal] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [pnlTimeframe, setPnlTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [rebalanceStrategy, setRebalanceStrategy] = useState<'balanced' | 'gold_hedge' | 'growth'>('gold_hedge');
  const [isRebalanceExecuting, setIsRebalanceExecuting] = useState<boolean>(false);
  const [rebalanceSuccess, setRebalanceSuccess] = useState<boolean>(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const currentAddress = searchAddress || walletAddress || '0x71C8705a2B88e3083feC7B58273683243354438F';
  const isDemo = !walletAddress && !searchAddress;

  // Portfolio token items
  const tokens: TokenItem[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      chain: "Ethereum",
      balance: 0.85,
      priceUsd: 3420.00,
      logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      color: "bg-indigo-500",
      hexColor: "#6366f1"
    },
    {
      symbol: "PAXG",
      name: "PAX Gold (طلای دیجیتال)",
      chain: "Ethereum",
      balance: 0.85,
      priceUsd: 2685.50,
      logo: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
      color: "bg-amber-400",
      hexColor: "#fbbf24"
    },
    {
      symbol: "USDT",
      name: "Tether USD (Arbitrum)",
      chain: "Arbitrum One",
      balance: 1450.5,
      priceUsd: 1.00,
      logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      color: "bg-emerald-500",
      hexColor: "#10b981"
    },
    {
      symbol: "ARB",
      name: "Arbitrum Token",
      chain: "Arbitrum One",
      balance: 1250.0,
      priceUsd: 0.88,
      logo: "https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png",
      color: "bg-cyan-500",
      hexColor: "#06b6d4"
    },
    {
      symbol: "BNB",
      name: "BNB Coin",
      chain: "BNB Chain",
      balance: 1.2,
      priceUsd: 590.00,
      logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      color: "bg-yellow-500",
      hexColor: "#eab308"
    },
    {
      symbol: "POL",
      name: "Polygon Ecosystem Token",
      chain: "Polygon",
      balance: 620.0,
      priceUsd: 0.45,
      logo: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
      color: "bg-purple-500",
      hexColor: "#a855f7"
    },
    {
      symbol: "SHIRDAL",
      name: "Shirdal Mythic (توکن بومی گریفین)",
      chain: "Arbitrum One",
      balance: 5000000,
      priceUsd: 0.0000485,
      logo: "/mascot/griffi-avatar.jpg",
      color: "bg-pink-500",
      hexColor: "#ec4899"
    }
  ];

  const transactions: TxItem[] = [
    {
      hash: "0x3f9a...88d2",
      type: "bridge",
      chain: "Arbitrum → Base",
      fromToken: "500 USDT",
      toToken: "500 USDC",
      amount: "$500.00",
      time: "۱۰ دقیقه پیش",
      status: "completed"
    },
    {
      hash: "0x88c1...12a9",
      type: "swap",
      chain: "Arbitrum One",
      fromToken: "0.25 ETH",
      toToken: "855 USDT",
      amount: "$855.00",
      time: "۲ ساعت پیش",
      status: "completed"
    },
    {
      hash: "0x12d4...99ea",
      type: "transfer",
      chain: "BNB Chain",
      fromToken: "0.5 BNB",
      amount: "$295.00",
      time: "دیروز",
      status: "completed"
    }
  ];

  const totalUsdValue = tokens.reduce((sum, t) => sum + (t.balance * t.priceUsd), 0);
  const totalTomanValue = usdToToman(totalUsdValue, tomanRate);

  // Historical PnL curves data
  const pnlData = {
    '7d': {
      values: [7420, 7550, 7480, 7690, 7820, 8010, totalUsdValue],
      changePct: '+9.7%',
      changeUsd: 720.50,
      labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'امروز']
    },
    '30d': {
      values: [6650, 6800, 6720, 7150, 7300, 7210, 7580, 7840, totalUsdValue],
      changePct: '+22.4%',
      changeUsd: 1490.50,
      labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'امروز']
    },
    '90d': {
      values: [5350, 5600, 5950, 6400, 6850, 7300, 7750, totalUsdValue],
      changePct: '+52.1%',
      changeUsd: 2790.50,
      labels: ['۳ ماه قبل', '۲ ماه قبل', '۱ ماه قبل', 'امروز']
    }
  };

  const currentPnl = pnlData[pnlTimeframe];
  const pnlToman = usdToToman(currentPnl.changeUsd, tomanRate);

  // SVG Chart path generation
  const chartHeight = 110;
  const chartWidth = 500;
  const minVal = Math.min(...currentPnl.values) * 0.96;
  const maxVal = Math.max(...currentPnl.values) * 1.04;
  const range = maxVal - minVal || 1;

  const points = currentPnl.values.map((v, idx) => {
    const x = (idx / (currentPnl.values.length - 1)) * chartWidth;
    const y = chartHeight - ((v - minVal) / range) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  // Donut chart calculations
  const donutRadius = 64;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedAngle = 0;

  // Gold & Seke parity
  const sekePriceToman = 54000000;
  const goldGramPriceToman = 4750000;
  const sekeEquiv = totalTomanValue / sekePriceToman;
  const goldGramEquiv = totalTomanValue / goldGramPriceToman;

  const handleRefresh = () => {
    playClickSound();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleExecuteRebalance = () => {
    playClickSound();
    setIsRebalanceExecuting(true);
    setTimeout(() => {
      setIsRebalanceExecuting(false);
      setRebalanceSuccess(true);
      setTimeout(() => setRebalanceSuccess(false), 4000);
    }, 1800);
  };

  const activeHoveredTokenData = tokens.find(t => t.symbol === hoveredToken);

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in space-y-6 text-right">
      
      {/* Header & Wallet Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight griffin-gradient-text">
            {isFa ? 'مدیریت دارایی‌ها و پرتفولیو' : 'Portfolio & Asset Manager'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isFa 
              ? 'نمایش جامع رمزارزها در تمام شبکه‌های بلاک‌چین با تبدیل همزمان به دلار و تومان و سیستم بازتعادل هوشمند' 
              : 'Multi-chain balances, transaction logs, PnL analytics, and Smart Rebalancer'}
          </p>
        </div>

        {/* Address Search / Wallet Connect */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder={isFa ? "جستجوی آدرس کیف پول..." : "Search wallet address..."}
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 pl-8 text-xs text-white font-mono focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />
          </div>

          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white transition-colors cursor-pointer"
            title={isFa ? 'بروزرسانی اطلاعات' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setShowTaxModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            title={isFa ? 'گزارش حسابداری و مالیاتی معاملات با معادل تومانی' : 'Tax & Accounting Statement'}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'گزارش سود/زیان تومانی' : 'Tax Statement'}</span>
          </button>

          {!walletAddress && (
            <button 
              onClick={() => {
                playClickSound();
                onConnectWallet();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isFa ? 'اتصال کیف پول' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Net Worth & Interactive SVG Donut + Historical Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Net Worth & Donut Allocation Card (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-purple-500/25 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Top row: Net worth metrics & address */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-300 tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'مجموع ارزش تخمینی پورتفولیو' : 'Total Portfolio Value'}</span>
                </span>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                    ≈ {isFa ? `${toPersianDigits(formatToman(totalTomanValue))} تومان` : `${formatToman(totalTomanValue, false)} T`}
                  </span>
                </div>
                {/* Gold Parity Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                    ≈ {sekeEquiv.toFixed(2)} {isFa ? 'سکه بهار آزادی' : 'Gold Coins'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
                    ≈ {goldGramEquiv.toFixed(1)} {isFa ? 'گرم طلای ۱۸' : 'g Gold'}
                  </span>
                </div>
              </div>

              {/* Monitored Address Card */}
              <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-xs space-y-1 min-w-[190px]">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>{isFa ? 'کیف‌پول رصدشده:' : 'Monitored:'}</span>
                  <span className="text-emerald-400 font-semibold">{isFa ? 'آنلاین' : 'Live'}</span>
                </div>
                <div className="font-mono text-purple-200 font-semibold text-[11px] truncate">
                  {currentAddress.slice(0, 8)}...{currentAddress.slice(-6)}
                </div>
                {isDemo && (
                  <span className="inline-block text-[10px] text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold">
                    {isFa ? 'دمو پیش‌فرض' : 'Demo Mode'}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Donut + Asset Breakdown */}
            <div className="pt-4 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* SVG Donut Chart (5 Cols) */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#1e1035"
                      strokeWidth="16"
                    />
                    {tokens.map((token) => {
                      const usdVal = token.balance * token.priceUsd;
                      const pct = totalUsdValue > 0 ? usdVal / totalUsdValue : 0;
                      const strokeDash = pct * donutCircumference;
                      const strokeOffset = -accumulatedAngle * donutCircumference;
                      accumulatedAngle += pct;
                      const isSelected = hoveredToken === token.symbol;

                      return (
                        <circle
                          key={token.symbol}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke={token.hexColor}
                          strokeWidth={isSelected ? "20" : "16"}
                          strokeDasharray={`${strokeDash} ${donutCircumference - strokeDash}`}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 cursor-pointer hover:opacity-100"
                          opacity={hoveredToken && !isSelected ? 0.35 : 0.9}
                          onMouseEnter={() => setHoveredToken(token.symbol)}
                          onMouseLeave={() => setHoveredToken(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Centered Dynamic Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                    {activeHoveredTokenData ? (
                      <>
                        <span className="text-[11px] font-bold text-slate-300">{activeHoveredTokenData.symbol}</span>
                        <span className="text-sm font-black text-white font-mono">
                          ${(activeHoveredTokenData.balance * activeHoveredTokenData.priceUsd).toLocaleString('en-US', { maximumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] font-mono text-purple-300">
                          {(((activeHoveredTokenData.balance * activeHoveredTokenData.priceUsd) / totalUsdValue) * 100).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <PieChart className="w-5 h-5 text-purple-400 mb-0.5" />
                        <span className="text-[10px] text-slate-400 font-bold">{isFa ? 'سبد دارایی' : 'Allocation'}</span>
                        <span className="text-xs font-black text-amber-400 font-mono">۷ ارز</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Token Percent Badges Legend (7 Cols) */}
              <div className="sm:col-span-7 grid grid-cols-2 gap-2 text-xs">
                {tokens.map((token) => {
                  const usdVal = token.balance * token.priceUsd;
                  const pct = totalUsdValue > 0 ? (usdVal / totalUsdValue) * 100 : 0;
                  const isHovered = hoveredToken === token.symbol;

                  return (
                    <div
                      key={token.symbol}
                      onMouseEnter={() => setHoveredToken(token.symbol)}
                      onMouseLeave={() => setHoveredToken(null)}
                      className={`p-2 rounded-xl transition-all border cursor-pointer flex items-center justify-between ${
                        isHovered 
                          ? 'bg-purple-900/40 border-purple-400 shadow-md' 
                          : 'bg-purple-950/30 border-purple-500/10 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${token.color}`} />
                        <span className="font-bold text-white text-[11px] truncate">{token.symbol}</span>
                      </div>
                      <span className="font-mono font-bold text-purple-200 text-[11px]">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Bottom Allocation Bar */}
          <div className="mt-4 pt-3 border-t border-purple-500/15">
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex">
              {tokens.map((token) => {
                const usdVal = token.balance * token.priceUsd;
                const percent = totalUsdValue > 0 ? (usdVal / totalUsdValue) * 100 : 0;
                return (
                  <div
                    key={token.symbol}
                    className={`${token.color} h-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                    title={`${token.symbol}: ${percent.toFixed(1)}%`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Historical Net Worth PnL Sparkline Card (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-purple-500/25 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">
                    {isFa ? 'روند رشد و سود/زیان' : 'Net Worth Performance'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {isFa ? 'عملکرد تاریخی سبد رمزارزی' : 'Historical portfolio PnL'}
                  </span>
                </div>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 bg-purple-950/60 p-1 rounded-xl border border-purple-500/20 text-[11px]">
                {(['7d', '30d', '90d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      playClickSound();
                      setPnlTimeframe(tf);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      pnlTimeframe === tf 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf === '7d' ? (isFa ? '۷ روز' : '7D') : tf === '30d' ? (isFa ? '۳۰ روز' : '30D') : (isFa ? '۹۰ روز' : '90D')}
                  </button>
                ))}
              </div>
            </div>

            {/* PnL Gains Indicator */}
            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isFa ? 'بازدهی کل دوره:' : 'Period Return:'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {currentPnl.changePct}
                  </span>
                  <span className="text-xs text-emerald-300 font-mono">
                    (+${currentPnl.changeUsd.toLocaleString()})
                  </span>
                </div>
              </div>
              <div className="text-left font-mono">
                <span className="text-[11px] text-slate-400 block">{isFa ? 'معادل سود تومانی:' : 'Toman Equivalent:'}</span>
                <span className="text-sm font-bold text-amber-300">
                  +{isFa ? `${toPersianDigits(formatToman(pnlToman))} تومان` : `${formatToman(pnlToman, false)} T`}
                </span>
              </div>
            </div>

            {/* Glowing SVG Area Line Chart */}
            <div className="w-full relative h-32 rounded-2xl bg-purple-950/30 border border-purple-500/15 p-2 overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#pnlGradient)" />
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {currentPnl.values.map((v, i) => {
                  const x = (i / (currentPnl.values.length - 1)) * chartWidth;
                  const y = chartHeight - ((v - minVal) / range) * (chartHeight - 20) - 10;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#10b981"
                      className="hover:r-5 transition-all stroke-2 stroke-purple-950"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between items-center">
              <span className="text-slate-400">{isFa ? 'سپر تورم ریالی:' : 'Inflation Guard:'}</span>
              <span className="font-bold text-amber-300 font-mono">۹۸.۴٪</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between items-center">
              <span className="text-slate-400">{isFa ? 'ضریب نقدشوندگی:' : 'Liquidity Tier:'}</span>
              <span className="font-bold text-emerald-400 font-mono">سطح A+</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('tokens');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tokens'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{isFa ? 'رمزارزها و موجودی' : 'Tokens & Balances'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
            {tokens.length}
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('transactions');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isFa ? 'تاریخچه تراکنش‌ها' : 'Transactions'}</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('rebalance');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rebalance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>{isFa ? 'بازتعادل هوشمند سبد' : 'Smart Rebalance'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            AI PRO
          </span>
        </button>
      </div>

      {/* Tokens Table */}
      {activeTab === 'tokens' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-950/40 text-purple-300 font-bold border-b border-purple-500/20">
                <tr>
                  <th className="p-3.5">{isFa ? 'دارایی' : 'Asset'}</th>
                  <th className="p-3.5">{isFa ? 'شبکه' : 'Network'}</th>
                  <th className="p-3.5">{isFa ? 'موجودی' : 'Balance'}</th>
                  <th className="p-3.5">{isFa ? 'قیمت واحد' : 'Unit Price'}</th>
                  <th className="p-3.5">{isFa ? 'ارزش دلاری' : 'USD Value'}</th>
                  <th className="p-3.5">{isFa ? 'ارزش تومانی' : 'Toman Value'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-slate-200">
                {tokens.map((token) => {
                  const usdVal = token.balance * token.priceUsd;
                  const tomanVal = usdToToman(usdVal, tomanRate);
                  return (
                    <tr key={token.symbol} className="hover:bg-purple-900/20 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                          <div>
                            <span className="font-bold text-white block">{token.symbol}</span>
                            <span className="text-[10px] text-slate-400">{token.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/20 text-[10px] font-medium text-purple-300">
                          {token.chain}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        {token.balance.toLocaleString()} {token.symbol}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        ${token.priceUsd.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-300">
                        {isFa ? `${toPersianDigits(formatToman(tomanVal))} تومان` : `${formatToman(tomanVal, false)} T`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-950/40 text-purple-300 font-bold border-b border-purple-500/20">
                <tr>
                  <th className="p-3.5">{isFa ? 'نوع تراکنش' : 'Type'}</th>
                  <th className="p-3.5">{isFa ? 'شبکه' : 'Network'}</th>
                  <th className="p-3.5">{isFa ? 'جزئیات' : 'Details'}</th>
                  <th className="p-3.5">{isFa ? 'ارزش' : 'Value'}</th>
                  <th className="p-3.5">{isFa ? 'زمان' : 'Age'}</th>
                  <th className="p-3.5">{isFa ? 'هش تراکنش' : 'Tx Hash'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-purple-900/20 transition-colors">
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 font-bold text-purple-300">
                        {tx.type === 'bridge' ? <Layers className="w-3.5 h-3.5 text-amber-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{tx.chain}</td>
                    <td className="p-3.5 font-mono font-semibold text-white">
                      {tx.fromToken} {tx.toToken ? `→ ${tx.toToken}` : ''}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{tx.amount}</td>
                    <td className="p-3.5 text-slate-400">{tx.time}</td>
                    <td className="p-3.5 font-mono text-purple-400">
                      <a href={`https://arbiscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                        <span>{tx.hash}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rebalance Tab Content */}
      {activeTab === 'rebalance' && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  {isFa ? 'دستیار هوشمند بازتعادل سبد دارایی (Smart Portfolio Rebalancer)' : 'Smart Portfolio Rebalancer'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isFa 
                  ? 'تنظیم خودکار وزن رمزارزها جهت کاهش ریسک تورم ریالی، بهینه‌سازی سود و حفظ ارزش سرمایه' 
                  : 'Automated weight optimization to hedge Rial devaluation and optimize returns'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">{isFa ? 'وضعیت موتور هوش‌مصنوعی:' : 'AI Engine:'}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{isFa ? 'فعال و برخط' : 'Active & Optimal'}</span>
              </span>
            </div>
          </div>

          {/* Strategy Presets */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2.5">
              {isFa ? 'انتخاب استراتژی هدف بازتعادل:' : 'Select Target Strategy:'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setRebalanceStrategy('gold_hedge');
                }}
                className={`p-4 rounded-xl text-right transition-all border cursor-pointer ${
                  rebalanceStrategy === 'gold_hedge'
                    ? 'bg-amber-500/15 border-amber-400/80 shadow-lg shadow-amber-500/10'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-amber-300">
                    {isFa ? '🛡️ سپر طلای ضد تورم' : '🛡️ Gold Inflation Shield'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                    {isFa ? 'پیشنهادی ایران' : 'Recommended'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa ? '۴۰٪ طلا (PAXG) + ۳۰٪ تتر + ۲۰٪ اتریوم + ۱۰٪ آلت‌کوین برای حداکثر مقابله با تورم ریالی' : '40% PAXG Gold + 30% USDT + 20% ETH + 10% Other'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setRebalanceStrategy('balanced');
                }}
                className={`p-4 rounded-xl text-right transition-all border cursor-pointer ${
                  rebalanceStrategy === 'balanced'
                    ? 'bg-purple-600/20 border-purple-400/80 shadow-lg shadow-purple-600/10'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-purple-200">
                    {isFa ? '⚖️ رشد متعادل وب۳' : '⚖️ Balanced Web3 Alpha'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa ? '۳۵٪ اتریوم + ۲۵٪ تتر + ۲۰٪ طلا + ۱۰٪ آربیتروم + ۱۰٪ شیردال برای سود متوازن' : '35% ETH + 25% USDT + 20% PAXG + 10% ARB + 10% SHIRDAL'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setRebalanceStrategy('growth');
                }}
                className={`p-4 rounded-xl text-right transition-all border cursor-pointer ${
                  rebalanceStrategy === 'growth'
                    ? 'bg-cyan-500/20 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-cyan-300">
                    {isFa ? '🚀 تهاجمی لایه‌دوم' : '🚀 Layer-2 Growth'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa ? '۵۰٪ اتریوم + ۲۵٪ آربیتروم + ۱۵٪ شیردال + ۱۰٪ تتر برای حداکثر بازدهی در بول‌مارکت' : '50% ETH + 25% ARB + 15% SHIRDAL + 10% USDT'}
                </p>
              </button>

            </div>
          </div>

          {/* Current vs Target Allocation Comparison */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/15 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">
              {isFa ? 'مقایسه وضعیت فعلی با درصد بهینه هدف:' : 'Current vs Target Allocation Comparison:'}
            </h4>

            <div className="space-y-2.5">
              {[
                { 
                  token: 'PAXG (طلا)', 
                  current: 28.1, 
                  target: rebalanceStrategy === 'gold_hedge' ? 40.0 : rebalanceStrategy === 'balanced' ? 20.0 : 0.0, 
                  color: 'bg-amber-400' 
                },
                { 
                  token: 'ETH (اتریوم)', 
                  current: 35.8, 
                  target: rebalanceStrategy === 'gold_hedge' ? 20.0 : rebalanceStrategy === 'balanced' ? 35.0 : 50.0, 
                  color: 'bg-indigo-500' 
                },
                { 
                  token: 'USDT (تتر)', 
                  current: 17.9, 
                  target: rebalanceStrategy === 'gold_hedge' ? 30.0 : rebalanceStrategy === 'balanced' ? 25.0 : 10.0, 
                  color: 'bg-emerald-500' 
                },
                { 
                  token: 'ARB / دیگران', 
                  current: 18.2, 
                  target: rebalanceStrategy === 'gold_hedge' ? 10.0 : rebalanceStrategy === 'balanced' ? 20.0 : 40.0, 
                  color: 'bg-cyan-500' 
                },
              ].map((row) => {
                const delta = row.target - row.current;
                return (
                  <div key={row.token} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span className="font-bold text-white">{row.token}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-slate-400">{isFa ? 'فعلی:' : 'Cur:'} {row.current}%</span>
                        <ArrowRight className="w-3 h-3 text-purple-400 rotate-180" />
                        <span className="text-purple-200 font-bold">{isFa ? 'هدف:' : 'Tgt:'} {row.target}%</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          delta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex">
                      <div className={`${row.color} h-full`} style={{ width: `${Math.min(100, row.current)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Planned Rebalance Actions */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-2.5">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'تراکنش‌های پیشنهادی بازتعادل خودکار:' : 'Recommended Auto-Rebalance Steps:'}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/30 border border-purple-500/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px]">۱</span>
                  <span className="text-slate-200">{isFa ? 'تبدیل ۰.۱۲ اتریوم به ۴۱۰ تتر (Arbitrum)' : 'Swap 0.12 ETH to 410 USDT'}</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">بدون اسلیپیج</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/30 border border-purple-500/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px]">۲</span>
                  <span className="text-slate-200">{isFa ? 'خرید ۰.۳۵ PAXG با تتر (Ethereum)' : 'Buy 0.35 PAXG with USDT'}</span>
                </div>
                <span className="text-amber-400 font-mono text-[11px] font-bold">سپر طلا</span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {rebalanceSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs animate-fade-in font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {isFa 
                  ? 'عملیات بازتعادل با موفقیت شبیه‌سازی و در سبد ثبت شد! کارمزد ۰.۵٪ به خزانه‌داری اختصاص یافت.' 
                  : 'Rebalance executed successfully! 0.5% protocol fee routed to verified treasury.'}
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              {isFa ? '⚡ بدون نیاز به محاسبات دستی، با کمترین کارمزد گس شبکه‌ای' : '⚡ Single-click rebalancing with optimal gas routing'}
            </span>

            <button
              onClick={handleExecuteRebalance}
              disabled={isRebalanceExecuting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isRebalanceExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isFa ? 'در حال اجرای بازتعادل...' : 'Executing Rebalance...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isFa ? 'اجرای بازتعادل هوشمند سبد دارایی' : 'Execute Smart Rebalance'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verified Protocol Treasury Fee Guarantee */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-right">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            {isFa 
              ? 'کارمزد پروتکل گریفین‌سواپ در تمام معاملات پورتفولیو (۰.۵٪) مستقیماً به خزانه‌داری رسمی واریز می‌گردد:' 
              : 'Platform protocol fee (0.5%) routes directly to verified treasury:'}
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

      {/* Tax & Portfolio PnL Accounting Modal */}
      <TaxExportModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        tomanRate={tomanRate}
        walletAddress={walletAddress}
        lang={lang}
      />
    </div>
  );
};
