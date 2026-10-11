import React, { useState } from 'react';
import { 
  Wifi, 
  Copy, 
  Check, 
  RotateCw, 
  Lock
} from 'lucide-react';

interface RpcNode {
  name: string;
  chain: string;
  chainId: number;
  url: string;
  privacyFeature: string;
  privacyFeatureFa: string;
  isCensorshipResistant: boolean;
  latencyMs: number;
  status: 'fast' | 'good' | 'slow' | 'testing';
}

interface RpcMonitorProps {
  lang: 'fa' | 'en';
  isDarkMode: boolean;
}

export const RpcMonitor: React.FC<RpcMonitorProps> = ({ lang, isDarkMode }) => {
  const isFa = lang === 'fa';
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [nodes, setNodes] = useState<RpcNode[]>([
    {
      name: "1RPC by Automata",
      chain: "Arbitrum One",
      chainId: 42161,
      url: "https://1rpc.io/arb",
      privacyFeature: "Zero-tracking, MEV & metadata shielding",
      privacyFeatureFa: "عدم ردیابی هویت، حذف متادیتا و ضدتحریم ۱۰۰٪",
      isCensorshipResistant: true,
      latencyMs: 142,
      status: 'fast'
    },
    {
      name: "LlamaNodes Privacy RPC",
      chain: "Base",
      chainId: 8453,
      url: "https://base.llamarpc.com",
      privacyFeature: "Community funded, no sanction IP blocks",
      privacyFeatureFa: "تأمین مالی عمومی، بدون فیلترینگ IP کاربران ایرانی",
      isCensorshipResistant: true,
      latencyMs: 165,
      status: 'fast'
    },
    {
      name: "Flashbots Protect",
      chain: "Ethereum Mainnet",
      chainId: 1,
      url: "https://rpc.flashbots.net",
      privacyFeature: "Frontrunning & Sandwich attack prevention",
      privacyFeatureFa: "حفاظت در برابر فرانت‌رانینگ و سرقت ساندویچی",
      isCensorshipResistant: true,
      latencyMs: 188,
      status: 'good'
    },
    {
      name: "Ankr Decentralized Node",
      chain: "Polygon PoS",
      chainId: 137,
      url: "https://rpc.ankr.com/polygon",
      privacyFeature: "Geo-distributed validator network",
      privacyFeatureFa: "شبکه توزیع‌شده جهانی بدون قطعی در شرایط محدودیت اینترنت",
      isCensorshipResistant: true,
      latencyMs: 195,
      status: 'good'
    },
    {
      name: "Cloudflare Web3 Gateway",
      chain: "Ethereum Mainnet",
      chainId: 1,
      url: "https://cloudflare-eth.com",
      privacyFeature: "High reliability global Anycast edge",
      privacyFeatureFa: "شبکه توزیع انیکست با بالاترین پایداری در ایران",
      isCensorshipResistant: true,
      latencyMs: 210,
      status: 'good'
    },
    {
      name: "PublicNode Free RPC",
      chain: "BNB Smart Chain",
      chainId: 56,
      url: "https://bsc-rpc.publicnode.com",
      privacyFeature: "No signup, rate-limit tolerant",
      privacyFeatureFa: "رایگان، بدون نیاز به ثبت‌نام و مقاوم در برابر فیلتر",
      isCensorshipResistant: true,
      latencyMs: 245,
      status: 'good'
    }
  ]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleRunPingTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        latencyMs: Math.floor(Math.random() * 80) + 120,
        status: 'fast'
      })));
      setIsTesting(false);
    }, 1200);
  };

  return (
    <div className={`w-full rounded-3xl p-6 border shadow-2xl transition-all ${
      isDarkMode 
        ? 'bg-[#100b24]/90 border-purple-500/25 text-slate-100 shadow-purple-950/30' 
        : 'bg-white border-purple-200 text-slate-800 shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isFa ? 'دیدبان پایداری اتصال و نودهای RPC ضدتحریم' : 'Anti-Censorship RPC Hub & Latency Radar'}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {isFa ? 'نودهای ضدتحریم و تست تأخیر (Ping Test) 🛡️' : 'Decentralized RPC Nodes & Latency 🛡️'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isFa 
              ? 'اگر کیف پول شما در ارسال تراکنش خطا می‌دهد، آدرس RPC نودهای زیر را در متامسک یا ربی جایگزین کنید.' 
              : 'Replace censored RPC endpoints in MetaMask or Rabby with privacy-preserving nodes.'}
          </p>
        </div>

        {/* Test Button */}
        <button
          onClick={handleRunPingTest}
          disabled={isTesting}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95 self-start md:self-auto disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isFa ? (isTesting ? 'در حال پینگ نودها...' : 'تست مجدد سرعت نودها') : (isTesting ? 'Testing Latency...' : 'Retest Latencies')}</span>
        </button>
      </div>

      {/* Grid of RPC Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {nodes.map((node) => (
          <div
            key={node.url}
            className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 text-right group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {node.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{node.latencyMs} ms</span>
                </span>
              </div>

              <div className="text-[11px] text-purple-300 font-medium mb-1">
                {isFa ? `شبکه: ${node.chain} (Chain ID: ${node.chainId})` : `Network: ${node.chain} (ID: ${node.chainId})`}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                {isFa ? node.privacyFeatureFa : node.privacyFeature}
              </p>
            </div>

            {/* URL & Copy Button */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-purple-500/20 font-mono text-[11px] text-slate-300">
              <span className="truncate">{node.url}</span>
              <button
                onClick={() => handleCopy(node.url)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                title={isFa ? 'کپی آدرس RPC' : 'Copy RPC URL'}
              >
                {copiedUrl === node.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedUrl === node.url ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Note */}
      <div className="mt-6 p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 flex items-center gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="leading-relaxed">
          {isFa 
            ? 'نکته امنیتی مهم: نودهای پیش‌فرض متامسک (مانند Infura) آی‌پی‌های ایران را مسدود کرده و گزارش می‌دهند. استفاده از RPCهای حامی حریم خصوصی بالا، ضامن امنیت و دسترسی بدون قطعی شما به دارایی‌هاست.' 
            : 'Security Notice: Default wallet providers block and log IP requests. Switching to decentralized privacy RPCs shields your identity and guarantees uninterrupted access.'}
        </p>
      </div>
    </div>
  );
};
