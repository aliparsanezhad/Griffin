import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  Globe2, 
  HelpCircle,
  Search,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { ANTI_CENSORSHIP_RPCS, IRANIAN_SECURITY_TIPS } from '../services/securityTips';
import { RpcMonitor } from './RpcMonitor';
import { SecurityScanner } from './SecurityScanner';
import { RpcNodeManager } from './RpcNodeManager';
import { playClickSound } from '../services/soundService';

const COMMISSION_WALLET = '0xD9C10B10945D85396f0838EA045587a25FD2A2D3';

interface SecurityHubProps {
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const SecurityHub: React.FC<SecurityHubProps> = ({ lang, isDarkMode = true }) => {
  const isFa = lang === 'fa';
  const [activeSecurityTab, setActiveSecurityTab] = useState<'scanner' | 'rpcs'>('scanner');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(COMMISSION_WALLET);
    setCopiedWallet(true);
    playClickSound();
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className="w-full py-6 px-4 max-w-5xl mx-auto animate-fade-in space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isFa ? 'مرکز امنیت، حریم خصوصی و ضدتحریم' : 'Anti-Censorship & Privacy Hub'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold griffin-gradient-text">
          {isFa ? 'راهنمای حفظ امنیت کاربر ایرانی در وب۳' : 'Iranian Web3 Safety Guide'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          {isFa
            ? 'لیست ارائه‌دهندگان RPC آزاد، روش‌های دور زدن خطای ۴۰۳ و قوانین محافظت از سرمایه در برابر تحریم‌ها'
            : 'Uncensored RPC endpoints and best practices to safeguard assets against geoblocking.'}
        </p>
      </div>

      {/* Griffi Security 3D Shield Showcase */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-5 text-right shadow-2xl">
        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-emerald-400/80 shrink-0 shadow-lg bg-black/40">
          <img src="/mascot/griffi-security.jpg" alt="Griffi Security Shield" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <span className="font-black text-emerald-300 text-sm flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? 'سپر امنیتی گریفی در برابر تحریم‌ها و سانسور 🛡️' : 'Griffi Anti-Censorship Shield 🛡️'}</span>
          </span>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            {isFa 
              ? 'گریفین‌سواپ بدون نیاز به ایمیل یا احراز هویت (KYC) فعالیت می‌کند. برای حفظ امنیت حداکثری از فیلترشکن‌های عمومی با نشت دی‌ان‌اس (DNS Leak) خودداری کرده و از نودهای غیرمتمرکز اختصاصی استفاده کنید.' 
              : 'GriffinSwap is 100% non-custodial and KYC-free. Shield your metadata and safeguard your digital sovereignty.'}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-200 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-mono">
            <span>{isFa ? 'خزانه رسمی کارمزدها: 0xD9C1...A2D3' : 'Official Treasury: 0xD9C1...A2D3'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-purple-500/30 shadow-lg">
          <button
            onClick={() => {
              playClickSound();
              setActiveSecurityTab('scanner');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSecurityTab === 'scanner'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>{isFa ? 'دیدبان هانی‌پات و امنیت ولت' : 'Honeypot & Token Auditor'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveSecurityTab('rpcs');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSecurityTab === 'rpcs'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4 text-purple-300" />
            <span>{isFa ? 'نودهای ضدتحریم و حریم خصوصی RPC' : 'Anti-Censorship RPCs'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Honeypot Scanner & Wallet Approvals */}
      {activeSecurityTab === 'scanner' && (
        <div className="animate-fade-in">
          <SecurityScanner lang={lang} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* MODE 2: Anti-Censorship RPCs & Tips */}
      {activeSecurityTab === 'rpcs' && (
        <div className="space-y-10 animate-fade-in">
          {/* Interactive Anti-Censorship RPC Node Manager */}
          <RpcNodeManager lang={lang} isDarkMode={isDarkMode} />

          {/* Safety Tips Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IRANIAN_SECURITY_TIPS.map((tip) => (
          <div
            key={tip.id}
            className={`glass-panel p-5 rounded-2xl border ${
              tip.critical 
                ? 'border-purple-500/30 bg-purple-950/20 shadow-purple-900/10' 
                : 'border-purple-500/15'
            } shadow-lg space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                {tip.badge}
              </span>
              {tip.critical && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isFa ? 'نکته حیاتی' : 'Critical'}
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-white text-sm">{tip.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      {/* Recommended Anti-Censorship RPCs */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/25 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <span>{isFa ? 'آدرس‌های RPC آزاد و ضدتحریم (بدون فیلتر و تحریم)' : 'Recommended Anti-Censorship RPCs'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'برای حل مشکل ارور ۴۰۳ در متامسک یا ربی، آدرس RPC شبکه خود را به یکی از این موارد تغییر دهید:'
                : 'Replace default wallet RPCs with these privacy-first endpoints to bypass 403 errors.'}
            </p>
          </div>
        </div>

        <div className="divide-y divide-purple-500/10">
          {ANTI_CENSORSHIP_RPCS.map((rpc) => (
            <div key={rpc.url} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{rpc.chain}</span>
                  <span className="text-[10px] text-slate-400">({rpc.name})</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.2 rounded-full">
                    {rpc.privacyRating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{rpc.features}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/20 font-mono text-[11px] text-purple-200 select-all max-w-xs truncate">
                  {rpc.url}
                </div>
                <button
                  onClick={() => handleCopy(rpc.url)}
                  className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-colors"
                  title="کپی آدرس RPC"
                >
                  {copiedUrl === rpc.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Anti-Censorship RPC Latency Ping Radar */}
      <RpcMonitor lang={lang} isDarkMode={isDarkMode ?? true} />

      {/* Tutorial: How to change RPC in MetaMask / Rabby */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 text-xs text-slate-300 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>{isFa ? 'چگونه RPC را در متامسک (MetaMask) تغییر دهیم؟' : 'How to Change RPC in MetaMask'}</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
          <li>{isFa ? 'وارد متامسک شوید و روی علامت شبکه در بالای صفحه کلیک کنید.' : 'Open MetaMask and click network selector.'}</li>
          <li>{isFa ? 'گزینه Add Network یا تنظیمات شبکه مورد نظر را انتخاب نمایید.' : 'Select network settings.'}</li>
          <li>{isFa ? 'در کادر New RPC URL، یکی از آدرس‌های جدول بالا (مثلاً 1RPC) را جایگزین کنید.' : 'Paste the custom RPC URL into the New RPC URL field.'}</li>
          <li>{isFa ? 'روی دکمه Save کلیک کنید. اکنون بدون نیاز به تغییر آی‌پی یا فیلترشکن به شبکه متصل هستید.' : 'Click Save. Your wallet will now connect seamlessly.'}</li>
        </ol>
      </div>
    </div>
  )}

      {/* Verified Protocol Treasury Commission Transparency Card */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-all ${
        isDarkMode ? 'bg-purple-950/40 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            {isFa
              ? 'کارمزدهای پروتکل گریفین سواپ (۰.۵٪) برای حفظ امنیت و توسعه زیرساخت‌های ضدتحریم به خزانه‌داری رسمی واریز می‌شود:'
              : 'Platform commission (0.5%) for anti-censorship node operations routes directly to verified treasury:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-black/40 text-purple-300 border border-purple-500/20">
            {COMMISSION_WALLET.slice(0, 6)}...{COMMISSION_WALLET.slice(-4)}
          </code>
          <button
            onClick={handleCopyWallet}
            className="p-1.5 rounded-xl hover:bg-white/10 text-purple-300 transition-colors"
            title={isFa ? 'کپی آدرس خزانه رسمی' : 'Copy Treasury Address'}
          >
            {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={`https://etherscan.io/address/${COMMISSION_WALLET}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isFa ? 'مشاهده در اترسکن' : 'View on Etherscan'}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

    </div>
  );
};
