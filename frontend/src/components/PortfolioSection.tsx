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
  Search
} from 'lucide-react';
import { toPersianDigits, formatToman, usdToToman } from '../services/tomanService';

interface TokenItem {
  symbol: string;
  name: string;
  chain: string;
  balance: number;
  priceUsd: number;
  logo: string;
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
  const [activeTab, setActiveTab] = useState<'tokens' | 'transactions'>('tokens');
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState<string>('');

  const currentAddress = searchAddress || walletAddress || '0x71C8705a2B88e3083feC7B58273683243354438F';
  const isDemo = !walletAddress && !searchAddress;

  // Portfolio token mock / live items
  const tokens: TokenItem[] = [
    {
      symbol: "USDT",
      name: "Tether USD (Arbitrum)",
      chain: "Arbitrum One",
      balance: 1450.5,
      priceUsd: 1.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdt.svg"
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      chain: "Ethereum",
      balance: 0.85,
      priceUsd: 3420.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg"
    },
    {
      symbol: "ARB",
      name: "Arbitrum Token",
      chain: "Arbitrum One",
      balance: 1250.0,
      priceUsd: 0.88,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg"
    },
    {
      symbol: "BNB",
      name: "BNB Coin",
      chain: "BNB Chain",
      balance: 1.2,
      priceUsd: 590.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg"
    },
    {
      symbol: "POL",
      name: "Polygon Ecosystem Token",
      chain: "Polygon",
      balance: 620.0,
      priceUsd: 0.45,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg"
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

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in space-y-8">
      
      {/* Header & Wallet Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight griffin-gradient-text">
            {isFa ? 'مدیریت دارایی‌ها و پرتفولیو' : 'Portfolio & Asset Manager'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isFa 
              ? 'نمایش جامع رمزارزها در تمام شبکه‌های بلاک‌چین با تبدیل همزمان به دلار و تومان' 
              : 'Multi-chain balances, transaction logs, and real-time Toman valuation'}
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
              className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 pl-8 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
            />
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />
          </div>

          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white transition-colors"
            title={isFa ? 'بروزرسانی اطلاعات' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {!walletAddress && (
            <button 
              onClick={onConnectWallet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isFa ? 'اتصال کیف پول' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-bold text-purple-300 tracking-wide uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isFa ? 'مجموع ارزش تخمینی پورتفولیو (دلار و تومان)' : 'Total Net Worth'}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
              <span className="text-3xl md:text-5xl font-black text-white font-mono tracking-tight">
                ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-lg md:text-2xl font-black text-amber-400 font-mono">
                ≈ {isFa ? `${toPersianDigits(formatToman(totalTomanValue))} تومان` : `${formatToman(totalTomanValue, false)} Toman`}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {isFa ? `نرخ مبنای محاسبه: هر تتر = ${toPersianDigits(formatToman(tomanRate))} تومان` : `Valued at 1 USDT = ${formatToman(tomanRate, false)} Toman`}
            </p>
          </div>

          {/* Monitored Address details */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span>{isFa ? 'آدرس در حال رصد:' : 'Monitored Wallet:'}</span>
              <span className="text-emerald-400 font-semibold">{isFa ? 'فعال' : 'Active'}</span>
            </div>
            <div className="font-mono text-purple-200 break-all font-semibold text-[11px]">
              {currentAddress}
            </div>
            {isDemo && (
              <span className="inline-block text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded font-bold">
                {isFa ? 'حالت پیش‌نمایش (کیف پول نمونه)' : 'Demo Preview Mode'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
        <button
          onClick={() => setActiveTab('tokens')}
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
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isFa ? 'تاریخچه تراکنش‌ها' : 'Transactions'}</span>
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
    </div>
  );
};
