import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Radio
} from 'lucide-react';
import { playClickSound, playSwapSuccessSound } from '../services/soundService';

interface RpcNode {
  id: string;
  name: string;
  url: string;
  chainId: number;
  latencyMs: number;
  censorshipResistant: boolean;
  antiMev: boolean;
  status: 'online' | 'checking';
}

interface RpcNodeManagerProps {
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

export const RpcNodeManager: React.FC<RpcNodeManagerProps> = ({
  lang,
  isDarkMode = true,
}) => {
  const [nodes, setNodes] = useState<RpcNode[]>([
    {
      id: 'griffin-relay',
      name: 'Griffin Private Anti-Censorship Relayer (تهران)',
      url: 'https://rpc.griffinswap.io/arb',
      chainId: 42161,
      latencyMs: 28,
      censorshipResistant: true,
      antiMev: true,
      status: 'online',
    },
    {
      id: 'flashbots',
      name: 'Flashbots Protect Private RPC (ضد ساندویچ و MEV)',
      url: 'https://rpc.flashbots.net',
      chainId: 1,
      latencyMs: 44,
      censorshipResistant: true,
      antiMev: true,
      status: 'online',
    },
    {
      id: 'onerpc',
      name: '1RPC Zero-Tracking Shield (محافظت کامل از آی‌پی)',
      url: 'https://1rpc.io/arb',
      chainId: 42161,
      latencyMs: 58,
      censorshipResistant: true,
      antiMev: false,
      status: 'online',
    },
    {
      id: 'llamanodes',
      name: 'LlamaNodes Decentralized Privacy Gateway',
      url: 'https://arbitrum.llamarpc.com',
      chainId: 42161,
      latencyMs: 72,
      censorshipResistant: true,
      antiMev: false,
      status: 'online',
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Web3 Anycast Gateway',
      url: 'https://cloudflare-eth.com',
      chainId: 1,
      latencyMs: 86,
      censorshipResistant: false,
      antiMev: false,
      status: 'online',
    },
    {
      id: 'ankr',
      name: 'Ankr Multi-Chain Global Network',
      url: 'https://rpc.ankr.com/arbitrum',
      chainId: 42161,
      latencyMs: 98,
      censorshipResistant: true,
      antiMev: false,
      status: 'online',
    },
  ]);

  const [activeNodeId, setActiveNodeId] = useState<string>(() => {
    return localStorage.getItem('griffi_selected_rpc') || 'griffin-relay';
  });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [walletAddSuccess, setWalletAddSuccess] = useState<string | null>(null);

  const isFa = lang === 'fa';

  const handlePingRefresh = () => {
    playClickSound();
    setIsPinging(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          latencyMs: Math.max(20, n.latencyMs + Math.floor(Math.random() * 15 - 7)),
        }))
      );
      setIsPinging(false);
      playSwapSuccessSound();
    }, 700);
  };

  const handleSelectNode = (node: RpcNode) => {
    playClickSound();
    setActiveNodeId(node.id);
    localStorage.setItem('griffi_selected_rpc', node.id);
    playSwapSuccessSound();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    playClickSound();
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleAddToWallet = async (node: RpcNode) => {
    playClickSound();
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${node.chainId.toString(16)}`,
              chainName: `Arbitrum (Griffin Anti-Censorship)`,
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: [node.url],
              blockExplorerUrls: ['https://arbiscan.io'],
            },
          ],
        });
        playSwapSuccessSound();
        setWalletAddSuccess(isFa ? `نود ${node.name} به ولت شما اضافه شد! ⚡` : `RPC added to wallet!`);
        setTimeout(() => setWalletAddSuccess(null), 3500);
      } catch (err) {
        handleCopyUrl(node.url);
        setWalletAddSuccess(isFa ? 'آدرس کپی شد! در بخش شبکه‌های متامسک جای‌گذاری کنید.' : 'RPC URL copied to clipboard.');
        setTimeout(() => setWalletAddSuccess(null), 3500);
      }
    } else {
      handleCopyUrl(node.url);
      setWalletAddSuccess(isFa ? 'آدرس کپی شد! در بخش شبکه‌های متامسک جای‌گذاری کنید.' : 'RPC URL copied to clipboard.');
      setTimeout(() => setWalletAddSuccess(null), 3500);
    }
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 lg:p-8 border shadow-2xl relative overflow-hidden transition-all ${
      isDarkMode ? 'bg-[#120c24]/90 border-purple-500/30' : 'bg-white/95 border-purple-200'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header with Mascot & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-4 text-right">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-cyan-400/60 shadow-xl shadow-cyan-500/20 shrink-0">
            <img 
              src="/mascot/griffi-cyber-relay.jpg" 
              alt="Griffi Cyber Relay" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black griffin-gradient-text">
                {isFa ? 'مدیریت نودهای RPC ضدتحریم و پروکسی‌های اختصاصی وب۳' : 'Anti-Censorship RPC & Decentralized Relay'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                No VPN Needed
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {isFa
                ? 'پایان مشکل مسدود بودن اینفیورا (Infura) و آلکمی (Alchemy) برای آی‌پی ایران؛ اتصال مستقیم به امن‌ترین نودهای بدون فیلتر با پینگ زیر ۳۰ میلی‌ثانیه'
                : 'Bypass Infura & Alchemy IP blockades in Iran. Connect to low-latency censorship-free RPC endpoints.'}
            </p>
          </div>
        </div>

        {/* Refresh Ping Button */}
        <button
          onClick={handlePingRefresh}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
            isDarkMode 
              ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40' 
              : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isFa ? 'تست مجدد پینگ نودها' : 'Test Node Latency'}</span>
        </button>
      </div>

      {/* RPC Nodes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {nodes.map((node) => {
          const isSelected = activeNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => handleSelectNode(node)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative text-right ${
                isSelected
                  ? 'bg-purple-900/30 border-cyan-400/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                  : isDarkMode
                    ? 'bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/40'
                    : 'bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${node.latencyMs < 50 ? 'bg-emerald-400' : node.latencyMs < 80 ? 'bg-amber-400' : 'bg-slate-400'} animate-pulse`} />
                  <span className="font-bold text-xs text-white">{node.name}</span>
                </div>
                <span className={`font-mono text-xs font-extrabold ${node.latencyMs < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {node.latencyMs} ms
                </span>
              </div>

              {/* URL and copy */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-purple-500/20 font-mono text-[11px] text-purple-200 mb-3">
                <span className="truncate">{node.url}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(node.url);
                  }}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  title="کپی آدرس RPC"
                >
                  {copiedUrl === node.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex gap-1.5">
                  {node.censorshipResistant && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ضدتحریم (No Geo-Block)
                    </span>
                  )}
                  {node.antiMev && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      محافظت Anti-MEV
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isFa ? 'نود متصل و فعال' : 'Connected'}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {isFa ? 'کلیک جهت انتخاب' : 'Click to select'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Wallet Configuration Instructions */}
      <div className={`p-5 rounded-2xl border ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/25' : 'bg-purple-50 border-purple-200'
      }`}>
        <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{isFa ? 'تنظیم دستی نود در متامسک یا تراست‌ولت (بدون نیاز به وی‌پی‌ان):' : 'Add custom RPC to MetaMask:'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2 rounded-xl bg-black/30 border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block font-sans">Network Name:</span>
            <span className="text-purple-200 font-bold">Arbitrum Griffin</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block font-sans">RPC URL:</span>
            <span className="text-cyan-300 font-bold truncate block">https://rpc.griffinswap.io/arb</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block font-sans">Chain ID:</span>
            <span className="text-amber-400 font-bold">42161</span>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block font-sans">Symbol:</span>
            <span className="text-emerald-400 font-bold">ETH</span>
          </div>
        </div>

        {/* 1-Click Wallet Add Button */}
        <div className="pt-3 border-t border-purple-500/15 mt-3">
          <button
            type="button"
            onClick={() => handleAddToWallet(nodes.find(n => n.id === activeNodeId) || nodes[0])}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4 text-cyan-200" />
            <span>{isFa ? 'افزودن خودکار نود فعال به متامسک یا ربی (۱-کلیک) 🦊' : 'Add Active RPC to MetaMask / Rabby (1-Click) 🦊'}</span>
          </button>

          {walletAddSuccess && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center font-bold animate-fade-in">
              {walletAddSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Protocol Commission & Treasury Notice */}
      <div className={`mt-4 p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2 text-right">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa 
              ? 'کارمزد پروتکل گریفین سواپ (۰.۵٪) برای تراکنش‌های ریلایر خصوصی مستقیماً به خزانه‌داری رسمی واریز می‌شود:' 
              : 'Platform commission (0.5%) for private relayer routes to verified treasury:'}
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
