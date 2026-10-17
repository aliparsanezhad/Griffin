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
  Copy
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
  const [showTaxModal, setShowTaxModal] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

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
      symbol: "USDT",
      name: "Tether USD (Arbitrum)",
      chain: "Arbitrum One",
      balance: 1450.5,
      priceUsd: 1.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/usdt.svg",
      color: "bg-emerald-500",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      chain: "Ethereum",
      balance: 0.85,
      priceUsd: 3420.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/tokens/eth.svg",
      color: "bg-indigo-500",
    },
    {
      symbol: "ARB",
      name: "Arbitrum Token",
      chain: "Arbitrum One",
      balance: 1250.0,
      priceUsd: 0.88,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg",
      color: "bg-cyan-500",
    },
    {
      symbol: "BNB",
      name: "BNB Coin",
      chain: "BNB Chain",
      balance: 1.2,
      priceUsd: 590.00,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg",
      color: "bg-amber-500",
    },
    {
      symbol: "POL",
      name: "Polygon Ecosystem Token",
      chain: "Polygon",
      balance: 620.0,
      priceUsd: 0.45,
      logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg",
      color: "bg-purple-500",
    },
    {
      symbol: "PAXG",
      name: "PAX Gold (طلای دیجیتال)",
      chain: "Ethereum",
      balance: 0.85,
      priceUsd: 2685.50,
      logo: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
      color: "bg-amber-400",
    },
    {
      symbol: "SHIRDAL",
      name: "Shirdal Mythic (توکن بومی گریفین)",
      chain: "Arbitrum One",
      balance: 5000000,
      priceUsd: 0.0000485,
      logo: "/mascot/griffi-avatar.jpg",
      color: "bg-pink-500",
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

          <button
            onClick={() => {
              playClickSound();
              setShowTaxModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs shadow-md transition-transform active:scale-95"
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isFa ? 'اتصال کیف پول' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Net Worth Card with Mascot Vault Showcase */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Griffi Vault Mini Showcase (3 Cols) */}
          <div className="md:col-span-3 flex justify-center md:justify-start">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-2 ring-amber-400/70 shadow-2xl bg-purple-950/50">
              <img 
                src="/mascot/griffi-vault.jpg" 
                alt="Griffi Vault" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Net Worth Metrics (6 Cols) */}
          <div className="md:col-span-6 space-y-2 text-right">
            <span className="text-xs font-bold text-purple-300 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'مجموع ارزش تخمینی پورتفولیو (دلار و تومان)' : 'Total Net Worth'}</span>
            </span>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
                ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-base sm:text-xl font-black text-amber-400 font-mono">
                ≈ {isFa ? `${toPersianDigits(formatToman(totalTomanValue))} تومان` : `${formatToman(totalTomanValue, false)} Toman`}
              </span>
            </div>

            {/* Gold Parity Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                ≈ {sekeEquiv.toFixed(2)} {isFa ? 'سکه تمام بهار آزادی' : 'Gold Coins'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
                ≈ {goldGramEquiv.toFixed(1)} {isFa ? 'گرم طلای ۱۸ عیار' : 'g 18k Gold'}
              </span>
            </div>
          </div>

          {/* Monitored Address details (3 Cols) */}
          <div className="md:col-span-3 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs space-y-1.5">
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

        {/* Asset Allocation Multi-Color Progress Bar */}
        <div className="mt-6 pt-5 border-t border-purple-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-purple-400" />
              <span>{isFa ? 'توزیع و تنوع دارایی‌ها در سبد:' : 'Asset Allocation Distribution:'}</span>
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden flex">
            {tokens.map((token) => {
              const usdVal = token.balance * token.priceUsd;
              const percent = totalUsdValue > 0 ? (usdVal / totalUsdValue) * 100 : 0;
              return (
                <div
                  key={token.symbol}
                  className={`${token.color} h-full transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                  title={`${token.symbol}: ${percent.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {tokens.map((token) => {
              const usdVal = token.balance * token.priceUsd;
              const percent = totalUsdValue > 0 ? (usdVal / totalUsdValue) * 100 : 0;
              return (
                <div key={token.symbol} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${token.color}`} />
                  <span className="text-slate-300 font-bold">{token.symbol}</span>
                  <span className="text-slate-400 font-mono">({percent.toFixed(1)}%)</span>
                </div>
              );
            })}
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
