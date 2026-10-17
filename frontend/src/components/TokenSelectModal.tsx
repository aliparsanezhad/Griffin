import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Check, 
  ShieldCheck, 
  Coins
} from 'lucide-react';
import { playClickSound } from '../services/soundService';
import { toPersianDigits, formatToman } from '../services/tomanService';

export interface TokenItem {
  symbol: string;
  name: string;
  chain: string;
  chainId: number;
  priceUsd: number;
  logo: string;
  category: 'popular' | 'stable' | 'l2' | 'gold' | 'defi';
  address?: string;
  isPopularInIran?: boolean;
}

export const EXTENDED_TOKENS: TokenItem[] = [
  // Stablecoins & Popular in Iran
  { symbol: "USDT", name: "Tether USD", chain: "Arbitrum One", chainId: 42161, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png", category: "popular", isPopularInIran: true },
  { symbol: "USDT", name: "Tether USD", chain: "BNB Chain", chainId: 56, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png", category: "popular", isPopularInIran: true },
  { symbol: "USDT", name: "Tether USD", chain: "Polygon", chainId: 137, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png", category: "popular", isPopularInIran: true },
  { symbol: "USDC", name: "USD Coin", chain: "Base", chainId: 8453, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png", category: "stable", isPopularInIran: true },
  { symbol: "USDC", name: "USD Coin", chain: "Arbitrum One", chainId: 42161, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png", category: "stable", isPopularInIran: true },
  { symbol: "DAI", name: "Dai Stablecoin", chain: "Ethereum", chainId: 1, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png", category: "stable" },
  { symbol: "USDe", name: "Ethena USDe", chain: "Ethereum", chainId: 1, priceUsd: 1.00, logo: "https://assets.coingecko.com/coins/images/35348/large/ethena.png", category: "stable" },

  // Digital Gold (Crucial hedge for Iranian investors)
  { symbol: "PAXG", name: "PAX Gold (۱ اونس طلا)", chain: "Ethereum", chainId: 1, priceUsd: 2650.00, logo: "https://assets.coingecko.com/coins/images/9519/large/paxg.png", category: "gold", isPopularInIran: true },
  { symbol: "XAUT", name: "Tether Gold", chain: "Ethereum", chainId: 1, priceUsd: 2648.00, logo: "https://assets.coingecko.com/coins/images/10481/large/Tether_Gold.png", category: "gold", isPopularInIran: true },

  // Bluechips & Layer 1/2
  { symbol: "ETH", name: "Ethereum", chain: "Ethereum", chainId: 1, priceUsd: 3420.00, logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", category: "popular", isPopularInIran: true },
  { symbol: "WETH", name: "Wrapped Ether", chain: "Arbitrum One", chainId: 42161, priceUsd: 3420.00, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png", category: "l2" },
  { symbol: "BTC", name: "Bitcoin (WBTC)", chain: "Arbitrum One", chainId: 42161, priceUsd: 68450.00, logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", category: "popular", isPopularInIran: true },
  { symbol: "ARB", name: "Arbitrum", chain: "Arbitrum One", chainId: 42161, priceUsd: 0.88, logo: "https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png", category: "l2", isPopularInIran: true },
  { symbol: "OP", name: "Optimism", chain: "Optimism", chainId: 10, priceUsd: 1.75, logo: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png", category: "l2" },
  { symbol: "POL", name: "Polygon Ecosystem", chain: "Polygon", chainId: 137, priceUsd: 0.45, logo: "https://assets.coingecko.com/coins/images/4713/large/polygon.png", category: "l2", isPopularInIran: true },
  { symbol: "BNB", name: "BNB Coin", chain: "BNB Chain", chainId: 56, priceUsd: 590.00, logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", category: "popular", isPopularInIran: true },
  { symbol: "SOL", name: "Solana", chain: "Solana", chainId: 1151111081099710, priceUsd: 178.60, logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png", category: "popular", isPopularInIran: true },
  { symbol: "AVAX", name: "Avalanche", chain: "Avalanche", chainId: 43114, priceUsd: 28.50, logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", category: "popular" },

  // Telegram Ecosystem (Huge in Iran)
  { symbol: "TON", name: "Toncoin", chain: "Ethereum (Bridge)", chainId: 1, priceUsd: 5.40, logo: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png", category: "popular", isPopularInIran: true },
  { symbol: "NOT", name: "Notcoin", chain: "BNB Chain (W)", chainId: 56, priceUsd: 0.0082, logo: "https://assets.coingecko.com/coins/images/36850/large/notcoin.png", category: "popular", isPopularInIran: true },
  { symbol: "DOGS", name: "DOGS Community", chain: "BNB Chain (W)", chainId: 56, priceUsd: 0.00075, logo: "https://assets.coingecko.com/coins/images/39849/large/dogs.png", category: "popular", isPopularInIran: true },

  // DeFi Yield Tokens
  { symbol: "AAVE", name: "Aave Token", chain: "Arbitrum One", chainId: 42161, priceUsd: 155.00, logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png", category: "defi" },
  { symbol: "UNI", name: "Uniswap", chain: "Ethereum", chainId: 1, priceUsd: 8.20, logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png", category: "defi" },
  { symbol: "PENDLE", name: "Pendle Finance", chain: "Arbitrum One", chainId: 42161, priceUsd: 4.65, logo: "https://assets.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png", category: "defi" },

  // Native Griffin Ecosystem
  { symbol: "SHIRDAL", name: "Shirdal Mythic (توکن بومی گریفین)", chain: "Arbitrum One", chainId: 42161, priceUsd: 0.0000485, logo: "/mascot/griffi-avatar.jpg", category: "popular", isPopularInIran: true },
];

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: TokenItem) => void;
  selectedTokenSymbol: string;
  lang: 'fa' | 'en';
  isDarkMode: boolean;
  userBalances?: Record<string, number>;
  tomanRate?: number;
}

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  selectedTokenSymbol,
  lang,
  isDarkMode,
  userBalances,
  tomanRate,
}) => {
  const isFa = lang === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'stable' | 'l2' | 'gold' | 'defi'>('all');

  const categories = [
    { id: 'all', labelFa: 'همه', labelEn: 'All' },
    { id: 'popular', labelFa: '🔥 محبوب در ایران', labelEn: '🔥 Popular in Iran' },
    { id: 'stable', labelFa: '💵 استیبل‌کوین‌ها', labelEn: '💵 Stablecoins' },
    { id: 'gold', labelFa: '🥇 طلای دیجیتال', labelEn: '🥇 Digital Gold' },
    { id: 'l2', labelFa: '⚡ شبکه‌های لایه ۲', labelEn: '⚡ Layer 2s' },
    { id: 'defi', labelFa: '🏦 دیفای', labelEn: '🏦 DeFi' },
  ];

  const filteredTokens = useMemo(() => {
    return EXTENDED_TOKENS.filter((t) => {
      const matchesCategory = selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'popular' 
          ? t.isPopularInIran 
          : t.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.symbol.toLowerCase().includes(q) || 
        t.name.toLowerCase().includes(q) || 
        t.chain.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-right">
      <div 
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden ${
          isDarkMode 
            ? 'bg-[#120c24] border-purple-500/30 text-slate-100 shadow-purple-950/40' 
            : 'bg-white border-purple-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>{isFa ? 'انتخاب رمزارز' : 'Select a Token'}</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          <input 
            type="text"
            placeholder={isFa ? 'جستجوی نام، نماد یا آدرس قرارداد...' : 'Search token name or address...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-purple-950/40 border border-purple-500/30 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-400 transition-colors font-sans"
            autoFocus
          />
        </div>

        {/* Quick Popular Tokens Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
          {[
            { symbol: 'USDT', logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
            { symbol: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
            { symbol: 'PAXG', logo: 'https://assets.coingecko.com/coins/images/9519/large/paxg.png' },
            { symbol: 'SHIRDAL', logo: '/mascot/griffi-avatar.jpg' },
            { symbol: 'BTC', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
            { symbol: 'ARB', logo: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png' },
            { symbol: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
            { symbol: 'TON', logo: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png' },
          ].map((quick) => {
            const tokenObj = EXTENDED_TOKENS.find(t => t.symbol === quick.symbol);
            if (!tokenObj) return null;
            const isSelected = selectedTokenSymbol === quick.symbol;
            return (
              <button
                key={quick.symbol}
                type="button"
                onClick={() => {
                  playClickSound();
                  onSelectToken(tokenObj);
                  onClose();
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : isDarkMode
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/20 text-slate-300'
                      : 'bg-white hover:bg-purple-50 border-purple-200 text-slate-700'
                }`}
              >
                <img src={quick.logo} alt={quick.symbol} className="w-4 h-4 rounded-full object-cover" />
                <span className="font-mono text-[11px]">{quick.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playClickSound();
                setSelectedCategory(c.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/30 text-slate-400 hover:text-white border border-purple-500/20'
              }`}
            >
              {isFa ? c.labelFa : c.labelEn}
            </button>
          ))}
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-purple-500/10">
          {filteredTokens.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {isFa ? 'رمزارزی با این مشخصات یافت نشد.' : 'No tokens found.'}
            </div>
          ) : (
            filteredTokens.map((token, idx) => {
              const isSelected = selectedTokenSymbol === token.symbol;
              return (
                <button
                  key={`${token.symbol}-${token.chain}-${idx}`}
                  onClick={() => {
                    playClickSound();
                    onSelectToken(token);
                    onClose();
                  }}
                  className={`w-full py-3 px-3 rounded-2xl transition-all flex items-center justify-between text-right group ${
                    isSelected 
                      ? 'bg-purple-900/40 border border-purple-500/40' 
                      : 'hover:bg-purple-950/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={token.logo} 
                      alt={token.symbol} 
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/30"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {token.symbol}
                        </span>
                        {token.isPopularInIran && (
                          <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                            {isFa ? 'محبوب' : 'Popular'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {token.name} • <span className="text-purple-300 font-medium">{token.chain}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-xs font-bold text-slate-200 block">
                      ${token.priceUsd < 0.01 
                        ? token.priceUsd.toFixed(6) 
                        : token.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                      }
                    </span>
                    {tomanRate && token.priceUsd >= 0.01 && (
                      <span className="text-[10px] text-purple-300 block">
                        ≈ {isFa ? toPersianDigits(formatToman(token.priceUsd * tomanRate)) : formatToman(token.priceUsd * tomanRate)} {isFa ? 'ت' : 'T'}
                      </span>
                    )}
                    {userBalances && userBalances[token.symbol] !== undefined && (
                      <span className="text-[10px] text-amber-300 font-bold block">
                        {userBalances[token.symbol].toLocaleString()} {token.symbol}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 ml-auto mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Security / Non-Custodial Footer */}
        <div className="pt-3 mt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isFa ? 'قراردادهای هوشمند ممیزی‌شده' : 'Audited contracts'}</span>
          </div>
          <span className="font-mono text-[10px] text-purple-300">
            {isFa ? '۵۸+ شبکه فعال' : '58+ Chains'}
          </span>
        </div>
      </div>
    </div>
  );
};
